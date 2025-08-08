import React from 'react';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';
import { useOrderFilters } from './useOrderFilters';
import { transformOrder } from '../api/ordersApi';

interface UsePaginatedOrdersOptions {
  source?: string;
  pageSize?: number;
  useFilters?: boolean;
}

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

  // Build URL for the paginated fetcher
  const buildUrl = (params: Record<string, string | number>) => {
    const url = new URL(config.endpoints.orders);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    return url.toString();
  };

  const paginatedState = usePaginatedFetcher<Order>({
    buildUrl,
    transform: (apiOrder: any) => transformOrder(apiOrder),
    keyExtractor: (order) => order.id,
  });

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
    totalRecords: paginatedState.totalRecords || 0,
    currentPage: paginatedState.currentPage || 1,
    totalPages: paginatedState.totalPages || 1,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};