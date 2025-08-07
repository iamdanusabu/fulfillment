
import { useState, useEffect } from 'react';
import { picklistApi } from '../api/picklistApi';
import { Picklist, Location, PicklistItem } from '../../../shared/types';

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

export const usePicklistCreation = () => {
  const [items, setItems] = useState<PicklistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const simulateFulfillment = async (orderIds: string[], locationId: string) => {
    try {
      setLoading(true);
      const simulatedItems = await picklistApi.simulateFulfillment(orderIds, locationId);
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

  return {
    items,
    loading,
    simulateFulfillment,
    updatePickedQuantity,
    createFulfillment,
  };
};
