import fs from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { HttpError } from '../../lib/httpError';

export interface StoredUploadFile {
  filename: string;
  mimetype: string;
  originalname: string;
  path: string;
  size: number;
}

export async function extractTextFromUpload(file: StoredUploadFile) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === 'application/pdf' || extension === '.pdf') {
    const buffer = await fs.readFile(file.path);
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === '.docx') {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value.trim();
  }

  if (file.mimetype.startsWith('text/') || extension === '.txt' || extension === '.md') {
    const text = await fs.readFile(file.path, 'utf8');
    return text.trim();
  }

  throw new HttpError(415, 'Unsupported upload type.');
}
