
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
  const { settings, loading: filtersLoading, getFilterParams } = useOrderFilters();
  const config = getConfig();

  const apiParams = React.useMemo(() => {
    if (filtersLoading || !settings) {
      return null;
    }

    const filterParams = getFilterParams();
    
    const result: Record<string, string | boolean> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: true,
    };

    Object.assign(result, filterParams);

    if (params.source) {
      result.source = params.source;
    }
    if (params.status) {
      result.status = params.status;
    }

    return result;
  }, [settings, filtersLoading, params, getFilterParams]);

  const endpoint = apiParams ? config.endpoints.orders : null;

  const paginatedState = usePaginatedFetcher<any>(
    endpoint,
    {
      pageSize: 20,
      initialParams: apiParams || {},
    }
  );

  const transformedOrders = React.useMemo(() => 
    paginatedState.data.map(transformOrder), 
    [paginatedState.data]
  );

  return {
    orders: transformedOrders,
    loading: filtersLoading || paginatedState.loading,
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};
