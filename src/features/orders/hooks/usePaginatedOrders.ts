
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
  const { settings, getFilterParams, loading: filtersLoading } = useOrderFilters();
  const config = getConfig();

  // Build parameters that react to filter settings changes
  const apiParams = React.useMemo(() => {
    // Don't build params until filter settings are loaded
    if (filtersLoading || !settings) {
      return null;
    }

    const filterParams = getFilterParams();
    
    const result: Record<string, string | number> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Add filter params if they exist (user has made selections)
    if (filterParams.source) {
      result.source = filterParams.source;
    }
    if (filterParams.status) {
      result.status = filterParams.status;
    }
    if (filterParams.paymentStatus) {
      result.paymentStatus = filterParams.paymentStatus;
    }

    // Override with URL params if provided (URL params take precedence)
    if (params.source) {
      result.source = params.source;
    }
    if (params.status) {
      result.status = params.status;
    }

    // Debug log to see what parameters are being sent
    console.log('API Parameters being sent:', result);
    console.log('Filter settings loaded:', settings);

    return result;
  }, [settings, params.source, params.status, params.hasFulfilmentJob, getFilterParams, filtersLoading]);

  const paginatedState = usePaginatedFetcher<any>(
    apiParams ? config.endpoints.orders : null, // Don't start fetching until params are ready
    {
      pageSize: 20,
      initialParams: apiParams || {},
    }
  );

  // Transform the raw data to Order objects
  const transformedOrders = React.useMemo(() => 
    paginatedState.data.map(transformOrder), 
    [paginatedState.data]
  );

  return {
    orders: transformedOrders,
    loading: paginatedState.loading || filtersLoading || (!settings),
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};
