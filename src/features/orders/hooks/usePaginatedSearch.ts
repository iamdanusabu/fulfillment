
import { useState, useCallback, useMemo } from 'react';
import { usePaginatedOrders } from './usePaginatedOrders';
import { Order } from '../../../shared/types';

interface UsePaginatedSearchParams {
  source?: string;
  status?: string;
  paymentStatus?: string;
}

export const usePaginatedSearch = (params: UsePaginatedSearchParams = {}) => {
  const [searchText, setSearchText] = useState('');
  
  const {
    orders,
    loading,
    hasMore,
    loadMore,
    refresh,
    error
  } = usePaginatedOrders(params);

  const filteredOrders = useMemo(() => {
    if (!searchText.trim()) return orders;

    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchText.toLowerCase()) ||
      order.source.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [orders, searchText]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  return {
    orders: filteredOrders,
    loading,
    hasMore,
    loadMore,
    refresh,
    error,
    searchText,
    handleSearch,
    clearSearch,
    totalOrders: orders.length,
    filteredCount: filteredOrders.length
  };
};
