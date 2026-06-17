import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Auth validation — anon key, respects RLS (used only for getUser)
const getSupabaseAuth = () =>
  createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  );

// CORS headers — needed for mobile browsers that send OPTIONS preflight
// (triggered by the Authorization header in cross-origin requests)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * POST /api/extract-text
 *
 * Accepts a JSON body: { file: "<base64-encoded file>", filename: "resume.pdf" }
 * Returns: { text: "extracted plain text" }
 *
 * Supports: .pdf (via pdf-parse, pure JS), .docx (via mammoth), .txt / .md (raw)
 *
 * Uses pdf-parse instead of unpdf/pdfjs-wasm — no WASM, instant cold start,
 * works identically on mobile and desktop.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight — mobile browsers send this before the actual POST
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Set CORS headers on every response
  Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));

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
    // Vercel's built-in JSON body parser handles req.body automatically
    const { file: base64, filename } = req.body as { file?: string; filename?: string };

    if (!base64) {
      return res.status(400).json({ error: 'Missing file data in request body' });
    }

    const fileBuffer = Buffer.from(base64, 'base64');

    if (fileBuffer.length === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    const ext = (filename ?? '').split('.').pop()?.toLowerCase() ?? '';
    let text = '';

    if (ext === 'pdf') {
      // pdf-parse: pure JS, no WASM, instant cold start on Vercel.
      // Perfect for text-based resume PDFs (1-2 pages).
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(fileBuffer);
      text = result.text ?? '';
    } else if (ext === 'docx' || ext === 'doc') {
      // mammoth: purpose-built Word document → plain text extractor.
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value ?? '';
    } else {
      // .txt, .md, or anything else — just decode as UTF-8
      text = fileBuffer.toString('utf-8');
    }

    if (!text || text.trim().length < 10) {
      return res.status(422).json({
        error: `Could not extract text from "${filename ?? 'file'}". The file may be image-based or empty.`,
      });
    }

    return res.status(200).json({ text: text.trim() });
  } catch (err) {
    console.error('File extraction error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'File extraction failed',
    });
  }
}
