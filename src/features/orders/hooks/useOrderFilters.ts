import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FilterSettings {
  sources: string[];
}

const DEFAULT_SETTINGS: FilterSettings = {
  sources: []
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
        setSettings(parsedSettings);
      } else {
        // If no saved settings, use default empty arrays
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading filter settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  // Convert settings to API parameters
  const getFilterParams = () => {
    return {
      source: settings.sources.length > 0 ? settings.sources.join(',') : undefined
    };
  };

  return {
    settings,
    loading,
    getFilterParams,
    refreshSettings: loadSettings
  };
};