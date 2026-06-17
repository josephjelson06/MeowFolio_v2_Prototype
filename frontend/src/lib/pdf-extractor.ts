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
 * Extract PDF text via the Vercel /api/extract-text serverless function.
 * All PDF extraction is server-side using unpdf — works consistently across
 * all browsers and mobile devices without memory constraints.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to upload a file for parsing.');
  }

  const base64 = await fileToBase64(file);

  let response: Response;
  try {
    response = await fetch('/api/extract-text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64, filename: file.name }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new Error('File extraction timed out after 60s. Please try again.');
    }
    throw err;
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
