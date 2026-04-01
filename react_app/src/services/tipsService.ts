import { dashboardTipsSeed } from 'mocks/dashboardTips';
import { apiClient } from 'lib/apiClient';

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
