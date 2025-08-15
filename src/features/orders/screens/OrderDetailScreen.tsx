
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ordersApi, transformOrder } from '../api/ordersApi';
import { Order, OrderItem } from '../../../shared/types';

const STATUS_OPTIONS = [
  { label: 'Initiated', value: 'INITIATED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

export default function OrderDetailScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await ordersApi.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order || updatingStatus) return;

    setUpdatingStatus(true);
    setShowStatusDropdown(false);

    try {
      await ordersApi.updateOrderStatus(order.orderID.toString(), newStatus);

      // Update local state
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);

      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      console.error('Failed to update order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'READY': return '#28a745';
      case 'DELIVERED': return '#28a745';
      case 'PROCESSING': return '#ffc107';
      case 'INITIATED': return '#007bff';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name || item.productName}</Text>
          {item.status && (
            <View style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.itemStatusText}>{item.status}</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemPrice}>${(item.unitPrice || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemMeta}>SKU: {item.itemID || item.productId}</Text>
        <Text style={styles.itemMeta}>Unit Price: ${(item.unitPrice || 0).toFixed(2)}</Text>
        <Text style={styles.itemMeta}>Quantity: {item.orderQuantity || item.quantity}</Text>
        <Text style={styles.itemMeta}>Cost: ${(item.costPrice || 0).toFixed(2)}</Text>
        <Text style={styles.itemMeta}>Default</Text>
        <Text style={styles.itemMeta}>Default</Text>
      </View>
    </View>
  );

  const customerInfo = typeof order?.customer === 'object' ? order.customer : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading order detail...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/orders')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderNumber}>#{order.orderID}</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaText}>External ID: {order.externalOrderKey || order.orderNumber}</Text>
            <Text style={styles.headerMetaText}>Source: {order.source}</Text>
            <Text style={styles.headerMetaText}>Date: {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusBadgeText}>{order.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Order Summary and Financial Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Customer:</Text>
                <Text style={styles.summaryValue}>
                  {customerInfo?.name || (typeof order.customer === 'string' ? order.customer : 'Unknown Customer')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Customer Number:</Text>
                <Text style={styles.summaryValue}>{customerInfo?.id || order.employeeID || 'N/A'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>{order.type}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Payment Status:</Text>
                <Text style={[styles.summaryValue, styles.paidStatus]}>{order.paymentStatus}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Items:</Text>
                <Text style={styles.summaryValue}>{order.totalItemQuantity || order.items.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Financial Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${(order.subTotal || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>${(order.tax || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Fees:</Text>
                <Text style={styles.summaryValue}>${(order.totalFees || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Customization:</Text>
                <Text style={styles.summaryValue}>${(order.customizationTotal || 0).toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryItem, styles.totalItem]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>${(order.amount || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          <View style={styles.itemsContainer}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name || item.productName}</Text>
                    {item.status && (
                      <View style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.itemStatusText}>{item.status}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>${(item.unitPrice || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemMeta}>SKU: {item.itemID || item.productId}</Text>
                  <Text style={styles.itemMeta}>Unit Price: ${(item.unitPrice || 0).toFixed(2)}</Text>
                  <Text style={styles.itemMeta}>Quantity: {item.orderQuantity || item.quantity}</Text>
                  <Text style={styles.itemMeta}>Cost: ${(item.costPrice || 0).toFixed(2)}</Text>
                  <Text style={styles.itemMeta}>Default</Text>
                  <Text style={styles.itemMeta}>Default</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Processing Information and Update Status */}
        <View style={styles.summaryRow}>
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Processing Information</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Store:</Text>
                <Text style={styles.summaryValue}>{order.store?.name || 'N/A'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Employee:</Text>
                <Text style={styles.summaryValue}>{order.employee?.name || 'N/A'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Register:</Text>
                <Text style={styles.summaryValue}>{order.register?.name || `Register ${order.registerID || '1'}`}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.summaryCard}>
              <View style={styles.statusUpdateContainer}>
                <Text style={styles.summaryLabel}>Order Status</Text>
                <View style={styles.statusUpdateRow}>
                  <TouchableOpacity 
                    style={styles.statusDropdown}
                    onPress={() => setShowStatusDropdown(true)}
                    disabled={updatingStatus}
                  >
                    <Text style={styles.statusDropdownText}>
                      {updatingStatus ? 'Updating...' : order.status}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.updateButton}>
                    <Text style={styles.updateButtonText}>Update Status</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Change Order Status</Text>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  order?.status === option.value && styles.selectedOption
                ]}
                onPress={() => handleStatusChange(option.value)}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  order?.status === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                {order?.status === option.value && (
                  <MaterialIcons name="check" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerMeta: {
    gap: 4,
  },
  headerMetaText: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summarySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  paidStatus: {
    color: '#28a745',
  },
  totalItem: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 8,
  },
  itemsContainer: {
    gap: 12,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  itemMeta: {
    fontSize: 12,
    color: '#666',
    minWidth: '30%',
  },
  statusUpdateContainer: {
    gap: 12,
  },
  statusUpdateRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  statusDropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  statusDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    minWidth: 250,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
