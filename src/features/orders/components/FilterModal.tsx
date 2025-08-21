
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FilterSettings } from '../hooks/useOrderFilters';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentSettings: FilterSettings;
  onApply: (settings: FilterSettings) => void;
}

const AVAILABLE_SOURCES = [
  "Shopify",
  "Tapin2", 
  "Breakaway",
  "bigcommerce",
  "Ecwid",
  "PHONE ORDER",
  "DELIVERY", 
  "BAR TAB",
  "TIKT",
  "TABLE",
  "OTHER",
  "MANUAL",
  "FanVista",
  "QSR"
];

const AVAILABLE_STATUSES = [
  "INITIATED",
  "PROCESSING", 
  "READY",
  "DELIVERED",
  "CANCELLED"
];

const AVAILABLE_PAYMENT_STATUSES = [
  "PAID",
  "UNPAID",
  "PENDING",
  "FAILED",
  "CANCELLED"
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  currentSettings,
  onApply,
}) => {
  const [localSettings, setLocalSettings] = useState<FilterSettings>(currentSettings);

  useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings, visible]);

  const toggleSource = (source: string) => {
    setLocalSettings(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const toggleStatus = (status: string) => {
    setLocalSettings(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  const togglePaymentStatus = (status: string) => {
    setLocalSettings(prev => ({
      ...prev,
      paymentStatuses: prev.paymentStatuses.includes(status)
        ? prev.paymentStatuses.filter(s => s !== status)
        : [...prev.paymentStatuses, status]
    }));
  };

  const selectAllSources = () => {
    setLocalSettings(prev => ({
      ...prev,
      sources: [...AVAILABLE_SOURCES]
    }));
  };

  const clearAllSources = () => {
    setLocalSettings(prev => ({
      ...prev,
      sources: []
    }));
  };

  const handleApply = async () => {
    try {
      await AsyncStorage.setItem('orderFilterSettings', JSON.stringify(localSettings));
      onApply(localSettings);
      onClose();
    } catch (error) {
      console.error('Error saving filter settings:', error);
    }
  };

  const handleReset = () => {
    const defaultSettings: FilterSettings = {
      sources: [...AVAILABLE_SOURCES],
      statuses: [],
      paymentStatuses: []
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filter Orders</Text>
          <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Sources Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sources</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity onPress={selectAllSources} style={styles.actionButton}>
                  <Text style={styles.actionText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAllSources} style={styles.actionButton}>
                  <Text style={styles.actionText}>None</Text>
                </TouchableOpacity>
              </View>
            </View>
            {AVAILABLE_SOURCES.map((source) => (
              <TouchableOpacity
                key={source}
                style={styles.filterItem}
                onPress={() => toggleSource(source)}
              >
                <Text style={styles.filterLabel}>{source}</Text>
                <Switch
                  value={localSettings.sources.includes(source)}
                  onValueChange={() => toggleSource(source)}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Order Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            {AVAILABLE_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.filterItem}
                onPress={() => toggleStatus(status)}
              >
                <Text style={styles.filterLabel}>{status}</Text>
                <Switch
                  value={localSettings.statuses.includes(status)}
                  onValueChange={() => toggleStatus(status)}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            {AVAILABLE_PAYMENT_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.filterItem}
                onPress={() => togglePaymentStatus(status)}
              >
                <Text style={styles.filterLabel}>{status}</Text>
                <Switch
                  value={localSettings.paymentStatuses.includes(status)}
                  onValueChange={() => togglePaymentStatus(status)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset to Default</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  applyButton: {
    padding: 8,
  },
  applyText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  resetButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resetText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
