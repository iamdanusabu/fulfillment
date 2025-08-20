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
      source: settings.sources.length > 0 ? settings.sources.join(',') : undefined,
      status: settings.statuses.length > 0 ? settings.statuses.join(',') : undefined,
      paymentStatus: settings.paymentStatuses.length > 0 ? settings.paymentStatuses.join(',') : undefined
    };
  };

  return {
    settings,
    loading,
    getFilterParams,
    refreshSettings: loadSettings
  };
};
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  sources: [
    'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid',
    'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE',
    'OTHER', 'MANUAL', 'FanVista', 'QSR'
  ],
  statuses: ['Initiated', 'Sent for Processing'],
  paymentStatuses: ['PAID', 'UNPAID']
};

export const useOrderFilters = () => {
  const [settings, setSettings] = useState<FilterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterSettings = async () => {
      setLoading(true);
      try {
        const savedSettingsJSON = await AsyncStorage.getItem('orderFilterSettings');
        if (savedSettingsJSON) {
          const savedSettings = JSON.parse(savedSettingsJSON);
          setSettings({ ...DEFAULT_FILTER_SETTINGS, ...savedSettings });
        } else {
          setSettings(DEFAULT_FILTER_SETTINGS);
        }
      } catch (error) {
        console.error('Failed to load order filter settings:', error);
        setSettings(DEFAULT_FILTER_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadFilterSettings();
  }, []);

  const getFilterParams = useCallback(() => {
    if (!settings) {
      return {};
    }
    
    const params: { [key: string]: string } = {};
    if (settings.sources.length > 0) {
      params.source = settings.sources.join(',');
    }
    if (settings.statuses.length > 0) {
      params.status = settings.statuses.join(',');
    }
    if (settings.paymentStatuses.length > 0) {
      params.paymentStatus = settings.paymentStatuses.join(',');
    }

    return params;
  }, [settings]);

  return { settings, loading, getFilterParams };
};
