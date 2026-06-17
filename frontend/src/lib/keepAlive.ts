/**
 * keepAlive.ts
 *
 * Previously used to ping a Render backend to prevent it from sleeping.
 * Now a no-op since all API routes (PDF extraction, AI parsing) run on Vercel
 * serverless functions which don't sleep.
 *
 * The recordApiRequest export is kept so existing call-sites in pdf-extractor.ts
 * don't need to be changed.
 */

export function recordApiRequest(): void {
  // No-op — Vercel serverless functions don't need a keep-alive ping.
}

export function startKeepAlive(): () => void {
  // No-op — no Render backend to keep alive.
  return () => undefined;
}
