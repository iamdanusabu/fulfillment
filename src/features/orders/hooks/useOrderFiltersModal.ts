
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

      switch (filters.dateRange) {
        case 'today':
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          apiFilters.createdFrom = todayStart.toISOString();
          apiFilters.createdTo = todayEnd.toISOString();
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
          apiFilters.createdFrom = yesterdayStart.toISOString();
          apiFilters.createdTo = yesterdayEnd.toISOString();
          break;
        case 'currentMonth':
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
          apiFilters.createdFrom = firstDay.toISOString();
          apiFilters.createdTo = lastDay.toISOString();
          break;
        case 'previousMonth':
          const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          const prevFirstDay = new Date(prevYear, prevMonth, 1);
          const prevLastDay = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);
          apiFilters.createdFrom = prevFirstDay.toISOString();
          apiFilters.createdTo = prevLastDay.toISOString();
          break;
        case 'custom':
          if (filters.customDateStart) {
            const startDate = new Date(filters.customDateStart);
            apiFilters.createdFrom = startDate.toISOString();
          }
          if (filters.customDateEnd) {
            const endDate = new Date(filters.customDateEnd + 'T23:59:59');
            apiFilters.createdTo = endDate.toISOString();
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
