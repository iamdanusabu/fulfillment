
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { DashboardStats } from '../../../shared/types';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const response = await fetchWithToken('/api/dashboard');
    return response;
  },
};
