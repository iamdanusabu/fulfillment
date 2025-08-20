
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
  FlatList,
  SafeAreaView,
  Dimensions
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

const { height } = Dimensions.get('window');

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

  const renderFilterOption = ({ item }: { item: string }) => {
    const isSelected = filterSettings[activeFilterType].includes(item);
    
    return (
      <TouchableOpacity 
        style={styles.filterOption}
        onPress={() => toggleFilterItem(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>
          {item}
        </Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <MaterialIcons name="check" size={14} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Filter Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Filters</Text>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => openFilterModal('sources')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLabelContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
              <MaterialIcons name="store" size={18} color="#1976d2" />
            </View>
            <Text style={styles.settingLabel}>Order Sources</Text>
          </View>
          <View style={styles.filterSummary}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {filterSettings.sources.length}/{ALL_SOURCES.length}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#9e9e9e" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => openFilterModal('statuses')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLabelContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
              <MaterialIcons name="flag" size={18} color="#7b1fa2" />
            </View>
            <Text style={styles.settingLabel}>Order Statuses</Text>
          </View>
          <View style={styles.filterSummary}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {filterSettings.statuses.length}/{ALL_STATUSES.length}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#9e9e9e" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, styles.lastSettingItem]} 
          onPress={() => openFilterModal('paymentStatuses')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLabelContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#e8f5e8' }]}>
              <MaterialIcons name="payment" size={18} color="#388e3c" />
            </View>
            <Text style={styles.settingLabel}>Payment Statuses</Text>
          </View>
          <View style={styles.filterSummary}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {filterSettings.paymentStatuses.length}/{ALL_PAYMENT_STATUSES.length}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#9e9e9e" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={[styles.settingItem, styles.lastSettingItem]} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.settingLabelContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
              <MaterialIcons name="logout" size={18} color="#d32f2f" />
            </View>
            <Text style={[styles.settingLabel, styles.logoutText]}>Logout</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#9e9e9e" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={[styles.settingItem, styles.lastSettingItem]}>
          <View style={styles.settingLabelContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#f5f5f5' }]}>
              <MaterialIcons name="info" size={18} color="#616161" />
            </View>
            <Text style={styles.settingLabel}>Version</Text>
          </View>
          <Text style={styles.settingValueText}>1.0.0</Text>
        </View>
      </View>

      {/* Filter Selection Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{getFilterTitle()}</Text>
              <View style={styles.headerButton} />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.primaryButton]}
                onPress={selectAllFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.secondaryButton]}
                onPress={clearAllFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>None</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <View style={styles.listContainer}>
              <FlatList
                data={getFilterOptions()}
                keyExtractor={(item) => item}
                renderItem={renderFilterOption}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>

            {/* Selection Summary */}
            <View style={styles.selectionSummary}>
              <Text style={styles.summaryText}>
                {filterSettings[activeFilterType].length}/{getFilterOptions().length} selected
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  settingValueText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '400',
  },
  logoutText: {
    color: '#d32f2f',
  },
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  headerButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007aff',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  primaryButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    minHeight: 200,
    maxHeight: 300,
  },
  listContent: {
    paddingVertical: 4,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  filterOptionText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '400',
    flex: 1,
  },
  filterOptionTextSelected: {
    color: '#007aff',
    fontWeight: '500',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#f0f0f0',
    marginLeft: 4,
  },
  selectionSummary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5ea',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
});
