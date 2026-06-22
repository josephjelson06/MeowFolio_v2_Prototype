export interface JdRecord {
  id: string;
  title: string;
  company: string;
  type: string;
  badge: string;
  parsedText: string;
  updatedAt?: string;
  /** Structured intelligence extracted by the JD Parser (Phase 2) */
  parsedData?: ParsedJD;
}

/** Seniority levels inferred from a JD */
export type JdSeniority = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'unknown';

/**
 * Structured intelligence extracted from a raw Job Description.
 * Produced by jdParserService.parse() and consumed by all generators.
 */
export interface ParsedJD {
  // ── Core identification ────────────────────────────────────────────────
  role: string;
  seniority: JdSeniority;
  company: string;
  industry: string;
  location: string;
  employmentType: string;       // "Full-time" | "Contract" | "Remote" | etc.

  // ── Requirements ──────────────────────────────────────────────────────
  mustHaveSkills: string[];     // Deal-breakers — missing = no interview
  niceToHaveSkills: string[];   // Preferred but not blockers
  requiredExperience: string;   // e.g. "5+ years in ML"

  // ── Role details ──────────────────────────────────────────────────────
  keyResponsibilities: string[]; // 3–7 concrete responsibilities
  preferredQualifications: string[];

  // ── Context ───────────────────────────────────────────────────────────
  companyContext: string;       // What the company does / current focus
  roleContext: string;          // Why this role exists / team context

  // ── Signals ───────────────────────────────────────────────────────────
  redFlags: string[];           // Vague requirements, warning signs
  keyAtsKeywords: string[];     // Top 10–15 ATS-critical terms to include in resume

  parsedAt: string;
}

export interface JdMetric {
  label: string;
  value: number;
  tone: 'accent' | 'warn';
}

export interface JdCheck {
  tone: 'ok' | 'warn' | 'bad';
  text: string;
}

export interface JdTailoredSkills {
  mode: 'csv' | 'grouped';
  items: string[];
  groups: { groupLabel: string; items: string[] }[];
}

export interface JdTailoredExperience {
  company: string;
  role: string;
  bullets: string[];
}

export interface JdTailoredProject {
  title: string;
  bullets: string[];
}

export interface JdTailoredSuggestions {
  summary: string;
  skills: JdTailoredSkills;
  experience: JdTailoredExperience[];
  projects: JdTailoredProject[];
}

