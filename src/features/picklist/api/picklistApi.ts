import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { Location, PicklistItem } from '../../../shared/types';
import { getConfig } from '../../../environments';

export const picklistApi = {
  async getLocations(): Promise<Location[]> {
    const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
    const config = getConfig();
    const response = await fetchWithToken(config.endpoints.locations);
    return response;
  },

  async getStores(): Promise<Location[]> {
    const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
    const config = getConfig();
    const response = await fetchWithToken(`${config.endpoints.stores}?fulfillable=true`);

    // Transform the paginated response to Location array
    if (response && response.data && Array.isArray(response.data)) {
      return response.data.map((store: any) => ({
        id: store.id.toString(),
        name: store.name,
        type: 'store' as const,
        address: store.address || 'Address not available'
      }));
    }

    return [];
  },

  async getWarehouses(): Promise<Location[]> {
    const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
    const config = getConfig();
    const response = await fetchWithToken(`${config.endpoints.warehouses}?fulfillable=true`);

    // Transform the paginated response to Location array
    if (response && response.data && Array.isArray(response.data)) {
      return response.data.map((warehouse: any) => ({
        id: warehouse.id.toString(),
        name: warehouse.name,
        type: 'warehouse' as const,
        address: warehouse.address || 'Address not available'
      }));
    }

    return [];
  },

  async getAllFulfillableLocations(): Promise<Location[]> {
    const config = getConfig();
    const [stores, warehouses] = await Promise.all([
      fetchWithToken(`${config.endpoints.stores}?fulfillable=true`),
      fetchWithToken(`${config.endpoints.warehouses}?fulfillable=true`)
    ]);
    return [...stores, ...warehouses];
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