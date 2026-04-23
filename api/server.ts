import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import parseResumeHandler from './parse-resume';
import parseJdHandler from './parse-jd';
import extractTextHandler from './extract-text-express';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: allow all origins — the API is protected by Supabase auth tokens,
// so it's safe to open CORS. This avoids any Vercel preview URL mismatches.
app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '20mb' }));

// Health check — used by the keep-alive ping from the frontend
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() });
});

app.post('/api/parse-resume', async (req, res) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await parseResumeHandler(req as any, res as any);
  } catch (error) {
    console.error('Unhandled error in parse-resume:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/parse-jd', async (req, res) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await parseJdHandler(req as any, res as any);
  } catch (error) {
    console.error('Unhandled error in parse-jd:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/extract-text', async (req, res) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await extractTextHandler(req as any, res as any);
  } catch (error) {
    console.error('Unhandled error in extract-text:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
