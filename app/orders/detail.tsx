
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
      // This would need to be implemented in the API
      // const orderData = await ordersApi.getOrderById(params.orderId as string);
      // setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productId}>SKU: {item.productId}</Text>
      </View>
      <View style={styles.quantityInfo}>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        {item.pickedQuantity !== undefined && (
          <Text style={styles.pickedQuantity}>Picked: {item.pickedQuantity}</Text>
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
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <Text style={styles.customer}>{order.customer}</Text>
        <View style={styles.orderMeta}>
          <Text style={styles.source}>Source: {order.source}</Text>
          <Text style={styles.status}>Status: {order.status}</Text>
          <Text style={styles.createdAt}>
            Created: {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

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
    marginBottom: 8,
  },
  customer: {
    fontSize: 16,
    color: '#666',
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
  quantityInfo: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 14,
    color: '#333',
  },
  pickedQuantity: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
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
