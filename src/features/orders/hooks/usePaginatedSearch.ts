import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/ordersApi';
import { Order } from '../../../shared/types';

interface UsePaginatedSearchProps {
  source?: string;
  status?: string;
  hasFulfilmentJob?: string;
}

export const usePaginatedSearch = ({ source, status, hasFulfilmentJob }: UsePaginatedSearchProps) => {
  const [searchOrders, setSearchOrders] = useState<Order[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const searchOrdersData = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!searchTerm.trim()) return;

    try {
      setSearchLoading(true);

      const response = await ordersApi.searchOrders({
        pageNo: page,
        pageSize: 20,
        searchTerm: searchTerm.trim(),
        source,
        status,
        hasFulfilmentJob
      });

      if (reset) {
        setSearchOrders(response.data);
      } else {
        setSearchOrders(prev => [...prev, ...response.data]);
      }

      setSearchCurrentPage(response.pageNo);
      setSearchTotalPages(response.totalPages);
      setSearchHasMore(response.pageNo < response.totalPages);
    } catch (error) {
      console.error('Failed to search orders:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, source, status, hasFulfilmentJob]);

  const loadMoreSearch = useCallback(() => {
    if (searchHasMore && !searchLoading) {
      searchOrdersData(searchCurrentPage + 1, false);
    }
  }, [searchOrdersData, searchHasMore, searchLoading, searchCurrentPage]);

  const refreshSearch = useCallback(async () => {
    if (searchTerm.trim()) {
      await searchOrdersData(1, true);
    }
  }, [searchOrdersData, searchTerm]);

  // Search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchOrders([]);
      setSearchCurrentPage(1);
      setSearchHasMore(true);
      searchOrdersData(1, true);
    } else {
      setSearchOrders([]);
      setSearchHasMore(true);
      setSearchCurrentPage(1);
    }
  }, [searchTerm, searchOrdersData]);

  return {
    searchOrders,
    searchLoading,
    searchHasMore,
    searchCurrentPage,
    searchTotalPages,
    loadMoreSearch,
    refreshSearch,
    searchTerm,
    setSearchTerm
  };
};