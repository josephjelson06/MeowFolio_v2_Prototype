import {
  createEmptyCustomEntry,
  createEmptyCustomSection,
  createEmptyDateField,
  createEmptyDescriptionField,
  createEmptyDynamicSection,
  createEmptyLinkField,
  createEmptyResumeData,
  DEFAULT_RENDER_OPTIONS,
  type CertificationEntry,
  type CustomEntriesSection,
  type DateField,
  type DescriptionField,
  type DynamicCustomSection,
  type EducationEntry,
  type ExperienceEntry,
  type LanguageItem,
  type LinkField,
  type ProfileSection,
  type ProjectEntry,
  type RenderOptions,
  type ResumeData,
  type ResumeSource,
  type SkillsSection,
} from '../../../../shared/contracts/resume';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(item => stringValue(item)).filter(Boolean) : [];
}

function monthValue(value: unknown): DateField['startMonth'] {
  if (typeof value !== 'string') return '';
  return value.length === 3 ? (value as DateField['startMonth']) : '';
}

function normalizeLinkField(value: unknown): LinkField {
  if (!isRecord(value)) return createEmptyLinkField();
  return {
    displayMode: value.displayMode === 'hyperlinked-text' ? 'hyperlinked-text' : 'plain-url',
    displayText: stringValue(value.displayText),
    url: stringValue(value.url),
  };
}

function normalizeDateField(value: unknown, fallbackMode: DateField['mode'] = 'mm-yyyy-range'): DateField {
  if (!isRecord(value)) return createEmptyDateField(fallbackMode);
  const mode = typeof value.mode === 'string' ? (value.mode as DateField['mode']) : fallbackMode;
  return {
    endMonth: monthValue(value.endMonth),
    endYear: stringValue(value.endYear),
    isOngoing: Boolean(value.isOngoing),
    mode,
    startMonth: monthValue(value.startMonth),
    startYear: stringValue(value.startYear),
  };
}

function normalizeDescriptionField(value: unknown): DescriptionField {
  if (!isRecord(value)) return createEmptyDescriptionField('bullets');
  const mode = value.mode === 'paragraph' ? 'paragraph' : 'bullets';
  return {
    bullets: stringArray(value.bullets),
    mode,
    paragraph: stringValue(value.paragraph),
  };
}

function normalizeSummary(value: unknown): ProfileSection {
  if (!isRecord(value)) return { content: '', mode: 'professional-summary' };
  return {
    content: stringValue(value.content),
    mode: value.mode === 'career-objective' ? 'career-objective' : 'professional-summary',
  };
}

function normalizeEducationEntry(value: unknown): EducationEntry {
  return {
    boardOrUniversity: isRecord(value) ? stringValue(value.boardOrUniversity) : '',
    date: isRecord(value) ? normalizeDateField(value.date, 'yyyy-range') : createEmptyDateField('yyyy-range'),
    degree: isRecord(value) ? stringValue(value.degree) : '',
    field: isRecord(value) ? stringValue(value.field) : '',
    institution: isRecord(value) ? stringValue(value.institution) : '',
    level: isRecord(value) && typeof value.level === 'string' ? (value.level as EducationEntry['level']) : 'degree-diploma',
    location: isRecord(value) ? stringValue(value.location) : '',
    result: isRecord(value) ? stringValue(value.result) : '',
    resultType: isRecord(value) && typeof value.resultType === 'string' ? (value.resultType as EducationEntry['resultType']) : null,
  };
}

function normalizeSkillsSection(value: unknown): SkillsSection {
  if (!isRecord(value)) {
    return {
      groups: [],
      items: [],
      mode: 'csv',
    };
  }

  const groups = Array.isArray(value.groups)
    ? value.groups
        .filter(isRecord)
        .map(group => ({
          groupLabel: stringValue(group.groupLabel),
          items: stringArray(group.items),
        }))
    : [];

  return {
    groups,
    items: stringArray(value.items),
    mode: value.mode === 'grouped' ? 'grouped' : 'csv',
  };
}

function normalizeExperienceEntry(value: unknown): ExperienceEntry {
  return {
    company: isRecord(value) ? stringValue(value.company) : '',
    date: isRecord(value) ? normalizeDateField(value.date, 'mm-yyyy-range') : createEmptyDateField('mm-yyyy-range'),
    description: isRecord(value) ? normalizeDescriptionField(value.description) : createEmptyDescriptionField('bullets'),
    isCurrent: isRecord(value) ? Boolean(value.isCurrent) : false,
    location: isRecord(value) ? stringValue(value.location) : '',
    role: isRecord(value) ? stringValue(value.role) : '',
  };
}

function normalizeProjectEntry(value: unknown): ProjectEntry {
  return {
    date: isRecord(value) ? normalizeDateField(value.date, 'mm-yyyy-range') : createEmptyDateField('mm-yyyy-range'),
    description: isRecord(value) ? normalizeDescriptionField(value.description) : createEmptyDescriptionField('bullets'),
    githubLink: isRecord(value) ? normalizeLinkField(value.githubLink) : createEmptyLinkField(),
    liveLink: isRecord(value) ? normalizeLinkField(value.liveLink) : createEmptyLinkField(),
    technologies: isRecord(value) ? stringArray(value.technologies) : [],
    title: isRecord(value) ? stringValue(value.title) : '',
  };
}

function normalizeCertificationEntry(value: unknown): CertificationEntry {
  return {
    date: isRecord(value) ? normalizeDateField(value.date, 'yyyy') : createEmptyDateField('yyyy'),
    description: isRecord(value) ? stringValue(value.description) : '',
    issuer: isRecord(value) ? stringValue(value.issuer) : '',
    link: isRecord(value) ? normalizeLinkField(value.link) : createEmptyLinkField(),
    title: isRecord(value) ? stringValue(value.title) : '',
  };
}

function normalizeCustomSection(value: unknown, fallbackLabel: string): CustomEntriesSection {
  const base = createEmptyCustomSection('leadership');
  base.label = fallbackLabel;
  if (!isRecord(value)) return base;

  return {
    entries: Array.isArray(value.entries)
      ? value.entries
          .filter(isRecord)
          .map(entry => ({
            ...createEmptyCustomEntry(),
            date: normalizeDateField(entry.date, 'mm-yyyy'),
            description: normalizeDescriptionField(entry.description),
            link: normalizeLinkField(entry.link),
            location: stringValue(entry.location),
            subtitle: stringValue(entry.subtitle),
            title: stringValue(entry.title),
          }))
      : [],
    label: stringValue(value.label, fallbackLabel),
  };
}

function normalizeDynamicSections(value: unknown): DynamicCustomSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((section, index) => {
      const base = createEmptyDynamicSection(stringValue(section.id, `custom_${index + 1}`), stringValue(section.label, `Custom Section ${index + 1}`));
      return {
        ...base,
        entries: Array.isArray(section.entries)
          ? section.entries
              .filter(isRecord)
              .map(entry => ({
                ...createEmptyCustomEntry(),
                date: normalizeDateField(entry.date, 'mm-yyyy'),
                description: normalizeDescriptionField(entry.description),
                link: normalizeLinkField(entry.link),
                location: stringValue(entry.location),
                subtitle: stringValue(entry.subtitle),
                title: stringValue(entry.title),
              }))
          : [],
      };
    });
}

function normalizeLanguages(value: unknown): ResumeData['languages'] {
  if (!isRecord(value)) {
    return { groups: [], items: [], mode: 'csv' };
  }
  return {
    groups: Array.isArray(value.groups)
      ? value.groups
          .filter(isRecord)
          .map(group => ({ groupLabel: stringValue(group.groupLabel), items: stringArray(group.items) }))
      : [],
    items: Array.isArray(value.items)
      ? value.items
          .filter(isRecord)
          .map(item => ({
            language: stringValue(item.language),
            proficiency: typeof item.proficiency === 'string' ? (item.proficiency as LanguageItem['proficiency']) : null,
          }))
      : [],
    mode: value.mode === 'grouped' ? 'grouped' : 'csv',
  };
}

function normalizeHobbies(value: unknown): ResumeData['hobbies'] {
  if (!isRecord(value)) {
    return { groups: [], items: [], mode: 'csv' };
  }
  return {
    groups: Array.isArray(value.groups)
      ? value.groups
          .filter(isRecord)
          .map(group => ({ groupLabel: stringValue(group.groupLabel), items: stringArray(group.items) }))
      : [],
    items: stringArray(value.items),
    mode: value.mode === 'grouped' ? 'grouped' : 'csv',
  };
}

export function normalizeRenderOptions(value: unknown): RenderOptions {
  const base = { ...DEFAULT_RENDER_OPTIONS, sectionOrder: [...DEFAULT_RENDER_OPTIONS.sectionOrder], sectionTitles: { ...DEFAULT_RENDER_OPTIONS.sectionTitles } };
  if (!isRecord(value)) return base;
  return {
    accentColor: typeof value.accentColor === 'string' ? (value.accentColor as RenderOptions['accentColor']) : base.accentColor,
    fontFamily: typeof value.fontFamily === 'string' ? (value.fontFamily as RenderOptions['fontFamily']) : base.fontFamily,
    fontSize: typeof value.fontSize === 'number' ? value.fontSize : base.fontSize,
    lineSpacing: typeof value.lineSpacing === 'number' ? value.lineSpacing : base.lineSpacing,
    margin: stringValue(value.margin, base.margin),
    maxBulletsPerEntry: typeof value.maxBulletsPerEntry === 'number' ? value.maxBulletsPerEntry : base.maxBulletsPerEntry,
    pageLimit: value.pageLimit === 2 ? 2 : 1,
    sectionOrder: Array.isArray(value.sectionOrder) ? value.sectionOrder.map(item => stringValue(item)).filter(Boolean) : [...base.sectionOrder],
    sectionTitles: isRecord(value.sectionTitles)
      ? Object.fromEntries(Object.entries(value.sectionTitles).map(([key, item]) => [key, stringValue(item)]))
      : { ...base.sectionTitles },
    templateId: typeof value.templateId === 'string' ? (value.templateId as RenderOptions['templateId']) : base.templateId,
  };
}

export function normalizeResumeData(value: unknown, source: ResumeSource = 'scratch'): ResumeData {
  const base = createEmptyResumeData(source);
  if (!isRecord(value)) return base;

  const now = new Date().toISOString();
  const header = isRecord(value.header) ? value.header : {};

  return {
    achievements: normalizeCustomSection(value.achievements, 'Achievements'),
    certifications: Array.isArray(value.certifications) ? value.certifications.map(normalizeCertificationEntry) : [],
    competitions: normalizeCustomSection(value.competitions, 'Competitions'),
    customSections: normalizeDynamicSections(value.customSections),
    education: Array.isArray(value.education) ? value.education.map(normalizeEducationEntry) : [],
    experience: Array.isArray(value.experience) ? value.experience.map(normalizeExperienceEntry) : [],
    extracurricular: normalizeCustomSection(value.extracurricular, 'Extra-Curricular'),
    header: {
      address: stringValue(header.address),
      email: stringValue(header.email),
      github: normalizeLinkField(header.github),
      linkedin: normalizeLinkField(header.linkedin),
      name: stringValue(header.name),
      phone: stringValue(header.phone),
      role: stringValue(header.role),
      website: normalizeLinkField(header.website),
    },
    hobbies: normalizeHobbies(value.hobbies),
    languages: normalizeLanguages(value.languages),
    leadership: normalizeCustomSection(value.leadership, 'Leadership'),
    meta: {
      createdAt: isRecord(value.meta) ? stringValue(value.meta.createdAt, base.meta.createdAt) : base.meta.createdAt,
      source,
      updatedAt: now,
      version: isRecord(value.meta) ? stringValue(value.meta.version, base.meta.version) : base.meta.version,
    },
    openSource: normalizeCustomSection(value.openSource, 'Open-Source'),
    projects: Array.isArray(value.projects) ? value.projects.map(normalizeProjectEntry) : [],
    publications: normalizeCustomSection(value.publications, 'Publications'),
    skills: normalizeSkillsSection(value.skills),
    summary: normalizeSummary(value.summary),
  };
}

export function buildResumePlainText(resume: ResumeData) {
  const parts: string[] = [];
  const push = (...items: Array<string | undefined | null>) => {
    const text = items.filter(Boolean).join(' ').trim();
    if (text) parts.push(text);
  };

  push(resume.header.name, resume.header.role, resume.header.email, resume.header.phone, resume.header.address);
  push(resume.summary.content);
  resume.education.forEach(item => push(item.degree, item.field, item.institution, item.boardOrUniversity, item.result));
  push(resume.skills.items.join(' '));
  resume.skills.groups.forEach(group => push(group.groupLabel, group.items.join(' ')));
  resume.experience.forEach(item => push(item.role, item.company, item.location, item.description.bullets.join(' '), item.description.paragraph));
  resume.projects.forEach(item => push(item.title, item.technologies.join(' '), item.description.bullets.join(' '), item.description.paragraph));
  resume.certifications.forEach(item => push(item.title, item.issuer, item.description));
  [resume.leadership, resume.achievements, resume.competitions, resume.extracurricular, resume.publications, resume.openSource, ...resume.customSections]
    .forEach(section => {
      push(section.label);
      section.entries.forEach(entry => push(entry.title, entry.subtitle, entry.location, entry.description.bullets.join(' '), entry.description.paragraph));
    });
  resume.languages.items.forEach(item => push(item.language, item.proficiency));
  push(resume.hobbies.items.join(' '));

  return parts.join('\n');
}
