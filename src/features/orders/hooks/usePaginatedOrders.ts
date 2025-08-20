
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

  // Build initial params with stable dependencies
  const initialParams = React.useMemo(() => {
    const filterParams = getFilterParams();
    
    const apiParams: Record<string, string | number> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Add filter params if available
    if (filterParams.source || params.source) {
      apiParams.source = params.source || filterParams.source;
    }
    if (filterParams.status || params.status) {
      apiParams.status = params.status || filterParams.status;
    }
    if (filterParams.paymentStatus) {
      apiParams.paymentStatus = filterParams.paymentStatus;
    }

    return apiParams;
  }, [
    params.source, 
    params.status, 
    params.hasFulfilmentJob, 
    JSON.stringify(settings)
  ]);

  const { data, loading, error, hasMore, loadMore } = usePaginatedFetcher<any>(
    config.endpoints.orders,
    {
      pageSize: 20,
      initialParams,
    }
  );

  // Transform the raw data to Order objects
  const transformedOrders = React.useMemo(() => 
    data.map(transformOrder), 
    [data]
  );

  return {
    orders: transformedOrders,
    loading,
    error,
    hasMore,
    loadMore,
  };
};
