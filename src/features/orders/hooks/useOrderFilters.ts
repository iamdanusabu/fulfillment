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
    // Only include parameters if user has made specific selections (not all defaults)
    const allSources = [
      'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
      'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
      'OTHER', 'MANUAL', 'FanVista', 'QSR'
    ];
    const allStatuses = ['Initiated', 'Sent for Processing'];
    const allPaymentStatuses = ['PAID', 'UNPAID'];

    // Check if user has selected all sources (default state)
    const hasAllSources = settings.sources.length === allSources.length && 
      allSources.every(source => settings.sources.includes(source));
    
    // Check if user has selected all statuses (default state)
    const hasAllStatuses = settings.statuses.length === allStatuses.length && 
      allStatuses.every(status => settings.statuses.includes(status));
    
    // Check if user has selected all payment statuses (default state)
    const hasAllPaymentStatuses = settings.paymentStatuses.length === allPaymentStatuses.length && 
      allPaymentStatuses.every(status => settings.paymentStatuses.includes(status));

    return {
      source: !hasAllSources && settings.sources.length > 0 ? settings.sources.join(',') : undefined,
      status: !hasAllStatuses && settings.statuses.length > 0 ? settings.statuses.join(',') : undefined,
      paymentStatus: !hasAllPaymentStatuses && settings.paymentStatuses.length > 0 ? settings.paymentStatuses.join(',') : undefined
    };
  };

  return {
    settings,
    loading,
    getFilterParams,
    refreshSettings: loadSettings
  };
};