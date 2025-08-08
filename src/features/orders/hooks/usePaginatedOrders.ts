import React, { useMemo } from 'react';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';
import { useOrderFilters } from './useOrderFilters';
import { transformOrder } from '../api/ordersApi';
import * as ordersApi from '../api/ordersApi'; // Assuming ordersApi is the correct import for the fetcher

interface UsePaginatedOrdersOptions {
  source?: string;
  status?: string;
  hasFulfilmentJob?: string;
  pageSize?: number;
  useFilters?: boolean;
}

export const usePaginatedOrders = (options: UsePaginatedOrdersOptions = {}) => {
  const { source, pageSize = 20, useFilters = true, status, hasFulfilmentJob } = options;
  const config = getConfig();
  const { getFilterParams, loading: filtersLoading, settings } = useOrderFilters();

  // Only make API calls if filters are loaded and settings exist or if a specific source is provided
  const shouldFetch = source || status || hasFulfilmentJob || (!filtersLoading && settings);

  const initialParams: Record<string, string | number> = {
    hasFulfilmentJob: 'false',
    expand: 'item,bin,location_hint,payment',
    pagination: 'true'
  };

  // Use specific source, status and hasFulfilmentJob if provided, otherwise use filter settings
  if (source) {
    initialParams.source = source;
  }
  if (status) {
    initialParams.status = status;
  }
  if (hasFulfilmentJob) {
    initialParams.hasFulfilmentJob = hasFulfilmentJob;
  }


  if (!source && !status && !hasFulfilmentJob && useFilters && !filtersLoading && settings) {
    const filterParams = getFilterParams();
    initialParams.source = filterParams.source;
    initialParams.status = filterParams.status;
    initialParams.paymentStatus = filterParams.paymentStatus;
  }

  const fetcher = useMemo(() => {
    const fetcherParams: Record<string, string | number> = {
      hasFulfilmentJob: 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true'
    };

    if (source) fetcherParams.source = source;
    if (status) fetcherParams.status = status;
    if (hasFulfilmentJob) fetcherParams.hasFulfilmentJob = hasFulfilmentJob;


    if (!source && !status && !hasFulfilmentJob && useFilters && !filtersLoading && settings) {
      const filterParams = getFilterParams();
      if (filterParams.source) fetcherParams.source = filterParams.source;
      if (filterParams.status) fetcherParams.status = filterParams.status;
      if (filterParams.paymentStatus) fetcherParams.paymentStatus = filterParams.paymentStatus;
    }

    return ordersApi.createPaginatedOrdersFetcher(fetcherParams);
  }, [source, status, hasFulfilmentJob, useFilters, filtersLoading, settings, getFilterParams]); // Ensure dependencies are correct

  const paginatedState = usePaginatedFetcher<any>(
    shouldFetch ? config.endpoints.orders : null, // Pass null to prevent API call
    {
      pageSize,
      initialParams,
      fetcher, // Pass the memoized fetcher
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
      }
      if (status) {
        newParams.status = status;
      }
      if (hasFulfilmentJob) {
        newParams.hasFulfilmentJob = hasFulfilmentJob;
      }

      if (!source && !status && !hasFulfilmentJob) {
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
  }, [filtersLoading, shouldFetch, source, status, hasFulfilmentJob, getFilterParams, settings]); // Add dependencies

  // Transform the raw data to Order objects
  const transformedOrders = paginatedState.data.map(transformOrder);

  return {
    orders: transformedOrders,
    loading: paginatedState.loading || filtersLoading,
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};