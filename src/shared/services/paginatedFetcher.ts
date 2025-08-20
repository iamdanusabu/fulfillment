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
  baseUrl: string | null,
  options: PaginatedFetcherOptions = {}
): PaginatedFetcherState<T> & PaginatedFetcherActions => {
  const fetcherRef = useRef<PaginatedFetcher<T> | null>(null);
  const [state, setState] = useState<PaginatedState<T>>({
    data: [],
    currentPage: 0,
    totalPages: 1,
    totalRecords: 0,
    hasMore: true,
    loading: false,
    error: null,
  });

  // Create stable parameters string for comparison
  const optionsString = React.useMemo(() => JSON.stringify(options), [options]);
  const prevOptionsRef = useRef<string>('');

  // Subscribe to fetcher state changes
  useEffect(() => {
    if (baseUrl) {
      const optionsChanged = optionsString !== prevOptionsRef.current;
      
      if (!fetcherRef.current || fetcherRef.current.url !== baseUrl) {
        // Create new fetcher only when URL changes
        fetcherRef.current = new PaginatedFetcher<T>(baseUrl, options);
        prevOptionsRef.current = optionsString;
        
        // Subscribe to state changes
        const unsubscribe = fetcherRef.current.subscribe((newState) => {
          setState(newState);
        });

        // Initial fetch
        fetcherRef.current.fetchPage(1, false);

        return unsubscribe;
      } else if (optionsChanged && fetcherRef.current) {
        // Only update params if they actually changed
        fetcherRef.current.updateParams(options.initialParams || {});
        prevOptionsRef.current = optionsString;
        
        // Only reset if we're not already on page 1 or if data exists
        if (fetcherRef.current.getState().currentPage > 1 || fetcherRef.current.getState().data.length > 0) {
          fetcherRef.current.reset();
          fetcherRef.current.fetchPage(1, false);
        }
      }
    } else {
      fetcherRef.current = null;
      prevOptionsRef.current = '';
      setState({
        data: [],
        currentPage: 0,
        totalPages: 1,
        totalRecords: 0,
        hasMore: true,
        loading: false,
        error: null,
      });
    }
  }, [baseUrl]);

  const loadMore = useCallback(() => {
    return fetcherRef.current?.loadMore();
  }, []);

  const refresh = useCallback(() => {
    return fetcherRef.current?.refresh();
  }, []);

  const resetFetcher = useCallback(() => {
    if (fetcherRef.current) {
      fetcherRef.current.reset();
      setState({ // Also reset local state
        data: [],
        currentPage: 0,
        totalPages: 1,
        totalRecords: 0,
        hasMore: true,
        loading: false,
        error: null,
      });
    }
  }, []);

  // Don't expose updateParams since it's handled automatically via options changes
  return {
    ...state,
    loadMore,
    refresh,
    reset: resetFetcher,
  };
};