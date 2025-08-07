
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ordersApi } from '../src/features/orders/api/ordersApi';
import { Order } from '../src/shared/types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const isPicklistMode = params.mode === 'picklist';

  useEffect(() => {
    loadOrders();
  }, [params.source]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrders({
        source: params.source as string,
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    if (!isPicklistMode) return;
    
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const viewOrderDetail = (order: Order) => {
    if (isPicklistMode) {
      toggleOrderSelection(order.id);
    } else {
      router.push(`/orders/detail?orderId=${order.id}`);
    }
  };

  const proceedToLocationSelection = () => {
    if (selectedOrders.length === 0) return;
    
    const orderIds = selectedOrders.join(',');
    router.push(`/picklist/location-selection?orderIds=${orderIds}`);
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[
        styles.orderCard,
        isPicklistMode && selectedOrders.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => viewOrderDetail(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.customer}>{item.customer}</Text>
        </View>
        {isPicklistMode && (
          <View style={styles.checkboxContainer}>
            <MaterialIcons
              name={selectedOrders.includes(item.id) ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={selectedOrders.includes(item.id) ? '#007AFF' : '#ccc'}
            />
          </View>
        )}
        {!isPicklistMode && (
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        )}
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.source}>Source: {item.source}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isPicklistMode ? 'Select Orders for Picklist' : 'Orders'}
        </Text>
        {params.source && (
          <Text style={styles.subtitle}>Filtered by: {params.source}</Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
      />

      {isPicklistMode && selectedOrders.length > 0 && (
        <View style={styles.bottomBar}>
          <Text style={styles.selectedCount}>
            {selectedOrders.length} orders selected
          </Text>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={proceedToLocationSelection}
          >
            <Text style={styles.proceedText}>Select Location</Text>
          </TouchableOpacity>
        </View>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
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
  checkboxContainer: {
    padding: 4,
  },
  orderDetails: {
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
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  selectedCount: {
    fontSize: 16,
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  proceedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
