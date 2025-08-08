import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

const DEFAULT_SETTINGS: FilterSettings = {
  sources: [
    'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
    'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
    'OTHER', 'MANUAL', 'FanVista', 'QSR'
  ],
  statuses: ['Initiated', 'Sent for Processing'],
  paymentStatuses: ['PAID', 'UNPAID']
};

export const useOrderFilters = () => {
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    // Removed the settings change listener to prevent automatic API calls
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('orderFilterSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading filter settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert settings to API parameters
  const getFilterParams = () => {
    return {
      source: settings.sources.length > 0 ? settings.sources.join(',') : '',
      status: settings.statuses.length > 0 ? settings.statuses.join(',') : '',
      paymentStatus: settings.paymentStatuses.length > 0 ? settings.paymentStatuses.join(',') : ''
    };
  };

  return {
    settings,
    loading,
    getFilterParams,
    refreshSettings: loadSettings
  };
};