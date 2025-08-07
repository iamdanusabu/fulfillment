
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { Location, PicklistItem } from '../../../shared/types';
import { getConfig } from '../../../environments';

export const picklistApi = {
  async getLocations(): Promise<Location[]> {
    const config = getConfig();
    return await fetchWithToken(config.endpoints.locations);
  },

  async simulateFulfillment(orderIds: string[], locationId: string): Promise<PicklistItem[]> {
    const config = getConfig();
    return await fetchWithToken(config.endpoints.simulateFulfillment, {
      method: 'POST',
      body: JSON.stringify({ orderIds, locationId }),
    });
  },

  async createFulfillment(orderIds: string[], locationId: string, items: PicklistItem[]) {
    const config = getConfig();
    return await fetchWithToken(config.endpoints.fulfillment, {
      method: 'POST',
      body: JSON.stringify({ orderIds, locationId, items }),
    });
  },

  async finalizePacking(fulfillmentId: string) {
    const config = getConfig();
    return await fetchWithToken(`${config.endpoints.fulfillment}/${fulfillmentId}/finalize`, {
      method: 'PATCH',
    });
  }
};
