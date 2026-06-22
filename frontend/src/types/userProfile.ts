/** A single education entry */
export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  location: string;
}

/** A single work experience entry */
export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  current: boolean;
  /** One bullet point per array item */
  bullets: string[];
}

/** A single project entry */
export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  /** Comma-separated: "React, FastAPI, PostgreSQL" */
  techStack: string;
  link: string;
  startDate: string;
  endDate: string;
}

/** A categorised skill group with comma-separated skill names */
export interface SkillGroup {
  id: string;
  category: string;
  /** Comma-separated: "Python, TypeScript, Java" */
  skills: string;
}

/** A single achievement or certification entry */
export interface AchievementEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

/** The full rich user profile stored per account */
export interface UserProfile {
  // ── Contact ───────────────────────────────────────────────────────────
  fullName: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  portfolio: string;

  // ── Professional Identity ─────────────────────────────────────────────
  defaultTitle: string;
  summary: string;

  // ── Sections ─────────────────────────────────────────────────────────
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skillGroups: SkillGroup[];
  achievements: AchievementEntry[];

  updatedAt: string;
}
