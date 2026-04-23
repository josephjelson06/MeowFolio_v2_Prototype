import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { supabase } from 'lib/supabase';

// Point the PDF.js worker to the file we copied into public/
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Returns true on Android/iOS mobile browsers where pdf.js workers
 * are frequently killed by the OS due to memory constraints.
 */
function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Extract text from a PDF via the server-side /api/extract-text endpoint.
 * Used on mobile to avoid running the memory-heavy pdf.js worker client-side.
 */
async function extractTextFromPdfServer(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to upload a file for parsing.');
  }

  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Server extraction failed (${response.status})`);
  }

  const result = await response.json() as { text: string };
  return result.text;
}

/**
 * Extract all text from a PDF file — runs entirely in the browser.
 * No file is uploaded to any server.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
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
