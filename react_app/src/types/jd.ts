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
