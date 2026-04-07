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

export interface AuthModalConfig {
  title: string;
  // copy: string;
  // note: string;
  // accent: string;
  // info: string;
  // outline: string;
  // previewTitle: string;
  // previewCopy: string;
}
