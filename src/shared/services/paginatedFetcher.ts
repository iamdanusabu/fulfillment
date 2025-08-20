import { fetchWithToken } from './fetchWithToken';
import { PaginatedResponse } from '../types';

interface PaginatedFetcherOptions {
  pageSize?: number;
  initialParams?: Record<string, string | number>;
}

interface PaginatedState<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export class PaginatedFetcher<T> {
  private state: PaginatedState<T> = {
    data: [],
    currentPage: 0,
    totalPages: 1,
    totalRecords: 0,
    hasMore: true,
    loading: false,
    error: null,
  };

  public url: string; // Made public for comparison in hook
  private options: PaginatedFetcherOptions;
  private subscribers: Array<(state: PaginatedState<T>) => void> = [];

  constructor(url: string, options: PaginatedFetcherOptions = {}) {
    this.url = url;
    this.options = {
      pageSize: 20,
      ...options,
    };
  }

  subscribe(callback: (state: PaginatedState<T>) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(callback => callback({ ...this.state }));
  }

  private updateState(updates: Partial<PaginatedState<T>>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  async fetchPage(pageNo: number = 1, append: boolean = false): Promise<void> {
    if (this.state.loading || !this.url) return;

    // Prevent loading the same page multiple times when appending
    if (append && pageNo <= this.state.currentPage) {
      return;
    }

    this.updateState({
      loading: true,
      error: null
    });

    try {
      const params = new URLSearchParams();

      // Add pagination params
      params.append('pageNo', pageNo.toString());
      if (this.options.pageSize) {
        params.append('pageSize', this.options.pageSize.toString());
      }

      // Add initial params
      if (this.options.initialParams) {
        Object.entries(this.options.initialParams).forEach(([key, value]) => {
          params.append(key, value.toString());
        });
      }

      const response: PaginatedResponse<T> = await fetchWithToken(
        `${this.url}?${params.toString()}`
      );

      const newData = append
        ? [...this.state.data, ...response.data]
        : response.data;

      this.updateState({
        data: newData,
        currentPage: response.pageNo,
        totalPages: response.totalPages,
        totalRecords: response.totalRecords,
        hasMore: response.pageNo < response.totalPages,
        loading: false,
      });

    } catch (error) {
      this.updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      });
    }
  }

  async loadMore(): Promise<void> {
    if (!this.state.hasMore || this.state.loading) return;

    // Only load the next page if we haven't already loaded it
    const nextPage = this.state.currentPage + 1;
    if (nextPage <= this.state.totalPages) {
      await this.fetchPage(nextPage, true);
    }
  }

  async refresh(): Promise<void> {
    await this.fetchPage(1, false);
  }

  updateParams(newParams: Record<string, string | number>) {
    this.options.initialParams = { ...this.options.initialParams, ...newParams };
  }

  updateParamsAndReset(newParams: Record<string, string | number>) {
    this.updateParams(newParams);
    this.reset();
  }

  reset() {
    this.updateState({
      data: [],
      currentPage: 0,
      totalPages: 1,
      totalRecords: 0,
      hasMore: true,
      loading: false,
      error: null,
    });
  }

  getState(): PaginatedState<T> {
    return { ...this.state };
  }
}

// Hook for React components
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Define types for the hook's return value to match the original structure
type PaginatedFetcherState<T> = PaginatedState<T>;
interface PaginatedFetcherActions {
  loadMore: () => Promise<void> | undefined;
  refresh: () => Promise<void> | undefined;
  updateParams: (params: Record<string, string | number>) => void;
  reset: () => void;
}

export const usePaginatedFetcher = <T>(
  endpoint: string,
  options: PaginatedFetcherOptions = {}
) => {
  const {
    pageSize = 10,
    initialParams = {},
    transform = (data: any) => data,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageURL, setNextPageURL] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState(initialParams);

  // Watch for parameter changes and reset data when they change
  useEffect(() => {
    const paramsChanged = JSON.stringify(currentParams) !== JSON.stringify(initialParams);
    console.log('=== usePaginatedFetcher Parameter Change Detection ===');
    console.log('Current params:', currentParams);
    console.log('New params:', initialParams);
    console.log('Params changed:', paramsChanged);

    if (paramsChanged) {
      console.log('Parameters changed, resetting and refetching...');
      setCurrentParams(initialParams);
      setData([]);
      setCurrentPage(1);
      setError(null);
      fetchData(1, false, initialParams);
    }
  }, [JSON.stringify(initialParams)]);

  // Initial load
  useEffect(() => {
    fetchData(1);
  }, [endpoint]);

  const fetchData = async (pageNo: number = 1, append: boolean = false, customParams?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(customParams || currentParams),
        pageNo,
        pageSize,
      };

      console.log('=== usePaginatedFetcher fetchData ===');
      console.log('Fetching with params:', params);
      console.log('Endpoint:', endpoint);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetchWithToken(`${endpoint}?${queryParams.toString()}`);
      const transformedData = transform(response.data);

      setData((prevData) =>
        append ? [...prevData, ...transformedData] : transformedData
      );
      setCurrentPage(response.pageNo);
      setTotalPages(response.totalPages);
      setTotalRecords(response.totalRecords);
      setHasMore(response.pageNo < response.totalPages);
      setNextPageURL(response.nextPageURL || null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      console.log(`=== Loading page ${nextPage} ===`);
      console.log('URL:', endpoint);
      console.log('Params:', { ...currentParams, pageNo: nextPage, pageSize });

      const response = await fetchWithToken(endpoint, {
        method: 'GET',
        params: { ...currentParams, pageNo: nextPage, pageSize },
      });

      console.log(`=== Page ${nextPage} Response ===`);
      console.log('Response structure:', {
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages,
        currentPageFromResponse: response.pageNo
      });

      if (response.data && Array.isArray(response.data)) {
        setData(prevData => [...prevData, ...response.data]);
        setCurrentPage(nextPage);
        setTotalRecords(response.totalRecords || 0);
        setTotalPages(response.totalPages || 0);

        // Update hasMore based on whether we've reached the end
        const newHasMore = nextPage < (response.totalPages || 0) && response.data.length > 0;
        setHasMore(newHasMore);

        console.log(`Updated hasMore to: ${newHasMore} (page ${nextPage} of ${response.totalPages})`);
      } else {
        setHasMore(false);
        console.log('No more data available - stopping pagination');
      }
    } catch (error) {
      console.error('Error loading more data:', error);

      // Handle 404 or other errors by stopping pagination
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log('Got 404 - stopping pagination and treating as end of data');
          setHasMore(false);
        }
      }

      setError(error as Error);
      setHasMore(false); // Stop pagination on any error
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentParams, pageSize, currentPage, loading, hasMore]);

  const refresh = useCallback(async () => {
    console.log('=== Refreshing Data ===');
    console.log('Resetting to page 1 with params:', currentParams);

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithToken(endpoint, {
        method: 'GET',
        params: { ...currentParams, pageNo: 1, pageSize },
      });

      console.log('=== Refresh Response ===');
      console.log('Response structure:', {
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages
      });

      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
        setCurrentPage(1);
        setTotalRecords(response.totalRecords || 0);
        setTotalPages(response.totalPages || 0);

        // Determine if there are more pages available
        const newHasMore = (response.totalPages || 0) > 1 && response.data.length > 0;
        setHasMore(newHasMore);

        console.log(`Refresh complete - hasMore: ${newHasMore}, totalPages: ${response.totalPages}`);
      } else {
        // No data returned
        setData([]);
        setCurrentPage(1);
        setTotalRecords(0);
        setTotalPages(0);
        setHasMore(false);
        console.log('Refresh complete - no data returned');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);

      // Handle 404 or other errors gracefully
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log('Got 404 on refresh - setting empty state');
          setData([]);
          setTotalRecords(0);
          setTotalPages(0);
          setHasMore(false);
          setCurrentPage(1);
          return; // Don't set error for 404, just show empty state
        }
      }

      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentParams, pageSize]);

  const updateParams = useCallback((newParams: Record<string, string | number>) => {
    console.log('=== usePaginatedFetcher updateParams ===');
    console.log('New params received:', newParams);
    setCurrentParams(prevParams => {
      const updatedParams = { ...prevParams, ...newParams };
      console.log('Updated params:', updatedParams);
      // Reset to first page and fetch with new parameters
      setData([]);
      setCurrentPage(1);
      setError(null);
      fetchData(1, false, updatedParams);
      return updatedParams;
    });
  }, []);

  const reset = useCallback(() => {
    console.log('=== usePaginatedFetcher reset ===');
    setCurrentParams(initialParams);
    setData([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalRecords(0);
    setHasMore(true);
    setLoading(false);
    setError(null);
    setNextPageURL(null);
  }, [initialParams]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalRecords,
    hasMore,
    loadMore,
    refresh,
    updateParams,
    reset,
  };
};