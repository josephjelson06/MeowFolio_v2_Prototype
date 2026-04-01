export interface ProfileSummary {
  name: string;
  email: string;
  plan: string;
  memberSince: string;
}

export interface UsageMetric {
  label: string;
  used: number;
  total: number;
}
