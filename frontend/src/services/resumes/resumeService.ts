import { supabase } from 'lib/supabase';
import type { ResumeRecord } from 'types/resume';
import type { AtsScoreResponse, AtsBreakdownItem, RenderOptions, ResumeData, ResumeDocumentRecord } from 'types/resumeDocument';
import { createEmptyResumeData, DEFAULT_RENDER_OPTIONS } from 'types/resumeDocument';

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
    template: row.template_id ?? 'template2',
    recent: index === 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge<T extends object>(target: T, source: any): T {
  if (!source) return target;
  const result = { ...target } as any;
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
        result[key] = deepMerge(result[key], val);
      } else {
        result[key] = val;
      }
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToDocumentRecord(row: any): ResumeDocumentRecord {
  return {
    id: row.id,
    title: row.title ?? 'Untitled Resume',
    source: row.source ?? 'scratch',
    templateId: row.template_id ?? 'template2',
    content: deepMerge(createEmptyResumeData(), row.content_json),
    renderOptions: deepMerge(DEFAULT_RENDER_OPTIONS, row.render_options),
    rawText: row.raw_text ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? 'guest-user';
}

// ─── Local Mock State for Test Seam ────────
let mockResumes: ResumeRecord[] = [
  { id: 'mock-1', name: 'Software Engineer Resume', template: 'template2', recent: true, updated: 'just now', updatedAt: new Date().toISOString() }
];
let mockDocuments: Record<string, ResumeDocumentRecord> = {
  'mock-1': {
    id: 'mock-1', title: 'Software Engineer Resume', source: 'scratch', templateId: 'template2',
    content: null as any, // will be initialized to avoid crash if accessed directly, wait, actually better write out a partial valid one:
    renderOptions: {} as any, rawText: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
};

// Initialization of mock content
if (mockDocuments['mock-1']) {
  const data = createEmptyResumeData('scratch');
  data.header.name = 'Test User';
  data.header.email = 'test@example.com';
  mockDocuments['mock-1'].content = data;
  mockDocuments['mock-1'].renderOptions = DEFAULT_RENDER_OPTIONS as any;
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
    if (await getUserId() === 'guest-user') {
      return [...mockResumes];
    }
    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, template_id, updated_at, created_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRowToResumeRecord);
  },

  async rename(id: string, nextName: string): Promise<ResumeRecord[]> {
    if (id === 'resume_placeholder' || await getUserId() === 'guest-user') {
      const target = mockResumes.find(r => r.id === id);
      if (target) target.name = nextName;
      if (mockDocuments[id]) mockDocuments[id].title = nextName;
      notifyResumeChange();
      return this.list();
    }
    const { error } = await supabase
      .from('resumes')
      .update({ title: nextName, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    notifyResumeChange();
    return this.list();
  },

  async remove(id: string): Promise<ResumeRecord[]> {
    if (id === 'resume_placeholder' || await getUserId() === 'guest-user') {
      mockResumes = mockResumes.filter(r => r.id !== id);
      delete mockDocuments[id];
      notifyResumeChange();
      return this.list();
    }
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
    if (id === 'resume_placeholder' || await getUserId() === 'guest-user') {
      if (id === 'resume_placeholder' && !mockDocuments['resume_placeholder']) {
        const data = createEmptyResumeData('scratch');
        data.header.name = 'Arjun Kumar';
        data.header.email = 'arjun@email.com';
        mockDocuments['resume_placeholder'] = {
          id: 'resume_placeholder',
          title: 'resume_v3.tex',
          source: 'scratch',
          templateId: 'template2',
          content: data,
          renderOptions: DEFAULT_RENDER_OPTIONS,
          rawText: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      const doc = mockDocuments[id] ?? mockDocuments['mock-1'];
      if (!doc.content) {
        const data = createEmptyResumeData('scratch');
        data.header.name = 'Test User (Local)';
        data.header.email = 'test@local.env';
        doc.content = data;
        doc.renderOptions = DEFAULT_RENDER_OPTIONS;
      }
      return doc;
    }
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
    if (id === 'resume_placeholder' || await getUserId() === 'guest-user') {
      if (mockDocuments[id]) {
        mockDocuments[id].content = input.content;
        mockDocuments[id].renderOptions = input.renderOptions;
        mockDocuments[id].templateId = input.templateId as any;
        if (input.title) {
          mockDocuments[id].title = input.title;
          const r = mockResumes.find(x => x.id === id);
          if (r) r.name = input.title;
        }
        if (input.rawText) mockDocuments[id].rawText = input.rawText;
        notifyResumeChange();
        return mockDocuments[id];
      }
      if (id === 'resume_placeholder') {
        mockDocuments[id] = {
          id,
          title: input.title ?? 'resume_v3.tex',
          source: 'scratch',
          templateId: input.templateId as any,
          content: input.content,
          renderOptions: input.renderOptions,
          rawText: input.rawText ?? '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        notifyResumeChange();
        return mockDocuments[id];
      }
      return null;
    }
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

  async scoreAts(id: string): Promise<AtsScoreResponse> {
    const record = await this.getRecord(id);
    const resume = record.content;
    if (!resume) {
      throw new Error('No resume data found to analyze');
    }

    let score = 0;
    const breakdown: AtsBreakdownItem[] = [];
    const tips: string[] = [];
    const warnings: string[] = [];

    // 1. Contact Info (max 20)
    let contactScore = 0;
    if (resume.header?.name?.trim()) contactScore += 4;
    if (resume.header?.email?.trim()) contactScore += 4;
    if (resume.header?.phone?.trim()) contactScore += 4;
    if (resume.header?.address?.trim()) contactScore += 4;
    if (resume.header?.role?.trim()) contactScore += 4;

    breakdown.push({ label: 'Contact Information', score: contactScore, max: 20 });
    score += contactScore;

    if (!resume.header?.phone?.trim()) warnings.push('Add a phone number so recruiters can easily reach you.');
    if (!resume.header?.email?.trim()) warnings.push('Add a professional email address.');
    if (!resume.header?.role?.trim()) warnings.push('Add a target role title in your header (e.g. Software Engineer).');

    // 2. Professional Summary (max 15)
    let summaryScore = 0;
    const summaryText = resume.summary?.content?.trim() ?? '';
    if (summaryText.length > 0) {
      if (summaryText.length >= 100 && summaryText.length <= 300) {
        summaryScore = 15;
      } else {
        summaryScore = 10;
        warnings.push('Keep your summary concise (ideally between 100 and 300 characters).');
      }
    } else {
      warnings.push('Add a brief professional summary (1-2 sentences) highlighting your value proposition.');
    }
    breakdown.push({ label: 'Professional Summary', score: summaryScore, max: 15 });
    score += summaryScore;

    // 3. Work Experience (max 30)
    let expScore = 0;
    if (resume.experience && resume.experience.length > 0) {
      expScore += 10;
      let totalBullets = 0;
      let validRoles = 0;
      resume.experience.forEach(job => {
        if (job.role?.trim() && job.company?.trim()) {
          validRoles++;
        }
        if (job.description?.bullets) {
          totalBullets += job.description.bullets.filter(b => b.trim().length > 0).length;
        }
      });
      if (validRoles >= 2) expScore += 10;
      else expScore += 5;

      if (totalBullets >= validRoles * 2) expScore += 10;
      else {
        expScore += Math.min(10, Math.floor((totalBullets / Math.max(1, validRoles * 2)) * 10));
        warnings.push('Include at least 2 detail bullets per job experience to demonstrate your impact.');
      }
    } else {
      warnings.push('Include at least 1-2 work experience entries to show your career history.');
    }
    breakdown.push({ label: 'Work Experience', score: expScore, max: 30 });
    score += expScore;

    // 4. Skills & Core Competencies (max 20)
    let skillsScore = 0;
    const skillItems = resume.skills?.items?.filter(s => s.trim().length > 0) ?? [];
    const skillGroups = resume.skills?.groups?.filter(g => g.items && g.items.length > 0) ?? [];
    if (skillItems.length > 0 || skillGroups.length > 0) {
      skillsScore += 10;
      if (skillItems.length + skillGroups.reduce((acc, g) => acc + g.items.length, 0) >= 6) {
        skillsScore += 10;
      } else {
        skillsScore += 5;
        warnings.push('List at least 6-8 core skills to match employer search filters.');
      }
    } else {
      warnings.push('Add a skills section listing your tools, frameworks, or methodologies.');
    }
    breakdown.push({ label: 'Skills & Competencies', score: skillsScore, max: 20 });
    score += skillsScore;

    // 5. Projects & Extras (max 15)
    let extraScore = 0;
    const projectItems = resume.projects?.filter(p => (p.title?.trim()?.length ?? 0) > 0) ?? [];
    const educationItems = resume.education?.filter(e => (e.institution?.trim()?.length ?? 0) > 0) ?? [];
    if (educationItems.length > 0) extraScore += 8;
    else warnings.push('Add your education history (degree and school name).');

    if (projectItems.length > 0) extraScore += 7;
    else warnings.push('Include 1-2 projects to showcase practical application of your skills.');

    breakdown.push({ label: 'Projects & Education', score: extraScore, max: 15 });
    score += extraScore;

    // 6. Verdict and tips
    let verdict = 'Needs Improvement';
    if (score >= 80) {
      verdict = 'Strong Resume';
      tips.push('Excellent coverage of key resume sections.');
      tips.push('Ensure experience descriptions contain measurable metrics (%, $, scale).');
    } else if (score >= 60) {
      verdict = 'Good Base';
      tips.push('Nice foundation. Complete the checklist warnings to boost your score.');
      tips.push('Tailor the phrasing of your projects to highlight tools used.');
    } else {
      verdict = 'Incomplete';
      tips.push('Add contact details and experiences to make this resume recruiter-ready.');
    }

    return {
      score,
      verdict,
      breakdown,
      tips,
      warnings,
    };
  },

  async exportTex(_id: string) {
    throw new Error('LaTeX export has been replaced by Typst PDF generation');
  },

  async createBlank(): Promise<ResumeRecord> {
    const userId = await getUserId();

    if (await getUserId() === 'guest-user') {
      const id = `mock-${Date.now()}`;
      const rec: ResumeRecord = { id, name: 'Untitled Resume', template: 'template2', updated: 'just now', updatedAt: new Date().toISOString(), recent: true };
      mockResumes.unshift(rec);
      mockDocuments[id] = {
        id, title: 'Untitled Resume', source: 'scratch', templateId: 'template2' as any, content: createEmptyResumeData('scratch') as any, renderOptions: DEFAULT_RENDER_OPTIONS as any, rawText: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      setActiveResumeId(id);
      notifyResumeChange();
      return rec;
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title: 'Untitled Resume',
        template_id: 'template2',
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
    const isGuest = await getUserId() === 'guest-user';
    const title = sourceName.replace(/\.[^.]+$/, '') || `Imported Resume ${Date.now()}`;

    // Try AI parsing via the serverless function FIRST (works for both local guest and prod)
    let parsedContent = null;
    let parseStatus: 'parsed' | 'partial' | 'failed' = 'partial';
    const warnings: string[] = [];

    try {
      const isTestSeam = typeof window !== 'undefined' && window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true';
      let token = '';

      if (isTestSeam) {
        token = 'test-seam-token';
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token ?? '';
      }

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
    } catch (err) {
      if (err instanceof Error && err.message.includes('No credits')) {
        throw err; // Re-throw credit errors so the modal can handle them
      }
      warnings.push('AI parsing unavailable. Resume saved with raw text only.');
    }

    // If AI parsing failed, use empty content
    if (!parsedContent) {
      parsedContent = createEmptyResumeData('import');
    }

    // --- Guest User Branch ---
    if (isGuest) {
      const id = `mock-${Date.now()}`;
      const item: ResumeRecord = { id, name: title, template: 'template2', updated: 'just now', updatedAt: new Date().toISOString(), recent: true };
      mockResumes.unshift(item);
      mockDocuments[id] = {
        id, title, source: 'import', templateId: 'template2' as any, 
        content: parsedContent as any, 
        renderOptions: DEFAULT_RENDER_OPTIONS as any, rawText: text, 
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      setActiveResumeId(id);
      notifyResumeChange();
      return {
        extractedText: text,
        item,
        parseStatus,
        resumeId: id,
        warnings,
      };
    }

    // --- Authenticated User Branch ---
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title,
        template_id: 'template2',
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

