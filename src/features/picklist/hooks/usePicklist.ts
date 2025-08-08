
import { useState, useEffect } from 'react';
import { picklistApi } from '../api/picklistApi';
import { Picklist, Location, PicklistItem, Fulfillment } from '../../../shared/types';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { getConfig } from '../../../environments';

export const usePicklists = () => {
  const [picklists, setPicklists] = useState<Picklist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPicklists = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call when available
      setPicklists([]);
    } catch (error) {
      console.error('Failed to load picklists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPicklists();
  }, []);

  return {
    picklists,
    loading,
    refetch: loadPicklists,
  };
};

export const useFulfillments = () => {
  const config = getConfig();
  
  const paginatedState = usePaginatedFetcher<Fulfillment>(
    config.endpoints.inventoryFulfillments,
    {
      pageSize: 20,
      initialParams: {
        status: 'OPEN',
        pagination: 'true'
      }
    }
  );

  return {
    fulfillments: paginatedState.data,
    loading: paginatedState.loading,
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    totalRecords: paginatedState.totalRecords,
    refetch: paginatedState.refresh,
    loadMore: paginatedState.loadMore,
  };
};

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await picklistApi.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    locations,
    loading,
    refetch: loadLocations,
  };
};

export const useStores = () => {
  const [stores, setStores] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await picklistApi.getStores();
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stores,
    loading,
    refetch: loadStores,
  };
};

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await picklistApi.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    warehouses,
    loading,
    refetch: loadWarehouses,
  };
};

export const useFulfillableLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFulfillableLocations();
  }, []);

  const loadFulfillableLocations = async () => {
    try {
      const data = await picklistApi.getAllFulfillableLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load fulfillable locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    locations,
    loading,
    refetch: loadFulfillableLocations,
  };
};

export const usePicklistCreation = () => {
  const [items, setItems] = useState<PicklistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const simulateFulfillment = async (orderIds: string[], locationId: string, locationType: string = 'STORE') => {
    try {
      setLoading(true);
      const simulatedItems = await picklistApi.simulateFulfillment(orderIds, locationId, locationType);
      setItems(simulatedItems);
    } catch (error) {
      console.error('Failed to simulate fulfillment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePickedQuantity = (itemId: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, pickedQuantity: Math.max(0, Math.min(quantity, item.requiredQuantity)) }
          : item
      )
    );
  };

  const createFulfillment = async (orderIds: string[], locationId: string) => {
    try {
      const result = await picklistApi.createFulfillment(orderIds, locationId, items);
      return result;
    } catch (error) {
      console.error('Failed to create fulfillment:', error);
      throw error;
    }
  };

  const updateFulfillment = async (fulfillmentId: string) => {
    try {
      const result = await picklistApi.updateFulfillment(fulfillmentId, items);
      return result;
    } catch (error) {
      console.error('Failed to update fulfillment:', error);
      throw error;
    }
  };

  return {
    items,
    loading,
    simulateFulfillment,
    updatePickedQuantity,
    createFulfillment,
    updateFulfillment,
  };
};
