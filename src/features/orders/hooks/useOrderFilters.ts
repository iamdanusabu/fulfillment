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