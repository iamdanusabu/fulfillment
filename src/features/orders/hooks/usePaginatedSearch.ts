
import { useState, useCallback } from 'react';
import { ordersApi } from '../api/ordersApi';
import { Order } from '../../../shared/types';

export const usePaginatedSearch = () => {
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchOrderById = useCallback(async (orderId: string) => {
    if (!orderId.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const order = await ordersApi.getOrderById(orderId.trim());
      setSearchResults([order]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Order not found');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchOrderById,
    clearSearch,
  };
};
