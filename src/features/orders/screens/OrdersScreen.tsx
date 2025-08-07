import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePaginatedOrders } from '../hooks/usePaginatedOrders';
import { Order } from '../../../shared/types';

export default function OrdersScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { 
    orders, 
    loading, 
    hasMore, 
    totalRecords,
    currentPage,
    totalPages,
    loadMore, 
    refresh 
  } = usePaginatedOrders({ 
    source: params.source as string 
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isPicklistMode, setIsPicklistMode] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setIsPicklistMode(params.mode === 'picklist');
  }, [params.mode]);

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
      router.push(`/orders/detail?orderId=${order.orderID}`);
    }
  };

  const proceedToLocationSelection = () => {
    if (selectedOrders.length === 0) return;

    const orderIds = selectedOrders.join(',');
    router.push(`/picklist/location-selection?orderIds=${orderIds}`);
  };

  const handleEndReached = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchText.toLowerCase()) ||
    order.source.toLowerCase().includes(searchText.toLowerCase())
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
          <Text style={styles.orderNumber}>Order ID: {item.orderID}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
          </Text>
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

      <View style={styles.customerSection}>
        <Text style={styles.customer}>Customer: {item.customer}</Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.itemCount}>{item.items.length} items</Text>
          <Text style={styles.source}>Source: {item.source}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.amount}>Amount: ${item.amount.toFixed(2)}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
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
        <Text style={styles.pagination}>
          Page {currentPage} of {totalPages} ({totalRecords} total)
        </Text>
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
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
          />
        }
        ListFooterComponent={() => (
          <View style={styles.footer}>
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={styles.loadMoreText}>Load More</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
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
  pagination: {
    fontSize: 12,
    color: '#999',
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
    alignItems: 'flex-start',
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
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  customerSection: {
    marginBottom: 8,
  },
  customer: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  checkboxContainer: {
    padding: 4,
  },
  orderDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  loadMoreText: {
    color: '#007AFF',
    fontSize: 14,
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