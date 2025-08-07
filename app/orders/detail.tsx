import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ordersApi } from '../../src/features/orders/api/ordersApi';
import { Order, OrderItem } from '../../src/shared/types';

export default function OrderDetail() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.orderId) {
      loadOrderDetail();
    }
  }, [params.orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await ordersApi.getOrderById(params.orderId as string);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name || item.productName}</Text>
        <Text style={styles.itemPrice}>${(item.unitPrice || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemDetail}>SKU: {item.itemID || item.productId}</Text>
        <Text style={styles.itemDetail}>UPC: {item.upc}</Text>
        <Text style={styles.itemDetail}>Quantity: {item.orderQuantity || item.quantity}</Text>
        <Text style={styles.itemDetail}>Status: {item.status}</Text>
        <Text style={styles.itemDetail}>Amount: ${(item.amount || 0).toFixed(2)}</Text>
        {item.discount > 0 && <Text style={styles.itemDetail}>Discount: ${(item.discount || 0).toFixed(2)}</Text>}
        {item.tax > 0 && <Text style={styles.itemDetail}>Tax: ${(item.tax || 0).toFixed(2)}</Text>}
      </View>
    </View>
  );

  const customerInfo = typeof order?.customer === 'object' ? order.customer : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading order detail...</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/orders')} style={styles.backIconButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <View style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order ID:</Text>
              <Text style={styles.summaryValue}>{order.orderID}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Number:</Text>
              <Text style={styles.summaryValue}>{order.orderNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[styles.summaryValue, styles.statusText]}>{order.status}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Status:</Text>
              <Text style={[styles.summaryValue, styles.paymentText]}>{order.paymentStatus}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text style={styles.summaryValue}>{order.type}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>
                {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerCard}>
            {customerInfo ? (
              <>
                <Text style={styles.customerName}>{customerInfo.name}</Text>
                <Text style={styles.customerDetail}>Email: {customerInfo.email}</Text>
                <Text style={styles.customerDetail}>Phone: {customerInfo.countryCode} {customerInfo.mobilePhone}</Text>
                <Text style={styles.customerDetail}>
                  Address: {customerInfo.address}, {customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}
                </Text>
                <Text style={styles.customerDetail}>Country: {customerInfo.country}</Text>
              </>
            ) : (
              <Text style={styles.customerName}>{order.customer as string}</Text>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Pricing Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Summary</Text>
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal:</Text>
              <Text style={styles.pricingValue}>${(order.subTotal || 0).toFixed(2)}</Text>
            </View>
            {order.netDiscount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Discount:</Text>
                <Text style={[styles.pricingValue, styles.discountText]}>-${(order.netDiscount || 0).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Tax:</Text>
              <Text style={styles.pricingValue}>${(order.tax || 0).toFixed(2)}</Text>
            </View>
            {order.totalFees > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Fees:</Text>
                <Text style={styles.pricingValue}>${(order.totalFees || 0).toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.pricingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${(order.amount || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backIconButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryRow: {
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
  },
  statusText: {
    color: '#007AFF',
  },
  paymentText: {
    color: '#28a745',
  },
  customerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  itemDetails: {
    gap: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
  },
  pricingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#dc3545',
  },
  totalRow: {
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