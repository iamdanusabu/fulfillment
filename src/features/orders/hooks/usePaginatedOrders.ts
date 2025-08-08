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
  hasFulfilmentJob?: string;
  status?: string;
}

export const usePaginatedOrders = (options: UsePaginatedOrdersOptions = {}) => {
  const { source, pageSize = 20, useFilters = true, hasFulfilmentJob, status } = options;
  const { filters, loading: filtersLoading } = useFilters ? useOrderFilters() : { filters: {}, loading: false };

  const buildUrl = React.useCallback(() => {
    const config = getConfig();
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
      pagination: 'true',
    });

    // Add source filter if provided
    if (source) {
      params.append('source', source);
    }

    // Add hasFulfilmentJob parameter if provided
    if (hasFulfilmentJob !== undefined) {
      params.append('hasFulfilmentJob', hasFulfilmentJob);
    }

    // Add status parameter if provided
    if (status) {
      params.append('status', status);
    }

    // Add filters from useOrderFilters if enabled (only if no direct parameters are provided)
    if (useFilters && filters && !hasFulfilmentJob && !status) {
      if (filters.sources?.length > 0) {
        params.append('source', filters.sources.join(','));
      }
      if (filters.statuses?.length > 0) {
        params.append('status', filters.statuses.join(','));
      }
      if (filters.paymentStatuses?.length > 0) {
        params.append('paymentStatus', filters.paymentStatuses.join(','));
      }
    }

    return `${config.endpoints.orders}?${params.toString()}`;
  }, [source, pageSize, useFilters, filters, hasFulfilmentJob, status]);

  const paginatedState = usePaginatedFetcher<Order>({
    buildUrl,
    transform: (apiOrder: any) => transformOrder(apiOrder),
    keyExtractor: (order) => order.id,
  });

  return {
    orders: paginatedState.data,
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