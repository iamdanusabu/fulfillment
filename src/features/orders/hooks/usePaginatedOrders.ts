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

  const fetcher = React.useMemo(() => {
    const config = getConfig();
    const filterParams = getFilterParams();

    // Only include non-empty filter params
    const apiParams: any = {
      hasFulfilmentJob: 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

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
    if (params.hasFulfilmentJob) {
      apiParams.hasFulfilmentJob = params.hasFulfilmentJob;
    }

    return new PaginatedFetcher<any>(config.endpoints.orders, {
      pageSize: 20,
      initialParams: apiParams,
    });
  }, [settings, params.source, params.status, params.hasFulfilmentJob]);

  // Use specific source if provided, otherwise use filter settings
  // This part of logic needs refactoring to handle dynamic params changes
  // For now, it is directly using params.source and filterParams.source
  const source = params.source || (settings && getFilterParams().source);

  const initialParams: Record<string, string | number> = {
    hasFulfilmentJob: params.hasFulfilmentJob || 'false', // Use provided param or default
    expand: 'item,bin,location_hint,payment',
    pagination: 'true',
    source: source
  };

  // If status is provided in params, use it, otherwise use filter settings
  if (params.status) {
    initialParams.status = params.status;
  } else if (settings && getFilterParams().status) {
    initialParams.status = getFilterParams().status;
  }


  const paginatedState = usePaginatedFetcher<any>(
    source ? config.endpoints.orders : null, // Pass null to prevent API call if no source
    {
      pageSize: 20,
      initialParams,
    }
  );

  // Load settings on hook initialization only (when user goes to orders screen)
  // This useEffect is intended to set initial params based on filters when the component mounts
  // and the `source` is not explicitly provided.
  React.useEffect(() => {
    // Check if we should fetch based on filters and if initial fetch hasn't happened yet
    // The condition `paginatedState.data.length === 0` ensures this runs only once on mount
    // when no data is present.
    if (source && paginatedState.data.length === 0) {
      const filterParams = getFilterParams();
      const newParams: Record<string, string | number> = {
        hasFulfilmentJob: params.hasFulfilmentJob || 'false', // Apply new param
        expand: 'item,bin,location_hint,payment',
        pagination: 'true',
        source: source,
      };

      // Apply status from params if available, otherwise from filters
      if (params.status) {
        newParams.status = params.status;
      } else if (filterParams.status) {
        newParams.status = filterParams.status;
      }

      // Update params if they differ from current ones to trigger a refetch
      // This comparison is simplified; a more robust check might be needed.
      // If the initialParams were correctly set above, this might not be strictly necessary
      // unless there's a complex dependency on filter changes that needs re-triggering.
      // However, the primary goal is to ensure the params are set correctly on mount.
      paginatedState.updateParams(newParams);
    }
  }, [source, paginatedState.data.length]); // Depend on source and data length to re-evaluate

  // Transform the raw data to Order objects
  const transformedOrders = paginatedState.data.map(transformOrder);

  return {
    orders: transformedOrders,
    loading: paginatedState.loading || (!source && !settings), // Consider filtersLoading if used directly
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};