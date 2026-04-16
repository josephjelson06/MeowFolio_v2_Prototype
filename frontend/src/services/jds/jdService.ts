import { supabase } from 'lib/supabase';
import { resumeService } from 'services/resumeService';
import type { JdCheck, JdMetric, JdRecord } from 'types/jd';
import type { ResumeMatchProfile, ResumePickerOption, ResumeScoreTone } from 'types/resume';

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
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

/** Seed-style match profiles for local JD matching (rule-based) */
const resumeMatchProfilesSeed: Record<string, ResumeMatchProfile> = {
  resume_v3: { score: 87, cls: 'high', found: ['Python', 'React', 'REST API', 'scalable', 'cloud'], miss: ['Kubernetes', 'Go'] },
  resume_sde: { score: 62, cls: 'mid', found: ['React', 'Node.js', 'REST'], miss: ['Python', 'System design', 'scalable'] },
  resume_pm: { score: 31, cls: 'low', found: ['communication'], miss: ['Python', 'React', 'backend', 'APIs'] },
  resume_ds: { score: 78, cls: 'high', found: ['Python', 'AWS', 'data pipelines'], miss: ['React', 'Node.js'] },
  resume_ml: { score: 55, cls: 'mid', found: ['Python', 'ML', 'TensorFlow', 'AWS'], miss: ['React', 'Node.js', 'REST API'] },
};

function fallbackReport(resumeId: string, jd: JdRecord): JdReportModel | null {
  const resumeSeed = resumeMatchProfilesSeed[resumeId] ?? { score: 58, cls: 'mid' as const, found: ['React', 'APIs'], miss: ['Python', 'cloud'] };
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

/* ─── Service ──────────────────────────────────────────────────────────────── */

export const jdService = {
  eventName: JD_EVENT,

  async list(): Promise<JdRecord[]> {
    const { data, error } = await supabase
      .from('jds')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRowToJdRecord);
  },

  async getById(id: string): Promise<JdRecord | undefined> {
    const { data, error } = await supabase
      .from('jds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return mapRowToJdRecord(data);
  },

  async rename(id: string, nextName: string): Promise<JdRecord[]> {
    const { error } = await supabase
      .from('jds')
      .update({ title: nextName, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    notifyJdChange({ id });
    return this.list();
  },

  async saveText(id: string, text: string, title?: string): Promise<JdRecord | null> {
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
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const title = sourceName?.replace(/\.[^.]+$/, '') || lines[0] || `Imported JD ${Date.now()}`;

    const { data, error } = await supabase
      .from('jds')
      .insert({
        user_id: userId,
        title,
        company: lines[1] || '',
        type: 'Imported',
        raw_text: text,
        badge: 'Newly added',
      })
      .select('*')
      .single();

    if (error) throw error;

    const item = mapRowToJdRecord(data);
    notifyJdChange({ id: item.id });
    const list = await this.list();
    return { extractedText: text, item, list };
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
    return fallbackReport(resumeId, jd);
  },
};
