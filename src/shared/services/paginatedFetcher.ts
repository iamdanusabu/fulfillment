
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchWithToken } from './fetchWithToken';

interface PaginatedFetcherOptions {
  pageSize?: number;
  initialParams?: Record<string, any>;
}

interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  pageNo: number;
  nextPageURL?: string;
}

export class PaginatedFetcher<T> {
  private baseUrl: string;
  private params: Record<string, any>;
  private pageSize: number;
  private data: T[] = [];
  private currentPage = 1;
  private totalPages = 1;
  private totalRecords = 0;
  private hasMore = true;
  private isLoading = false;
  private error: Error | null = null;
  private subscribers: Set<() => void> = new Set();

  constructor(baseUrl: string, options: PaginatedFetcherOptions = {}) {
    this.baseUrl = baseUrl;
    this.pageSize = options.pageSize || 20;
    this.params = { ...options.initialParams };
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }

  updateParams(newParams: Record<string, any>) {
    this.params = { ...this.params, ...newParams };
    this.reset();
  }

  private reset() {
    this.data = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalRecords = 0;
    this.hasMore = true;
    this.error = null;
  }

  async refresh() {
    this.reset();
    return this.loadPage(1);
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    return this.loadPage(this.currentPage + 1);
  }

  private async loadPage(page: number) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;
    this.notify();

    try {
      const queryParams = new URLSearchParams({
        ...this.params,
        pageNo: page.toString(),
        pageSize: this.pageSize.toString(),
      });

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response: PaginatedResponse<T> = await fetchWithToken(url);

      if (page === 1) {
        this.data = response.data || [];
      } else {
        this.data = [...this.data, ...(response.data || [])];
      }

      this.currentPage = response.pageNo || page;
      this.totalPages = response.totalPages || 1;
      this.totalRecords = response.totalRecords || 0;
      this.hasMore = this.currentPage < this.totalPages;

    } catch (error) {
      this.error = error instanceof Error ? error : new Error('Failed to fetch data');
      if (page === 1) {
        this.data = [];
      }
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  getState() {
    return {
      data: this.data,
      loading: this.isLoading,
      error: this.error,
      hasMore: this.hasMore,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalRecords: this.totalRecords,
    };
  }
}

export function usePaginatedFetcher<T>(
  baseUrl: string,
  options: PaginatedFetcherOptions = {}
) {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as Error | null,
    hasMore: true,
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  // Create fetcher instance only when baseUrl changes
  const fetcher = useMemo(() => {
    return new PaginatedFetcher<T>(baseUrl, options);
  }, [baseUrl]);

  // Track previous params to avoid unnecessary updates
  const prevParamsRef = useRef<string>('');
  const currentParamsString = JSON.stringify(options.initialParams || {});
  
  // Update params only when they actually change
  useEffect(() => {
    if (currentParamsString !== prevParamsRef.current) {
      prevParamsRef.current = currentParamsString;
      if (options.initialParams) {
        fetcher.updateParams(options.initialParams);
      }
    }
  }, [fetcher, currentParamsString]);

  // Subscribe to fetcher state changes and initial load
  const initializedRef = useRef(false);
  useEffect(() => {
    const updateState = () => {
      setState(fetcher.getState());
    };

    const unsubscribe = fetcher.subscribe(updateState);
    
    // Initial load only once when fetcher is first created
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetcher.refresh();
    }

    return unsubscribe;
  }, [fetcher]);

  const loadMore = useCallback(() => {
    return fetcher.loadMore();
  }, [fetcher]);

  const refresh = useCallback(() => {
    return fetcher.refresh();
  }, [fetcher]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalRecords: state.totalRecords,
    loadMore,
    refresh,
  };
}
