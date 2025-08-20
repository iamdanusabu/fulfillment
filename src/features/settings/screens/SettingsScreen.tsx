
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

const capitalizeSourceName = (source: string): string => {
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

  return source.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

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
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('refresh_token');
              await AsyncStorage.removeItem('token_expires_in');
              await AsyncStorage.removeItem('username');
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
      {/* Dashboard Filters Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterSectionHeader}>
          <View style={styles.filterTitleRow}>
            <MaterialIcons name="dashboard" size={24} color="#007AFF" />
            <Text style={styles.filterSectionTitle}>Dashboard View Filters</Text>
          </View>
          <Text style={styles.filterSectionSubtitle}>
            Control which order sources and statuses are displayed on your dashboard
          </Text>
        </View>

        {/* Order Sources */}
        <View style={styles.filterCategory}>
          <View style={styles.filterCategoryHeader}>
            <Text style={styles.filterCategoryTitle}>Order Sources</Text>
            <Text style={styles.filterCategoryCount}>
              {filterSettings.sources.length} of {ALL_SOURCES.length} selected
            </Text>
          </View>
          <View style={styles.selectButtons}>
            <TouchableOpacity onPress={selectAllSources} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAllSources} style={[styles.selectButton, styles.selectButtonSecondary]}>
              <Text style={[styles.selectButtonText, styles.selectButtonSecondaryText]}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterGrid}>
            {ALL_SOURCES.map((source) => (
              <TouchableOpacity
                key={source}
                style={[
                  styles.filterChip,
                  filterSettings.sources.includes(source) && styles.filterChipSelected
                ]}
                onPress={() => toggleSource(source)}
              >
                <Text style={[
                  styles.filterChipText,
                  filterSettings.sources.includes(source) && styles.filterChipTextSelected
                ]}>
                  {capitalizeSourceName(source)}
                </Text>
                {filterSettings.sources.includes(source) && (
                  <MaterialIcons name="check" size={16} color="#fff" style={styles.filterChipIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="notifications" size={20} color="#666" />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="sync" size={20} color="#666" />
            <Text style={styles.settingLabel}>Auto Refresh</Text>
          </View>
          <Switch
            value={settings.autoRefresh}
            onValueChange={(value) => updateSetting('autoRefresh', value)}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="palette" size={20} color="#666" />
            <Text style={styles.settingLabel}>Theme</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>{settings.theme === 'light' ? 'Light' : 'Dark'}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="logout" size={20} color="#dc3545" />
            <Text style={[styles.settingLabel, styles.logoutText]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.settingLabel}>Version</Text>
          </View>
          <Text style={styles.settingValueText}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterSectionHeader: {
    marginBottom: 24,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  filterSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  filterCategory: {
    marginBottom: 24,
  },
  filterCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterCategoryCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectButtonSecondaryText: {
    color: '#007AFF',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  filterChipIcon: {
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
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
