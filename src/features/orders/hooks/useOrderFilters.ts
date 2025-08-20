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
    const params: Record<string, string> = {};

    // Only add filter params if user has made specific selections
    // (not the default "all sources" selection)
    const hasSpecificSourceSelection = settings.sources.length > 0 && 
      settings.sources.length < DEFAULT_SETTINGS.sources.length;

    const hasSpecificStatusSelection = settings.statuses.length > 0 && 
      settings.statuses.length < DEFAULT_SETTINGS.statuses.length;

    const hasSpecificPaymentSelection = settings.paymentStatuses.length > 0 && 
      settings.paymentStatuses.length < DEFAULT_SETTINGS.paymentStatuses.length;

    if (hasSpecificSourceSelection) {
      params.source = settings.sources.join(',');
    }
    if (hasSpecificStatusSelection) {
      params.status = settings.statuses.join(',');
    }
    if (hasSpecificPaymentSelection) {
      params.paymentStatus = settings.paymentStatuses.join(',');
    }

    return params;
  };

  // Helper function to verify current filter settings
  const verifyFilters = () => {
    const params = getFilterParams();
    console.log('=== Current Filter Settings ===');
    console.log('Sources:', settings.sources.length > 0 ? settings.sources : 'All sources (no filter)');
    console.log('Statuses:', settings.statuses.length > 0 ? settings.statuses : 'All statuses (no filter)');
    console.log('Payment Statuses:', settings.paymentStatuses.length > 0 ? settings.paymentStatuses : 'All payment statuses (no filter)');
    console.log('API Parameters:', params);
    console.log('================================');
    return {
      settings,
      apiParams: params,
      totalActiveFilters: settings.sources.length + settings.statuses.length + settings.paymentStatuses.length
    };
  };

  return {
    settings,
    loading,
    getFilterParams,
    refreshSettings: loadSettings,
    verifyFilters
  };
};