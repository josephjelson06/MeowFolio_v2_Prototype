import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Auth validation — anon key, respects RLS (used only for getUser)
const getSupabaseAuth = () =>
  createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  );

/**
 * POST /api/extract-text
 *
 * Accepts a JSON body: { file: "<base64-encoded PDF>", filename: "resume.pdf" }
 * Returns: { text: "extracted plain text" }
 *
 * Used by mobile clients where the client-side pdf.js worker is killed by
 * the OS due to memory constraints.
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
    // Vercel's built-in JSON body parser handles req.body automatically
    const { file: base64, filename } = req.body as { file?: string; filename?: string };

    if (!base64) {
      return res.status(400).json({ error: 'Missing file data in request body' });
    }

    // Convert base64 string back to a Buffer
    const pdfBuffer = Buffer.from(base64, 'base64');

    if (pdfBuffer.length === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // pdf-parse v2 has a CJS/ESM interop quirk — `require()` may return
    // `{ default: fn }` instead of the function directly. Handle both.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseImport = require('pdf-parse');
    const pdfParse = typeof pdfParseImport === 'function' ? pdfParseImport : pdfParseImport.default;
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse module did not export a callable function');
    }
    const result = await pdfParse(pdfBuffer);
    const text: string = result.text ?? '';

    if (!text || text.trim().length < 10) {
      return res.status(422).json({
        error: `Could not extract text from "${filename ?? 'file'}". The PDF may be scanned or image-based.`,
      });
    }

    return res.status(200).json({ text: text.trim() });
  } catch (err) {
    console.error('PDF extraction error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'PDF extraction failed',
    });
  }
}
