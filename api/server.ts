import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import parseResumeHandler from './parse-resume';
import parseJdHandler from './parse-jd';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/parse-resume', async (req, res) => {
  try {
    await parseResumeHandler(req, res);
  } catch (error) {
    console.error('Unhandled error in parse-resume:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/parse-jd', async (req, res) => {
  try {
    await parseJdHandler(req, res);
  } catch (error) {
    console.error('Unhandled error in parse-jd:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
