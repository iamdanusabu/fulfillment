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
  const { settings, hasUserSettings, getFilterParams } = useOrderFilters();
  const config = getConfig();

  // Build parameters that react to filter settings changes
  const apiParams = React.useMemo(() => {
    const filterParams = getFilterParams();

    console.log('=== Building API Params in usePaginatedOrders ===');
    console.log('Current settings in usePaginatedOrders:', settings);
    console.log('Filter params from getFilterParams:', filterParams);

    // Only add filter params if user has actually made selections or URL params exist
    const hasUserFilters = filterParams.source || filterParams.status || filterParams.paymentStatus;
    const hasUrlParams = params.source || params.status;

    // Only build params if there are actual filters to apply
    if (!hasUserFilters && !hasUrlParams) {
      console.log('No filters applied by user, returning empty params');
      return {};
    }

    const result: Record<string, string | number> = {
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    };

    // Add hasFulfilmentJob only if explicitly provided
    if (params.hasFulfilmentJob) {
      result.hasFulfilmentJob = params.hasFulfilmentJob;
    }

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
    console.log('Has filters to apply:', hasUserFilters || hasUrlParams);
    return result;
  }, [
    settings.sources, 
    settings.statuses, 
    settings.paymentStatuses, 
    params.source, 
    params.status, 
    params.hasFulfilmentJob
  ]);

  // Determine if we should skip initial fetch (when no user filters are set in AsyncStorage)
  const shouldSkipInitialFetch = React.useMemo(() => {
    const hasUrlParams = params.source || params.status;

    // If there are URL params, don't skip
    if (hasUrlParams) {
      console.log('URL params present, not skipping fetch');
      return false;
    }

    // Skip initial fetch if user hasn't set any custom filters in AsyncStorage
    const shouldSkip = !hasUserSettings;
    console.log('Should skip initial fetch (no user filters in AsyncStorage):', shouldSkip);
    console.log('Has user settings in AsyncStorage:', hasUserSettings);

    // Additional check: if user has settings but no actual filter params, also skip
    if (hasUserSettings) {
      const filterParams = getFilterParams();
      const hasActualFilters = filterParams.source || filterParams.status || filterParams.paymentStatus;
      if (!hasActualFilters) {
        console.log('User has settings but no actual filter params, skipping fetch');
        return true;
      }
    }

    return shouldSkip;
  }, [hasUserSettings, params.source, params.status, getFilterParams]);

  // Use conditional hook to completely avoid API calls when we should skip
  const paginatedState = usePaginatedFetcher<any>(
    shouldSkipInitialFetch ? null : config.endpoints.orders, // Pass null instead of empty string
    {
      pageSize: 20,
      initialParams: shouldSkipInitialFetch ? {} : apiParams, // Don't pass params if skipping
      skipInitialFetch: shouldSkipInitialFetch,
    }
  );

  // Debug logging
  React.useEffect(() => {
    console.log('=== usePaginatedOrders Debug Info ===');
    console.log('hasUserSettings:', hasUserSettings);
    console.log('shouldSkipInitialFetch:', shouldSkipInitialFetch);
    console.log('endpoint passed to fetcher:', shouldSkipInitialFetch ? 'NULL' : config.endpoints.orders);
    console.log('apiParams:', apiParams);
    console.log('paginatedState.data.length:', paginatedState.data.length);
    console.log('paginatedState.hasNoResults:', paginatedState.hasNoResults);
    console.log('paginatedState.loading:', paginatedState.loading);
  }, [hasUserSettings, shouldSkipInitialFetch, apiParams, paginatedState.data.length, paginatedState.hasNoResults, paginatedState.loading]);

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
    hasNoResults: shouldSkipInitialFetch ? true : paginatedState.hasNoResults,
    totalRecords: paginatedState.totalRecords,
    currentPage: paginatedState.currentPage,
    totalPages: paginatedState.totalPages,
    loadMore: paginatedState.loadMore,
    refresh: paginatedState.refresh,
  };
};