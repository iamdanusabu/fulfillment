
import { useState } from 'react';
import { OrderFilters } from '../components/OrderFilterModal';

const DEFAULT_FILTERS: OrderFilters = {
  dateRange: null,
  sources: [],
  paymentStatuses: [],
  orderStatuses: [],
};

export const useOrderFiltersModal = () => {
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  const applyFilters = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Convert filters to API parameters
  const getAPIFilters = () => {
    const apiFilters: any = {};

    if (filters.sources.length > 0) {
      apiFilters.source = filters.sources.join(',');
    }

    if (filters.paymentStatuses.length > 0) {
      apiFilters.paymentStatus = filters.paymentStatuses.join(',');
    }

    if (filters.orderStatuses.length > 0) {
      apiFilters.status = filters.orderStatuses.join(',');
    }

    if (filters.dateRange) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      switch (filters.dateRange) {
        case 'today':
          apiFilters.startDate = todayStr;
          apiFilters.endDate = todayStr;
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          apiFilters.startDate = yesterdayStr;
          apiFilters.endDate = yesterdayStr;
          break;
        case 'currentMonth':
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          apiFilters.startDate = firstDay.toISOString().split('T')[0];
          apiFilters.endDate = lastDay.toISOString().split('T')[0];
          break;
        case 'previousMonth':
          const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          const prevFirstDay = new Date(prevYear, prevMonth, 1);
          const prevLastDay = new Date(prevYear, prevMonth + 1, 0);
          apiFilters.startDate = prevFirstDay.toISOString().split('T')[0];
          apiFilters.endDate = prevLastDay.toISOString().split('T')[0];
          break;
        case 'custom':
          if (filters.customDateStart) {
            apiFilters.startDate = filters.customDateStart;
          }
          if (filters.customDateEnd) {
            apiFilters.endDate = filters.customDateEnd;
          }
          break;
      }
    }

    return apiFilters;
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.dateRange !== null ||
      filters.sources.length > 0 ||
      filters.paymentStatuses.length > 0 ||
      filters.orderStatuses.length > 0
    );
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange !== null) count++;
    if (filters.sources.length > 0) count++;
    if (filters.paymentStatuses.length > 0) count++;
    if (filters.orderStatuses.length > 0) count++;
    return count;
  };

  return {
    filters,
    isVisible,
    openModal,
    closeModal,
    applyFilters,
    clearAllFilters,
    getAPIFilters,
    hasActiveFilters,
    getActiveFilterCount,
  };
};
