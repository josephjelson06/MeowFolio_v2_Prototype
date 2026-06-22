import { resumeService } from 'services/resumeService';
import { userProfileService } from 'services/profile/userProfileService';
import { createEmptyResumeData, buildResumePlainText } from 'types/resumeDocument';
import type { ResumeData } from 'types/resumeDocument';
import type { ParsedJD } from 'types/jd';
import type { UserProfile } from 'types/userProfile';


/* ─── Gap Analysis ───────────────────────────────────────────────────────────── */

export interface GapAnalysisResult {
  /** 0–100. Higher = bigger gap (profile ≠ JD). */
  gapScore: number;
  /** Human-readable verdict */
  verdict: string;
  /** Skills in the JD that the user has */
  matchedSkills: string[];
  /** Must-have skills the user is missing */
  missingMustHave: string[];
  /** Nice-to-have skills the user is missing */
  missingNiceToHave: string[];
  /** Recommended pipeline mode */
  mode: 'tailor' | 'fresh';
}

/**
 * Compare a UserProfile against a ParsedJD to determine how well the user
 * fits, and whether we should tailor an existing resume or generate fresh.
 *
 * Decision rule:
 *   - gapScore < 40  → tailor   (user already has most required skills)
 *   - gapScore ≥ 40  → fresh    (too many missing must-haves; easier to build clean)
 */
export function analyzeGap(profile: UserProfile, parsedJd: ParsedJD): GapAnalysisResult {
  // Flatten all skills the user has into a single lowercase string for matching
  const userSkillText = [
    ...profile.skillGroups.map(g => g.skills),
    ...profile.experience.map(e => e.bullets.join(' ')),
    ...profile.projects.map(p => `${p.techStack} ${p.description}`),
    profile.summary ?? '',
    profile.defaultTitle ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#.]/g, ' ');

  const matchedSkills = parsedJd.mustHaveSkills.filter(skill =>
    userSkillText.includes(normalize(skill)),
  );

  const missingMustHave = parsedJd.mustHaveSkills.filter(
    skill => !userSkillText.includes(normalize(skill)),
  );

  const missingNiceToHave = parsedJd.niceToHaveSkills.filter(
    skill => !userSkillText.includes(normalize(skill)),
  );

  const total = parsedJd.mustHaveSkills.length || 1;
  const gapScore = Math.round((missingMustHave.length / total) * 100);

  const mode: 'tailor' | 'fresh' = gapScore < 40 ? 'tailor' : 'fresh';

  const verdict =
    gapScore < 20
      ? 'Excellent fit — tailoring existing resume will maximize your score'
      : gapScore < 40
        ? 'Good fit — tailoring recommended to plug skill gaps'
        : gapScore < 65
          ? 'Partial fit — generating a fresh, JD-optimized resume recommended'
          : 'Wide gap — fresh generation will yield a much stronger result';

  return { gapScore, verdict, matchedSkills, missingMustHave, missingNiceToHave, mode };
}

/* ─── Generation Pipeline ────────────────────────────────────────────────────── */

export interface GenerateResumeOptions {
  /** Force a specific mode, overriding the gap analysis recommendation */
  forceMode?: 'tailor' | 'fresh';
  /**
   * Required for "tailor" mode — the existing resume ID to tailor.
   * If not provided in tailor mode, falls back to fresh generation.
   */
  baseResumeId?: string;
  /** Name for the newly created resume in the library */
  resumeTitle?: string;
}

export interface GenerateResumeResult {
  resumeId: string;
  resumeTitle: string;
  mode: 'tailor' | 'fresh';
  gapAnalysis: GapAnalysisResult;
}

/**
 * Full Phase 3 pipeline:
 * 1. Load user profile
 * 2. Run gap analysis
 * 3. Call AI with the appropriate prompt
 * 4. Parse and validate the ResumeData JSON
 * 5. Save to the resume library
 * 6. Return the new resume ID
 */
export async function generateResume(
  parsedJd: ParsedJD,
  options: GenerateResumeOptions = {},
): Promise<GenerateResumeResult> {
  // 1. Load user profile
  const profile = await userProfileService.get();

  // 2. Gap analysis
  const gapAnalysis = analyzeGap(profile, parsedJd);
  const mode = options.forceMode ?? gapAnalysis.mode;

  // 3. Build prompts + call AI
  const { buildResumeFreshGenPrompt, buildResumeTailorFromProfilePrompt } = await import('lib/resume-prompt');
  const { callGroq } = await import('lib/groq-client');

  let rawJson: string;
  let baseData: ResumeData | null = null;

  if (mode === 'tailor' && options.baseResumeId) {
    const record = await resumeService.getRecord(options.baseResumeId);
    if (record?.content) {
      baseData = record.content;
      const { systemPrompt, userPrompt } = buildResumeTailorFromProfilePrompt(
        JSON.stringify(record.content),
        {
          role:                parsedJd.role,
          company:             parsedJd.company,
          mustHaveSkills:      parsedJd.mustHaveSkills,
          keyResponsibilities: parsedJd.keyResponsibilities,
          keyAtsKeywords:      parsedJd.keyAtsKeywords,
          companyContext:      parsedJd.companyContext,
        },
      );
      rawJson = await callGroq(systemPrompt, userPrompt);
    } else {
      // Fall back to fresh if the base resume is missing
      const { systemPrompt, userPrompt } = buildResumeFreshGenPrompt(profile, parsedJd);
      rawJson = await callGroq(systemPrompt, userPrompt);
    }
  } else {
    // Fresh generation
    const { systemPrompt, userPrompt } = buildResumeFreshGenPrompt(profile, parsedJd);
    rawJson = await callGroq(systemPrompt, userPrompt);
  }

  // 4. Parse + merge with a clean skeleton (defensive — never let a bad AI response crash the app)
  let generated: ResumeData;
  try {
    const parsed = JSON.parse(rawJson);
    generated = mergeWithSkeleton(parsed, baseData);
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // 5. Save to library using createBlank + saveRecord
  const title = options.resumeTitle
    ?? `${parsedJd.role}${parsedJd.company ? ` @ ${parsedJd.company}` : ''} (AI)`;

  // Create a blank entry, then immediately overwrite its content
  const blankRecord = await resumeService.createBlank();
  await resumeService.saveRecord(blankRecord.id, {
    content: generated,
    renderOptions: { ...generated.meta, ...{ templateId: 'template2', fontFamily: 'TeX Gyre Termes', fontSize: 11, lineSpacing: 1.15, maxBulletsPerEntry: 4, margin: '1cm', accentColor: 'charcoal', pageLimit: 1, sectionOrder: [], sectionTitles: {} } } as any,
    templateId: 'template2',
    title,
    rawText: buildResumePlainText(generated),
  });

  return {
    resumeId: blankRecord.id,
    resumeTitle: title,
    mode,
    gapAnalysis,
  };
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

/**
 * Merge the AI-generated partial ResumeData with a clean skeleton so
 * all required keys are always present, even if the AI omits them.
 */
function mergeWithSkeleton(generated: Partial<ResumeData>, base?: ResumeData | null): ResumeData {
  const skeleton = base ? { ...base } : createEmptyResumeData('ai');
  return {
    ...skeleton,
    ...generated,
    meta: {
      ...skeleton.meta,
      source: 'ai',
      updatedAt: new Date().toISOString(),
    },
    header:         { ...skeleton.header,         ...(generated.header         ?? {}) },
    summary:        { ...skeleton.summary,        ...(generated.summary        ?? {}) },
    skills:         { ...skeleton.skills,         ...(generated.skills         ?? {}) },
    leadership:     { ...skeleton.leadership,     ...(generated.leadership     ?? {}) },
    achievements:   { ...skeleton.achievements,   ...(generated.achievements   ?? {}) },
    competitions:   { ...skeleton.competitions,   ...(generated.competitions   ?? {}) },
    extracurricular:{ ...skeleton.extracurricular,...(generated.extracurricular?? {}) },
    publications:   { ...skeleton.publications,   ...(generated.publications   ?? {}) },
    openSource:     { ...skeleton.openSource,     ...(generated.openSource     ?? {}) },
    languages:      { ...skeleton.languages,      ...(generated.languages      ?? {}) },
    hobbies:        { ...skeleton.hobbies,        ...(generated.hobbies        ?? {}) },
    education:      Array.isArray(generated.education)      ? generated.education      : skeleton.education,
    experience:     Array.isArray(generated.experience)     ? generated.experience     : skeleton.experience,
    projects:       Array.isArray(generated.projects)       ? generated.projects       : skeleton.projects,
    certifications: Array.isArray(generated.certifications) ? generated.certifications : skeleton.certifications,
  };
}
