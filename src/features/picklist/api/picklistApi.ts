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

  async simulateFulfillment(orderIds: string[], locationId: string, locationType: string = 'STORE'): Promise<PicklistItem[]> {
    const config = getConfig();
    const orderIDParam = orderIds.join(',');
    const url = `${config.endpoints.simulateFulfillment}?orderID=${encodeURIComponent(orderIDParam)}&locationID=${locationId}&locationType=${locationType}`;
    
    const response = await fetchWithToken(url);
    
    // Transform the API response to PicklistItem format
    if (response && Array.isArray(response)) {
      return response.map((item: any) => ({
        id: item.id || item.itemID || Math.random().toString(),
        productId: item.itemID || item.productId,
        productName: item.name || item.productName,
        location: item.location || 'Unknown',
        requiredQuantity: item.requiredQuantity || item.quantity || 0,
        pickedQuantity: 0,
        availableQuantity: item.availableQuantity || 0,
        upc: item.upc,
        batch: item.batch,
      }));
    }
    
    return [];
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