
import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { transformOrder } from '../api/ordersApi';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';

interface OrderSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderSelect: (order: Order) => void;
}

export function OrderSearchModal({ visible, onClose, onOrderSelect }: OrderSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const config = getConfig();

  const {
    data: searchResults,
    loading,
    hasMore,
    totalRecords,
    loadMore,
    refresh,
  } = usePaginatedFetcher<any>(
    searchUrl,
    {
      pageSize: 25,
    }
  );

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter an order number to search');
      return;
    }

    const params = new URLSearchParams({
      searchMode: 'MATCH_WITH',
      matchWith: 'any',
      orderID: searchQuery.trim(),
      expand: 'item,bin,location_hint,payment',
      pagination: 'true',
    });

    setSearchUrl(`${config.endpoints.orderSearch}?${params.toString()}`);
  }, [searchQuery, config.endpoints.orderSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchUrl(null);
  }, []);

  const handleOrderPress = useCallback((order: any) => {
    const transformedOrder = transformOrder(order);
    onOrderSelect(transformedOrder);
    onClose();
  }, [onOrderSelect, onClose]);

  const renderOrderItem = ({ item }: { item: any }) => {
    const order = transformOrder(item);
    
    return (
      <TouchableOpacity 
        style={styles.orderItem} 
        onPress={() => handleOrderPress(item)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.customerName}>{order.customer}</Text>
            {order.externalOrderKey && (
              <Text style={styles.externalId}>External ID: {order.externalOrderKey}</Text>
            )}
          </View>
          <View style={styles.orderMeta}>
            <View style={[styles.statusBadge, getStatusBadgeColor(order.status)]}>
              <Text style={styles.statusText}>{order.status?.toUpperCase()}</Text>
            </View>
            <Text style={styles.orderAmount}>${(order.amount || 0).toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.itemCount}>{order.items.length} items</Text>
          <Text style={styles.orderDate}>
            {new Date(order.date).toLocaleDateString()}
          </Text>
          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>{order.source}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'initiated':
        return { backgroundColor: '#FF8C00' };
      case 'completed':
      case 'fulfilled':
        return { backgroundColor: '#28a745' };
      case 'pending':
      case 'processing':
        return { backgroundColor: '#ffc107' };
      case 'cancelled':
      case 'failed':
        return { backgroundColor: '#dc3545' };
      default:
        return { backgroundColor: '#007AFF' };
    }
  };

  const renderFooter = () => {
    if (!hasMore) {
      return searchResults.length > 0 ? (
        <Text style={styles.endText}>No more results</Text>
      ) : null;
    }

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Search Orders</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter order number..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <MaterialIcons name="clear" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.searchButton, loading && styles.disabledButton]} 
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {searchUrl && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {loading && searchResults.length === 0 ? 
                'Searching...' : 
                `${totalRecords} result${totalRecords !== 1 ? 's' : ''} found`
              }
            </Text>
            
            <FlatList
              data={searchResults}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.orderID.toString()}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={true}
            />
          </View>
        )}

        {!searchUrl && (
          <View style={styles.emptyState}>
            <MaterialIcons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Enter an order number to search</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsText: {
    padding: 16,
    paddingBottom: 8,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  orderItem: {
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
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  externalId: {
    fontSize: 12,
    color: '#666',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  sourceTag: {
    backgroundColor: '#e7f3ff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
    textTransform: 'capitalize',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});
