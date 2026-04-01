import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const backendRoot = path.resolve(__dirname, '..', '..');
const projectRoot = path.resolve(backendRoot, '..');
const envPath = path.join(projectRoot, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function readString(name: string, fallback = '') {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readCsv(name: string, fallback: string[]) {
  const value = readString(name);
  return value ? value.split(',').map(item => item.trim()).filter(Boolean) : fallback;
}

function normalizeAllowedUploadType(value: string) {
  const next = value.trim().toLowerCase();
  if (!next) return '';
  return next.startsWith('.') ? next : next;
}

function buildFrontendOrigins(value: string[]) {
  const normalized = new Set<string>();
  for (const item of value) {
    if (item) normalized.add(item);
  }
  normalized.add('http://localhost:5173');
  return Array.from(normalized);
}

export const paths = {
  backendRoot,
  projectRoot,
  uploadsDir: path.join(backendRoot, 'uploads'),
  migrationsDir: path.join(backendRoot, 'migrations'),
  templateImagesDir: path.join(projectRoot, 'Templates'),
  texTemplatesDir: path.join(projectRoot, 'Tex Templates'),
};

export const env = {
  port: readNumber('PORT', 4000),
  databaseUrl: readString('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/resumeai'),
  frontendOrigins: buildFrontendOrigins(readCsv('FRONTEND_ORIGIN', ['http://localhost:5173'])),
  uploadDir: readString('UPLOAD_DIR', paths.uploadsDir),
  maxUploadSizeMb: readNumber('MAX_UPLOAD_SIZE_MB', 10),
  allowedUploadTypes: readCsv('ALLOWED_UPLOAD_TYPES', [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ]).map(normalizeAllowedUploadType).filter(Boolean),
  aiProvider: readString('AI_PROVIDER', 'groq'),
  groqApiKey: readString('GROQ_API_KEY'),
  groqModel: readString('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  compilerImage: readString('COMPILER_IMAGE'),
};

fs.mkdirSync(env.uploadDir, { recursive: true });
