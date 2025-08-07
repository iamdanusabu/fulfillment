
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
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>{item.name || item.productName}</Text>
        <Text style={styles.productId}>SKU: {item.itemID || item.productId}</Text>
        <Text style={styles.productId}>UPC: {item.upc}</Text>
      </View>
      <View style={styles.itemPricing}>
        <Text style={styles.unitPrice}>Unit Price: ${item.unitPrice.toFixed(2)}</Text>
        <Text style={styles.quantity}>Qty: {item.orderQuantity || item.quantity}</Text>
        <Text style={styles.itemAmount}>Amount: ${item.amount.toFixed(2)}</Text>
        {item.discount > 0 && (
          <Text style={styles.discount}>Discount: ${item.discount.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <View style={styles.orderSummary}>
        <Text style={styles.orderNumber}>Order ID: {order.orderID}</Text>
        <Text style={styles.externalOrderId}>External Order ID: {order.externalOrderID}</Text>
        <Text style={styles.customer}>
          {typeof order.customer === 'string' ? order.customer : order.customer.name}
        </Text>
        <View style={styles.orderMeta}>
          <Text style={styles.source}>Source: {order.source}</Text>
          <Text style={styles.status}>Status: {order.status}</Text>
          <Text style={styles.paymentStatus}>Payment: {order.paymentStatus}</Text>
        </View>
        <View style={styles.orderAmounts}>
          <Text style={styles.amount}>Subtotal: ${order.subTotal.toFixed(2)}</Text>
          <Text style={styles.amount}>Tax: ${order.tax.toFixed(2)}</Text>
          <Text style={styles.amount}>Discount: ${order.netDiscount.toFixed(2)}</Text>
          <Text style={styles.totalAmount}>Total: ${order.amount.toFixed(2)}</Text>
        </View>
        <Text style={styles.createdAt}>
          Created: {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
        </Text>
      </View>

      {typeof order.customer === 'object' && (
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Text style={styles.customerDetail}>Name: {order.customer.name}</Text>
          <Text style={styles.customerDetail}>Email: {order.customer.email}</Text>
          <Text style={styles.customerDetail}>Phone: {order.customer.countryCode} {order.customer.mobilePhone}</Text>
          <Text style={styles.customerDetail}>
            Address: {order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.zipCode}
          </Text>
        </View>
      )}

      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        <FlatList
          data={order.items}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
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
  errorContainer: {
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  externalOrderId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  customer: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 12,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  source: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  createdAt: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  paymentStatus: {
    fontSize: 12,
    color: '#666',
  },
  orderAmounts: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  customerSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  customerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemsSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  discount: {
    fontSize: 12,
    color: '#e74c3c',
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
