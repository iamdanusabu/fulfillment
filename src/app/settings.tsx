
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

const AVAILABLE_SOURCES = [
  'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
  'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
  'OTHER', 'MANUAL', 'FanVista', 'QSR'
];

const AVAILABLE_STATUSES = [
  'Initiated', 'Sent for Processing', 'Completed', 'Cancelled'
];

const AVAILABLE_PAYMENT_STATUSES = [
  'PAID', 'UNPAID'
];

const DEFAULT_SETTINGS: FilterSettings = {
  sources: AVAILABLE_SOURCES,
  statuses: ['Initiated', 'Sent for Processing'],
  paymentStatuses: ['PAID', 'UNPAID']
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('orderFilterSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('orderFilterSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Filter settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const toggleItem = (category: keyof FilterSettings, item: string) => {
    setSettings(prev => {
      const currentItems = prev[category];
      const newItems = currentItems.includes(item)
        ? currentItems.filter(i => i !== item)
        : [...currentItems, item];
      
      return {
        ...prev,
        [category]: newItems
      };
    });
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset to default settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => setSettings(DEFAULT_SETTINGS)
        }
      ]
    );
  };

  const renderFilterSection = (
    title: string, 
    items: string[], 
    selectedItems: string[], 
    category: keyof FilterSettings
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.itemsContainer}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterItem,
              selectedItems.includes(item) && styles.selectedItem
            ]}
            onPress={() => toggleItem(category, item)}
          >
            <Text style={[
              styles.filterItemText,
              selectedItems.includes(item) && styles.selectedItemText
            ]}>
              {item}
            </Text>
            {selectedItems.includes(item) && (
              <MaterialIcons name="check" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Filter Settings</Text>
        <Text style={styles.subtitle}>Configure which orders to display</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderFilterSection(
          'Order Sources',
          AVAILABLE_SOURCES,
          settings.sources,
          'sources'
        )}

        {renderFilterSection(
          'Order Status',
          AVAILABLE_STATUSES,
          settings.statuses,
          'statuses'
        )}

        {renderFilterSection(
          'Payment Status',
          AVAILABLE_PAYMENT_STATUSES,
          settings.paymentStatuses,
          'paymentStatuses'
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <MaterialIcons name="restore" size={20} color="#dc3545" />
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <MaterialIcons name="save" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    gap: 6,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedItemText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
    gap: 8,
  },
  resetButtonText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
