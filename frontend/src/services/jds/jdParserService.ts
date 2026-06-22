import { supabase } from 'lib/supabase';
import type { JdRecord, ParsedJD } from 'types/jd';

const LS_PREFIX = 'meowfolio:jd-parsed:';

/** Retrieve a locally-cached ParsedJD for a given JD id */
function getCached(jdId: string): ParsedJD | null {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${jdId}`);
    return raw ? (JSON.parse(raw) as ParsedJD) : null;
  } catch {
    return null;
  }
}

/** Cache a ParsedJD locally */
function setCache(jdId: string, data: ParsedJD): void {
  try {
    localStorage.setItem(`${LS_PREFIX}${jdId}`, JSON.stringify(data));
  } catch {
    // quota exceeded — silently ignore
  }
}

export const jdParserService = {
  /**
   * Return cached ParsedJD for a JD record if it exists.
   * Priority: in-memory JdRecord.parsedData → localStorage → null
   */
  getCached(jd: JdRecord): ParsedJD | null {
    if (jd.parsedData) return jd.parsedData;
    return getCached(jd.id);
  },

  /**
   * Run deep AI extraction on a saved JD.
   * Calls Groq with the intelligence prompt, validates the JSON response,
   * persists to localStorage, and best-effort upserts to the `jds` table.
   *
   * Returns the ParsedJD on success, throws on failure.
   */
  async parse(jd: JdRecord): Promise<ParsedJD> {
    if (!jd.parsedText?.trim()) {
      throw new Error('No JD text to parse. Add text to the JD first.');
    }

    const { buildJdIntelligencePrompt } = await import('lib/resume-prompt');
    const { callGroq } = await import('lib/groq-client');

    const { systemPrompt, userPrompt } = buildJdIntelligencePrompt(jd.parsedText);
    const raw = await callGroq(systemPrompt, userPrompt);

    let parsed: ParsedJD;
    try {
      const obj = JSON.parse(raw) as Partial<ParsedJD>;
      parsed = {
        role:                    obj.role                    ?? jd.title,
        seniority:               obj.seniority               ?? 'unknown',
        company:                 obj.company                 ?? jd.company,
        industry:                obj.industry                ?? '',
        location:                obj.location                ?? '',
        employmentType:          obj.employmentType          ?? jd.type ?? 'Full-time',
        mustHaveSkills:          Array.isArray(obj.mustHaveSkills)          ? obj.mustHaveSkills          : [],
        niceToHaveSkills:        Array.isArray(obj.niceToHaveSkills)        ? obj.niceToHaveSkills        : [],
        requiredExperience:      obj.requiredExperience      ?? '',
        keyResponsibilities:     Array.isArray(obj.keyResponsibilities)     ? obj.keyResponsibilities     : [],
        preferredQualifications: Array.isArray(obj.preferredQualifications) ? obj.preferredQualifications : [],
        companyContext:          obj.companyContext          ?? '',
        roleContext:             obj.roleContext             ?? '',
        redFlags:                Array.isArray(obj.redFlags)                ? obj.redFlags                : [],
        keyAtsKeywords:          Array.isArray(obj.keyAtsKeywords)          ? obj.keyAtsKeywords          : [],
        parsedAt:                new Date().toISOString(),
      };
    } catch {
      throw new Error('AI returned invalid JSON. Please try again.');
    }

    // Persist to localStorage immediately
    setCache(jd.id, parsed);

    // Best-effort Supabase upsert — requires `parsed_data` JSONB column on `jds` table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && jd.id && !jd.id.startsWith('mock-')) {
        await supabase
          .from('jds')
          .update({ parsed_data: parsed, updated_at: parsed.parsedAt })
          .eq('id', jd.id);
      }
    } catch {
      // localStorage already saved — DB sync is best-effort
    }

    return parsed;
  },
};
