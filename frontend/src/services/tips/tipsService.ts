import { apiClient } from 'lib/apiClient';

const dashboardTipsSeed = [
  'Use numbers when they clarify scale, speed, quality, or reach.',
  'Start each bullet with a strong action verb - Led, Built, Reduced, Designed.',
  'Keep your resume to one page unless you have 10+ years of experience.',
  'Tailor your skills section to match the job description keywords.',
  'Add a professional summary only when it adds value, not filler.',
];

export const tipsService = {
  async list() {
    try {
      const response = await apiClient.get<{ items: string[] }>('/tips');
      return response.items.slice();
    } catch {
      return dashboardTipsSeed.slice();
    }
  },
};
