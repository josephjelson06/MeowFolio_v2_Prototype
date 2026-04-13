export interface ResumeRecord {
  id: string;
  name: string;
  updated: string;
  updatedAt?: string;
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

export interface ResumePickerOption {
  id: string;
  label: string;
}
