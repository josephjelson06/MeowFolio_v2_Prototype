export interface JdKeywordBucket {
  required: string[];
  preferred: string[];
  titles: string[];
  skills: string[];
}

export interface JdParsedMeta {
  roleTitle: string | null;
  company: string | null;
  summary: string | null;
  keywordBuckets: JdKeywordBucket;
}

export interface JdRecord {
  id: string;
  title: string;
  company: string;
  type: string;
  badge: string;
  parsedText: string;
  parsedMeta?: JdParsedMeta;
  updatedAt: string;
}

export interface ScoreMetric {
  label: string;
  value: number;
  tone: 'accent' | 'warn';
}

export interface ScoreCheck {
  tone: 'ok' | 'warn' | 'bad';
  text: string;
}

export interface AtsScoreResponse {
  score: number;
  verdict: string;
  breakdown: Array<{ label: string; score: number; max: number }>;
  tips: string[];
  warnings: string[];
}

export interface JdMatchResponse {
  score: number;
  tone: 'high' | 'mid' | 'low';
  verdict: string;
  foundKeywords: string[];
  missingKeywords: string[];
  metrics: ScoreMetric[];
  checks: ScoreCheck[];
}
