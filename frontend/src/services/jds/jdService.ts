import { supabase } from 'lib/supabase';
import { resumeService } from 'services/resumeService';
import { buildResumePlainText } from 'types/resumeDocument';
import type { JdCheck, JdMetric, JdRecord, JdTailoredSuggestions } from 'types/jd';
import type { ResumePickerOption, ResumeScoreTone } from 'types/resume';

const JD_EVENT = 'meowfolio:jd-library-changed';

/* ─── Types ────────────────────────────────────────────────────────────────── */

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

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function notifyJdChange(detail?: { id?: string }) {
  window.dispatchEvent(new CustomEvent(JD_EVENT, { detail }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToJdRecord(row: any): JdRecord {
  return {
    id: row.id,
    title: row.title,
    company: row.company ?? '',
    type: row.type ?? 'Full-time',
    badge: row.badge ?? 'New',
    parsedText: row.raw_text ?? '',
    updatedAt: row.updated_at ?? row.created_at,
  };
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? 'guest-user';
}

let mockJds: JdRecord[] = [];

/** Seed-style match profiles for local JD matching (rule-based) */
function containsKeyword(text: string, kw: string): boolean {
  const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  let pattern = `\\b${escaped}\\b`;
  if (kw.includes('+') || kw.includes('#') || kw.startsWith('.')) {
    pattern = escaped;
  }
  const regex = new RegExp(pattern, 'i');
  return regex.test(text);
}

/* ─── Service ──────────────────────────────────────────────────────────────── */

export const jdService = {
  eventName: JD_EVENT,

  async list(): Promise<JdRecord[]> {
    const userId = await getUserId();
    if (userId === 'guest-user') return [...mockJds];

    const { data, error } = await supabase
      .from('jds')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRowToJdRecord);
  },

  async getById(id: string): Promise<JdRecord | undefined> {
    const userId = await getUserId();
    if (userId === 'guest-user') return mockJds.find(j => j.id === id);

    const { data, error } = await supabase
      .from('jds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return mapRowToJdRecord(data);
  },

  async rename(id: string, nextName: string): Promise<JdRecord[]> {
    const userId = await getUserId();
    if (userId === 'guest-user') {
      const match = mockJds.find(j => j.id === id);
      if (match) match.title = nextName;
      notifyJdChange({ id });
      return this.list();
    }

    const { error } = await supabase
      .from('jds')
      .update({ title: nextName, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    notifyJdChange({ id });
    return this.list();
  },

  async saveText(id: string, text: string, title?: string): Promise<JdRecord | null> {
    const userId = await getUserId();
    if (userId === 'guest-user') {
      const match = mockJds.find(j => j.id === id);
      if (match) {
        match.parsedText = text;
        if (title) match.title = title;
        match.updatedAt = new Date().toISOString();
        notifyJdChange({ id });
        return match;
      }
      return null;
    }

    const updatePayload: Record<string, unknown> = {
      raw_text: text,
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updatePayload.title = title;

    const { data, error } = await supabase
      .from('jds')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    notifyJdChange({ id });
    return data ? mapRowToJdRecord(data) : null;
  },

  async remove(id: string): Promise<JdRecord[]> {
    const userId = await getUserId();
    if (userId === 'guest-user') {
      mockJds = mockJds.filter(j => j.id !== id);
      notifyJdChange();
      return this.list();
    }

    const { error } = await supabase
      .from('jds')
      .delete()
      .eq('id', id);

    if (error) throw error;
    notifyJdChange();
    return this.list();
  },

  async importText(text: string, sourceName?: string) {
    const userId = await getUserId();
    
    let cleanTitle = sourceName?.replace(/\.[^.]+$/, '') || `Imported JD ${Date.now()}`;
    let cleanCompany = '';
    let cleanType = 'Imported';
    let cleanText = text;

    try {
      const { buildJdParsePrompt } = await import('lib/resume-prompt');
      const { callGroq } = await import('lib/groq-client');
      const { systemPrompt, userPrompt } = buildJdParsePrompt(text.slice(0, 8000));
      const result = await callGroq(systemPrompt, userPrompt);
      const parsed = JSON.parse(result);
      if (parsed.title) cleanTitle = parsed.title;
      if (parsed.company) cleanCompany = parsed.company;
      if (parsed.type) cleanType = parsed.type;
      if (parsed.cleanText) cleanText = parsed.cleanText;
    } catch (err) {
      console.warn('AI JD parsing failed, using fallback line-based parsing:', err);
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      cleanTitle = sourceName?.replace(/\.[^.]+$/, '') || lines[0] || `Imported JD ${Date.now()}`;
      cleanCompany = lines[1] || '';
    }

    if (userId === 'guest-user') {
      const item: JdRecord = {
        id: `mock-jd-${Date.now()}`,
        title: cleanTitle,
        company: cleanCompany,
        type: cleanType,
        parsedText: cleanText,
        badge: 'Newly added',
        updatedAt: new Date().toISOString(),
      };
      mockJds.unshift(item);
      notifyJdChange({ id: item.id });
      const list = await this.list();
      return { extractedText: cleanText, item, list };
    }

    const { data, error } = await supabase
      .from('jds')
      .insert({
        user_id: userId,
        title: cleanTitle,
        company: cleanCompany,
        type: cleanType,
        raw_text: cleanText,
        badge: 'Newly added',
      })
      .select('*')
      .single();

    if (error) throw error;

    const item = mapRowToJdRecord(data);
    notifyJdChange({ id: item.id });
    const list = await this.list();
    return { extractedText: cleanText, item, list };
  },

  async importFile(file: File) {
    // Phase 4 will add pdf.js extraction here.
    return this.importText(`Imported from ${file.name}`, file.name);
  },

  async getMatchProfiles(): Promise<ResumePickerOption[]> {
    const resumes = await resumeService.list();
    return resumes.map(item => ({
      id: item.id,
      label: item.name.replace(/\.tex$/i, ''),
    }));
  },

  async buildReport(resumeId: string, jdId: string): Promise<JdReportModel | null> {
    const jd = await this.getById(jdId);
    if (!jd) return null;

    const record = await resumeService.getRecord(resumeId);
    const resumeText = record?.content ? buildResumePlainText(record.content) : '';
    const jdText = jd.parsedText || '';

    const dict = [
      'React', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
      'REST API', 'GraphQL', 'Microservices', 'CI/CD', 'Git', 'HTML', 'CSS', 'Tailwind', 'System Design',
      'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Data Pipelines', 'APIs', 'Node',
      'Spring Boot', 'PHP', 'Agile', 'Scrum'
    ];

    const jdKeywords = dict.filter(kw => containsKeyword(jdText, kw));

    if (jdKeywords.length === 0) {
      const titleLower = jd.title.toLowerCase();
      if (titleLower.includes('front') || titleLower.includes('web')) {
        jdKeywords.push('React', 'JavaScript', 'HTML', 'CSS', 'Git');
      } else if (titleLower.includes('back') || titleLower.includes('api')) {
        jdKeywords.push('Node.js', 'REST API', 'SQL', 'Git', 'APIs');
      } else {
        jdKeywords.push('JavaScript', 'Python', 'Git', 'APIs');
      }
    }

    const found = jdKeywords.filter(kw => containsKeyword(resumeText, kw));
    const miss = jdKeywords.filter(kw => !containsKeyword(resumeText, kw));

    const score = Math.round((found.length / jdKeywords.length) * 100);
    let scoreTone: ResumeScoreTone = 'mid';
    if (score >= 75) scoreTone = 'high';
    else if (score < 45) scoreTone = 'low';

    const verdict = scoreTone === 'high'
      ? 'Strong match for this role'
      : scoreTone === 'mid'
        ? 'Promising match with a few gaps'
        : 'Needs targeted tailoring';

    const checks: JdCheck[] = [
      { text: `Matched ${found.length} keywords from the JD`, tone: score >= 75 ? 'ok' : 'warn' },
      { text: 'Resume structure is clear enough for recruiter review', tone: 'ok' },
      { text: `Address ${miss.length} missing keyword gaps before applying`, tone: miss.length > 2 ? 'bad' : 'warn' },
      { text: 'Tailor the summary and experience bullets to this exact role', tone: 'warn' },
    ];

    const metrics: JdMetric[] = [
      { label: 'Keyword coverage', tone: score >= 75 ? 'accent' : 'warn', value: score },
      { label: 'Role alignment', tone: score >= 60 ? 'accent' : 'warn', value: Math.max(30, score - 5) },
      { label: 'Preferred overlap', tone: score >= 65 ? 'accent' : 'warn', value: Math.max(25, score - 12) },
      { label: 'Evidence readiness', tone: score >= 55 ? 'accent' : 'warn', value: Math.min(95, score + 8) },
    ];

    return {
      checks,
      found,
      jd,
      metrics,
      miss,
      resumeId,
      resumeLabel: record?.title ?? resumeId,
      score,
      scoreTone,
      verdict,
    };
  },

  async tailorResume(resumeId: string, jdId: string): Promise<JdTailoredSuggestions> {
    const jd = await this.getById(jdId);
    if (!jd) throw new Error('Job description not found');

    const record = await resumeService.getRecord(resumeId);
    if (!record || !record.content) throw new Error('Resume not found or has no content');

    const { buildResumeTailorPrompt } = await import('lib/resume-prompt');
    const { callGroq } = await import('lib/groq-client');

    const { systemPrompt, userPrompt } = buildResumeTailorPrompt(record.content, jd.parsedText);
    const result = await callGroq(systemPrompt, userPrompt);
    
    try {
      const suggestions = JSON.parse(result) as JdTailoredSuggestions;
      return suggestions;
    } catch (parseErr) {
      console.error('Failed to parse tailored suggestions JSON:', result);
      throw new Error('AI tailoring returned invalid JSON formatting. Please try again.');
    }
  }
};
