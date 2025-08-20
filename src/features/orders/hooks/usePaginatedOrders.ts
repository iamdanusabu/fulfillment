
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

  // Build parameters that react to filter settings changes
  const apiParams = React.useMemo(() => {
    const filterParams = getFilterParams();
    
    const result: Record<string, string | number> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Only add filter params if they're not the default "all" selections
    // URL params take precedence over settings
    if (params.source) {
      result.source = params.source;
    } else if (filterParams.source) {
      result.source = filterParams.source;
    }
    
    if (params.status) {
      result.status = params.status;
    } else if (filterParams.status) {
      result.status = filterParams.status;
    }
    
    if (filterParams.paymentStatus) {
      result.paymentStatus = filterParams.paymentStatus;
    }

    return result;
  }, [settings, params.source, params.status, params.hasFulfilmentJob, getFilterParams]);

  const paginatedState = usePaginatedFetcher<any>(
    config.endpoints.orders,
    {
      pageSize: 20,
      initialParams: apiParams,
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
