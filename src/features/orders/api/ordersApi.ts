
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { Order, PaginatedResponse } from '../../../shared/types';

export const ordersApi = {
  async getOrders(params: {
    page?: number;
    limit?: number;
    source?: string;
    status?: string;
  } = {}): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return await fetchWithToken(`/api/orders?${searchParams.toString()}`);
  }
};
