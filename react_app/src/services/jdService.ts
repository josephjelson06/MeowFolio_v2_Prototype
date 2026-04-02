import { jdLibrarySeed } from 'mocks/jdLibrary';
import { resumeMatchProfilesSeed } from 'mocks/resumeMatchProfiles';
import { apiClient } from 'lib/apiClient';
import type { JdCheck, JdMetric, JdRecord } from 'types/jd';
import type { ResumePickerOption, ResumeScoreTone } from 'types/resume';
import { resumeService } from './resumeService';

const JD_EVENT = 'meowfolio:jd-library-changed';

let jdLibrary = structuredClone(jdLibrarySeed);

export interface JdReportModel {
  jd: JdRecord;
  resumeId: string;
  resumeLabel: string;
  verdict: string;
  scoreTone: ResumeScoreTone;
  score: number;
  metrics: JdMetric[];
  checks: JdCheck[];
  found: string[];
  miss: string[];
}

interface JdListResponse {
  items: JdRecord[];
}

interface JdMutationResponse {
  item: JdRecord;
}

interface MatchScoreResponse {
  jd: JdRecord;
  resume: { id: string; name: string };
  report: {
    score: number;
    tone: ResumeScoreTone;
    verdict: string;
    foundKeywords: string[];
    missingKeywords: string[];
    metrics: JdMetric[];
    checks: JdCheck[];
  };
}

function cloneLibrary() {
  return structuredClone(jdLibrary);
}

function notifyJdChange(detail?: { id?: string }) {
  window.dispatchEvent(new CustomEvent(JD_EVENT, { detail }));
}

function prependOrReplace(item: JdRecord) {
  jdLibrary = [item, ...jdLibrary.filter(entry => entry.id !== item.id)];
}

function buildFallbackJd(text: string, sourceName = ''): JdRecord {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const title = sourceName.replace(/\.[^.]+$/, '') || lines[0] || `Imported JD ${jdLibrary.length + 1}`;
  return {
    badge: 'Newly added',
    company: lines[1] || 'Imported Company',
    id: `${title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_${Date.now()}`,
    parsedText: text,
    title,
    type: 'Imported',
    updatedAt: 'just now',
  };
}

function fallbackReport(resumeId: string, jdId: string): JdReportModel | null {
  const resumeSeed = resumeMatchProfilesSeed[resumeId] ?? { score: 58, cls: 'mid' as const, found: ['React', 'APIs'], miss: ['Python', 'cloud'] };
  const jd = jdLibrary.find(item => item.id === jdId);
  if (!jd) return null;
  return {
    checks: [
      { text: `Matched ${resumeSeed.found.length} keywords from the JD`, tone: 'ok' },
      { text: 'Resume structure is clear enough for recruiter review', tone: 'warn' },
      { text: `Address ${resumeSeed.miss.length} missing keyword gaps before applying`, tone: resumeSeed.miss.length > 2 ? 'bad' : 'warn' },
      { text: 'Tailor the summary and experience bullets to this exact role', tone: 'warn' },
    ],
    found: resumeSeed.found,
    jd,
    metrics: [
      { label: 'Keyword coverage', tone: resumeSeed.score >= 70 ? 'accent' : 'warn', value: resumeSeed.score },
      { label: 'Role alignment', tone: 'warn', value: Math.max(40, resumeSeed.score - 5) },
      { label: 'Preferred overlap', tone: 'warn', value: Math.max(35, resumeSeed.score - 12) },
      { label: 'Evidence readiness', tone: resumeSeed.score >= 65 ? 'accent' : 'warn', value: Math.min(92, resumeSeed.score + 8) },
    ],
    miss: resumeSeed.miss,
    resumeId,
    resumeLabel: resumeId,
    score: resumeSeed.score,
    scoreTone: resumeSeed.cls,
    verdict: resumeSeed.cls === 'high' ? 'Strong match for this role' : resumeSeed.cls === 'mid' ? 'Promising match with a few gaps' : 'Needs targeted tailoring',
  };
}

export const jdService = {
  eventName: JD_EVENT,
  async list() {
    try {
      const response = await apiClient.get<JdListResponse>('/jds');
      jdLibrary = response.items;
      return cloneLibrary();
    } catch {
      return cloneLibrary();
    }
  },
  async getById(id: string) {
    const loaded = await this.list();
    return loaded.find(item => item.id === id);
  },
  async rename(id: string, nextName: string) {
    try {
      const response = await apiClient.patch<JdMutationResponse>(`/jds/${id}`, { title: nextName });
      prependOrReplace(response.item);
      notifyJdChange({ id: response.item.id });
      return cloneLibrary();
    } catch {
      jdLibrary = jdLibrary.map(item => item.id === id ? { ...item, title: nextName } : item);
      notifyJdChange({ id });
      return cloneLibrary();
    }
  },
  async saveText(id: string, text: string, title?: string) {
    try {
      const response = await apiClient.patch<JdMutationResponse>(`/jds/${id}`, { text, title });
      prependOrReplace(response.item);
      notifyJdChange({ id: response.item.id });
      return response.item;
    } catch {
      jdLibrary = jdLibrary.map(item => item.id === id ? { ...item, parsedText: text, title: title ?? item.title } : item);
      const next = jdLibrary.find(item => item.id === id) ?? null;
      notifyJdChange({ id });
      return next;
    }
  },
  async remove(id: string) {
    try {
      await apiClient.delete(`/jds/${id}`);
    } catch {
      // fallback handled locally below
    }
    jdLibrary = jdLibrary.filter(item => item.id !== id);
    notifyJdChange();
    return cloneLibrary();
  },
  async importText(text: string, sourceName?: string) {
    try {
      const response = await apiClient.post<JdMutationResponse & { extractedText?: string }>('/import/jd', { sourceName, text });
      prependOrReplace(response.item);
      notifyJdChange({ id: response.item.id });
      return { extractedText: response.extractedText ?? text, item: response.item, list: cloneLibrary() };
    } catch {
      const item = buildFallbackJd(text, sourceName);
      prependOrReplace(item);
      notifyJdChange({ id: item.id });
      return { extractedText: text, item, list: cloneLibrary() };
    }
  },
  async importFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceName', file.name);

    try {
      const response = await apiClient.postForm<JdMutationResponse & { extractedText?: string }>('/import/jd', formData);
      prependOrReplace(response.item);
      notifyJdChange({ id: response.item.id });
      return { extractedText: response.extractedText ?? '', item: response.item, list: cloneLibrary() };
    } catch {
      const item = buildFallbackJd('Imported JD text', file.name);
      prependOrReplace(item);
      notifyJdChange({ id: item.id });
      return { extractedText: `Parsed text preview from ${file.name}`, item, list: cloneLibrary() };
    }
  },
  async getMatchProfiles(): Promise<ResumePickerOption[]> {
    const resumes = await resumeService.list();
    return resumes.map(item => ({
      id: item.id,
      label: item.name.replace(/\.tex$/i, ''),
    }));
  },
  async buildReport(resumeId: string, jdId: string): Promise<JdReportModel | null> {
    try {
      const response = await apiClient.post<MatchScoreResponse>(`/jds/${jdId}/match-score`, { resumeId });
      return {
        checks: response.report.checks,
        found: response.report.foundKeywords,
        jd: response.jd,
        metrics: response.report.metrics,
        miss: response.report.missingKeywords,
        resumeId: response.resume.id,
        resumeLabel: response.resume.name.replace(/\.tex$/i, ''),
        score: response.report.score,
        scoreTone: response.report.tone,
        verdict: response.report.verdict,
      };
    } catch {
      return fallbackReport(resumeId, jdId);
    }
  },
};
