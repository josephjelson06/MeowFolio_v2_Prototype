import { $typst } from '@myriaddreamin/typst.ts';
import type { ResumeData, RenderOptions } from 'types/resumeDocument';

let initialized = false;

/**
 * Lazily initialize the Typst WASM compiler.
 * Only loads once — subsequent calls are no-ops.
 */
async function ensureInit() {
  if (initialized) return;

  $typst.setCompilerInitOptions({
    getModule: () =>
      fetch(
        'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
      ).then((r) => r.arrayBuffer()),
  });

  $typst.setRendererInitOptions({
    getModule: () =>
      fetch(
        'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
      ).then((r) => r.arrayBuffer()),
  });

  initialized = true;
}

/**
 * Compile resume data into a PDF using the Typst WASM engine.
 *
 * @param data - The resume content (maps to ResumeData)
 * @param renderOptions - Render options (font, colors, section order)
 * @param templateId - Which template to use (template1-5)
 * @returns PDF as Uint8Array
 */
export async function compilePdf(
  data: ResumeData,
  renderOptions: RenderOptions,
  templateId: string,
): Promise<Uint8Array> {
  await ensureInit();

  // Fetch the template file
  const templateUrl = `/templates/typst/${templateId}.typ`;
  const templateResponse = await fetch(templateUrl);
  if (!templateResponse.ok) {
    throw new Error(`Failed to load template: ${templateUrl}`);
  }
  const templateSource = await templateResponse.text();

  // Build accent color components from the named color
  const accentColors: Record<string, { r: number; g: number; b: number }> = {
    charcoal: { r: 50, g: 50, b: 50 },
    navy: { r: 61, g: 90, b: 128 },
    slate: { r: 100, g: 116, b: 139 },
    forest: { r: 34, g: 100, b: 75 },
    berry: { r: 140, g: 50, b: 80 },
  };
  const accent = accentColors[renderOptions.accentColor] ?? accentColors.navy;

  // Prepare the inputs that the Typst template reads via sys.inputs
  const resumeDataJson = JSON.stringify(data);
  const renderOptsJson = JSON.stringify({
    ...renderOptions,
    accentColorR: accent.r,
    accentColorG: accent.g,
    accentColorB: accent.b,
  });

  // Compile to PDF
  const pdfBytes = await $typst.pdf({
    mainContent: templateSource,
    inputs: {
      'resume-data': resumeDataJson,
      'render-options': renderOptsJson,
    },
  });

  if (!pdfBytes) {
    throw new Error('PDF compilation failed or returned empty data');
  }

  return new Uint8Array(pdfBytes);
}

/**
 * Compile resume data and return a Blob URL for embedding in an iframe.
 */
export async function compilePdfBlobUrl(
  data: ResumeData,
  renderOptions: RenderOptions,
  templateId: string,
): Promise<string> {
  const pdfBytes = await compilePdf(data, renderOptions, templateId);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * Compile and trigger a browser download of the PDF.
 */
export async function downloadPdf(
  data: ResumeData,
  renderOptions: RenderOptions,
  templateId: string,
  filename = 'resume.pdf',
) {
  const pdfBytes = await compilePdf(data, renderOptions, templateId);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Compile resume data into an SVG string for preview.
 * Lighter weight than PDF for live preview rendering.
 */
export async function compileSvg(
  data: ResumeData,
  renderOptions: RenderOptions,
  templateId: string,
): Promise<string> {
  await ensureInit();

  const templateUrl = `/templates/typst/${templateId}.typ`;
  const templateResponse = await fetch(templateUrl);
  if (!templateResponse.ok) {
    throw new Error(`Failed to load template: ${templateUrl}`);
  }
  const templateSource = await templateResponse.text();

  const accentColors: Record<string, { r: number; g: number; b: number }> = {
    charcoal: { r: 50, g: 50, b: 50 },
    navy: { r: 61, g: 90, b: 128 },
    slate: { r: 100, g: 116, b: 139 },
    forest: { r: 34, g: 100, b: 75 },
    berry: { r: 140, g: 50, b: 80 },
  };
  const accent = accentColors[renderOptions.accentColor] ?? accentColors.navy;

  const resumeDataJson = JSON.stringify(data);
  const renderOptsJson = JSON.stringify({
    ...renderOptions,
    accentColorR: accent.r,
    accentColorG: accent.g,
    accentColorB: accent.b,
  });

  const svgString = await $typst.svg({
    mainContent: templateSource,
    inputs: {
      'resume-data': resumeDataJson,
      'render-options': renderOptsJson,
    },
  });

  return svgString;
}
