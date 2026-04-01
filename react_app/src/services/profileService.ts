import { apiClient } from 'lib/apiClient';
import type { ProfileSummary, UsageMetric } from 'types/ui';

const fallbackSummary: ProfileSummary = {
  name: 'Arjun Kumar',
  email: 'arjun@email.com',
  plan: 'Free Plan',
  memberSince: 'Jan 2026',
};

const fallbackUsage: UsageMetric[] = [
  { label: 'ATS analyses', used: 8, total: 50 },
  { label: 'JD comparisons', used: 3, total: 20 },
  { label: 'PDF exports', used: 2, total: 100 },
  { label: 'Parses today', used: 3, total: 3 },
];

export const profileService = {
  async getSummary() {
    try {
      const response = await apiClient.get<{ summary: ProfileSummary; usage: UsageMetric[] }>('/profile');
      return response.summary;
    } catch {
      return structuredClone(fallbackSummary);
    }
  },
  async getUsage() {
    try {
      const response = await apiClient.get<{ summary: ProfileSummary; usage: UsageMetric[] }>('/profile');
      return response.usage;
    } catch {
      return structuredClone(fallbackUsage);
    }
  },
};
