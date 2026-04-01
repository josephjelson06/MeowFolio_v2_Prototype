import { randomUUID } from 'node:crypto';
import {
  createEmptyDescriptionField,
  createEmptyLinkField,
  createEmptyResumeData,
  DEFAULT_RENDER_OPTIONS,
  type ResumeData,
} from '../../../../shared/contracts/resume';
import { slugify } from '../../lib/formatters';
import { parseResumeWithGroq } from './groqClient';
import { normalizeResumeData } from '../resumes/normalizer';

const SECTION_ALIASES: Array<{ key: string; match: RegExp }> = [
  { key: 'summary', match: /^(summary|profile|professional summary|career objective|objective)$/i },
  { key: 'education', match: /^education$/i },
  { key: 'skills', match: /^skills?$/i },
  { key: 'experience', match: /^(experience|work experience|internships?)$/i },
  { key: 'projects', match: /^projects?$/i },
  { key: 'certifications', match: /^certifications?$/i },
  { key: 'languages', match: /^languages?$/i },
  { key: 'hobbies', match: /^(hobbies|interests|hobbies & interests)$/i },
];

function extractContacts(text: string, resume: ResumeData) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? '';
  const phone = text.match(/(\+?\d[\d\s()-]{8,}\d)/)?.[0] ?? '';
  const github = text.match(/github\.com\/[^\s]+/i)?.[0] ?? '';
  const linkedin = text.match(/linkedin\.com\/[^\s]+/i)?.[0] ?? '';

  resume.header.email = email;
  resume.header.phone = phone;
  resume.header.github = { ...createEmptyLinkField(), url: github };
  resume.header.linkedin = { ...createEmptyLinkField(), url: linkedin };
}

function detectSections(lines: string[]) {
  const sections = new Map<string, string[]>();
  let current = 'intro';
  sections.set(current, []);

  for (const line of lines) {
    const alias = SECTION_ALIASES.find(item => item.match.test(line));
    if (alias) {
      current = alias.key;
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }
    sections.get(current)?.push(line);
  }

  return sections;
}

function parseSkills(lines: string[], resume: ResumeData) {
  const grouped = lines
    .map(line => line.split(':'))
    .filter(parts => parts.length >= 2);

  if (grouped.length) {
    resume.skills.mode = 'grouped';
    resume.skills.groups = grouped.map(parts => ({
      groupLabel: parts[0].trim(),
      items: parts.slice(1).join(':').split(',').map(item => item.trim()).filter(Boolean),
    }));
    return;
  }

  resume.skills.items = lines.join(',').split(',').map(item => item.trim()).filter(Boolean);
}

function parseSimpleBullets(lines: string[]) {
  return lines
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function heuristicParseResumeText(rawText: string): { resume: ResumeData; warnings: string[] } {
  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const resume = createEmptyResumeData('upload');
  const sections = detectSections(lines);
  const warnings = ['AI parse unavailable or incomplete, so a heuristic import was used.'];

  resume.header.name = lines[0] ?? 'Imported Resume';
  if (lines[1] && !/@|github|linkedin|\+?\d/.test(lines[1])) {
    resume.header.role = lines[1];
  }
  extractContacts(rawText, resume);

  const summaryLines = sections.get('summary') ?? [];
  resume.summary.content = summaryLines.join(' ').trim();

  const educationLines = sections.get('education') ?? [];
  resume.education = educationLines.map(line => ({
    boardOrUniversity: '',
    date: { endMonth: '', endYear: '', isOngoing: false, mode: 'yyyy-range', startMonth: '', startYear: '' },
    degree: line,
    field: '',
    institution: '',
    level: 'degree-diploma',
    location: '',
    result: '',
    resultType: null,
  }));

  parseSkills(sections.get('skills') ?? [], resume);

  const experienceLines = sections.get('experience') ?? [];
  if (experienceLines.length) {
    const bullets = parseSimpleBullets(experienceLines);
    resume.experience = [{
      company: '',
      date: { endMonth: '', endYear: '', isOngoing: false, mode: 'mm-yyyy-range', startMonth: '', startYear: '' },
      description: { ...createEmptyDescriptionField('bullets'), bullets },
      isCurrent: false,
      location: '',
      role: experienceLines[0]?.replace(/^[-*•]\s*/, '') ?? '',
    }];
  }

  const projectLines = sections.get('projects') ?? [];
  if (projectLines.length) {
    const bullets = parseSimpleBullets(projectLines.slice(1));
    resume.projects = [{
      date: { endMonth: '', endYear: '', isOngoing: false, mode: 'mm-yyyy-range', startMonth: '', startYear: '' },
      description: { ...createEmptyDescriptionField('bullets'), bullets },
      githubLink: createEmptyLinkField(),
      liveLink: createEmptyLinkField(),
      technologies: [],
      title: projectLines[0] ?? 'Imported Project',
    }];
  }

  const certificationLines = sections.get('certifications') ?? [];
  resume.certifications = certificationLines.map(line => ({
    date: { endMonth: '', endYear: '', isOngoing: false, mode: 'yyyy', startMonth: '', startYear: '' },
    description: '',
    issuer: '',
    link: createEmptyLinkField(),
    title: line,
  }));

  const languageLines = sections.get('languages') ?? [];
  resume.languages.items = languageLines
    .flatMap(line => line.split(',').map(item => item.trim()).filter(Boolean))
    .map(item => ({
      language: item.split(':')[0]?.trim() ?? item,
      proficiency: item.includes(':') ? (item.split(':')[1]?.trim().toLowerCase() as never) : null,
    }));

  const hobbyLines = sections.get('hobbies') ?? [];
  resume.hobbies.items = hobbyLines.flatMap(line => line.split(',').map(item => item.trim()).filter(Boolean));

  return { resume, warnings };
}

export async function importResumeFromText(rawText: string, sourceName = 'Imported Resume') {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      extractedText: '',
      parseStatus: 'failed' as const,
      renderOptions: { ...DEFAULT_RENDER_OPTIONS },
      resume: createEmptyResumeData('upload'),
      title: `${slugify(sourceName || 'resume') || `resume_${randomUUID().slice(0, 6)}`}.tex`,
      warnings: ['No resume text was detected during import.'],
    };
  }

  const warnings: string[] = [];
  let parsed: unknown = null;

  try {
    parsed = await parseResumeWithGroq(trimmed);
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : 'AI resume parsing failed.');
  }

  if (parsed) {
    const resume = normalizeResumeData(parsed, 'upload');
    return {
      extractedText: trimmed,
      parseStatus: warnings.length ? 'partial' as const : 'parsed' as const,
      renderOptions: { ...DEFAULT_RENDER_OPTIONS },
      resume,
      title: `${slugify(sourceName || resume.header.name || 'resume') || `resume_${randomUUID().slice(0, 6)}`}.tex`,
      warnings,
    };
  }

  const heuristic = heuristicParseResumeText(trimmed);
  return {
    extractedText: trimmed,
    parseStatus: heuristic.warnings.length ? 'partial' as const : 'parsed' as const,
    renderOptions: { ...DEFAULT_RENDER_OPTIONS },
    resume: heuristic.resume,
    title: `${slugify(sourceName || heuristic.resume.header.name || 'resume') || `resume_${randomUUID().slice(0, 6)}`}.tex`,
    warnings: [...warnings, ...heuristic.warnings],
  };
}
