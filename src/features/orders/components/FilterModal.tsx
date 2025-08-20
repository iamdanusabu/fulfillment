
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FilterOptions {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

const AVAILABLE_SOURCES = [
  'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid',
  'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE',
  'OTHER', 'MANUAL', 'FanVista', 'QSR'
];

const AVAILABLE_STATUSES = [
  'Initiated', 'Sent for Processing', 'Processing', 'Ready', 'Delivered', 'Cancelled'
];

const AVAILABLE_PAYMENT_STATUSES = [
  'PAID', 'UNPAID', 'PENDING', 'FAILED', 'CANCELLED'
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      loadSavedFilters();
    }
  }, [visible]);

  const loadSavedFilters = async () => {
    try {
      const savedFilters = await AsyncStorage.getItem('orderFilters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        setSelectedSources(filters.sources || []);
        setSelectedStatuses(filters.statuses || []);
        setSelectedPaymentStatuses(filters.paymentStatuses || []);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const saveFilters = async (filters: FilterOptions) => {
    try {
      await AsyncStorage.setItem('orderFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const togglePaymentStatus = (paymentStatus: string) => {
    setSelectedPaymentStatuses(prev => 
      prev.includes(paymentStatus) 
        ? prev.filter(s => s !== paymentStatus)
        : [...prev, paymentStatus]
    );
  };

  const handleApply = () => {
    const filters = {
      sources: selectedSources,
      statuses: selectedStatuses,
      paymentStatuses: selectedPaymentStatuses,
    };
    saveFilters(filters);
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setSelectedSources([]);
    setSelectedStatuses([]);
    setSelectedPaymentStatuses([]);
  };

  const renderFilterSection = (
    title: string,
    items: string[],
    selectedItems: string[],
    toggleFunction: (item: string) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.filterItem}
          onPress={() => toggleFunction(item)}
        >
          <Text style={styles.filterItemText}>{item}</Text>
          <Switch
            value={selectedItems.includes(item)}
            onValueChange={() => toggleFunction(item)}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={selectedItems.includes(item) ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Orders</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderFilterSection('Sources', AVAILABLE_SOURCES, selectedSources, toggleSource)}
          {renderFilterSection('Order Status', AVAILABLE_STATUSES, selectedStatuses, toggleStatus)}
          {renderFilterSection('Payment Status', AVAILABLE_PAYMENT_STATUSES, selectedPaymentStatuses, togglePaymentStatus)}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 4,
    borderRadius: 6,
  },
  filterItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
