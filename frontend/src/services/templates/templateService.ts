import type { TemplateRecord } from 'types/template';

const fallbackTemplates: TemplateRecord[] = [
  {
    id: 'template1',
    name: 'Classic',
    badge: 'Template 1',
    bestFor: 'ATS-friendly technical resumes with clear section rhythm',
    density: 'balanced',
    headerLayout: 'center',
    previewImageUrl: '/templates/previews/template1.jpg',
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template2',
    name: 'Sidebar',
    badge: 'Template 2',
    bestFor: 'Classic software-engineering resumes with compact ATS structure',
    density: 'tight',
    headerLayout: 'center',
    previewImageUrl: '/templates/previews/template2.jpg',
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template3',
    name: 'Structured',
    badge: 'Template 3',
    bestFor: 'Student and early-career resumes with coursework and projects',
    density: 'balanced',
    headerLayout: 'center',
    previewImageUrl: '/templates/previews/template3.jpg',
    sectionStyle: 'underline',
    availableForCompile: false,
  },
  {
    id: 'template4',
    name: 'Minimal',
    badge: 'Template 4',
    bestFor: 'Low-chrome resumes that still preserve hierarchy',
    density: 'airy',
    headerLayout: 'left',
    previewImageUrl: '/templates/previews/template4.png',
    sectionStyle: 'capsule',
    availableForCompile: false,
  },
  {
    id: 'template5',
    name: 'Bold',
    badge: 'Template 5',
    bestFor: 'Application versions that need slightly stronger visual presence',
    density: 'balanced',
    headerLayout: 'left',
    previewImageUrl: '/templates/previews/template5.png',
    sectionStyle: 'capsule',
    availableForCompile: false,
  },
];

export const templateService = {
  async list() {
    return structuredClone(fallbackTemplates);
  },
};
