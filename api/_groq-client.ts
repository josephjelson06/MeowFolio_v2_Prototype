/**
 * Groq API client with key cycling and model fallback.
 *
 * Strategy:
 *   1. Try GROQ_MODEL_PRIMARY with key 1, 2, 3
 *   2. If all 429, try GROQ_MODEL_FALLBACK with key 1, 2, 3
 *   3. If all 6 attempts fail, throw descriptive error
 */

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getKeys(): string[] {
  return [
    process.env.GROQ_KEY_1,
    process.env.GROQ_KEY_2,
    process.env.GROQ_KEY_3,
  ].filter((k): k is string => !!k);
}

function getModels(): string[] {
  return [
    process.env.GROQ_MODEL_PRIMARY || 'llama-3.3-70b-versatile',
    process.env.GROQ_MODEL_FALLBACK || 'llama-3.1-8b-instant',
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
    throw new Error('No GROQ_KEY_* environment variables configured');
  }
  console.log("USING GROQ KEYS:", keys.map(k => k.substring(0, 8) + '...'));

  const errors: string[] = [];

  for (const model of models) {
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const apiKey = keys[keyIndex];
      const messages: GroqMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
          }),
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
