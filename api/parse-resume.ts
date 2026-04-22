import type { Request, Response } from 'express';
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
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
);

// Replaced by buildResumeParsePrompt

export async function parseResumeHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate auth
  // const authHeader = req.headers.authorization;
  // if (!authHeader?.startsWith('Bearer ')) {
  //   return res.status(401).json({ error: 'Missing authorization header' });
  // }

  // const token = authHeader.slice(7);
  // const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  // if (authError || !user) {
  //   return res.status(401).json({ error: 'Invalid or expired token' });
  // }
  
  const user = { id: 'guest-user' };

  // Check credits (admin client bypasses RLS)
  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  // if (!profile || profile.credits <= 0) {
  //   return res.status(402).json({ error: 'No credits remaining. Upgrade your plan to continue.' });
  // }

  // Parse request
  const { text, source } = req.body as { text?: string; source?: string };
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: 'Resume text is too short to parse' });
  }

  try {
    // Call Groq
    const { systemPrompt, userPrompt } = buildResumeParsePrompt(text.slice(0, 8000));
    const result = await callGroq(systemPrompt, userPrompt);

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
    }

    // Deduct credit (admin client bypasses RLS) - DISABLED
    // await supabaseAdmin
    //   .from('profiles')
    //   .update({ credits: profile.credits - 1 })
    //   .eq('id', user.id);

    // Log credit event (skip gracefully if credit_events table doesn't exist)
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from('credit_events')
        .insert({
          user_id: user.id,
          action: 'parse_resume',
          amount: 1,
          resource_id: source ?? 'unknown',
        });
    } catch {
      // Non-fatal if table doesn't exist yet
    }

    return res.status(200).json({ parsed, creditsRemaining: profile?.credits ?? 99999 });
  } catch (err) {
    console.error('Resume parse error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'AI parsing failed',
    });
  }
}
