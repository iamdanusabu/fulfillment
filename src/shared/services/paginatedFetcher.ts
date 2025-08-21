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
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
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

  const [params, setParams] = useState<Record<string, string | number>>(options.initialParams || {});
  
  // Create a stable string representation of params to prevent unnecessary re-renders
  const paramsString = React.useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    if (baseUrl) {
      // Only recreate fetcher if URL or params actually changed
      if (!fetcherRef.current || fetcherRef.current['url'] !== baseUrl) {
        fetcherRef.current = new PaginatedFetcher<T>(baseUrl, { ...options, initialParams: params });
      } else {
        // Just update params without recreating fetcher
        fetcherRef.current.updateParams(params);
      }
      
      fetcherRef.current.fetchPage(1, false).then(() => {
        setState(fetcherRef.current!.getState());
      });
    } else {
      fetcherRef.current = null;
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
  }, [baseUrl, paramsString]);

  const loadMore = useCallback(() => {
    if (fetcherRef.current) {
      return fetcherRef.current.loadMore().then(() => {
        setState(fetcherRef.current!.getState());
      });
    }
  }, []);

  const refresh = useCallback(() => {
    if (fetcherRef.current) {
      return fetcherRef.current.refresh().then(() => {
        setState(fetcherRef.current!.getState());
      });
    }
  }, []);

  const updateParamsAndFetch = useCallback((newParams: Record<string, string | number>) => {
    setParams(prevParams => {
      const updatedParams = { ...prevParams, ...newParams };
      
      // Only update fetcher if params actually changed
      const hasChanged = Object.keys(updatedParams).some(key => 
        updatedParams[key] !== prevParams[key]
      );
      
      if (hasChanged && fetcherRef.current) {
        fetcherRef.current.updateParams(updatedParams);
        // Reset pagination and refresh for filter changes
        fetcherRef.current.refresh().then(() => {
          setState(fetcherRef.current!.getState());
        });
      }
      return updatedParams;
    });
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

  return {
    ...state,
    loadMore,
    refresh,
    updateParams: updateParamsAndFetch,
    reset: resetFetcher,
  };
};