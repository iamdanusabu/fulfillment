
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { picklistApi } from '../api/picklistApi';
import { ordersApi } from '../../orders/api/ordersApi';
import { Order } from '../../../shared/types';

export default function PackingScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.orderIds) {
      loadOrders();
    }
  }, [params.orderIds]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderIds = (params.orderIds as string).split(',');
      
      // Load order details for each order in the picklist
      const orderPromises = orderIds.map(id => 
        ordersApi.getOrderById(id)
      );
      const orderData = await Promise.all(orderPromises);
      setOrders(orderData.filter(Boolean));
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const finalizePacking = async () => {
    if (!params.fulfillmentId) return;
    
    try {
      setFinalizing(true);
      await picklistApi.finalizePacking(params.fulfillmentId as string);
      
      // Navigate back to picklist index
      router.push('/picklist');
    } catch (error) {
      console.error('Failed to finalize packing:', error);
    } finally {
      setFinalizing(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleSection}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.orderStatusSection}>
          <Text style={[styles.status, getStatusColor(item.status)]}>{item.status}</Text>
          <Text style={styles.orderAmount}>${(item.amount || 0).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer:</Text>
          <Text style={styles.detailValue}>{item.customer}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Source:</Text>
          <Text style={styles.detailValue}>{item.source}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment:</Text>
          <Text style={[styles.detailValue, getPaymentStatusColor(item.paymentStatus)]}>
            {item.paymentStatus}
          </Text>
        </View>
        {item.type && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{item.type}</Text>
          </View>
        )}
        {item.externalOrderKey && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>External Key:</Text>
            <Text style={styles.detailValue}>{item.externalOrderKey}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.orderItems}>
        <Text style={styles.itemsHeader}>Items ({item.items.length})</Text>
        {item.items.map((orderItem, index) => (
          <View key={orderItem.id} style={styles.itemRow}>
            <View style={styles.itemDetails}>
              <Text style={styles.productName}>{orderItem.productName}</Text>
              <View style={styles.itemMetadata}>
                {orderItem.upc && (
                  <Text style={styles.itemMeta}>UPC: {orderItem.upc}</Text>
                )}
                {orderItem.productId && (
                  <Text style={styles.itemMeta}>ID: {orderItem.productId}</Text>
                )}
                <Text style={styles.itemMeta}>Unit: ${(orderItem.unitPrice || 0).toFixed(2)}</Text>
              </View>
              {orderItem.batch && (
                <Text style={styles.batchText}>Batch: {orderItem.batch}</Text>
              )}
            </View>
            <View style={styles.quantitySection}>
              <Text style={styles.quantity}>
                {orderItem.pickedQuantity || orderItem.quantity} / {orderItem.quantity}
              </Text>
              <Text style={styles.itemTotal}>
                ${((orderItem.unitPrice || 0) * (orderItem.quantity || 0)).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
        
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${(item.subTotal || 0).toFixed(2)}</Text>
          </View>
          {item.tax && item.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>${item.tax.toFixed(2)}</Text>
            </View>
          )}
          {item.netDiscount && item.netDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>-${item.netDiscount.toFixed(2)}</Text>
            </View>
          )}
          {item.totalFees && item.totalFees > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fees:</Text>
              <Text style={styles.summaryValue}>${item.totalFees.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${(item.amount || 0).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'fulfilled':
        return { color: '#28a745' };
      case 'pending':
      case 'processing':
        return { color: '#ffc107' };
      case 'cancelled':
      case 'failed':
        return { color: '#dc3545' };
      default:
        return { color: '#007AFF' };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { color: '#28a745' };
      case 'pending':
        return { color: '#ffc107' };
      case 'failed':
      case 'refunded':
        return { color: '#dc3545' };
      default:
        return { color: '#666' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading packing details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Packing</Text>
        <Text style={styles.subtitle}>{orders.length} orders to pack</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.finalizeButton, finalizing && styles.disabledButton]}
          onPress={finalizePacking}
          disabled={finalizing}
        >
          <Text style={styles.finalizeText}>
            {finalizing ? 'Finalizing...' : 'Finalize Packing'}
          </Text>
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
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderTitleSection: {
    flex: 1,
  },
  orderStatusSection: {
    alignItems: 'flex-end',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  orderDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  orderItems: {
    marginTop: 8,
  },
  itemsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemMeta: {
    fontSize: 11,
    color: '#666',
  },
  batchText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  quantitySection: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  itemTotal: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#dc3545',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  finalizeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  finalizeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
