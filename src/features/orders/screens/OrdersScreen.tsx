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
  Modal,
  Button,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { usePaginatedOrders } from '../hooks/usePaginatedOrders';
import { Order } from '../../../shared/types';
import { picklistApi } from '../../picklist/api/picklistApi';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { useQRScanner } from '../hooks/useQRScanner';
import { AppToolbar } from '../../../components/layout/AppToolbar';
import { ordersApi } from '../api/ordersApi';
import { usePaginatedSearch } from '../hooks/usePaginatedSearch';

const OrderSearchModal = ({ visible, onClose, onOrderSelect }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const { 
    data: searchResults, 
    loading: searchLoading, 
    error: searchError, 
    fetchData: searchOrders 
  } = usePaginatedSearch({ 
    searchMode: 'contains', 
    searchFields: 'orderID',
    query: orderIdInput,
    searchOnMount: false,
  });

  const handleSearch = () => {
    if (orderIdInput.trim()) {
      searchOrders(orderIdInput);
    } else {
      Alert.alert("Input Error", "Please enter an Order ID to search.");
    }
  };

  const handleOrderPress = (order) => {
    onOrderSelect(order);
    onClose();
    setOrderIdInput(''); // Clear input after selection
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Order</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchForm}>
            <TextInput
              style={styles.searchInputModal}
              placeholder="Enter Order ID"
              value={orderIdInput}
              onChangeText={setOrderIdInput}
              keyboardType="default"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButtonModal}>
              <Text style={styles.searchButtonModalText}>Search</Text>
            </TouchableOpacity>
          </View>

          {searchLoading && <ActivityIndicator size="large" color="#007AFF" style={styles.modalLoader} />}
          {searchError && <Text style={styles.errorText}>Error: {searchError}</Text>}

          {!searchLoading && !searchError && searchResults && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleOrderPress(item)} style={styles.resultItem}>
                  <Text style={styles.resultText}>#{item.orderNumber} - {item.customer}</Text>
                  <Text style={styles.resultSubText}>ID: {item.orderID} • {item.source}</Text>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          )}
          {!searchLoading && !searchError && orderIdInput.length > 0 && searchResults && searchResults.length === 0 && (
            <Text style={styles.noResultsText}>No orders found for this Order ID.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
  const [showSearchModal, setShowSearchModal] = useState(false);

  // QR Scanner integration
  const { isScanning, isLoading: qrLoading, startScanning, stopScanning, handleScan } = useQRScanner();

  useEffect(() => {
    setIsPicklistMode(params.mode === 'picklist');
  }, [params.mode]);

  const handleSearchModalOpen = () => {
    setShowSearchModal(true);
  };

  const handleSearchModalClose = () => {
    setShowSearchModal(false);
    // Reset search input and results when modal is closed
    // (handled within the modal component itself now)
  };

  const handleOrderSelect = (order: Order) => {
    setShowSearchModal(false);
    // Navigate to order details using the correct orderID
    router.push(`/orders/${order.orderID}`);
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
        <TouchableOpacity 
          style={styles.searchInput}
          onPress={handleSearchModalOpen}
        >
          <Text style={styles.searchPlaceholder}>Search orders...</Text>
        </TouchableOpacity>
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

      <OrderSearchModal
        visible={showSearchModal}
        onClose={handleSearchModalClose}
        onOrderSelect={handleOrderSelect}
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
    paddingVertical: 8,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  qrButton: {
    padding: 4,
    marginLeft: 6,
  },
  searchButton: {
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  searchForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  searchInputModal: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    fontSize: 14,
  },
  searchButtonModal: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
  },
  searchButtonModalText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalLoader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubText: {
    fontSize: 12,
    color: '#666',
  },
  resultsList: {
    maxHeight: 300,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});