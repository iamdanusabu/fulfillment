
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Fulfillment } from '../../../shared/types';
import { useFulfillments } from '../hooks/usePicklist';

export default function PicklistIndexScreen() {
  const { fulfillments, loading, error, hasMore, refetch, loadMore } = useFulfillments();
  const router = useRouter();

  const createNewPicklist = () => {
    router.push('/orders?mode=picklist');
  };

  const viewFulfillment = (fulfillment: Fulfillment) => {
    // Extract order IDs from sources
    const orderIds = fulfillment.sources.map(source => source.typeID).join(',');
    router.push(`/picklist/packing?orderIds=${orderIds}&fulfillmentId=${fulfillment.id}&locationId=${fulfillment.fulfillmentLocation.id}`);
  };

  const renderFulfillmentItem = ({ item }: { item: Fulfillment }) => (
    <TouchableOpacity style={styles.picklistCard} onPress={() => viewFulfillment(item)}>
      <View style={styles.picklistHeader}>
        <Text style={styles.picklistId}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getFulfillmentStatusColor(item.fulfillmentStatus) }]}>
          <Text style={styles.statusText}>{item.fulfillmentStatus}</Text>
        </View>
      </View>
      
      <View style={styles.picklistDetails}>
        <Text style={styles.orderCount}>{item.orderCount} orders</Text>
        <Text style={styles.itemCount}>{item.totalItemCount} items</Text>
        <Text style={styles.createdAt}>Created: {new Date(item.createdOn).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.locationInfo}>
        <MaterialIcons name="location-on" size={16} color="#666" />
        <Text style={styles.locationText}>{item.fulfillmentLocation.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const getFulfillmentStatusColor = (status: string) => {
    switch (status) {
      case 'UNFULFILLED': return '#ffc107';
      case 'FULFILLED': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Picklists</Text>
        <TouchableOpacity style={styles.createButton} onPress={createNewPicklist}>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create Picklist</Text>
        </TouchableOpacity>
      </View>

      {loading && fulfillments.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading fulfillments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <MaterialIcons name="error" size={64} color="#dc3545" />
          <Text style={styles.errorTitle}>Error loading fulfillments</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : fulfillments.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="inventory" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No fulfillments found</Text>
          <Text style={styles.emptyMessage}>Create your first picklist to get started</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={createNewPicklist}>
            <Text style={styles.emptyButtonText}>Create Picklist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={fulfillments}
          renderItem={renderFulfillmentItem}
          keyExtractor={(item) => item.id}
          style={styles.picklistsList}
          contentContainerStyle={styles.picklistsContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreFooter}>
                <ActivityIndicator size="small" color="#007AFF" />
              </View>
            ) : null
          }
        />
      )}
    </View>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  picklistsList: {
    flex: 1,
  },
  picklistsContent: {
    padding: 16,
  },
  picklistCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  picklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  picklistId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  picklistDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderCount: {
    fontSize: 12,
    color: '#666',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  createdAt: {
    fontSize: 12,
    color: '#666',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadMoreFooter: {
    padding: 16,
    alignItems: 'center',
  },
});
