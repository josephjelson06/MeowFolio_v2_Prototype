import { resumeLibrarySeed } from 'mocks/resumeLibrary';
import { apiClient } from 'lib/apiClient';
import type { ResumeRecord } from 'types/resume';
import type { AtsScoreResponse, RenderOptions, ResumeData, ResumeDocumentRecord } from 'types/resumeDocument';

const RESUME_EVENT = 'meowfolio:resume-library-changed';
const ACTIVE_RESUME_KEY = 'meowfolio:active-resume-id';
const LEGACY_ACTIVE_RESUME_KEY = 'resumeai:active-resume-id';

let resumeLibrary = structuredClone(resumeLibrarySeed);

interface ResumeListResponse {
  items: ResumeRecord[];
}

interface ResumeMutationResponse {
  item: ResumeRecord;
  record?: ResumeDocumentRecord;
  resumeId?: string;
  parseStatus?: 'parsed' | 'partial' | 'failed';
  warnings?: string[];
  extractedText?: string;
}

interface ResumeRecordResponse {
  record: ResumeDocumentRecord;
}

interface ResumeTexExportResponse {
  filename: string;
  templateId: string;
  tex: string;
}

function cloneLibrary() {
  return structuredClone(resumeLibrary);
}

function notifyResumeChange() {
  window.dispatchEvent(new CustomEvent(RESUME_EVENT));
}

function setActiveResumeId(id: string) {
  localStorage.setItem(ACTIVE_RESUME_KEY, id);
}

function prependOrReplace(item: ResumeRecord) {
  resumeLibrary = [item, ...resumeLibrary.filter(entry => entry.id !== item.id)].map((entry, index) => ({
    ...entry,
    recent: index === 0,
  }));
}

function updateLocalRename(id: string, nextName: string) {
  resumeLibrary = resumeLibrary.map(item => item.id === id ? { ...item, name: nextName } : item);
  return cloneLibrary();
}

function updateLocalDelete(id: string) {
  resumeLibrary = resumeLibrary.filter(item => item.id !== id).map((item, index) => ({
    ...item,
    recent: index === 0,
  }));
  return cloneLibrary();
}

function buildFallbackResume(sourceName = 'resume') {
  const id = `${sourceName.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'resume'}_${Date.now()}`;
  return {
    id,
    name: `${id}.tex`,
    recent: true,
    template: 'template1',
    updated: 'just now',
    updatedAt: new Date().toISOString(),
  } satisfies ResumeRecord;
}

export const resumeService = {
  eventName: RESUME_EVENT,
  getActiveId() {
    return localStorage.getItem(ACTIVE_RESUME_KEY) ?? localStorage.getItem(LEGACY_ACTIVE_RESUME_KEY);
  },
  setActiveId(id: string) {
    setActiveResumeId(id);
  },
  async list() {
    try {
      const response = await apiClient.get<ResumeListResponse>('/resumes');
      resumeLibrary = response.items;
      return cloneLibrary();
    } catch {
      return cloneLibrary();
    }
  },
  async rename(id: string, nextName: string) {
    try {
      const response = await apiClient.patch<ResumeMutationResponse>(`/resumes/${id}`, { title: nextName });
      prependOrReplace(response.item);
      notifyResumeChange();
      return cloneLibrary();
    } catch {
      const next = updateLocalRename(id, nextName);
      notifyResumeChange();
      return next;
    }
  },
  async remove(id: string) {
    try {
      await apiClient.delete(`/resumes/${id}`);
      const next = updateLocalDelete(id);
      notifyResumeChange();
      return next;
    } catch {
      const next = updateLocalDelete(id);
      notifyResumeChange();
      return next;
    }
  },
  async getById(id: string): Promise<ResumeRecord | undefined> {
    const loaded = await this.list();
    return loaded.find(item => item.id === id);
  },
  async getRecord(id: string) {
    const response = await apiClient.get<ResumeRecordResponse>(`/resumes/${id}`);
    return response.record;
  },
  async saveRecord(id: string, input: {
    content: ResumeData;
    renderOptions: RenderOptions;
    templateId: string;
    title?: string;
    rawText?: string;
  }) {
    const response = await apiClient.patch<ResumeMutationResponse>(`/resumes/${id}`, input);
    prependOrReplace(response.item);
    notifyResumeChange();
    return response.record ?? null;
  },
  async scoreAts(id: string) {
    return apiClient.post<AtsScoreResponse>(`/resumes/${id}/ats-score`);
  },
  async exportTex(id: string) {
    return apiClient.get<ResumeTexExportResponse>(`/resumes/${id}/export/tex`);
  },
  async createBlank() {
    try {
      const response = await apiClient.post<ResumeMutationResponse>('/resumes', {});
      prependOrReplace(response.item);
      setActiveResumeId(response.item.id);
      notifyResumeChange();
      return response.item;
    } catch {
      const item = buildFallbackResume('resume');
      prependOrReplace(item);
      setActiveResumeId(item.id);
      notifyResumeChange();
      return item;
    }
  },
  async importText(text: string, sourceName: string) {
    try {
      const response = await apiClient.post<ResumeMutationResponse>('/import/resume', { sourceName, text });
      prependOrReplace(response.item);
      setActiveResumeId(response.item.id);
      notifyResumeChange();
      return response;
    } catch {
      const item = buildFallbackResume(sourceName);
      prependOrReplace(item);
      setActiveResumeId(item.id);
      notifyResumeChange();
      return {
        extractedText: text,
        item,
        parseStatus: 'partial' as const,
        resumeId: item.id,
        warnings: ['Backend import unavailable, using local fallback.'],
      };
    }
  },
  async importFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceName', file.name);

    try {
      const response = await apiClient.postForm<ResumeMutationResponse>('/import/resume', formData);
      prependOrReplace(response.item);
      setActiveResumeId(response.item.id);
      notifyResumeChange();
      return response;
    } catch {
      const item = buildFallbackResume(file.name.replace(/\.[^.]+$/, ''));
      prependOrReplace(item);
      setActiveResumeId(item.id);
      notifyResumeChange();
      return {
        extractedText: `Parsed text preview from ${file.name}`,
        item,
        parseStatus: 'partial' as const,
        resumeId: item.id,
        warnings: ['Backend file import unavailable, using local fallback.'],
      };
    }
  },
};
