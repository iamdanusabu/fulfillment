
import React, { useMemo } from 'react';
import { Order } from '../../../shared/types';
import { useOrderFilters } from './useOrderFilters';
import { transformOrder } from '../api/ordersApi';
import * as ordersApi from '../api/ordersApi';

interface UsePaginatedOrdersOptions {
  source?: string;
  status?: string;
  hasFulfilmentJob?: string;
  pageSize?: number;
  useFilters?: boolean;
}

export const usePaginatedOrders = (options: UsePaginatedOrdersOptions = {}) => {
  const { source, pageSize = 20, useFilters = true, status, hasFulfilmentJob } = options;
  const { getFilterParams, loading: filtersLoading, settings } = useOrderFilters();

  // Only make API calls if filters are loaded and settings exist or if a specific source is provided
  const shouldFetch = source || status || hasFulfilmentJob || (!filtersLoading && settings);

  const fetcher = useMemo(() => {
    if (!shouldFetch) return null;

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

    return ordersApi.ordersApi.createPaginatedOrdersFetcher(fetcherParams);
  }, [source, status, hasFulfilmentJob, useFilters, filtersLoading, settings, getFilterParams, shouldFetch]);

  const [paginatedState, setPaginatedState] = React.useState({
    data: [] as any[],
    loading: false,
    error: null as Error | null,
    hasMore: true,
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const loadMore = React.useCallback(async () => {
    if (!fetcher || paginatedState.loading || !paginatedState.hasMore) return;

    setPaginatedState(prev => ({ ...prev, loading: true }));
    
    try {
      await fetcher.loadMore();
      const state = fetcher.getState();
      setPaginatedState({
        data: state.data || [],
        loading: false,
        error: null,
        hasMore: state.hasMore,
        totalRecords: state.totalRecords,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
      });
    } catch (error) {
      setPaginatedState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [fetcher, paginatedState.loading, paginatedState.hasMore]);

  const refresh = React.useCallback(async () => {
    if (!fetcher) return;

    setPaginatedState(prev => ({ ...prev, loading: true, data: [] }));
    
    try {
      await fetcher.refresh();
      const state = fetcher.getState();
      setPaginatedState({
        data: state.data || [],
        loading: false,
        error: null,
        hasMore: state.hasMore,
        totalRecords: state.totalRecords,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
      });
    } catch (error) {
      setPaginatedState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [fetcher]);

  // Load initial data when fetcher is ready
  React.useEffect(() => {
    if (fetcher && paginatedState.data.length === 0 && !paginatedState.loading) {
      refresh();
    }
  }, [fetcher, paginatedState.data.length, paginatedState.loading, refresh]);

  // Transform the raw data to Order objects
  const transformedOrders = paginatedState.data ? paginatedState.data.map(transformOrder) : [];

  return {
    orders: transformedOrders,
    loading: paginatedState.loading || filtersLoading,
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore,
    refresh,
  };
};
