import type { ProfileSummary, UsageMetric } from 'types/ui';

const profileSummary: ProfileSummary = {
  name: 'Arjun Kumar',
  email: 'arjun@email.com',
  plan: 'Free Plan',
  memberSince: 'Jan 2026',
};

const usageMetrics: UsageMetric[] = [
  { label: 'ATS analyses', used: 8, total: 50 },
  { label: 'JD comparisons', used: 3, total: 20 },
  { label: 'PDF exports', used: 2, total: 100 },
  { label: 'Parses today', used: 4, total: 4 },
];

export const profileService = {
  getSummary() {
    return structuredClone(profileSummary);
  },
  getUsage() {
    return structuredClone(usageMetrics);
  },
};
