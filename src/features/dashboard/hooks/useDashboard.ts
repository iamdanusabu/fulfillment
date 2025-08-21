
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { getConfig } from '../../../environments';

interface SourceCount {
  name: string;
  count: number;
  error?: boolean;
}

interface DashboardStats {
  sourceCounts: SourceCount[];
  readyForPickupCount: number;
  activePicklistsCount: number;
  totalOrdersCount: number;
  loading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    sourceCounts: [],
    readyForPickupCount: 0,
    activePicklistsCount: 0,
    totalOrdersCount: 0,
    loading: true,
    error: null,
  });

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('dashboard_cache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setStats({
          ...parsedData,
          loading: false,
          error: null,
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
    return false;
  };

  const saveCachedData = async (data: any) => {
    try {
      const cacheData = {
        sourceCounts: data.sourceCounts,
        readyForPickupCount: data.readyForPickupCount,
        activePicklistsCount: data.activePicklistsCount,
        totalOrdersCount: data.totalOrdersCount,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem('dashboard_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cached data:', error);
    }
  };

  const loadSourceCounts = async (): Promise<SourceCount[]> => {
    try {
      const allSources = [
        "Shopify", "Tapin2", "Breakaway", "bigcommerce", "Ecwid",
        "PHONE ORDER", "DELIVERY", "BAR TAB", "TIKT", "TABLE",
        "OTHER", "MANUAL", "FanVista", "QSR",
      ];

      const config = getConfig();
      const sourcesWithData: SourceCount[] = [];

      for (const source of allSources) {
        try {
          const url = `${config.endpoints.orders}?source=${encodeURIComponent(source)}&pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
          const response = await fetchWithToken(url);
          const count = response?.totalRecords || 0;
          
          if (count > 0) {
            sourcesWithData.push({
              name: source,
              count: count,
              error: false,
            });
          }
        } catch (error) {
          if (error instanceof Error && (error.message.includes('404') || error.message.includes('No orders found'))) {
            continue;
          }
          console.error(`Failed to get count for source ${source}:`, error);
        }
      }

      return sourcesWithData;
    } catch (error) {
      console.error("Failed to load source counts:", error);
      return [];
    }
  };

  const loadTotalOrdersCount = async (): Promise<number> => {
    try {
      const config = getConfig();
      const url = `${config.endpoints.orders}?pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
      const response = await fetchWithToken(url);
      return response?.totalRecords || 0;
    } catch (error) {
      console.error("Failed to load total orders count:", error);
      return 0;
    }
  };

  const loadReadyForPickupCount = async (): Promise<number> => {
    try {
      const config = getConfig();
      const url = `${config.endpoints.orders}?pageNo=1&pageSize=20&hasFulfilmentJob=true&expand=item%2Cbin%2Clocation_hint%2Cpayment&pagination=true&status=Ready&paymentStatus=PAID%2CUNPAID`;
      const response = await fetchWithToken(url);
      return response?.totalRecords || 0;
    } catch (error) {
      console.error("Failed to load ready for pickup count:", error);
      return 0;
    }
  };

  const loadActivePicklistsCount = async (): Promise<number> => {
    try {
      const config = getConfig();
      const url = `${config.endpoints.activePicklists}?pageNo=1&pageSize=20&status=OPEN&pagination=true`;
      const response = await fetchWithToken(url);
      return response?.totalRecords || 0;
    } catch (error) {
      console.error("Failed to load active picklists count:", error);
      return 0;
    }
  };

  const loadStats = async (isRefresh = false) => {
    try {
      // Load cached data first if not refreshing
      if (!isRefresh) {
        const hasCachedData = await loadCachedData();
        if (!hasCachedData) {
          setStats(prev => ({ ...prev, loading: true, error: null }));
        }
      }

      // Load fresh data from API
      const [sourceCounts, readyForPickupCount, activePicklistsCount, totalOrdersCount] = await Promise.all([
        loadSourceCounts(),
        loadReadyForPickupCount(),
        loadActivePicklistsCount(),
        loadTotalOrdersCount(),
      ]);

      const newData = {
        sourceCounts,
        readyForPickupCount,
        activePicklistsCount,
        totalOrdersCount,
        loading: false,
        error: null,
      };

      // Update state with fresh data
      setStats(newData);
      
      // Save fresh data to cache
      await saveCachedData(newData);

    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading: stats.loading,
    refetch: () => loadStats(true),
  };
};
