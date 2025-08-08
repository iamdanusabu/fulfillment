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

  private url: string;
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
    await this.fetchPage(this.state.currentPage + 1, true);
  }

  async refresh(): Promise<void> {
    await this.fetchPage(1, false);
  }

  updateParams(newParams: Record<string, string | number>) {
    this.options.initialParams = { ...this.options.initialParams, ...newParams };
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
import { useState, useEffect, useRef, useCallback } from 'react';

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

  useEffect(() => {
    if (baseUrl) {
      fetcherRef.current = new PaginatedFetcher<T>(baseUrl, { ...options, initialParams: params });
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
  }, [baseUrl, JSON.stringify(params)]);

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
      if (fetcherRef.current) {
        fetcherRef.current.updateParams(updatedParams);
        fetcherRef.current.refresh();
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