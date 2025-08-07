
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { picklistApi } from '../../src/features/picklist/api/picklistApi';
import { ordersApi } from '../../src/features/orders/api/ordersApi';
import { Order } from '../../src/shared/types';

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
        ordersApi.getOrders({ id }).then(response => response.data[0])
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
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <Text style={styles.customer}>{item.customer}</Text>
      </View>
      
      <View style={styles.orderItems}>
        {item.items.map((orderItem, index) => (
          <View key={orderItem.id} style={styles.itemRow}>
            <Text style={styles.productName}>{orderItem.productName}</Text>
            <Text style={styles.quantity}>
              {orderItem.pickedQuantity || orderItem.quantity} / {orderItem.quantity}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

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
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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
