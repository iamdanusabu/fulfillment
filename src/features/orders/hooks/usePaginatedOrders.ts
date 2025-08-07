
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';

interface UsePaginatedOrdersOptions {
  source?: string;
  pageSize?: number;
}

export const usePaginatedOrders = (options: UsePaginatedOrdersOptions = {}) => {
  const { source, pageSize = 20 } = options;
  const config = getConfig();

  const initialParams: Record<string, string | number> = {};
  if (source) {
    initialParams.source = source;
  }

  const paginatedState = usePaginatedFetcher<Order>(
    config.endpoints.orders,
    {
      pageSize,
      initialParams,
    }
  );

  return {
    orders: paginatedState.data,
    loading: paginatedState.loading,
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
