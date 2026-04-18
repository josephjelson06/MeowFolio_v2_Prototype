import type { EditorSectionItem } from 'pages/workspace/editor/types';
import { createEmptyResumeData, DEFAULT_RENDER_OPTIONS, DEFAULT_RESUME_SECTION_ORDER, GENERIC_CUSTOM_SECTION_LABELS, isGenericCustomSectionKey, type GenericCustomSectionKey, type ResumeData, type ResumeSectionKey } from 'types/resumeDocument';

export function countForSection(resume: ResumeData, activeSection: string) {
  if (activeSection === 'experience') return Math.max(1, resume.experience.length);
  if (activeSection === 'education') return Math.max(1, resume.education.length);
  if (activeSection === 'projects') return Math.max(1, resume.projects.length);
  if (activeSection === 'skills') return Math.max(1, resume.skills.groups.length || (resume.skills.items.length ? 1 : 0));
  if (activeSection === 'certifications') return Math.max(1, resume.certifications.length);
  if (activeSection === 'languages') return Math.max(1, resume.languages.groups.length || (resume.languages.items.length ? 1 : 0));
  if (activeSection === 'hobbies') return Math.max(1, resume.hobbies.groups.length || (resume.hobbies.items.length ? 1 : 0));
  
  if (isGenericCustomSectionKey(activeSection)) {
    return Math.max(1, resume[activeSection as GenericCustomSectionKey].entries.length);
  }
  return 1;
}

export function sectionList(
  resume: ResumeData | null,
  sectionOrder: ResumeSectionKey[] = DEFAULT_RENDER_OPTIONS.sectionOrder as ResumeSectionKey[],
): EditorSectionItem[] {
  const content = resume ?? createEmptyResumeData();
  const persistedOrder = sectionOrder.length ? sectionOrder : [...DEFAULT_RESUME_SECTION_ORDER];

  const itemMap = new Map<string, EditorSectionItem>([
    ['contact', { id: 'contact', label: 'Contact', done: Boolean(content.header.name || content.header.email) }],
    ['summary', { id: 'summary', label: 'Summary', done: Boolean(content.summary.content), movable: true }],
    ['education', { id: 'education', label: 'Education', done: content.education.length > 0, movable: true }],
    ['skills', { id: 'skills', label: 'Skills', done: content.skills.items.length > 0 || content.skills.groups.length > 0, movable: true }],
    ['experience', { id: 'experience', label: 'Experience', done: content.experience.length > 0, movable: true }],
    ['projects', { id: 'projects', label: 'Projects', done: content.projects.length > 0, movable: true }],
    ['certifications', { id: 'certifications', label: 'Certifications', done: content.certifications.length > 0, movable: true }],
    ['languages', { id: 'languages', label: 'Languages', done: content.languages.items.length > 0 || content.languages.groups.length > 0, movable: true }],
    ['hobbies', { id: 'hobbies', label: 'Hobbies', done: content.hobbies.items.length > 0 || content.hobbies.groups.length > 0, movable: true }],
  ]);

  Object.keys(GENERIC_CUSTOM_SECTION_LABELS).forEach(k => {
    const key = k as GenericCustomSectionKey;
    itemMap.set(key, {
      id: key,
      label: content[key].label || GENERIC_CUSTOM_SECTION_LABELS[key],
      done: content[key].entries.length > 0,
      movable: true,
      removable: true,
    });
  });

  return ['contact', ...persistedOrder].map(section => itemMap.get(section)).filter(Boolean) as EditorSectionItem[];
}
