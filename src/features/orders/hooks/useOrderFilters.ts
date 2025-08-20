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
      
      // Console log the AsyncStorage values
      console.log('=== AsyncStorage Filter Settings ===');
      console.log('Raw savedSettings:', savedSettings);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Parsed settings:', parsedSettings);
        console.log('Sources:', parsedSettings.sources);
        console.log('Statuses:', parsedSettings.statuses);
        console.log('Payment Statuses:', parsedSettings.paymentStatuses);
        
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
      }
    } catch (error) {
      console.error('Error loading filter settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert settings to API parameters
  const getFilterParams = () => {
    const params = {
      source: settings.sources.length > 0 ? settings.sources.join(',') : undefined,
      status: settings.statuses.length > 0 ? settings.statuses.join(',') : undefined,
      paymentStatus: settings.paymentStatuses.length > 0 ? settings.paymentStatuses.join(',') : undefined
    };
    
    // Console log the API parameters being generated
    console.log('=== Generated API Filter Parameters ===');
    console.log('Source param:', params.source);
    console.log('Status param:', params.status);
    console.log('Payment Status param:', params.paymentStatus);
    console.log('Full params object:', params);
    
    return params;
  };

  return {
    settings,
    loading,
    getFilterParams,
    refreshSettings: loadSettings
  };
};