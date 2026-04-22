import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Point the PDF.js worker to the file we copied into public/
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extract all text from a PDF file.
 * Runs entirely in the browser — no file is uploaded anywhere.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  try {
    const pages: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pages.push(pageText);
    }

    return pages.join('\n\n');
  } finally {
    await pdf.destroy();
  }
}

/**
 * Extract text from a text-based file (txt, md, docx text).
 * For actual DOCX parsing, a library like mammoth.js would be needed.
 * For now, reads the raw text content.
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  return file.text();
}

/**
 * Auto-detect file type and extract text.
 */
export async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  }
  // txt, md, and other text formats
  return extractTextFromTextFile(file);
}
