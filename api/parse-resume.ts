import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { callGroq } from './_groq-client';

// Auth validation — anon key, respects RLS (used only for getUser)
const supabaseAuth = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
);

// Admin client — service role key, bypasses RLS for server-side DB ops
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const SYSTEM_PROMPT = `You are a resume parser. Given raw resume text, extract structured data as JSON.

Return ONLY a JSON object with this exact structure:
{
  "header": {
    "name": "string",
    "role": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "linkedin": { "url": "string", "displayText": "string" },
    "github": { "url": "string", "displayText": "string" },
    "website": { "url": "string", "displayText": "string" }
  },
  "summary": { "content": "string", "mode": "professional-summary" },
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "result": "string",
      "date": { "startMonth": "string", "startYear": "string", "endMonth": "string", "endYear": "string", "isOngoing": false }
    }
  ],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "location": "string",
      "date": { "startMonth": "string", "startYear": "string", "endMonth": "string", "endYear": "string", "isOngoing": false },
      "description": { "mode": "bullets", "bullets": ["string"], "paragraph": "" }
    }
  ],
  "skills": {
    "mode": "grouped",
    "items": [],
    "groups": [
      { "groupLabel": "string", "items": ["string"] }
    ]
  },
  "projects": [
    {
      "title": "string",
      "technologies": ["string"],
      "date": { "startMonth": "", "startYear": "", "endMonth": "", "endYear": "", "isOngoing": false },
      "description": { "mode": "bullets", "bullets": ["string"], "paragraph": "" }
    }
  ]
}

Rules:
- Extract as much data as possible from the text
- Leave empty strings for missing fields, never null
- Dates should be month names (e.g., "Jan", "Feb") and 4-digit years
- Skill groups should be logical categories (Languages, Frameworks, Tools, etc.)
- Bullets should be individual accomplishment statements
- Return ONLY the JSON, no markdown, no explanation`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate auth
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check credits (admin client bypasses RLS)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits <= 0) {
    return res.status(402).json({ error: 'No credits remaining. Upgrade your plan to continue.' });
  }

  // Parse request
  const { text, source } = req.body as { text?: string; source?: string };
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: 'Resume text is too short to parse' });
  }

  try {
    // Call Groq
    const result = await callGroq(SYSTEM_PROMPT, text.slice(0, 8000));

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
    }

    // Deduct credit (admin client bypasses RLS)
    await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    // Log credit event (skip gracefully if credit_events table doesn't exist)
    await supabaseAdmin
      .from('credit_events')
      .insert({
        user_id: user.id,
        action: 'parse_resume',
        amount: 1,
        resource_id: source ?? 'unknown',
      })
      .then(() => null)
      .catch(() => null); // Non-fatal if table doesn't exist yet

    return res.status(200).json({ parsed, creditsRemaining: profile.credits - 1 });
  } catch (err) {
    console.error('Resume parse error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'AI parsing failed',
    });
  }
}
