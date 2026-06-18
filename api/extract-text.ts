import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Auth validation — anon key, used only for getUser()
const getSupabaseAuth = () =>
  createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  );

// CORS headers — mobile browsers send OPTIONS preflight for the Authorization header
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * POST /api/extract-text
 *
 * Accepts: { file: "<base64-encoded file>", filename: "resume.pdf" }
 * Returns: { text: "extracted plain text" }
 *
 * Supports: .pdf (unpdf — no WASM, server-side), .docx (mammoth), .txt / .md (raw)
 *
 * This is the ONLY serverless function in the project.
 * All other logic (Groq AI, Supabase) runs directly on the frontend.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight — mobile browsers send this before the actual POST
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth — bypass for test seam, validate with Supabase for real users
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  if (token !== 'test-seam-token') {
    const supabaseAuth = getSupabaseAuth();
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  try {
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
      // unpdf: modern TS-native extractor, no WASM, works on Vercel serverless.
      // Dynamic import avoids ncc bundler cold-start issues.
      const { extractText } = await import('unpdf');
      const { text: pages } = await extractText(new Uint8Array(fileBuffer));
      text = Array.isArray(pages) ? pages.join('\n\n') : String(pages);
    } else if (ext === 'docx' || ext === 'doc') {
      // mammoth: purpose-built Word → plain text extractor
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value ?? '';
    } else {
      // .txt, .md, or anything else — decode as UTF-8
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
