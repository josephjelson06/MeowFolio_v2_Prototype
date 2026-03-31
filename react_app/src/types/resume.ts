export interface ResumeRecord {
  id: string;
  name: string;
  updated: string;
  template: string;
  recent?: boolean;
}

export type ResumeScoreTone = 'high' | 'mid' | 'low';

export interface ResumeMatchProfile {
  score: number;
  cls: ResumeScoreTone;
  found: string[];
  miss: string[];
}
