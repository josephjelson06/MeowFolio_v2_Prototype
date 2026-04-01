import type { ProfileSummary, UsageMetric } from '../../../../shared/contracts/profile';

export function getProfileSummary(): ProfileSummary {
  return {
    email: 'arjun@email.com',
    memberSince: 'Jan 2026',
    name: 'Arjun Kumar',
    plan: 'Free Plan',
  };
}

export function buildUsageMetrics(resumeCount: number, jdCount: number): UsageMetric[] {
  return [
    { label: 'ATS analyses', used: Math.min(Math.max(resumeCount, 1), 50), total: 50 },
    { label: 'JD comparisons', used: Math.min(Math.max(jdCount, 1), 20), total: 20 },
    { label: 'PDF exports', used: 2, total: 100 },
    { label: 'Parses today', used: Math.min(resumeCount + jdCount, 3), total: 3 },
  ];
}
