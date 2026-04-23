import { supabase } from 'lib/supabase';

/**
 * Returns true on Android/iOS mobile browsers where pdf.js workers
 * are frequently killed by the OS due to memory constraints.
 */
function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Extract text from a PDF via the server-side /api/extract-text endpoint.
 * Sends the file as base64-encoded JSON — compatible with Vercel's built-in
 * body parser (avoids the raw stream hanging bug in serverless functions).
 */
async function extractTextFromPdfServer(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to upload a file for parsing.');
  }

  // Encode the file as base64 in chunks to avoid stack overflow on large PDFs
  const base64 = await fileToBase64(file);

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: base64, filename: file.name }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Server extraction failed (${response.status})`);
  }

  const result = await response.json() as { text: string };
  return result.text;
}

/** Convert a File to a base64 string using FileReader (safe for large files). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to encode file as base64'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed to read the PDF'));
    reader.readAsDataURL(file);
  });
}


/**
 * Extract all text from a PDF file — runs entirely in the browser.
 * No file is uploaded to any server.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
  
  // Point the PDF.js worker to the file we copied into public/
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  try {
    const pages: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pages.push(pageText);
    }

    return pages.join('\n\n');
  } finally {
    await pdf.destroy();
  }
}

/**
 * Extract text from a text-based file (txt, md, docx text).
 * For actual DOCX parsing, a library like mammoth.js would be needed.
 * For now, reads the raw text content.
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  return file.text();
}

/**
 * Auto-detect file type and extract text.
 * On mobile browsers, PDF extraction is routed to the server to avoid
 * the OS killing the memory-heavy pdf.js worker.
 */
export async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    // On mobile, the pdf.js Web Worker is frequently killed by the OS.
    // Route through the server instead for reliable extraction.
    if (isMobileBrowser()) {
      return extractTextFromPdfServer(file);
    }
    return extractTextFromPdf(file);
  }

  // txt, md, and other text formats
  return extractTextFromTextFile(file);
}
