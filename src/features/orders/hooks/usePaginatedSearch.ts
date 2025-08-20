
import { useState, useCallback } from 'react';
import { ordersApi } from '../api/ordersApi';
import { Order } from '../../../shared/types';

export interface UsePaginatedSearchOptions {
  searchMode: string;
  searchFields: string;
  query?: string;
  searchOnMount?: boolean;
}

export const usePaginatedSearch = (options: UsePaginatedSearchOptions) => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        searchMode: options.searchMode,
        matchWith: searchQuery,
        searchFields: options.searchFields,
        pageNo: 1,
        limit: 25
      };

      const response = await ordersApi.searchOrders(searchParams);
      setData(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [options.searchMode, options.searchFields]);

  return {
    data,
    loading,
    error,
    fetchData,
  };
};
