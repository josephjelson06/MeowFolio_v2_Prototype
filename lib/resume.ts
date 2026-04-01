import type {
  DateField,
  DescriptionField,
  LinkField,
  ResumeData,
  SkillsSection,
  SummaryMode,
} from '../types/resume';

function clean(value?: string | null) {
  return typeof value === 'string' ? value.trim() : '';
}

export function splitLineItems(value: string) {
  return value
    .split(/\r?\n+/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function getLinkUrl(link?: LinkField | null) {
  return clean(link?.url);
}

export function getLinkLabel(link?: LinkField | null) {
  if (!link) return '';
  const displayText = clean(link.displayText);
  const url = getLinkUrl(link);
  if (link.displayMode === 'hyperlinked-text' && displayText) {
    return displayText;
  }
  return displayText || url;
}

function getSummaryModeLabel(mode?: SummaryMode | null) {
  return mode === 'career-objective' ? 'Career Objective' : 'Professional Summary';
}

export function getProfileLabel(resume: ResumeData) {
  return getSummaryModeLabel(resume.summary.mode);
}

export function getSummaryText(resume: ResumeData) {
  return clean(resume.summary.content);
}

export function flattenSkills(skills: SkillsSection) {
  const values = skills.mode === 'grouped'
    ? skills.groups.flatMap(group => group.items)
    : skills.items;

  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean)));
}

function joinMonthYear(month?: string | null, year?: string | null) {
  const monthValue = clean(month);
  const yearValue = clean(year);
  if (monthValue && yearValue) return `${monthValue} ${yearValue}`;
  return monthValue || yearValue;
}

export function formatDateField(date?: DateField | null) {
  if (!date) return '';

  const start = joinMonthYear(date.startMonth, date.startYear);
  const end = date.isOngoing ? 'Present' : joinMonthYear(date.endMonth, date.endYear);

  switch (date.mode) {
    case 'mm-yyyy':
    case 'yyyy':
      return start || end;
    case 'mm-yyyy-range':
    case 'yyyy-range':
    case 'mm-yyyy-present':
    case 'yyyy-present':
      if (start && end) return `${start} - ${end}`;
      return start || end;
    default:
      return start || end;
  }
}

export function getResumeContactLines(resume: ResumeData) {
  return [
    clean(resume.header.email),
    clean(resume.header.phone),
    clean(resume.header.address),
  ].filter(Boolean);
}

export function getDescriptionParagraph(description: DescriptionField) {
  if (description.mode === 'paragraph') {
    return clean(description.paragraph);
  }
  return description.bullets.map(item => item.trim()).filter(Boolean).join(' ');
}
