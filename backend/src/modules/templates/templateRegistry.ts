import type { TemplatePreviewRecord } from '../../../../shared/contracts/template';
import { paths } from '../../config/env';

function previewImage(relativeFile: string) {
  return `/static/templates/${relativeFile}`;
}

export const templateRegistry: TemplatePreviewRecord[] = [
  {
    id: 'template1',
    name: 'Classic',
    badge: 'Template 1',
    bestFor: 'ATS-friendly technical resumes with clear section rhythm',
    density: 'balanced',
    description: 'Centered identity block with ruled sections and clean multi-page flow.',
    headerLayout: 'center',
    previewImageUrl: previewImage('Temp1.jpg'),
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template2',
    name: 'Sidebar',
    badge: 'Template 2',
    bestFor: 'Classic software-engineering resumes with compact ATS structure',
    density: 'tight',
    description: 'Compact single-column technical layout with strong scanability.',
    headerLayout: 'center',
    previewImageUrl: previewImage('Temp2.jpg'),
    sectionStyle: 'rule',
    availableForCompile: false,
  },
  {
    id: 'template3',
    name: 'Structured',
    badge: 'Template 3',
    bestFor: 'Student and early-career resumes with coursework and projects',
    density: 'balanced',
    description: 'Jake-style resume layout with dense but readable section rhythm.',
    headerLayout: 'center',
    previewImageUrl: previewImage('Temp5.jpg'),
    sectionStyle: 'underline',
    availableForCompile: false,
  },
  {
    id: 'template4',
    name: 'Minimal',
    badge: 'Template 4',
    bestFor: 'Low-chrome resumes that still preserve hierarchy',
    density: 'airy',
    description: 'Lean visual treatment with lighter section chrome and wider breathing room.',
    headerLayout: 'left',
    previewImageUrl: previewImage('Temp6.png'),
    sectionStyle: 'capsule',
    availableForCompile: false,
  },
  {
    id: 'template5',
    name: 'Bold',
    badge: 'Template 5',
    bestFor: 'Application versions that need slightly stronger visual presence',
    density: 'balanced',
    description: 'A more expressive layout with a confident section treatment and compact flow.',
    headerLayout: 'left',
    previewImageUrl: previewImage('Temp7.png'),
    sectionStyle: 'capsule',
    availableForCompile: false,
  },
];

export function getTemplateById(templateId: string) {
  return templateRegistry.find(template => template.id === templateId) ?? templateRegistry[0];
}

export function getTemplateRuntimeMeta() {
  return {
    compileEnabled: false,
    compilerImage: Boolean(paths.texTemplatesDir),
    texSourceAvailable: true,
  };
}
