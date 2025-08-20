import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { usePaginatedOrders } from '../hooks/usePaginatedOrders';
import { Order } from '../../../shared/types';
import { picklistApi } from '../../picklist/api/picklistApi';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { useQRScanner } from '../hooks/useQRScanner';
import { AppToolbar } from '../../../components/layout/AppToolbar';

export default function OrdersScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isPicklistMode, setIsPicklistMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // QR Scanner integration
  const { isScanning, isLoading: qrLoading, startScanning, stopScanning, handleScan } = useQRScanner();

  // Debounce search text
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      console.log('Setting debounced search text:', searchText);
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

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
    hasFulfilmentJob: params.hasFulfilmentJob as string,
    searchText: debouncedSearchText
  });

  // Debug logging
  React.useEffect(() => {
    console.log('Search params:', { 
      searchText, 
      debouncedSearchText, 
      ordersCount: orders.length,
      loading 
    });
  }, [searchText, debouncedSearchText, orders.length, loading]);

  useEffect(() => {
    setIsPicklistMode(params.mode === 'picklist');
  }, [params.mode]);

  // Removed aggressive refresh on focus - let users manually refresh via pull-to-refresh

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

  // Remove client-side filtering since search is now handled by API
  const filteredOrders = orders;

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


  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { backgroundColor: '#28a745', color: '#fff' };
      case 'unpaid':
      case 'pending':
        return { backgroundColor: '#ffc107', color: '#000' };
      case 'failed':
      case 'cancelled':
        return { backgroundColor: '#dc3545', color: '#fff' };
      default:
        return { backgroundColor: '#6c757d', color: '#fff' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return '1 day ago';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[
        styles.orderCard,
        isPicklistMode && selectedOrders.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => viewOrderDetail(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderMainInfo}>
          <Text style={styles.customerName}>
            {item.customer || 'Guest Order'}
          </Text>
          <View style={styles.orderMetaRow}>
            <Text style={styles.orderMainId}>#{item.orderID}</Text>
            <Text style={styles.externalOrderId}>Ext: {item.orderNumber}</Text>
            <View style={styles.paymentStatusTag}>
              <Text style={[styles.paymentStatusText, getPaymentStatusColor(item.paymentStatus)]}>
                {item.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.orderActions}>
          {isPicklistMode && (
            <View style={styles.checkboxContainer}>
              <MaterialIcons
                name={selectedOrders.includes(item.id) ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={selectedOrders.includes(item.id) ? '#007AFF' : '#ccc'}
              />
            </View>
          )}
          {!isPicklistMode && (
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          )}
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.totalItemQuantity || item.items.length} Items</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>{item.source}</Text>
          </View>
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
        <MaterialIcons name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID or customer name..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={styles.qrButton} 
          onPress={startScanning}
          disabled={qrLoading}
        >
          <MaterialIcons name="qr-code-scanner" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* QR Code Scanner Modal */}
      <QRCodeScanner
        visible={isScanning}
        onClose={stopScanning}
        onScan={handleScan}
      />



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
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  qrButton: {
    padding: 4,
    marginLeft: 6,
  },
  resultsText: {
    paddingHorizontal: 16,
    paddingBottom: 2,
    color: '#666',
    fontSize: 11,
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 50,
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  orderMainInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderMainId: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  externalOrderId: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  paymentStatusTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    padding: 2,
  },
  orderFooter: {
    marginTop: 2,
  },
  orderTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  sourceTag: {
    backgroundColor: '#e7f3ff',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  sourceText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
    textTransform: 'capitalize',
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