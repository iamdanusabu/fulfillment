
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Settings {
  notifications: boolean;
  autoRefresh: boolean;
  theme: 'light' | 'dark';
  refreshInterval: number;
}

interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
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
  ],
  statuses: ['Initiated', 'Sent for Processing'],
  paymentStatuses: ['PAID', 'UNPAID']
};

const ALL_SOURCES = [
  'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
  'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
  'OTHER', 'MANUAL', 'FanVista', 'QSR'
];

const ALL_STATUSES = [
  'Initiated', 'Sent for Processing'
];

const ALL_PAYMENT_STATUSES = ['PAID', 'UNPAID'];

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

  const toggleStatus = (status: string) => {
    const newStatuses = filterSettings.statuses.includes(status)
      ? filterSettings.statuses.filter(s => s !== status)
      : [...filterSettings.statuses, status];
    
    const newFilterSettings = { ...filterSettings, statuses: newStatuses };
    saveFilterSettings(newFilterSettings);
  };

  const togglePaymentStatus = (paymentStatus: string) => {
    const newPaymentStatuses = filterSettings.paymentStatuses.includes(paymentStatus)
      ? filterSettings.paymentStatuses.filter(s => s !== paymentStatus)
      : [...filterSettings.paymentStatuses, paymentStatus];
    
    const newFilterSettings = { ...filterSettings, paymentStatuses: newPaymentStatuses };
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

  const selectAllStatuses = () => {
    const newFilterSettings = { ...filterSettings, statuses: [...ALL_STATUSES] };
    saveFilterSettings(newFilterSettings);
  };

  const deselectAllStatuses = () => {
    const newFilterSettings = { ...filterSettings, statuses: [] };
    saveFilterSettings(newFilterSettings);
  };

  const selectAllPaymentStatuses = () => {
    const newFilterSettings = { ...filterSettings, paymentStatuses: [...ALL_PAYMENT_STATUSES] };
    saveFilterSettings(newFilterSettings);
  };

  const deselectAllPaymentStatuses = () => {
    const newFilterSettings = { ...filterSettings, paymentStatuses: [] };
    saveFilterSettings(newFilterSettings);
  };

  const handleLogout = () => {
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
              await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'token_expires_in']);
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
      {/* Order Filter Settings */}
      <View style={styles.section}>
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
            <Text style={styles.filterLabel}>{source}</Text>
            <MaterialIcons 
              name={filterSettings.sources.includes(source) ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={filterSettings.sources.includes(source) ? "#007AFF" : "#ccc"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.selectButtons}>
            <TouchableOpacity onPress={selectAllStatuses} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAllStatuses} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>None</Text>
            </TouchableOpacity>
          </View>
        </View>
        {ALL_STATUSES.map((status) => (
          <TouchableOpacity
            key={status}
            style={styles.filterItem}
            onPress={() => toggleStatus(status)}
          >
            <Text style={styles.filterLabel}>{status}</Text>
            <MaterialIcons 
              name={filterSettings.statuses.includes(status) ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={filterSettings.statuses.includes(status) ? "#007AFF" : "#ccc"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Status</Text>
          <View style={styles.selectButtons}>
            <TouchableOpacity onPress={selectAllPaymentStatuses} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAllPaymentStatuses} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>None</Text>
            </TouchableOpacity>
          </View>
        </View>
        {ALL_PAYMENT_STATUSES.map((paymentStatus) => (
          <TouchableOpacity
            key={paymentStatus}
            style={styles.filterItem}
            onPress={() => togglePaymentStatus(paymentStatus)}
          >
            <Text style={styles.filterLabel}>{paymentStatus}</Text>
            <MaterialIcons 
              name={filterSettings.paymentStatuses.includes(paymentStatus) ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={filterSettings.paymentStatuses.includes(paymentStatus) ? "#007AFF" : "#ccc"} 
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
          <MaterialIcons name="logout" size={20} color="#dc3545" />
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
});
