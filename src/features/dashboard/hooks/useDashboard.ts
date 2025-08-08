
import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardStats } from '../../../shared/types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: loadStats,
  };
};
