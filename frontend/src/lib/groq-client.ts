/**
 * Groq API client — runs directly in the browser.
 * Keys are exposed via VITE_GROQ_KEY_* env vars (accepted tradeoff for a free SaaS).
 * Uses key cycling + model fallback identical to the old server-side client.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getKeys(): string[] {
  return [
    import.meta.env.VITE_GROQ_KEY_1,
    import.meta.env.VITE_GROQ_KEY_2,
    import.meta.env.VITE_GROQ_KEY_3,
  ].filter((k): k is string => !!k);
}

function getModels(): string[] {
  return [
    import.meta.env.VITE_GROQ_MODEL_PRIMARY || 'llama-3.3-70b-versatile',
    import.meta.env.VITE_GROQ_MODEL_FALLBACK || 'llama-3.1-8b-instant',
  ];
}

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const keys = getKeys();
  const models = getModels();
  const temperature = options?.temperature ?? 0.1;
  const maxTokens = options?.maxTokens ?? 4096;

  if (keys.length === 0) {
    throw new Error('No VITE_GROQ_KEY_* environment variables configured');
  }

  const errors: string[] = [];

  for (const model of models) {
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const apiKey = keys[keyIndex];

      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(30_000),
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          errors.push(`Key ${keyIndex + 1} on ${model}: rate limited (retry-after: ${retryAfter ?? 'unknown'})`);
          continue;
        }

        if (!response.ok) {
          const body = await response.text();
          errors.push(`Key ${keyIndex + 1} on ${model}: HTTP ${response.status} — ${body.slice(0, 200)}`);
          continue;
        }

        const data = await response.json() as {
          choices: { message: { content: string } }[];
        };

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          errors.push(`Key ${keyIndex + 1} on ${model}: empty response`);
          continue;
        }

        return content;
      } catch (err) {
        errors.push(`Key ${keyIndex + 1} on ${model}: ${err instanceof Error ? err.message : 'unknown error'}`);
        continue;
      }
    }
  }

  throw new Error(
    `All Groq keys and models exhausted.\n${errors.map((e, i) => `  Attempt ${i + 1}: ${e}`).join('\n')}`,
  );
}
