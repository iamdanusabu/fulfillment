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
  hasNoResults?: boolean; // Added to specifically track no results found
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
        hasNoResults: false // Reset hasNoResults on successful fetch
      });

    } catch (error: any) {
      console.error('Failed to fetch data:', error);

      // Handle network errors gracefully
      if (error.message === 'Unauthorized') {
        throw error; // Re-throw auth errors
      }

      // Handle 404 or no data scenarios
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        this.updateState({ 
          loading: false, 
          error: null,
          hasNoResults: true,
          data: [],
          totalRecords: 0,
          hasMore: false
        });
        return;
      }

      // For other errors, set hasNoResults flag
      this.updateState({ 
        loading: false, 
        error: error.message || 'Failed to load data',
        hasNoResults: true 
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
      hasNoResults: false // Reset hasNoResults on reset
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
  const [hasNoResults, setHasNoResults] = useState(false); // State to track no results

  // Watch for parameter changes and reset data when they change
  useEffect(() => {
    const paramsChanged = JSON.stringify(currentParams) !== JSON.stringify(initialParams);
    console.log('=== usePaginatedFetcher Parameter Change Detection ===');
    console.log('Current params:', currentParams);
    console.log('New params:', initialParams);
    console.log('Params changed:', paramsChanged);

    if (paramsChanged) {
      console.log('Parameters changed, immediately resetting data and refetching...');
      // Immediately clear data to prevent showing stale results
      setData([]);
      setHasNoResults(false);
      setError(null);
      setCurrentPage(1);
      setTotalRecords(0);
      setHasMore(true);
      setCurrentParams(initialParams);
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
      setHasNoResults(false); // Reset hasNoResults on new fetch

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
      // If response.data is empty and it's not an append operation, set hasNoResults
      if (transformedData.length === 0 && !append) {
          setHasNoResults(true);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Handle 404 or no data scenarios
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setData([]);
        setTotalRecords(0);
        setHasMore(false);
        setError(null); // Clear error for 404
        setHasNoResults(true); // Indicate no results
      } else {
        setError(err.message || 'An error occurred');
        setHasNoResults(true); // Set for other errors too
      }
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchData(currentPage + 1, true, currentParams);
  }, [hasMore, loading, currentPage, currentParams]);

  const refresh = useCallback(() => {
    console.log('=== usePaginatedFetcher refresh ===');
    console.log('Refreshing with current params:', currentParams);
    setData([]);
    setCurrentPage(1);
    setError(null);
    setHasNoResults(false); // Reset hasNoResults on refresh
    fetchData(1, false, currentParams);
  }, [currentParams]);

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
      setHasNoResults(false); // Reset hasNoResults
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
    setHasNoResults(false); // Reset hasNoResults on reset
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
    hasNoResults, // Include hasNoResults in the return object
  };
};