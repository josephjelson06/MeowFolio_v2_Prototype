import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { callGroq } from './_groq-client';

// Auth validation — anon key (used only for getUser)
const supabaseAuth = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
);

// Admin client — service role key, bypasses RLS for server-side DB ops
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const SYSTEM_PROMPT = `You are a job description parser. Given raw JD text, extract key structured data as JSON.

Return ONLY a JSON object with this structure:
{
  "title": "string (job title)",
  "company": "string (company name)",
  "type": "string (Full-time, Part-time, Contract, Internship)",
  "location": "string",
  "keywords": ["string (key technical skills and tools mentioned)"],
  "requirements": ["string (each individual requirement)"],
  "responsibilities": ["string (each key responsibility)"],
  "summary": "string (1-2 sentence summary of the role)"
}

Rules:
- Extract as much as possible from the text
- Keywords should be specific technical skills (React, Python, AWS, etc.)
- Requirements should be standalone statements
- Leave empty strings for missing fields, never null
- Return ONLY the JSON, no markdown, no explanation`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits <= 0) {
    return res.status(402).json({ error: 'No credits remaining. Upgrade your plan to continue.' });
  }

  const { text } = req.body as { text?: string };
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: 'JD text is too short to parse' });
  }

  try {
    const result = await callGroq(SYSTEM_PROMPT, text.slice(0, 6000));

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
    }

    await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    await supabaseAdmin
      .from('credit_events')
      .insert({
        user_id: user.id,
        action: 'parse_jd',
        amount: 1,
        resource_id: 'jd',
      })
      .then(() => null)
      .catch(() => null); // Non-fatal if table doesn't exist yet

    return res.status(200).json({ parsed, creditsRemaining: profile.credits - 1 });
  } catch (err) {
    console.error('JD parse error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'AI parsing failed',
    });
  }
}
