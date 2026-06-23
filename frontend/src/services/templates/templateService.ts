import type { TemplateRecord } from 'types/template';

const fallbackTemplates: TemplateRecord[] = [
  {
    id: 'template2',
    name: 'Classic',
    badge: 'Template 1',
    bestFor: 'Classic software-engineering resumes with compact ATS structure',
    density: 'tight',
    headerLayout: 'center',
    previewImageUrl: '/Templates/previews/template2.png',
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template3',
    name: 'Engineering Minimalist',
    badge: 'Template 2',
    bestFor: 'Left-aligned tech resumes, optimized for FAANG and technical roles',
    density: 'balanced',
    headerLayout: 'left',
    previewImageUrl: '/Templates/previews/template3.jpg',
    sectionStyle: 'rule',
    availableForCompile: false,
  },
];

export const templateService = {
  async list() {
    return structuredClone(fallbackTemplates);
  },
};
