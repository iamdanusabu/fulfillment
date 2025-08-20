import { fetchWithToken } from "./fetchWithToken";
import { PaginatedResponse } from "../types";

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
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach((callback) => callback({ ...this.state }));
  }

  private updateState(updates: Partial<PaginatedState<T>>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  async fetchPage(pageNo: number = 1, append: boolean = false): Promise<void> {
    if (this.state.loading || !this.url) return;

    this.updateState({
      loading: true,
      error: null,
    });

    try {
      const params = new URLSearchParams();

      // Add pagination params
      params.append("pageNo", pageNo.toString());
      if (this.options.pageSize) {
        params.append("pageSize", this.options.pageSize.toString());
      }

      // Add initial params
      if (this.options.initialParams) {
        Object.entries(this.options.initialParams).forEach(([key, value]) => {
          params.append(key, value.toString());
        });
      }

      const response: PaginatedResponse<T> = await fetchWithToken(
        `${this.url}?${params.toString()}`,
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
        error: error instanceof Error ? error.message : "Failed to fetch data",
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
    this.options.initialParams = {
      ...this.options.initialParams,
      ...newParams,
    };
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
import { useState, useEffect, useRef, useCallback } from "react";

// Define types for the hook's return value
interface UsePaginatedFetcherReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export const usePaginatedFetcher = <T>(
  baseUrl: string | null,
  options: PaginatedFetcherOptions = {},
): UsePaginatedFetcherReturn<T> => {
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

  // Create a stable reference for options to prevent unnecessary re-creation
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Only re-create fetcher when baseUrl changes
  useEffect(() => {
    if (!baseUrl) {
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
      return;
    }

    // Create new fetcher instance
    fetcherRef.current = new PaginatedFetcher<T>(baseUrl, optionsRef.current);

    // Subscribe to state changes
    const unsubscribe = fetcherRef.current.subscribe((newState) => {
      setState(newState);
    });

    // Initial fetch
    fetcherRef.current.fetchPage(1, false);

    return unsubscribe;
  }, [baseUrl]);

  // Update params without re-creating the fetcher
  useEffect(() => {
    if (fetcherRef.current && options.initialParams) {
      fetcherRef.current.updateParams(options.initialParams);
      fetcherRef.current.refresh();
    }
  }, [JSON.stringify(options.initialParams)]);

  const loadMore = useCallback(() => {
    if (fetcherRef.current && !state.loading && state.hasMore) {
      fetcherRef.current.loadMore();
    }
  }, [state.loading, state.hasMore]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
  };
};