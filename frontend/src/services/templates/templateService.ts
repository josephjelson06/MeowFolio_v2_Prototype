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
    id: 'template1',
    name: 'Classic Smallcaps',
    badge: 'Template 2',
    bestFor: 'ATS-friendly technical resumes with clear section rhythm and smallcaps headings',
    density: 'balanced',
    headerLayout: 'center',
    previewImageUrl: '/Templates/previews/template1.jpg',
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template3',
    name: 'Engineering Minimalist',
    badge: 'Template 3',
    bestFor: 'Left-aligned tech resumes, optimized for FAANG and technical roles',
    density: 'balanced',
    headerLayout: 'left',
    previewImageUrl: '/Templates/previews/template3.jpg',
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template4',
    name: 'Minimal',
    badge: 'Template 4',
    bestFor: 'Low-chrome, whitespace-heavy resumes that preserve elegant hierarchy',
    density: 'airy',
    headerLayout: 'left',
    previewImageUrl: '/Templates/previews/template4.png',
    sectionStyle: 'capsule',
    availableForCompile: false,
  },
  {
    id: 'template5',
    name: 'Bold',
    badge: 'Template 5',
    bestFor: 'Application versions that need slightly stronger visual and accent presence',
    density: 'balanced',
    headerLayout: 'left',
    previewImageUrl: '/Templates/previews/template5.png',
    sectionStyle: 'capsule',
    availableForCompile: false,
  },
];

export const templateService = {
  async list() {
    return structuredClone(fallbackTemplates);
  },
};
