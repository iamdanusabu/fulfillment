import { useState, useEffect } from 'react';
import { ordersApi } from '../api/ordersApi';
import { Order } from '../../../shared/types';

// This hook is deprecated - use usePaginatedOrders instead
// Keeping only useOrderDetail for backward compatibility

export const useOrderDetail = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await ordersApi.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    order,
    loading,
    refetch: loadOrderDetail,
  };
};