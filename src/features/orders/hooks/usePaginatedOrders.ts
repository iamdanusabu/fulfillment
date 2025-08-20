
import React from 'react';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';
import { useOrderFilters } from './useOrderFilters';
import { transformOrder } from '../api/ordersApi';

interface UsePaginatedOrdersParams {
  source?: string;
  status?: string;
  hasFulfilmentJob?: string;
}

export const usePaginatedOrders = (params: UsePaginatedOrdersParams = {}) => {
  const { settings, getFilterParams } = useOrderFilters();
  const config = getConfig();

  // Build initial params once
  const initialParams = React.useMemo(() => {
    const filterParams = getFilterParams();
    
    const apiParams: Record<string, string | number> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Add filter params if they exist
    if (filterParams.source) {
      apiParams.source = filterParams.source;
    }
    if (filterParams.status) {
      apiParams.status = filterParams.status;
    }
    if (filterParams.paymentStatus) {
      apiParams.paymentStatus = filterParams.paymentStatus;
    }

    // Override with URL params if provided
    if (params.source) {
      apiParams.source = params.source;
    }
    if (params.status) {
      apiParams.status = params.status;
    }

    return apiParams;
  }, [settings, params.source, params.status, params.hasFulfilmentJob]);

  const paginatedState = usePaginatedFetcher<any>(
    config.endpoints.orders,
    {
      pageSize: 20,
      initialParams,
    }
  );

  // Transform the raw data to Order objects
  const transformedOrders = React.useMemo(() => 
    paginatedState.data.map(transformOrder), 
    [paginatedState.data]
  );

  return {
    orders: transformedOrders,
    loading: paginatedState.loading || (!settings),
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};
