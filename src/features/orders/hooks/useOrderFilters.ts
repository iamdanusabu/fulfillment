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
    
    // Add listener for storage changes to react to settings updates
    const checkStorageChange = setInterval(() => {
      loadSettings();
    }, 1000); // Check every second for changes

    return () => clearInterval(checkStorageChange);
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('orderFilterSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => {
          // Only update if settings actually changed
          if (JSON.stringify(prevSettings) !== JSON.stringify(parsedSettings)) {
            return parsedSettings;
          }
          return prevSettings;
        });
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