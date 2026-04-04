import type { RenderOptions, ResumeData } from '../../shared/contracts/resume';
import { renderTemplate1ToTex } from '../../Tex Templates/template1/render';
import { renderTemplate2ToTex } from '../../Tex Templates/template2/render';
import { renderTemplate3ToTex } from '../../Tex Templates/template3/render';
import { renderTemplate4ToTex } from '../../Tex Templates/template4/render';
import { renderTemplate5ToTex } from '../../Tex Templates/template5/render';

type TemplateRenderer = (resume: ResumeData, options: RenderOptions) => string;

const renderers: Record<string, TemplateRenderer> = {
  template1: renderTemplate1ToTex,
  template2: renderTemplate2ToTex,
  template3: renderTemplate3ToTex,
  template4: renderTemplate4ToTex,
  template5: renderTemplate5ToTex,
};

interface RenderResumePayload {
  title: string;
  resume: ResumeData;
  renderOptions: RenderOptions;
}

function normalizeFilename(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return 'resume.tex';
  return trimmed.toLowerCase().endsWith('.tex') ? trimmed : `${trimmed}.tex`;
}

async function readStdin() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const raw = await readStdin();
  const payload = JSON.parse(raw) as RenderResumePayload;
  const templateId = payload.renderOptions?.templateId ?? 'template1';
  const renderer = renderers[templateId] ?? renderers.template1;
  const tex = renderer(payload.resume, payload.renderOptions);

  process.stdout.write(JSON.stringify({
    filename: normalizeFilename(payload.title),
    templateId,
    tex,
  }));
}

void main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  process.stderr.write(message);
  process.exit(1);
});
