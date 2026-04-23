// (No imports needed at the top level for pdf-extractor)

/**
 * Returns true on Android/iOS mobile browsers where pdf.js workers
 * are frequently killed by the OS due to memory constraints.
 */
function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Extract all text from a PDF file — runs entirely in the browser.
 * No file is uploaded to any server.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
  
  // Point the PDF.js worker to the file we copied into public/
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  return file.text();
}

/**
 * Auto-detect file type and extract text.
 * 100% Client-side.
 */
export async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  }

  // txt, md, and other text formats
  return extractTextFromTextFile(file);
}
