
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
  searchText?: string;
  customerName?: string;
  orderID?: string;
}

export const usePaginatedOrders = (params: UsePaginatedOrdersParams = {}) => {
  const { settings, getFilterParams } = useOrderFilters();
  const config = getConfig();

  // Build parameters that react to filter settings changes
  const apiParams = React.useMemo(() => {
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

    // Add search parameters
    if (params.searchText && params.searchText.trim()) {
      const searchValue = params.searchText.trim();
      result.searchMode = 'contains';
      result.matchWith = 'any';
      
      // Always add customerName for text searches, and orderID for numeric searches
      if (/^\d+$/.test(searchValue)) {
        result.orderID = searchValue;
      } else {
        result.customerName = searchValue;
      }
    }

    // Add specific search parameters if provided
    if (params.customerName) {
      result.customerName = params.customerName;
      result.searchMode = 'contains';
      result.matchWith = 'any';
    }
    if (params.orderID) {
      result.orderID = params.orderID;
      result.searchMode = 'contains';
      result.matchWith = 'any';
    }

    return result;
  }, [settings, params.source, params.status, params.hasFulfilmentJob, params.searchText, params.customerName, params.orderID, getFilterParams]);

  const paginatedState = usePaginatedFetcher<any>(
    config.endpoints.orders,
    {
      pageSize: 20,
      initialParams: {
        hasFulfilmentJob: 'false',
        expand: 'item,bin,location_hint,payment',
        pagination: 'true',
      },
    }
  );

  // Update parameters when apiParams change
  React.useEffect(() => {
    paginatedState.updateParams(apiParams);
  }, [apiParams]);

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
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};
