import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { supabase } from 'lib/supabase';

// Set the worker source once at module load time
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Wraps a promise with a hard timeout.
 * On mobile, pdfjs workers get silently killed by the OS and promises
 * never resolve or reject — this converts that silent hang into a real error.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err)   => { clearTimeout(timer); reject(err); }
    );
  });
}

/**
 * Extract text via the /api/extract-text server endpoint.
 * Used as fallback when client-side pdf.js times out on mobile.
 */
async function extractTextFromPdfServer(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to upload a file for parsing.');
  }

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
    throw new Error((body as { error?: string }).error ?? `Server extraction failed (${response.status})`);
  }

  const result = await response.json() as { text: string };
  return result.text;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) { reject(new Error('Failed to encode file as base64')); return; }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract all text from a PDF file — runs entirely in the browser.
 * If the browser's pdf.js worker times out (common on Android),
 * automatically falls back to server-side extraction.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });

  try {
    // Try client-side extraction with a 15-second limit
    const pdf = await withTimeout(loadingTask.promise, 15_000);

    try {
      const pages: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await withTimeout(pdf.getPage(pageNum), 10_000);
        const textContent = await withTimeout(page.getTextContent(), 10_000);
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        pages.push(pageText);
      }
      return pages.join('\n\n');
    } finally {
      await pdf.destroy().catch(() => undefined);
    }
  } catch (err) {
    // If this is a timeout (worker killed by OS on mobile), try the server
    if (err instanceof Error && err.message === 'TIMEOUT') {
      console.warn('[pdf-extractor] Client-side PDF.js timed out, falling back to server extraction...');
      return extractTextFromPdfServer(file);
    }
    throw err;
  }
}

/**
 * Extract text from a text-based file (txt, md, etc).
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  return file.text();
}

/**
 * Auto-detect file type and extract text.
 * On mobile, if the pdfjs worker is killed by the OS, automatically
 * falls back to server-side extraction instead of hanging forever.
 */
export async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  }
  return extractTextFromTextFile(file);
}
