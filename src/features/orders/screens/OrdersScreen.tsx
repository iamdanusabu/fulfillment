import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePaginatedOrders } from '../hooks/usePaginatedOrders';
import { Order } from '../../../shared/types';
import { picklistApi } from '../../picklist/api/picklistApi';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { useQRScanner } from '../hooks/useQRScanner';
import { AppToolbar } from '../../../components/layout/AppToolbar';

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
    source: params.source as string,
    status: params.status as string,
    hasFulfilmentJob: params.hasFulfilmentJob as string
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isPicklistMode, setIsPicklistMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // QR Scanner integration
  const { isScanning, isLoading: qrLoading, startScanning, stopScanning, handleScan } = useQRScanner();

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
      router.push(`/orders/${order.orderID}`);
    }
  };

  const proceedToLocationSelection = () => {
    if (selectedOrders.length === 0) return;

    const orderIdsParam = selectedOrders.join(',');
    router.push(`/picklist/location-selection?orderIds=${orderIdsParam}`);
  };

  const filteredOrders = useMemo(() => {
    if (!searchText.trim()) return orders;

    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchText.toLowerCase()) ||
      order.source.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [orders, searchText]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);


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
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order number, customer name..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={styles.qrButton} 
          onPress={startScanning}
          disabled={qrLoading}
        >
          <MaterialIcons name="qr-code-scanner" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* QR Code Scanner Modal */}
      <QRCodeScanner
        visible={isScanning}
        onClose={stopScanning}
        onScan={handleScan}
      />

      <Text style={styles.resultsText}>
        {totalRecords} orders found - Page {currentPage} of {totalPages}
      </Text>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => {
          if (loading && orders.length > 0) {
            return (
              <View style={styles.loadingFooter}>
                <ActivityIndicator color="#007AFF" />
                <Text style={styles.loadingText}>Loading more orders...</Text>
              </View>
            );
          }
          if (!hasMore && orders.length > 0) {
            return <Text style={styles.endText}>No more orders</Text>;
          }
          return null;
        }}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
      />

      {isPicklistMode && selectedOrders.length > 0 && (
        <View style={styles.bottomBar}>
          <Text style={styles.selectedCount}>
            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={proceedToLocationSelection}
          >
            <Text style={styles.proceedText}>Continue to Location</Text>
          </TouchableOpacity>
        </View>
      )}
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  qrButton: {
    padding: 8,
    marginLeft: 8,
  },
  resultsText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: '#666',
    fontSize: 14,
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
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  endText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
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
    fontSize: 14,
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  proceedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});