import React from 'react';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';
import { useOrderFilters } from './useOrderFilters';

interface UsePaginatedOrdersOptions {
  source?: string;
  pageSize?: number;
  useFilters?: boolean;
}

// Transform raw API order data to our Order type
const transformOrder = (apiOrder: any): Order => ({
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
});

export const usePaginatedOrders = (options: UsePaginatedOrdersOptions = {}) => {
  const { source, pageSize = 20, useFilters = true } = options;
  const config = getConfig();
  const { getFilterParams, loading: filtersLoading, settings } = useOrderFilters();

  // Only make API calls if filters are loaded and settings exist or if a specific source is provided
  const shouldFetch = source || (!filtersLoading && settings);

  const initialParams: Record<string, string | number> = {
    hasFulfilmentJob: 'false',
    expand: 'item,bin,location_hint,payment',
    pagination: 'true'
  };

  // Use specific source if provided, otherwise use filter settings
  if (source) {
    initialParams.source = source;
  } else if (useFilters && !filtersLoading && settings) {
    const filterParams = getFilterParams();
    initialParams.source = filterParams.source;
    initialParams.status = filterParams.status;
    initialParams.paymentStatus = filterParams.paymentStatus;
  }

  const paginatedState = usePaginatedFetcher<any>(
    shouldFetch ? config.endpoints.orders : null, // Pass null to prevent API call
    {
      pageSize,
      initialParams,
    }
  );

  // Load settings on hook initialization only (when user goes to orders screen)
  React.useEffect(() => {
    if (useFilters && !filtersLoading && settings && shouldFetch && paginatedState.data.length === 0) {
      const filterParams = getFilterParams();
      const newParams: Record<string, string | number> = {
        hasFulfilmentJob: 'false',
        expand: 'item,bin,location_hint,payment',
        pagination: 'true'
      };

      if (source) {
        newParams.source = source;
      } else {
        // Apply all filter parameters from settings
        if (filterParams.source) {
          newParams.source = filterParams.source;
        }
        if (filterParams.status) {
          newParams.status = filterParams.status;
        }
        if (filterParams.paymentStatus) {
          newParams.paymentStatus = filterParams.paymentStatus;
        }
      }

      // Update params only on initial load, not on settings changes
      paginatedState.updateParams(newParams);
    }
  }, [filtersLoading, shouldFetch]); // Only depend on loading state, not settings values

  // Transform the raw data to Order objects
  const transformedOrders = paginatedState.data.map(transformOrder);

  return {
    orders: transformedOrders,
    loading: paginatedState.loading || filtersLoading,
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    totalRecords: paginatedState.totalRecords,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
    updateParams: paginatedState.updateParams,
    reset: paginatedState.reset,
  };
};