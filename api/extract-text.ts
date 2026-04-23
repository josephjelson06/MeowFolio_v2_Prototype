import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Auth validation — anon key, respects RLS (used only for getUser)
const getSupabaseAuth = () =>
  createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  );

export const config = {
  api: {
    bodyParser: false, // We need raw body for multipart/form-data
  },
};

/**
 * POST /api/extract-text
 *
 * Accepts a multipart/form-data request with a PDF file.
 * Returns the extracted plain text.
 * Used by mobile clients where the client-side pdf.js worker is unstable.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate auth token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const supabaseAuth = getSupabaseAuth();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    // Collect the raw body buffer
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      (req as any).on('data', (chunk: Buffer) => chunks.push(chunk));
      (req as any).on('end', resolve);
      (req as any).on('error', reject);
    });
    const rawBody = Buffer.concat(chunks);

    // Parse multipart/form-data to extract the PDF file buffer
    const contentType = req.headers['content-type'] ?? '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Missing multipart boundary' });
    }

    const pdfBuffer = extractFileFromMultipart(rawBody, boundaryMatch[1]);
    if (!pdfBuffer) {
      return res.status(400).json({ error: 'No PDF file found in request' });
    }

    // Dynamically import pdf-parse (CommonJS module)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(pdfBuffer);
    const text: string = result.text ?? '';

    if (!text || text.trim().length < 10) {
      return res.status(422).json({ error: 'Could not extract text from PDF. The file may be scanned or image-based.' });
    }

    return res.status(200).json({ text: text.trim() });
  } catch (err) {
    console.error('PDF extraction error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'PDF extraction failed',
    });
  }
}

/**
 * Minimal multipart/form-data parser — extracts the first binary file part.
 */
function extractFileFromMultipart(body: Buffer, boundary: string): Buffer | null {
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const parts: Buffer[] = [];

  let start = 0;
  while (start < body.length) {
    const boundaryIdx = body.indexOf(boundaryBuf, start);
    if (boundaryIdx === -1) break;

    const headerStart = boundaryIdx + boundaryBuf.length + 2; // skip \r\n
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd === -1) break;

    const header = body.slice(headerStart, headerEnd).toString();
    const nextBoundary = body.indexOf(boundaryBuf, headerEnd + 4);
    const contentEnd = nextBoundary === -1 ? body.length : nextBoundary - 2; // trim \r\n

    if (header.toLowerCase().includes('filename') || header.toLowerCase().includes('application/pdf')) {
      parts.push(body.slice(headerEnd + 4, contentEnd));
    }

    start = nextBoundary === -1 ? body.length : nextBoundary;
  }

  return parts[0] ?? null;
}
