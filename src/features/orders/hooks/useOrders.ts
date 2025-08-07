
import { useState, useEffect } from 'react';
import { ordersApi } from '../api/ordersApi';
import { Order } from '../../../shared/types';

export const useOrders = (source?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasMore: true
  });

  const loadOrders = async (pageNo = 1, append = false) => {
    try {
      if (pageNo === 1) setLoading(true);
      const response = await ordersApi.getOrders({ source, pageNo });
      
      const transformedOrders = response.data.map((apiOrder: any) => ({
        id: apiOrder.orderID.toString(),
        orderID: apiOrder.orderID,
        orderNumber: apiOrder.externalOrderID || apiOrder.orderID.toString(),
        source: apiOrder.source,
        status: apiOrder.status,
        customer: apiOrder.customer?.name || apiOrder.employee?.name || 'Unknown Customer',
        items: apiOrder.items?.map((item: any) => ({
          id: item.orderItemID.toString(),
          productId: item.itemID,
          productName: item.name,
          quantity: item.orderQuantity,
          pickedQuantity: item.returnQuantity || 0,
          orderItemID: item.orderItemID,
          itemID: item.itemID,
          orderID: item.orderID,
          upc: item.upc,
          name: item.name,
          sequence: item.sequence,
          orderQuantity: item.orderQuantity,
          returnQuantity: item.returnQuantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          discount: item.discount,
          tax: item.tax,
          customizationTotal: item.customizationTotal,
          status: item.status,
          batch: item.batch,
          amount: item.amount,
        })) || [],
        createdAt: apiOrder.date,
        date: apiOrder.date,
        type: apiOrder.type,
        paymentStatus: apiOrder.paymentStatus,
        employeeID: apiOrder.employeeID,
        subTotal: apiOrder.subTotal,
        totalFees: apiOrder.totalFees,
        customizationTotal: apiOrder.customizationTotal,
        tax: apiOrder.tax,
        amount: apiOrder.amount,
        registerID: apiOrder.registerID,
        externalOrderKey: apiOrder.externalOrderKey,
        netDiscount: apiOrder.netDiscount,
        isTaxExempt: apiOrder.isTaxExempt,
        totalItemQuantity: apiOrder.totalItemQuantity,
        employee: apiOrder.employee,
        store: apiOrder.store,
        register: apiOrder.register,
      }));
      
      if (append) {
        setOrders(prev => [...prev, ...transformedOrders]);
      } else {
        setOrders(transformedOrders);
      }
      
      setPagination({
        currentPage: response.pageNo,
        totalPages: response.totalPages,
        totalRecords: response.totalRecords,
        hasMore: response.pageNo < response.totalPages
      });
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [source]);

  const loadMoreOrders = () => {
    if (pagination.hasMore && !loading) {
      loadOrders(pagination.currentPage + 1, true);
    }
  };

  return {
    orders,
    loading,
    pagination,
    loadOrders,
    loadMoreOrders,
  };
};

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
