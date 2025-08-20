
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FilterSettings } from '../../orders/hooks/useOrderFilters';

interface Settings {
  notifications: boolean;
  autoRefresh: boolean;
  theme: 'light' | 'dark';
  refreshInterval: number;
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

const ALL_STATUSES = ['Initiated', 'Sent for Processing', 'Processing', 'Ready', 'Delivered', 'Cancelled'];

const ALL_PAYMENT_STATUSES = ['PAID', 'UNPAID', 'PENDING', 'REFUNDED'];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<'sources' | 'statuses' | 'paymentStatuses'>('sources');
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

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const saveFilterSettings = async (newFilterSettings: FilterSettings) => {
    try {
      await AsyncStorage.setItem('orderFilterSettings', JSON.stringify(newFilterSettings));
      setFilterSettings(newFilterSettings);
      Alert.alert('Success', 'Filter settings saved successfully!');
    } catch (error) {
      console.error('Error saving filter settings:', error);
      Alert.alert('Error', 'Failed to save filter settings. Please try again.');
    }
  };

  const openFilterModal = (filterType: 'sources' | 'statuses' | 'paymentStatuses') => {
    setActiveFilterType(filterType);
    setShowFilterModal(true);
  };

  const toggleFilterItem = (item: string) => {
    const currentArray = filterSettings[activeFilterType];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    const newFilterSettings = { ...filterSettings, [activeFilterType]: newArray };
    saveFilterSettings(newFilterSettings);
  };

  const selectAllFilters = () => {
    const allItems = activeFilterType === 'sources' ? ALL_SOURCES : 
                    activeFilterType === 'statuses' ? ALL_STATUSES : ALL_PAYMENT_STATUSES;
    const newFilterSettings = { ...filterSettings, [activeFilterType]: [...allItems] };
    saveFilterSettings(newFilterSettings);
  };

  const clearAllFilters = () => {
    const newFilterSettings = { ...filterSettings, [activeFilterType]: [] };
    saveFilterSettings(newFilterSettings);
  };

  const getFilterTitle = () => {
    switch (activeFilterType) {
      case 'sources': return 'Order Sources';
      case 'statuses': return 'Order Statuses';
      case 'paymentStatuses': return 'Payment Statuses';
    }
  };

  const getFilterOptions = () => {
    switch (activeFilterType) {
      case 'sources': return ALL_SOURCES;
      case 'statuses': return ALL_STATUSES;
      case 'paymentStatuses': return ALL_PAYMENT_STATUSES;
    }
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
      {/* Filter Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Filters</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => openFilterModal('sources')}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="store" size={20} color="#666" />
            <Text style={styles.settingLabel}>Order Sources</Text>
          </View>
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {filterSettings.sources.length} / {ALL_SOURCES.length} selected
            </Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => openFilterModal('statuses')}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="flag" size={20} color="#666" />
            <Text style={styles.settingLabel}>Order Statuses</Text>
          </View>
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {filterSettings.statuses.length} / {ALL_STATUSES.length} selected
            </Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => openFilterModal('paymentStatuses')}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="payment" size={20} color="#666" />
            <Text style={styles.settingLabel}>Payment Statuses</Text>
          </View>
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {filterSettings.paymentStatuses.length} / {ALL_PAYMENT_STATUSES.length} selected
            </Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
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

      {/* Filter Selection Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{getFilterTitle()}</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.actionButton} onPress={selectAllFilters}>
              <Text style={styles.actionButtonText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={clearAllFilters}>
              <Text style={styles.actionButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={getFilterOptions()}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.filterOption}
                onPress={() => toggleFilterItem(item)}
              >
                <Text style={styles.filterOptionText}>{item}</Text>
                <Switch
                  value={filterSettings[activeFilterType].includes(item)}
                  onValueChange={() => toggleFilterItem(item)}
                  trackColor={{ false: '#767577', true: '#007AFF' }}
                  thumbColor={filterSettings[activeFilterType].includes(item) ? '#ffffff' : '#f4f3f4'}
                />
              </TouchableOpacity>
            )}
            style={styles.filterList}
          />
        </View>
      </Modal>
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
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalDoneText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  filterList: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
