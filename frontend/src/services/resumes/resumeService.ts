import { supabase } from 'lib/supabase';
import type { ResumeRecord } from 'types/resume';
import type { AtsScoreResponse, RenderOptions, ResumeData, ResumeDocumentRecord } from 'types/resumeDocument';

const RESUME_EVENT = 'meowfolio:resume-library-changed';
const ACTIVE_RESUME_KEY = 'meowfolio:active-resume-id';
const LEGACY_ACTIVE_RESUME_KEY = 'resumeai:active-resume-id';

interface ResumeMutationResponse {
  item: ResumeRecord;
  record?: ResumeDocumentRecord;
  resumeId?: string;
  parseStatus?: 'parsed' | 'partial' | 'failed';
  warnings?: string[];
  extractedText?: string;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function notifyResumeChange() {
  window.dispatchEvent(new CustomEvent(RESUME_EVENT));
}

function setActiveResumeId(id: string) {
  localStorage.setItem(ACTIVE_RESUME_KEY, id);
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToResumeRecord(row: any, index: number): ResumeRecord {
  return {
    id: row.id,
    name: row.title ?? 'Untitled Resume',
    updated: relativeTime(row.updated_at ?? row.created_at),
    updatedAt: row.updated_at ?? row.created_at,
    template: row.template_id ?? 'template1',
    recent: index === 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToDocumentRecord(row: any): ResumeDocumentRecord {
  return {
    id: row.id,
    title: row.title ?? 'Untitled Resume',
    source: row.source ?? 'scratch',
    templateId: row.template_id ?? 'template1',
    content: row.content_json ?? {},
    renderOptions: row.render_options ?? {},
    rawText: row.raw_text ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

/* ─── Service ──────────────────────────────────────────────────────────────── */

export const resumeService = {
  eventName: RESUME_EVENT,

  getActiveId() {
    return localStorage.getItem(ACTIVE_RESUME_KEY) ?? localStorage.getItem(LEGACY_ACTIVE_RESUME_KEY);
  },

  setActiveId(id: string) {
    setActiveResumeId(id);
  },

  async list(): Promise<ResumeRecord[]> {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, template_id, updated_at, created_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRowToResumeRecord);
  },

  async rename(id: string, nextName: string): Promise<ResumeRecord[]> {
    const { error } = await supabase
      .from('resumes')
      .update({ title: nextName, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    notifyResumeChange();
    return this.list();
  },

  async remove(id: string): Promise<ResumeRecord[]> {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    notifyResumeChange();
    return this.list();
  },

  async getById(id: string): Promise<ResumeRecord | undefined> {
    const loaded = await this.list();
    return loaded.find(item => item.id === id);
  },

  async getRecord(id: string): Promise<ResumeDocumentRecord> {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapRowToDocumentRecord(data);
  },

  async saveRecord(id: string, input: {
    content: ResumeData;
    renderOptions: RenderOptions;
    templateId: string;
    title?: string;
    rawText?: string;
  }): Promise<ResumeDocumentRecord | null> {
    const { data, error } = await supabase
      .from('resumes')
      .update({
        content_json: input.content,
        render_options: input.renderOptions,
        template_id: input.templateId,
        title: input.title,
        raw_text: input.rawText ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    notifyResumeChange();
    return data ? mapRowToDocumentRecord(data) : null;
  },

  async scoreAts(_id: string): Promise<AtsScoreResponse> {
    // ATS scoring is rule-based and runs locally — this is a placeholder
    // that will be computed from the current resume content by the editor hook.
    throw new Error('ATS scoring is handled locally by the editor');
  },

  async exportTex(_id: string) {
    throw new Error('LaTeX export has been replaced by Typst PDF generation');
  },

  async createBlank(): Promise<ResumeRecord> {
    const userId = await getUserId();
    const { createEmptyResumeData, DEFAULT_RENDER_OPTIONS } = await import('types/resumeDocument');

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title: 'Untitled Resume',
        template_id: 'template1',
        content_json: createEmptyResumeData('scratch'),
        render_options: DEFAULT_RENDER_OPTIONS,
        source: 'scratch',
        raw_text: '',
      })
      .select('id, title, template_id, updated_at, created_at')
      .single();

    if (error) throw error;

    const record = mapRowToResumeRecord(data, 0);
    setActiveResumeId(record.id);
    notifyResumeChange();
    return record;
  },

  async importText(text: string, sourceName: string): Promise<ResumeMutationResponse> {
    const userId = await getUserId();
    const { DEFAULT_RENDER_OPTIONS } = await import('types/resumeDocument');
    const title = sourceName.replace(/\.[^.]+$/, '') || `Imported Resume ${Date.now()}`;

    // Try AI parsing via the serverless function
    let parsedContent = null;
    let parseStatus: 'parsed' | 'partial' | 'failed' = 'partial';
    const warnings: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, source: sourceName }),
        });

        if (response.status === 402) {
          throw new Error('No credits remaining. Upgrade your plan to continue using AI parsing.');
        }

        if (response.ok) {
          const result = await response.json();
          parsedContent = result.parsed;
          parseStatus = 'parsed';
        } else {
          const errBody = await response.json().catch(() => ({}));
          warnings.push(errBody.error ?? 'AI parsing returned an error. Resume saved with raw text.');
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('No credits')) {
        throw err; // Re-throw credit errors so the modal can handle them
      }
      warnings.push('AI parsing unavailable. Resume saved with raw text only.');
    }

    // If AI parsing failed, use empty content
    if (!parsedContent) {
      const { createEmptyResumeData } = await import('types/resumeDocument');
      parsedContent = createEmptyResumeData('import');
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title,
        template_id: 'template1',
        content_json: parsedContent,
        render_options: DEFAULT_RENDER_OPTIONS,
        source: 'import',
        raw_text: text,
      })
      .select('id, title, template_id, updated_at, created_at')
      .single();

    if (error) throw error;

    const item = mapRowToResumeRecord(data, 0);
    setActiveResumeId(item.id);
    notifyResumeChange();

    return {
      extractedText: text,
      item,
      parseStatus,
      resumeId: item.id,
      warnings: warnings.length ? warnings : undefined,
    };
  },

  async importFile(file: File): Promise<ResumeMutationResponse> {
    const { extractText } = await import('lib/pdf-extractor');
    const text = await extractText(file);
    const sourceName = file.name.replace(/\.[^.]+$/, '');
    return this.importText(text, sourceName);
  },
};

