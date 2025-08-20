
import React from 'react';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';
import { useOrderFilters, OrderFilters } from './useOrderFilters';
import { transformOrder } from '../api/ordersApi';

interface UsePaginatedOrdersParams {
  source?: string;
  status?: string;
  hasFulfilmentJob?: string;
  externalFilters?: OrderFilters;
}

export const usePaginatedOrders = (params: UsePaginatedOrdersParams = {}) => {
  const { filters, getFilterParams } = useOrderFilters();
  const config = getConfig();

  // Build parameters that react to filter settings changes
  const apiParams = React.useMemo(() => {
    // Use external filters if provided, otherwise use stored filters
    const activeFilters = params.externalFilters || filters;
    const filterParams = getFilterParams();
    
    const result: Record<string, string | number> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Add filter params if they exist (user has made selections)
    if (params.externalFilters) {
      if (params.externalFilters.sources.length > 0) {
        result.source = params.externalFilters.sources.join(',');
      }
      if (params.externalFilters.statuses.length > 0) {
        result.status = params.externalFilters.statuses.join(',');
      }
      if (params.externalFilters.paymentStatuses.length > 0) {
        result.paymentStatus = params.externalFilters.paymentStatuses.join(',');
      }
    } else {
      if (filterParams.source) {
        result.source = filterParams.source;
      }
      if (filterParams.status) {
        result.status = filterParams.status;
      }
      if (filterParams.paymentStatus) {
        result.paymentStatus = filterParams.paymentStatus;
      }
    }

    // Override with URL params if provided (URL params take precedence)
    if (params.source) {
      result.source = params.source;
    }
    if (params.status) {
      result.status = params.status;
    }

    return result;
  }, [filters, params.source, params.status, params.hasFulfilmentJob, params.externalFilters, getFilterParams]);

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
    loading: paginatedState.loading,
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};
