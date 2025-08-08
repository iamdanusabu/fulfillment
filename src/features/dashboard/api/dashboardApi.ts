import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { DashboardStats } from '../../../shared/types';
import { getConfig } from '../../../environments';

export const dashboardApi = {
  async getDashboardStats() {
    try {
      const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
      const config = getConfig();

      const data = await fetchWithToken(config.endpoints.dashboard);

      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats instead of throwing
      return {
        totalOrders: 0,
        readyForPickup: 0,
        activePicklists: 0,
        sources: []
      };
    }
  },

  async getOrderCountBySource(source: string) {
    try {
      const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
      const config = getConfig();

      const url = `${config.endpoints.orders}?source=${encodeURIComponent(source)}&pageSize=1`;
      const data = await fetchWithToken(url);

      return data?.totalRecords || 0;
    } catch (error) {
      console.error(`Failed to get count for source ${source}:`, error);
      return 0; // Return 0 instead of throwing error
    }
  },
};