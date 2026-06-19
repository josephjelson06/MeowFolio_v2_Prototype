import { recordApiRequest } from 'lib/keepAlive';
import { supabase } from 'lib/supabase';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to encode file as base64'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed to read the file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Returns an AbortSignal that fires after `ms` milliseconds.
 * Falls back to a manual AbortController for browsers that don't support
 * AbortSignal.timeout (iOS Safari < 16, Chrome Android < 103).
 */
function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  if (typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(ms), clear: () => {} };
  }
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => window.clearTimeout(id) };
}

/**
 * Extract PDF text via the /api/extract-text serverless function.
 * Server-side using unpdf — works on all browsers and mobile devices.
 */
export async function extractTextFromPdf(file: File, preFetchedToken?: string): Promise<string> {
  const isTestSeam = typeof window !== 'undefined' && window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true';
  let token = preFetchedToken || '';

  if (!token) {
    if (isTestSeam) {
      token = 'test-seam-token';
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('You must be signed in to upload a file for parsing.');
      }
      token = session.access_token;
    }
  }

  const base64 = await fileToBase64(file);

  const { signal, clear } = timeoutSignal(60_000);

  let response: Response;
  try {
    response = await fetch('/api/extract-text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64, filename: file.name }),
      signal,
    });
  } catch (err) {
    clear();
    if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new Error('File extraction timed out after 60s. Please try again.');
    }
    throw err;
  }

  clear();

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Server extraction failed (${response.status})`);
  }

  const result = await response.json() as { text: string };
  recordApiRequest();
  return result.text;
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
export async function extractText(file: File, preFetchedToken?: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
    return extractTextFromPdf(file, preFetchedToken);
  }
  return extractTextFromTextFile(file);
}
