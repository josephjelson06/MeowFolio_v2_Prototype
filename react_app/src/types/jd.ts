export interface JdRecord {
  id: number;
  title: string;
  company: string;
  type: string;
  badge: string;
  parsedText: string;
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
