
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderFilters {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

export const useOrderFilters = () => {
  const [filters, setFilters] = useState<OrderFilters>({
    sources: [],
    statuses: [],
    paymentStatuses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const savedFilters = await AsyncStorage.getItem('orderFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = useCallback((newFilters: OrderFilters) => {
    setFilters(newFilters);
  }, []);

  const getFilterParams = useCallback(() => {
    const params: Record<string, string> = {};
    
    if (filters.sources.length > 0) {
      params.source = filters.sources.join(',');
    }
    
    if (filters.statuses.length > 0) {
      params.status = filters.statuses.join(',');
    }
    
    if (filters.paymentStatuses.length > 0) {
      params.paymentStatus = filters.paymentStatuses.join(',');
    }
    
    return params;
  }, [filters]);

  const hasActiveFilters = filters.sources.length > 0 || 
                          filters.statuses.length > 0 || 
                          filters.paymentStatuses.length > 0;

  return {
    filters,
    loading,
    updateFilters,
    getFilterParams,
    hasActiveFilters,
    refreshFilters: loadFilters,
  };
};
