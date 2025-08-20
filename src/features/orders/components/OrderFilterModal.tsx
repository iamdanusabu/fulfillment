
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface OrderFilters {
  dateRange: 'today' | 'yesterday' | 'currentMonth' | 'previousMonth' | 'custom' | null;
  customDateStart?: string;
  customDateEnd?: string;
  sources: string[];
  paymentStatuses: string[];
  orderStatuses: string[];
}

interface OrderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: OrderFilters) => void;
  currentFilters: OrderFilters;
}

const ALL_SOURCES = [
  'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid',
  'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE',
  'OTHER', 'MANUAL', 'FanVista', 'QSR'
];

const ALL_PAYMENT_STATUSES = ['PAID', 'UNPAID'];

const ALL_ORDER_STATUSES = ['Initiated', 'Sent for Processing'];

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

const getDateRangeText = (range: string | null) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  switch (range) {
    case 'today':
      return `${today.toLocaleDateString()}`;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return `${yesterday.toLocaleDateString()}`;
    case 'currentMonth':
      const firstDay = new Date(currentYear, today.getMonth(), 1);
      const lastDay = new Date(currentYear, today.getMonth() + 1, 0);
      return `${firstDay.toLocaleDateString()} - ${lastDay.toLocaleDateString()}`;
    case 'previousMonth':
      const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const prevYear = today.getMonth() === 0 ? currentYear - 1 : currentYear;
      const prevFirstDay = new Date(prevYear, prevMonth, 1);
      const prevLastDay = new Date(prevYear, prevMonth + 1, 0);
      return `${prevFirstDay.toLocaleDateString()} - ${prevLastDay.toLocaleDateString()}`;
    default:
      return null;
  }
};

export default function OrderFilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: OrderFilterModalProps) {
  const [filters, setFilters] = useState<OrderFilters>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, visible]);

  const handleDateRangeSelect = (range: 'today' | 'yesterday' | 'currentMonth' | 'previousMonth' | 'custom') => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const toggleSource = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const togglePaymentStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      paymentStatuses: prev.paymentStatuses.includes(status)
        ? prev.paymentStatuses.filter(s => s !== status)
        : [...prev.paymentStatuses, status]
    }));
  };

  const toggleOrderStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      orderStatuses: prev.orderStatuses.includes(status)
        ? prev.orderStatuses.filter(s => s !== status)
        : [...prev.orderStatuses, status]
    }));
  };

  const clearDateRange = () => {
    setFilters(prev => ({
      ...prev,
      dateRange: null,
      customDateStart: undefined,
      customDateEnd: undefined
    }));
  };

  const clearSources = () => {
    setFilters(prev => ({ ...prev, sources: [] }));
  };

  const selectAllSources = () => {
    setFilters(prev => ({ ...prev, sources: [...ALL_SOURCES] }));
  };

  const clearPaymentStatuses = () => {
    setFilters(prev => ({ ...prev, paymentStatuses: [] }));
  };

  const clearOrderStatuses = () => {
    setFilters(prev => ({ ...prev, orderStatuses: [] }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters: OrderFilters = {
      dateRange: null,
      sources: [],
      paymentStatuses: [],
      orderStatuses: [],
    };
    setFilters(clearedFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter Order</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApplyFilters} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Date Range Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <TouchableOpacity onPress={clearDateRange}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateRangeGrid}>
              <TouchableOpacity
                style={[
                  styles.dateRangeButton,
                  filters.dateRange === 'currentMonth' && styles.selectedDateRange
                ]}
                onPress={() => handleDateRangeSelect('currentMonth')}
              >
                <Text style={[
                  styles.dateRangeButtonText,
                  filters.dateRange === 'currentMonth' && styles.selectedDateRangeText
                ]}>
                  Current Month
                </Text>
                <Text style={styles.dateRangeSubText}>
                  {getDateRangeText('currentMonth')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateRangeButton,
                  filters.dateRange === 'previousMonth' && styles.selectedDateRange
                ]}
                onPress={() => handleDateRangeSelect('previousMonth')}
              >
                <Text style={[
                  styles.dateRangeButtonText,
                  filters.dateRange === 'previousMonth' && styles.selectedDateRangeText
                ]}>
                  Previous Month
                </Text>
                <Text style={styles.dateRangeSubText}>
                  {getDateRangeText('previousMonth')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateRangeButton,
                  filters.dateRange === 'today' && styles.selectedDateRange
                ]}
                onPress={() => handleDateRangeSelect('today')}
              >
                <Text style={[
                  styles.dateRangeButtonText,
                  filters.dateRange === 'today' && styles.selectedDateRangeText
                ]}>
                  Today
                </Text>
                <Text style={styles.dateRangeSubText}>
                  {getDateRangeText('today')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateRangeButton,
                  filters.dateRange === 'yesterday' && styles.selectedDateRange
                ]}
                onPress={() => handleDateRangeSelect('yesterday')}
              >
                <Text style={[
                  styles.dateRangeButtonText,
                  filters.dateRange === 'yesterday' && styles.selectedDateRangeText
                ]}>
                  Yesterday
                </Text>
                <Text style={styles.dateRangeSubText}>
                  {getDateRangeText('yesterday')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.customRangeButton,
                filters.dateRange === 'custom' && styles.selectedDateRange
              ]}
              onPress={() => handleDateRangeSelect('custom')}
            >
              <Text style={styles.customRangeText}>Custom Range</Text>
              <Text style={styles.customRangeSubText}>Select specific dates</Text>
            </TouchableOpacity>
          </View>

          {/* Order Source Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Source</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity onPress={selectAllSources} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearSources} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.chipContainer}>
              {ALL_SOURCES.map((source) => (
                <TouchableOpacity
                  key={source}
                  style={[
                    styles.chip,
                    filters.sources.includes(source) && styles.selectedChip
                  ]}
                  onPress={() => toggleSource(source)}
                >
                  <Text style={[
                    styles.chipText,
                    filters.sources.includes(source) && styles.selectedChipText
                  ]}>
                    {capitalizeSourceName(source)}
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

            <View style={styles.chipContainer}>
              {ALL_PAYMENT_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.chip,
                    filters.paymentStatuses.includes(status) && styles.selectedChip
                  ]}
                  onPress={() => togglePaymentStatus(status)}
                >
                  <Text style={[
                    styles.chipText,
                    filters.paymentStatuses.includes(status) && styles.selectedChipText
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Order Status Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              <TouchableOpacity onPress={clearOrderStatuses}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chipContainer}>
              {ALL_ORDER_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.chip,
                    filters.orderStatuses.includes(status) && styles.selectedChip
                  ]}
                  onPress={() => toggleOrderStatus(status)}
                >
                  <Text style={[
                    styles.chipText,
                    filters.orderStatuses.includes(status) && styles.selectedChipText
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
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
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
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
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  clearText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  dateRangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dateRangeButton: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  selectedDateRange: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  dateRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedDateRangeText: {
    color: '#007AFF',
  },
  dateRangeSubText: {
    fontSize: 12,
    color: '#666',
  },
  customRangeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  customRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customRangeSubText: {
    fontSize: 12,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  selectedChip: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#fff',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  clearAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearAllButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});
