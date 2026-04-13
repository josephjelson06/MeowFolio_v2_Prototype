import type { EditorSectionItem } from 'pages/workspace/editor/types';
import { createEmptyResumeData, DEFAULT_RENDER_OPTIONS, type ResumeData } from 'types/resumeDocument';

const BASE_SECTION_ORDER = ['summary', 'education', 'skills', 'experience', 'projects'] as const;

export function countForSection(resume: ResumeData, activeSection: string) {
  if (activeSection === 'experience') return Math.max(1, resume.experience.length);
  if (activeSection === 'education') return Math.max(1, resume.education.length);
  if (activeSection === 'projects') return Math.max(1, resume.projects.length);
  if (activeSection === 'skills') return Math.max(1, resume.skills.groups.length || (resume.skills.items.length ? 1 : 0));
  const customSection = resume.customSections.find(section => section.id === activeSection);
  if (customSection) return Math.max(1, customSection.entries.length);
  return 1;
}

export function sectionList(
  resume: ResumeData | null,
  sectionOrder: string[] = DEFAULT_RENDER_OPTIONS.sectionOrder,
): EditorSectionItem[] {
  const content = resume ?? createEmptyResumeData();
  const available = new Set<string>([...BASE_SECTION_ORDER, ...content.customSections.map(section => section.id)]);
  const persistedOrder = sectionOrder.length ? sectionOrder : [...BASE_SECTION_ORDER];
  const mergedOrder = [
    ...persistedOrder.filter(section => available.has(section)),
    ...Array.from(available).filter(section => !persistedOrder.includes(section)),
  ];

  const itemMap = new Map<string, EditorSectionItem>([
    ['contact', { id: 'contact', label: 'Contact', done: Boolean(content.header.name || content.header.email) }],
    ['summary', { id: 'summary', label: 'Summary', done: Boolean(content.summary.content), movable: true }],
    ['education', { id: 'education', label: 'Education', done: content.education.length > 0, movable: true }],
    ['skills', { id: 'skills', label: 'Skills', done: content.skills.items.length > 0 || content.skills.groups.length > 0, movable: true }],
    ['experience', { id: 'experience', label: 'Experience', done: content.experience.length > 0, movable: true }],
    ['projects', { id: 'projects', label: 'Projects', done: content.projects.length > 0, movable: true }],
  ]);

  content.customSections.forEach(section => {
    itemMap.set(section.id, {
      id: section.id,
      label: section.label,
      done: section.entries.length > 0,
      movable: true,
      removable: true,
    });
  });

  return ['contact', ...mergedOrder].map(section => itemMap.get(section)).filter(Boolean) as EditorSectionItem[];
}
