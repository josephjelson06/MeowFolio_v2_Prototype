/**
 * Local development server — NOT deployed to Vercel.
 *
 * Serves only /api/extract-text so the Vite dev server (port 5173)
 * can proxy PDF/DOCX extraction requests to this Express server (port 3001).
 *
 * On Vercel, api/extract-text.ts runs as a standalone serverless function
 * directly — no Express wrapper needed.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'path';
import path from 'path';

// Load .env.local from the root directory
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../.env.local') });
config({ path: path.resolve(__dirname, '../.env') });

import extractTextHandler from './extract-text';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() });
});

// PDF / DOCX text extraction — the only route needed
app.post('/api/extract-text', async (req, res) => {
  try {
    await extractTextHandler(req as any, res as any);
  } catch (error) {
    console.error('Unhandled error in extract-text:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local API Server running at http://localhost:${PORT}`);
  console.log(`   Only /api/extract-text is proxied — Groq runs directly in the browser.`);
});

export default app;
