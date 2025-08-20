
import { useState, useEffect, useRef } from 'react';

export interface SearchParams {
  searchText: string;
  customerName?: string;
  orderID?: string;
  status?: string;
  paymentStatus?: string;
}

export const useOrderSearch = (initialParams?: Partial<SearchParams>) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    ...initialParams,
  });
  const [debouncedParams, setDebouncedParams] = useState<SearchParams>(searchParams);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounce search parameters
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedParams(searchParams);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchParams]);

  const updateSearchText = (text: string) => {
    setSearchParams(prev => ({ ...prev, searchText: text }));
  };

  const updateSearchParams = (params: Partial<SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  const clearSearch = () => {
    setSearchParams({ searchText: '' });
  };

  const buildApiParams = () => {
    const params: Record<string, string> = {};
    
    if (debouncedParams.searchText?.trim()) {
      params.searchMode = 'contains';
      params.matchWith = 'any';
      
      // Determine if search text is numeric (likely an order ID) or text (likely customer name)
      const searchValue = debouncedParams.searchText.trim();
      if (/^\d+$/.test(searchValue)) {
        params.orderID = searchValue;
      } else {
        params.customerName = searchValue;
      }
    }

    if (debouncedParams.customerName) {
      params.customerName = debouncedParams.customerName;
      params.searchMode = 'contains';
      params.matchWith = 'any';
    }

    if (debouncedParams.orderID) {
      params.orderID = debouncedParams.orderID;
      params.searchMode = 'contains';
      params.matchWith = 'any';
    }

    if (debouncedParams.status) {
      params.status = debouncedParams.status;
    }

    if (debouncedParams.paymentStatus) {
      params.paymentStatus = debouncedParams.paymentStatus;
    }

    return params;
  };

  return {
    searchParams,
    debouncedParams,
    updateSearchText,
    updateSearchParams,
    clearSearch,
    buildApiParams,
    isSearching: searchParams.searchText !== debouncedParams.searchText,
  };
};
