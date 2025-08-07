
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { Location, PicklistItem } from '../../../shared/types';

export const picklistApi = {
  async getLocations(): Promise<Location[]> {
    return await fetchWithToken('/api/locations');
  },

  async simulateFulfillment(orderIds: string[], locationId: string): Promise<PicklistItem[]> {
    return await fetchWithToken('/api/fulfillment/simulate', {
      method: 'POST',
      body: JSON.stringify({ orderIds, locationId }),
    });
  },

  async createFulfillment(orderIds: string[], locationId: string, items: PicklistItem[]) {
    return await fetchWithToken('/api/fulfillment', {
      method: 'POST',
      body: JSON.stringify({ orderIds, locationId, items }),
    });
  },

  async finalizePacking(fulfillmentId: string) {
    return await fetchWithToken(`/api/fulfillment/${fulfillmentId}/finalize`, {
      method: 'PATCH',
    });
  }
};
