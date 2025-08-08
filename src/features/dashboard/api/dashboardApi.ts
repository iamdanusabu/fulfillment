
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { DashboardStats } from '../../../shared/types';
import { getConfig } from '../../../environments';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const config = getConfig();
    
    try {
      const response = await fetchWithToken(config.endpoints.dashboard, {
        timeout: 10000, // 10 second timeout
      });
      
      // Return the response or provide defaults if data is missing
      return {
        totalOrders: response?.totalOrders || 0,
        pendingOrders: response?.pendingOrders || 0,
        readyForPickup: response?.readyForPickup || 0,
        completedOrders: response?.completedOrders || 0,
        ordersBySource: response?.ordersBySource || [],
        ...response
      };
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  },
};
