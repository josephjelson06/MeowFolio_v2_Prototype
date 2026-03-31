import { jdLibrarySeed } from 'mocks/jdLibrary';
import { resumeMatchProfilesSeed } from 'mocks/resumeMatchProfiles';
import type { JdCheck, JdMetric, JdRecord } from 'types/jd';
import type { ResumeMatchProfile } from 'types/resume';

let jdLibrary = structuredClone(jdLibrarySeed);

export interface JdReportModel {
  jd: JdRecord;
  resumeKey: string;
  resume: ResumeMatchProfile;
  verdict: string;
  scoreTone: ResumeMatchProfile['cls'];
  metrics: JdMetric[];
  checks: JdCheck[];
}

export const jdService = {
  list() {
    return structuredClone(jdLibrary);
  },
  getById(id: number) {
    return structuredClone(jdLibrary.find(item => item.id === id));
  },
  rename(id: number, nextName: string) {
    jdLibrary = jdLibrary.map(item => item.id === id ? { ...item, title: nextName } : item);
    return structuredClone(jdLibrary);
  },
  remove(id: number) {
    jdLibrary = jdLibrary.filter(item => item.id !== id);
    return structuredClone(jdLibrary);
  },
  getMatchProfiles() {
    return structuredClone(resumeMatchProfilesSeed);
  },
  buildReport(resumeKey: string, jdId: number): JdReportModel | null {
    const resume = resumeMatchProfilesSeed[resumeKey];
    const jd = jdLibrary.find(item => item.id === jdId);
    if (!resume || !jd) return null;

    const totalKeywords = resume.found.length + resume.miss.length || 1;
    const keywordCoverage = Math.round((resume.found.length / totalKeywords) * 100);
    const roleAlignment = Math.max(28, Math.min(96, Math.round((resume.score + keywordCoverage) / 2)));
    const seniorityFit = Math.max(24, Math.min(94, resume.score + (jdId % 3 === 0 ? 4 : 7)));
    const impactReadiness = Math.max(20, Math.min(92, resume.score - (resume.miss.length * 5) + 18));
    const verdict = resume.cls === 'high'
      ? 'Strong match for this role'
      : resume.cls === 'mid'
        ? 'Promising match with a few gaps'
        : 'Needs targeted tailoring';

    return {
      jd: structuredClone(jd),
      resumeKey,
      resume: structuredClone(resume),
      verdict,
      scoreTone: resume.cls,
      metrics: [
        { label: 'Keyword coverage', value: keywordCoverage, tone: keywordCoverage >= 70 ? 'accent' : 'warn' },
        { label: 'Role alignment', value: roleAlignment, tone: roleAlignment >= 70 ? 'accent' : 'warn' },
        { label: 'Seniority fit', value: seniorityFit, tone: seniorityFit >= 70 ? 'accent' : 'warn' },
        { label: 'Impact readiness', value: impactReadiness, tone: impactReadiness >= 70 ? 'accent' : 'warn' },
      ],
      checks: [
        { tone: 'ok', text: `Matched ${resume.found.length} high-signal keywords from the JD` },
        { tone: resume.score >= 70 ? 'ok' : 'warn', text: 'Resume structure is clear enough for recruiter review' },
        { tone: resume.miss.length <= 2 ? 'warn' : 'bad', text: `Address ${resume.miss.length} missing keyword gaps before applying` },
        { tone: resume.cls === 'low' ? 'bad' : 'warn', text: 'Tailor the summary and experience bullets to this exact role' },
      ],
    };
  },
};
