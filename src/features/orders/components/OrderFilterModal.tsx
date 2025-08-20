
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

interface OrderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterSettings) => void;
}

const ALL_SOURCES = [
  'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
  'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
  'OTHER', 'MANUAL', 'FanVista', 'QSR'
];

const ALL_STATUSES = [
  'Initiated', 'Sent for Processing', 'Ready', 'Completed', 'Cancelled'
];

const ALL_PAYMENT_STATUSES = [
  'PAID', 'UNPAID', 'PENDING', 'FAILED', 'CANCELLED'
];

const DEFAULT_SETTINGS: FilterSettings = {
  sources: [],
  statuses: [],
  paymentStatuses: []
};

export const OrderFilterModal: React.FC<OrderFilterModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadCurrentFilters();
    }
  }, [visible]);

  const loadCurrentFilters = async () => {
    try {
      setLoading(true);
      const savedSettings = await AsyncStorage.getItem('orderFilterSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setFilters(parsedSettings);
      } else {
        setFilters(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading filter settings:', error);
      setFilters(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  const togglePaymentStatus = (paymentStatus: string) => {
    setFilters(prev => ({
      ...prev,
      paymentStatuses: prev.paymentStatuses.includes(paymentStatus)
        ? prev.paymentStatuses.filter(s => s !== paymentStatus)
        : [...prev.paymentStatuses, paymentStatus]
    }));
  };

  const clearSources = () => {
    setFilters(prev => ({ ...prev, sources: [] }));
  };

  const selectAllSources = () => {
    setFilters(prev => ({ ...prev, sources: [...ALL_SOURCES] }));
  };

  const clearStatuses = () => {
    setFilters(prev => ({ ...prev, statuses: [] }));
  };

  const clearPaymentStatuses = () => {
    setFilters(prev => ({ ...prev, paymentStatuses: [] }));
  };

  const handleApply = async () => {
    try {
      await AsyncStorage.setItem('orderFilterSettings', JSON.stringify(filters));
      onApply(filters);
      onClose();
    } catch (error) {
      console.error('Error saving filter settings:', error);
      Alert.alert('Error', 'Failed to save filter settings. Please try again.');
    }
  };

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

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text>Loading...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Order</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Order Source Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Order Source</Text>
                <TouchableOpacity onPress={clearSources}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filters.sources.length === 0 && styles.filterChipSelected
                  ]}
                  onPress={clearSources}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.sources.length === 0 && styles.filterChipTextSelected
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                {ALL_SOURCES.map((source) => (
                  <TouchableOpacity
                    key={source}
                    style={[
                      styles.filterChip,
                      filters.sources.includes(source) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleSource(source)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.sources.includes(source) && styles.filterChipTextSelected
                    ]}>
                      {capitalizeSourceName(source)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Order Status Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Order Status</Text>
                <TouchableOpacity onPress={clearStatuses}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterRow}>
                {ALL_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      filters.statuses.includes(status) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleStatus(status)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.statuses.includes(status) && styles.filterChipTextSelected
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Status Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Status</Text>
                <TouchableOpacity onPress={clearPaymentStatuses}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterRow}>
                {ALL_PAYMENT_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      filters.paymentStatuses.includes(status) && styles.filterChipSelected
                    ]}
                    onPress={() => togglePaymentStatus(status)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.paymentStatuses.includes(status) && styles.filterChipTextSelected
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
});
