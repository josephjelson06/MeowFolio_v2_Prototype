import type { JdMatchResponse, JdParsedMeta, ScoreCheck, ScoreMetric } from '../../../../shared/contracts/jd';
import type { ResumeData } from '../../../../shared/contracts/resume';
import { buildResumePlainText } from '../resumes/normalizer';

const COMMON_SKILLS = [
  'python',
  'react',
  'node',
  'node.js',
  'rest',
  'rest api',
  'apis',
  'aws',
  'docker',
  'postgresql',
  'kubernetes',
  'sql',
  'typescript',
  'javascript',
  'cloud',
  'scalable',
  'backend',
  'frontend',
  'ml',
  'tensorflow',
  'pytorch',
  'data pipelines',
  'analytics',
  'system design',
];

const STOP_WORDS = new Set(['with', 'that', 'from', 'have', 'will', 'your', 'build', 'role', 'this', 'into', 'across', 'about', 'team', 'work', 'years']);

export function deriveJdParsedMeta(text: string, sourceName = ''): JdParsedMeta {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const title = lines[0] ?? sourceName.replace(/\.[^.]+$/, '') ?? 'Imported JD';
  const company = lines[1] ?? 'Imported Company';
  const lower = text.toLowerCase();

  const skillHits = COMMON_SKILLS.filter(skill => lower.includes(skill));
  const words = lower.match(/[a-z][a-z.+-]{2,}/g) ?? [];
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    if (STOP_WORDS.has(word)) return;
    wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
  });

  const rankedWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter(word => !skillHits.includes(word))
    .slice(0, 8);

  return {
    company,
    keywordBuckets: {
      preferred: rankedWords.slice(4),
      required: [...new Set([...skillHits.slice(0, 5), ...rankedWords.slice(0, 4)])],
      skills: skillHits,
      titles: title.toLowerCase().split(/[^a-z0-9+.#-]+/).filter(Boolean),
    },
    roleTitle: title,
    summary: lines.slice(2, 6).join(' ') || null,
  };
}

export function scoreResumeAgainstJd(resume: ResumeData, jd: JdParsedMeta): JdMatchResponse {
  const text = buildResumePlainText(resume).toLowerCase();
  const required = [...new Set(jd.keywordBuckets.required)];
  const preferred = [...new Set(jd.keywordBuckets.preferred)];
  const foundKeywords = required.concat(preferred).filter(keyword => text.includes(keyword.toLowerCase()));
  const missingKeywords = required.concat(preferred).filter(keyword => !text.includes(keyword.toLowerCase()));

  const requiredCoverage = required.length ? Math.round((required.filter(keyword => foundKeywords.includes(keyword)).length / required.length) * 100) : 70;
  const preferredCoverage = preferred.length ? Math.round((preferred.filter(keyword => foundKeywords.includes(keyword)).length / preferred.length) * 100) : 60;
  const titleAlignment = jd.keywordBuckets.titles.some(token => text.includes(token)) ? 85 : 45;
  const evidenceReadiness = Math.min(95, resume.experience.length * 18 + resume.projects.length * 12 + 20);
  const score = Math.round((requiredCoverage * 0.4) + (preferredCoverage * 0.2) + (titleAlignment * 0.2) + (evidenceReadiness * 0.2));

  const tone = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';
  const verdict = tone === 'high'
    ? 'Strong match for this role'
    : tone === 'mid'
      ? 'Promising match with a few gaps'
      : 'Needs targeted tailoring';

  const metrics: ScoreMetric[] = [
    { label: 'Keyword coverage', tone: requiredCoverage >= 70 ? 'accent' : 'warn', value: requiredCoverage },
    { label: 'Preferred overlap', tone: preferredCoverage >= 60 ? 'accent' : 'warn', value: preferredCoverage },
    { label: 'Role alignment', tone: titleAlignment >= 70 ? 'accent' : 'warn', value: titleAlignment },
    { label: 'Evidence readiness', tone: evidenceReadiness >= 70 ? 'accent' : 'warn', value: evidenceReadiness },
  ];

  const checks: ScoreCheck[] = [
    { text: `Matched ${foundKeywords.length} JD keywords`, tone: foundKeywords.length >= Math.max(2, Math.ceil(required.length / 2)) ? 'ok' : 'warn' },
    { text: 'Resume structure is readable enough for recruiter review', tone: resume.experience.length || resume.projects.length ? 'ok' : 'warn' },
    { text: `Address ${missingKeywords.length} keyword gaps before applying`, tone: missingKeywords.length <= 2 ? 'warn' : 'bad' },
    { text: 'Tailor summary and role-specific bullets to this job', tone: tone === 'high' ? 'warn' : 'bad' },
  ];

  return {
    checks,
    foundKeywords,
    metrics,
    missingKeywords,
    score,
    tone,
    verdict,
  };
}
