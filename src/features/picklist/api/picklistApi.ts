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
    if (response && response.items && Array.isArray(response.items)) {
      return response.items.map((apiItem: any) => ({
        id: apiItem.item?.id || apiItem.item?.itemID || Math.random().toString(),
        productId: apiItem.item?.itemID || apiItem.item?.id,
        productName: apiItem.item?.name || 'Unknown Product',
        location: apiItem.bin?.location?.name || 'Unknown Location',
        requiredQuantity: apiItem.requiredCount || apiItem.requiredQuantity || apiItem.quantity || 1,
        pickedQuantity: 0,
        availableQuantity: apiItem.availableQuantity || 0,
        upc: apiItem.item?.upc,
        batch: apiItem.batch,
        bin: apiItem.bin ? {
          id: apiItem.bin.id,
          name: apiItem.bin.name,
          location: apiItem.bin.location
        } : undefined,
        locationHints: apiItem.locationHints || []
      }));
    }
    
    return [];
  },

  async createFulfillment(orderIds: string[], locationId: string, items: PicklistItem[]) {
    const config = getConfig();
    
    // Generate fulfillment name with timestamp
    const timestamp = Date.now();
    const fulfillmentName = `FULFILLMENT # ${timestamp}`;
    
    // Format sources from orderIds
    const sources = orderIds.map(orderId => ({
      type: "ORDER",
      typeID: orderId
    }));
    
    // Format items with picked count
    const formattedItems = items
      .filter(item => item.pickedQuantity > 0) // Only include items with picked quantity
      .map(item => ({
        item: {
          itemID: item.productId
        },
        pickedCount: item.pickedQuantity
      }));
    
    const requestBody = {
      name: fulfillmentName,
      status: "OPEN",
      sources: sources,
      items: formattedItems,
      fulfillmentLocation: {
        type: "STORE",
        locationID: locationId
      }
    };
    
    return await fetchWithToken(config.endpoints.inventoryFulfillments, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  async finalizePacking(fulfillmentId: string, sources: Array<{type: string, typeID: string}>) {
    const config = getConfig();
    return await fetchWithToken(`${config.endpoints.inventoryFulfillments}/${fulfillmentId}/finalize`, {
      method: 'PATCH',
      body: JSON.stringify({ sources }),
    });
  }
};