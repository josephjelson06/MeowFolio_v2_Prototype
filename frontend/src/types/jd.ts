export interface JdRecord {
  id: string;
  title: string;
  company: string;
  type: string;
  badge: string;
  parsedText: string;
  updatedAt?: string;
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

