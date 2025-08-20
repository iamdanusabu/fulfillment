import { useState, useEffect, useCallback } from 'react';
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
  const [hasUserSettings, setHasUserSettings] = useState(false);

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

      // Console log the AsyncStorage values
      console.log('=== AsyncStorage Filter Settings ===');
      console.log('Raw savedSettings:', savedSettings);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Parsed settings:', parsedSettings);
        console.log('Sources:', parsedSettings.sources);
        console.log('Statuses:', parsedSettings.statuses);
        console.log('Payment Statuses:', parsedSettings.paymentStatuses);

        setHasUserSettings(true);
        setSettings(prevSettings => {
          // Only update if settings actually changed
          if (JSON.stringify(prevSettings) !== JSON.stringify(parsedSettings)) {
            return parsedSettings;
          }
          return prevSettings;
        });
      } else {
        console.log('No saved settings found, using defaults');
        console.log('Default Sources:', DEFAULT_SETTINGS.sources);
        console.log('Default Statuses:', DEFAULT_SETTINGS.statuses);
        console.log('Default Payment Statuses:', DEFAULT_SETTINGS.paymentStatuses);
        setHasUserSettings(false);
      }
    } catch (error) {
      console.error('Error loading filter settings:', error);
      setHasUserSettings(false);
    } finally {
      setLoading(false);
    }
  };

  // Convert settings to API parameters
  const getFilterParams = useCallback(() => {
    const params: Record<string, string> = {};

    console.log('=== getFilterParams called ===');
    console.log('Current settings:', settings);
    console.log('Has user settings:', hasUserSettings);

    // Only build params if user has actually set custom settings
    if (!hasUserSettings) {
      console.log('No user settings found, returning empty params');
      return params;
    }

    // Build source filter
    if (settings.sources && settings.sources.length > 0) {
      const sourceParam = settings.sources.join(',');
      params.source = sourceParam;
      console.log('Built source param:', sourceParam);
    }

    // Build status filter
    if (settings.statuses && settings.statuses.length > 0) {
      const statusParam = settings.statuses.join(',');
      params.status = statusParam;
      console.log('Built status param:', statusParam);
    }

    // Build payment status filter
    if (settings.paymentStatuses && settings.paymentStatuses.length > 0) {
      const paymentStatusParam = settings.paymentStatuses.join(',');
      params.paymentStatus = paymentStatusParam;
      console.log('Built paymentStatus param:', paymentStatusParam);
    }

    console.log('Final filter params:', params);
    return params;
  }, [settings, hasUserSettings]);

  return {
    settings,
    loading,
    hasUserSettings,
    getFilterParams,
    refreshSettings: loadSettings
  };
};