
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

  // Build parameters that react to filter settings changes
  const apiParams = React.useMemo(() => {
    const filterParams = getFilterParams();
    
    console.log('=== Building API Params in usePaginatedOrders ===');
    console.log('Current settings in usePaginatedOrders:', settings);
    console.log('Filter params from getFilterParams:', filterParams);
    
    const result: Record<string, string | number> = {
      hasFulfilmentJob: params.hasFulfilmentJob || 'false',
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Add filter params if they exist (user has made selections)
    if (filterParams.source) {
      result.source = filterParams.source;
      console.log('Added source to API params:', filterParams.source);
    }
    if (filterParams.status) {
      result.status = filterParams.status;
      console.log('Added status to API params:', filterParams.status);
    }
    if (filterParams.paymentStatus) {
      result.paymentStatus = filterParams.paymentStatus;
      console.log('Added paymentStatus to API params:', filterParams.paymentStatus);
    }

    // Override with URL params if provided (URL params take precedence)
    if (params.source) {
      result.source = params.source;
      console.log('Overridden source with URL param:', params.source);
    }
    if (params.status) {
      result.status = params.status;
      console.log('Overridden status with URL param:', params.status);
    }

    console.log('Final API params object:', result);
    return result;
  }, [
    settings.sources, 
    settings.statuses, 
    settings.paymentStatuses, 
    params.source, 
    params.status, 
    params.hasFulfilmentJob
  ]);

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
    loading: paginatedState.loading || (!settings),
    error: paginatedState.error,
    hasMore: paginatedState.hasMore,
    hasNoResults: paginatedState.hasNoResults,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};
