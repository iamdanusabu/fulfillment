import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  notifications: boolean;
  autoRefresh: boolean;
  theme: 'light' | 'dark';
  refreshInterval: number;
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: true,
  autoRefresh: false,
  theme: 'light',
  refreshInterval: 30,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppSettings();
  }, []);

  const loadAppSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_APP_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  };

  const resetAppSettings = async () => {
    try {
      await AsyncStorage.removeItem('app_settings');
      setSettings(DEFAULT_APP_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateAppSetting,
    resetAppSettings,
    refresh: loadAppSettings,
  };
};


export interface FilterSettings {
  sources: string[];
}

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  sources: []
};

export const useOrderFilterSettings = () => {
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterSettings();
  }, []);

  const loadFilterSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('orderFilterSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setFilterSettings({ ...DEFAULT_FILTER_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading filter settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilterSetting = async <K extends keyof FilterSettings>(
    key: K,
    value: FilterSettings[K]
  ) => {
    try {
      const newSettings = { ...filterSettings, [key]: value };
      await AsyncStorage.setItem('orderFilterSettings', JSON.stringify(newSettings));
      setFilterSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving filter setting:', error);
      return false;
    }
  };

  const resetFilterSettings = async () => {
    try {
      await AsyncStorage.removeItem('orderFilterSettings');
      setFilterSettings(DEFAULT_FILTER_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting filter settings:', error);
      return false;
    }
  };

  return {
    filterSettings,
    loading,
    updateFilterSetting,
    resetFilterSettings,
    refresh: loadFilterSettings,
  };
};