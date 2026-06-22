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

export function buildProfilePlainText(profile: UserProfile): string {
  const parts: string[] = [];
  const push = (...items: Array<string | undefined | null>) => {
    const text = items.filter(Boolean).join(' ').trim();
    if (text) parts.push(text);
  };

  push(profile.fullName, profile.defaultTitle, profile.phone, profile.location);
  push(profile.linkedIn, profile.github, profile.portfolio);
  push(profile.summary);

  if (profile.education && profile.education.length > 0) {
    parts.push('\n--- EDUCATION ---');
    profile.education.forEach(edu => {
      push(
        `${edu.degree} in ${edu.field}`,
        edu.institution,
        edu.startDate || edu.endDate ? `(${edu.startDate} - ${edu.endDate})` : '',
        edu.location,
        edu.gpa ? `GPA: ${edu.gpa}` : ''
      );
    });
  }

  if (profile.experience && profile.experience.length > 0) {
    parts.push('\n--- EXPERIENCE ---');
    profile.experience.forEach(exp => {
      push(
        exp.role,
        `at ${exp.company}`,
        exp.startDate || exp.endDate ? `(${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})` : '',
        exp.location
      );
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach(b => push(`- ${b}`));
      }
    });
  }

  if (profile.projects && profile.projects.length > 0) {
    parts.push('\n--- PROJECTS ---');
    profile.projects.forEach(proj => {
      push(
        proj.name,
        proj.startDate || proj.endDate ? `(${proj.startDate} - ${proj.endDate})` : '',
        proj.link ? `Link: ${proj.link}` : '',
        proj.techStack ? `Tech Stack: ${proj.techStack}` : ''
      );
      push(proj.description);
    });
  }

  if (profile.skillGroups && profile.skillGroups.length > 0) {
    parts.push('\n--- SKILLS ---');
    profile.skillGroups.forEach(sg => {
      if (sg.skills && sg.skills.trim()) {
        push(`${sg.category}: ${sg.skills}`);
      }
    });
  }

  if (profile.achievements && profile.achievements.length > 0) {
    parts.push('\n--- ACHIEVEMENTS & CERTIFICATIONS ---');
    profile.achievements.forEach(ach => {
      push(ach.title, ach.issuer ? `by ${ach.issuer}` : '', ach.date ? `(${ach.date})` : '');
      push(ach.description);
    });
  }

  return parts.join('\n');
}

