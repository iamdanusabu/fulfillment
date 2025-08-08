
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { DashboardStats } from '../../../shared/types';
import { getConfig } from '../../../environments';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const config = getConfig();
    const response = await fetchWithToken(config.endpoints.dashboard);
    return response;
  },
};
