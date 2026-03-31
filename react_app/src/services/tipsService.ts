import { dashboardTipsSeed } from 'mocks/dashboardTips';

export const tipsService = {
  list() {
    return dashboardTipsSeed.slice();
  },
};
