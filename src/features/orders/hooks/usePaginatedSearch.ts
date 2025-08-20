
import { useState, useCallback, useEffect } from 'react';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { transformOrder } from '../api/ordersApi';
import { getConfig } from '../../../environments';

interface UsePaginatedSearchParams {
  searchMode?: string;
  searchFields?: string;
  query?: string;
  searchOnMount?: boolean;
}

export function usePaginatedSearch({
  searchMode = 'contains',
  searchFields = 'orderID',
  query = '',
  searchOnMount = true,
}: UsePaginatedSearchParams = {}) {
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const config = getConfig();

  const {
    data: rawData,
    loading,
    error,
    hasMore,
    totalRecords,
    currentPage,
    totalPages,
    loadMore,
    refresh,
  } = usePaginatedFetcher<any>(
    searchUrl,
    {
      pageSize: 25,
    }
  );

  // Transform the raw data to our Order type
  const data = rawData.map(transformOrder);

  const fetchData = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchUrl(null);
      return;
    }

    const params = new URLSearchParams({
      pageNo: '1',
      limit: '25',
      createdFrom: '2009-08-15T00:00:00+05:30',
      createdTo: '2025-08-20T23:59:59+05:30',
      isPreventOrderIDParam: 'true',
      staticFilters: 'createdTo,createdFrom',
      source: 'tikt,breakaway,phone order,QSR,BARTAB,yinzcam,tapin2,suite,FanVista,Manual,woocommerce,jwo',
      searchMode: searchMode,
      matchWith: 'any',
      orderID: searchQuery.trim(),
    });

    setSearchUrl(`${config.endpoints.orders}?${params.toString()}`);
  }, [searchMode, config.endpoints.orders]);

  useEffect(() => {
    if (searchOnMount && query) {
      fetchData(query);
    }
  }, [searchOnMount, query, fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    totalRecords,
    currentPage,
    totalPages,
    loadMore,
    refresh,
    fetchData,
  };
}
