import { env } from '../../config/env';
import { HttpError } from '../../lib/httpError';
import { buildResumeParsePrompt } from './prompts';

export async function parseResumeWithGroq(rawText: string) {
  if (!env.groqApiKey || env.aiProvider !== 'groq') {
    return null;
  }

  const prompt = buildResumeParsePrompt(rawText);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new HttpError(502, `Groq parse failed with status ${response.status}`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new HttpError(502, 'Groq returned invalid JSON for resume parsing.');
  }
}
