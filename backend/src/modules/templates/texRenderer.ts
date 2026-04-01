import type { RenderOptions, ResumeData } from '../../../../shared/contracts/resume';
import { renderTemplate1ToTex } from '../../../../Tex Templates/template1/render';
import { renderTemplate2ToTex } from '../../../../Tex Templates/template2/render';
import { renderTemplate3ToTex } from '../../../../Tex Templates/template3/render';
import { renderTemplate4ToTex } from '../../../../Tex Templates/template4/render';
import { renderTemplate5ToTex } from '../../../../Tex Templates/template5/render';

type TemplateRenderer = (resume: ResumeData, options: RenderOptions) => string;

const renderers: Record<string, TemplateRenderer> = {
  template1: renderTemplate1ToTex,
  template2: renderTemplate2ToTex,
  template3: renderTemplate3ToTex,
  template4: renderTemplate4ToTex,
  template5: renderTemplate5ToTex,
};

function normalizeFilename(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return 'resume.tex';
  return trimmed.toLowerCase().endsWith('.tex') ? trimmed : `${trimmed}.tex`;
}

export function renderResumeToTex(resume: ResumeData, options: RenderOptions) {
  const renderer = renderers[options.templateId] ?? renderers.template1;
  return renderer(resume, options);
}

export function buildTexExportPayload(input: {
  title: string;
  resume: ResumeData;
  renderOptions: RenderOptions;
}) {
  const templateId = input.renderOptions.templateId;
  return {
    filename: normalizeFilename(input.title),
    templateId,
    tex: renderResumeToTex(input.resume, input.renderOptions),
  };
}
