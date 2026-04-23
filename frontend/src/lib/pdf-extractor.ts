import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { supabase } from 'lib/supabase';
import { recordApiRequest } from 'lib/keepAlive';

// Set the worker source once at module load time
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Render backend URL — set VITE_RENDER_BACKEND_URL in your Vercel env vars
// e.g. https://meowfolio-api.onrender.com
const RENDER_BACKEND_URL = (import.meta.env.VITE_RENDER_BACKEND_URL as string | undefined) ?? '';

function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

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
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
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
 * Extract text via the dedicated Render backend /api/extract-text endpoint.
 * Used on mobile when client-side pdf.js times out (worker killed by OS).
 * Falls back to the Vercel function if no Render URL is configured.
 */
async function extractTextFromPdfServer(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to upload a file for parsing.');
  }

  const base64 = await fileToBase64(file);

  // Prefer the dedicated Render backend; fall back to Vercel function
  const endpoint = RENDER_BACKEND_URL
    ? `${RENDER_BACKEND_URL}/api/extract-text`
    : '/api/extract-text';

  const response = await fetch(endpoint, {
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

  // Tell the keep-alive tracker that a real request was just made
  recordApiRequest();

  return result.text;
}

/**
 * Extract all text from a PDF using pdf.js in the browser.
 *
 * Desktop: runs in a Web Worker (fast, non-blocking).
 * Mobile:  tries client-side first (15s timeout), then automatically falls back
 *          to the Render backend so the OS killing the worker doesn't cause
 *          an infinite hang.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });

  if (isMobileBrowser()) {
    // On mobile, attempt client-side with a 15-second safety net.
    // If the OS kills the worker, we catch TIMEOUT and hit the server instead.
    try {
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
      if (err instanceof Error && err.message === 'TIMEOUT') {
        console.warn('[pdf-extractor] Client-side PDF.js timed out on mobile — falling back to Render backend...');
        return extractTextFromPdfServer(file);
      }
      throw err;
    }
  }

  // Desktop: no timeout needed, Web Worker runs reliably
  const pdf = await loadingTask.promise;
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
    await pdf.destroy().catch(() => undefined);
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
 */
export async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  }
  return extractTextFromTextFile(file);
}
