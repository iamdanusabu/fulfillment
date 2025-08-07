
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picklist } from '../../src/shared/types';

export default function PicklistIndex() {
  const [picklists, setPicklists] = useState<Picklist[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createNewPicklist = () => {
    router.push('/orders?mode=picklist');
  };

  const viewPicklist = (picklist: Picklist) => {
    // Navigate to packing screen with the picklist details
    router.push(`/picklist/packing?picklistId=${picklist.id}`);
  };

  const renderPicklistItem = ({ item }: { item: Picklist }) => (
    <TouchableOpacity style={styles.picklistCard} onPress={() => viewPicklist(item)}>
      <View style={styles.picklistHeader}>
        <Text style={styles.picklistId}>Picklist #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.picklistDetails}>
        <Text style={styles.orderCount}>{item.orderIds.length} orders</Text>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
        <Text style={styles.createdAt}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#ffc107';
      case 'active': return '#007AFF';
      case 'completed': return '#28a745';
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

      {picklists.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="inventory" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No picklists found</Text>
          <Text style={styles.emptyMessage}>Create your first picklist to get started</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={createNewPicklist}>
            <Text style={styles.emptyButtonText}>Create Picklist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={picklists}
          renderItem={renderPicklistItem}
          keyExtractor={(item) => item.id}
          style={styles.picklistsList}
          contentContainerStyle={styles.picklistsContent}
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
});
