
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  notifications: boolean;
  autoRefresh: boolean;
  theme: 'light' | 'dark';
  refreshInterval: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  autoRefresh: false,
  theme: 'light',
  refreshInterval: 30,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
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

  const resetSettings = async () => {
    try {
      await AsyncStorage.removeItem('app_settings');
      setSettings(DEFAULT_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    resetSettings,
    refresh: loadSettings,
  };
};
// Helper function to verify all saved settings
export const verifyAllSettings = async () => {
  try {
    const [appSettings, filterSettings] = await Promise.all([
      AsyncStorage.getItem('app_settings'),
      AsyncStorage.getItem('orderFilterSettings')
    ]);
    
    console.log('=== All Stored Settings ===');
    console.log('App Settings:', appSettings ? JSON.parse(appSettings) : 'Using defaults');
    console.log('Filter Settings:', filterSettings ? JSON.parse(filterSettings) : 'Using defaults');
    console.log('===========================');
    
    return {
      appSettings: appSettings ? JSON.parse(appSettings) : null,
      filterSettings: filterSettings ? JSON.parse(filterSettings) : null
    };
  } catch (error) {
    console.error('Error verifying settings:', error);
    return null;
  }
};
