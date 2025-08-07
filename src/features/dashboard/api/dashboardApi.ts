
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { DashboardStats } from '../../../shared/types';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    return await fetchWithToken('/api/dashboard');
  }
};
