
import { useState, useEffect, useRef } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardStats } from '../../../shared/types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stats');
      // Set empty stats to prevent continuous loading
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        readyForPickup: 0,
        completedOrders: 0,
        ordersBySource: []
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: loadStats,
  };
};
