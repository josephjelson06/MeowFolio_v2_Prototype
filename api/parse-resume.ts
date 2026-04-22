import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { callGroq } from './_groq-client';
import { buildResumeParsePrompt } from './_resume-prompt';

// Auth validation — anon key, respects RLS (used only for getUser)
const getSupabaseAuth = () => createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
);

// Admin client — service role key, bypasses RLS for server-side DB ops
const getSupabaseAdmin = () => createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate auth token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const supabaseAuth = getSupabaseAuth();
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check credits via admin client (bypasses RLS)
  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits <= 0) {
    return res.status(402).json({ error: 'No credits remaining. Upgrade your plan to continue.' });
  }

  // Parse request body
  const { text, source } = req.body as { text?: string; source?: string };
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: 'Resume text is too short to parse' });
  }

  try {
    // Call Groq AI
    const { systemPrompt, userPrompt } = buildResumeParsePrompt(text.slice(0, 8000));
    const result = await callGroq(systemPrompt, userPrompt);

    // Parse the JSON response from Groq
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
    }

    // Deduct one credit
    await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    // Log credit event (non-fatal if table doesn't exist yet)
    try {
      await supabaseAdmin
        .from('credit_events')
        .insert({
          user_id: user.id,
          action: 'parse_resume',
          amount: 1,
          resource_id: source ?? 'unknown',
        });
    } catch {
      // Non-fatal
    }

    return res.status(200).json({ parsed, creditsRemaining: profile.credits - 1 });
  } catch (err) {
    console.error('Resume parse error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'AI parsing failed',
    });
  }
}
