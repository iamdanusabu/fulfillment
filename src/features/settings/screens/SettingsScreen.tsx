import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Settings {
  notifications: boolean;
  autoRefresh: boolean;
  theme: 'light' | 'dark';
  refreshInterval: number;
}

interface FilterSettings {
  sources: string[];
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  autoRefresh: false,
  theme: 'light',
  refreshInterval: 30,
};

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  sources: [
    'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
    'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
    'OTHER', 'MANUAL', 'FanVista', 'QSR'
  ]
};

const ALL_SOURCES = [
  'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
  'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
  'OTHER', 'MANUAL', 'FanVista', 'QSR'
];

const capitalizeSourceName = (source: string): string => {
  // Handle special cases
  const specialCases: { [key: string]: string } = {
    'bigcommerce': 'BigCommerce',
    'PHONE ORDER': 'Phone Order',
    'DELIVERY': 'Delivery',
    'BAR TAB': 'Bar Tab',
    'TIKT': 'TIKT',
    'TABLE': 'Table',
    'OTHER': 'Other',
    'MANUAL': 'Manual',
    'QSR': 'QSR'
  };

  if (specialCases[source]) {
    return specialCases[source];
  }

  // For other sources, capitalize first letter of each word
  return source.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};



export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedSettings, savedFilterSettings] = await Promise.all([
        AsyncStorage.getItem('app_settings'),
        AsyncStorage.getItem('orderFilterSettings')
      ]);

      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }

      if (savedFilterSettings) {
        setFilterSettings({ ...DEFAULT_FILTER_SETTINGS, ...JSON.parse(savedFilterSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const saveFilterSettings = async (newFilterSettings: FilterSettings) => {
    try {
      await AsyncStorage.setItem('orderFilterSettings', JSON.stringify(newFilterSettings));
      setFilterSettings(newFilterSettings);
    } catch (error) {
      console.error('Error saving filter settings:', error);
      Alert.alert('Error', 'Failed to save filter settings. Please try again.');
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const toggleSource = (source: string) => {
    const newSources = filterSettings.sources.includes(source)
      ? filterSettings.sources.filter(s => s !== source)
      : [...filterSettings.sources, source];

    const newFilterSettings = { ...filterSettings, sources: newSources };
    saveFilterSettings(newFilterSettings);
  };

  

  const selectAllSources = () => {
    const newFilterSettings = { ...filterSettings, sources: [...ALL_SOURCES] };
    saveFilterSettings(newFilterSettings);
  };

  const deselectAllSources = () => {
    const newFilterSettings = { ...filterSettings, sources: [] };
    saveFilterSettings(newFilterSettings);
  };

  

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear stored tokens and user data
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('refresh_token');
              await AsyncStorage.removeItem('token_expires_in');
              await AsyncStorage.removeItem('username');

              // Navigate to login screen
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard Filter Settings */}
      <View style={styles.section}>
        <Text style={styles.mainSectionTitle}>Dashboard Filters</Text>
        <Text style={styles.sectionDescription}>
          These filters control what data is displayed on the dashboard. They don't affect the Orders screen filters.
        </Text>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Sources</Text>
          <View style={styles.selectButtons}>
            <TouchableOpacity onPress={selectAllSources} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAllSources} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>None</Text>
            </TouchableOpacity>
          </View>
        </View>
        {ALL_SOURCES.map((source) => (
          <TouchableOpacity
            key={source}
            style={styles.filterItem}
            onPress={() => toggleSource(source)}
          >
            <Text style={styles.filterLabel}>{capitalizeSourceName(source)}</Text>
            <MaterialIcons 
              name={filterSettings.sources.includes(source) ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={filterSettings.sources.includes(source) ? "#007AFF" : "#ccc"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Sync</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto Refresh</Text>
          <Switch
            value={settings.autoRefresh}
            onValueChange={(value) => updateSetting('autoRefresh', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Theme</Text>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>{settings.theme === 'light' ? 'Light' : 'Dark'}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Text style={[styles.settingLabel, styles.logoutText]}>Logout</Text>
          <MaterialIcons name="logout" size={20} color="#dc3545" style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValueText}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  mainSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  logoutText: {
    color: '#dc3545',
  },
  logoutIcon: {
    marginRight: 15,
  },
});