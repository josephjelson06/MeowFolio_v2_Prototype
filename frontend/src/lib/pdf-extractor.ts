import { supabase } from 'lib/supabase';
import { recordApiRequest } from 'lib/keepAlive';

// NOTE: pdfjs-dist is NOT statically imported here.
// It is dynamically imported only on desktop inside extractTextFromPdfDesktop().
// This prevents pdfjs from being evaluated on mobile, where it crashes in
// restricted WebKit environments (iOS in-app browsers) with errors like
// "undefined is not a function".

// Render backend URL — set VITE_RENDER_BACKEND_URL in Vercel env vars.
// e.g. https://meowfolio-api.onrender.com
const RENDER_BACKEND_URL = (import.meta.env.VITE_RENDER_BACKEND_URL as string | undefined) ?? '';

function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
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
    reader.onerror = () => reject(new Error('FileReader failed to read the file'));
    reader.readAsDataURL(file);
  });
}

/**
 * MOBILE PATH: Extract text via the dedicated Render backend.
 *
 * Skips pdfjs entirely — no worker spawned, no iOS crashes, no Android hangs.
 * Falls back to the Vercel function if no Render URL is configured.
 */
async function extractTextFromPdfServer(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to upload a file for parsing.');
  }

  const base64 = await fileToBase64(file);

  const endpoint = RENDER_BACKEND_URL
    ? `${RENDER_BACKEND_URL}/api/extract-text`
    : '/api/extract-text';

  // 30-second hard timeout — Render free tier can take ~20s to cold-start.
  // If it doesn't respond within 30s, abort and show a real error.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64, filename: file.name }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Server extraction timed out after 30s. The server may be waking up — please try again in a moment.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Server extraction failed (${response.status})`);
  }

  const result = await response.json() as { text: string };
  recordApiRequest();
  return result.text;
}

/**
 * DESKTOP PATH: Extract text using pdfjs-dist in a Web Worker.
 *
 * Dynamically imports pdfjs so it is NEVER evaluated on mobile devices.
 * Desktop browsers handle the Web Worker reliably without OS interference.
 */
async function extractTextFromPdfDesktop(file: File): Promise<string> {
  // Dynamic import — only downloaded and executed on desktop
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
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
    await pdf.destroy().catch(() => undefined);
  }
}

/**
 * Extract all text from a PDF.
 *
 * Mobile  → server-side (Render backend). No pdfjs loaded at all.
 * Desktop → client-side (pdfjs Web Worker). Fast and non-blocking.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  if (isMobileBrowser()) {
    return extractTextFromPdfServer(file);
  }
  return extractTextFromPdfDesktop(file);
}

/**
 * Extract text from a plain text file (txt, md, etc).
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
