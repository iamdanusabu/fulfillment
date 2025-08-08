import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStores, useWarehouses } from '../hooks/usePicklist';
import { Location } from '../../../shared/types';

export default function LocationSelectionScreen() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stores' | 'warehouses'>('stores');
  const router = useRouter();
  const params = useLocalSearchParams();

  const { stores, loading: storesLoading } = useStores();
  const { warehouses, loading: warehousesLoading } = useWarehouses();

  const proceedToPicklist = () => {
    if (!selectedLocation) return;

    const { orderIds } = params;
    router.push(`/picklist/create?orderIds=${orderIds}&locationId=${selectedLocation}`);
  };

  const handleLocationSelect = (location: Location) => {
    const orderIds = params.orderIds as string;
    router.push(`/picklist/create?orderIds=${orderIds}&locationId=${location.id}&locationType=${location.type.toUpperCase()}`);
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[
        styles.locationCard,
        selectedLocation === item.id && styles.selectedCard
      ]}
      onPress={() => {
        setSelectedLocation(item.id);
        handleLocationSelect(item); 
      }}
    >
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={[styles.locationType, activeTab === 'stores' ? styles.storeType : styles.warehouseType]}>
            {activeTab === 'stores' ? 'Store' : 'Warehouse'}
          </Text>
          <Text style={styles.locationAddress}>{item.address}</Text>
        </View>
        <View style={styles.radioContainer}>
          <MaterialIcons
            name={selectedLocation === item.id ? 'radio-button-checked' : 'radio-button-unchecked'}
            size={24}
            color={selectedLocation === item.id ? '#007AFF' : '#ccc'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const currentData = activeTab === 'stores' ? stores : warehouses;
  const currentLoading = activeTab === 'stores' ? storesLoading : warehousesLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stores' && styles.activeTab]}
          onPress={() => {
            setActiveTab('stores');
            setSelectedLocation(null);
          }}
        >
          <MaterialIcons 
            name="store" 
            size={20} 
            color={activeTab === 'stores' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'stores' && styles.activeTabText]}>
            Stores ({stores.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'warehouses' && styles.activeTab]}
          onPress={() => {
            setActiveTab('warehouses');
            setSelectedLocation(null);
          }}
        >
          <MaterialIcons 
            name="warehouse" 
            size={20} 
            color={activeTab === 'warehouses' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'warehouses' && styles.activeTabText]}>
            Warehouses ({warehouses.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading {activeTab}...</Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          style={styles.locationsList}
          contentContainerStyle={styles.locationsContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name={activeTab === 'stores' ? 'store' : 'warehouse'} 
                size={48} 
                color="#ccc" 
              />
              <Text style={styles.emptyText}>
                No {activeTab} available for fulfillment
              </Text>
            </View>
          )}
        />
      )}

      {selectedLocation && (
        <View style={styles.bottomBar}>
          <Text style={styles.selectedInfo}>
            Selected: {currentData.find(item => item.id === selectedLocation)?.name}
          </Text>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={proceedToPicklist}
          >
            <Text style={styles.proceedText}>Create Picklist</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  locationsList: {
    flex: 1,
  },
  locationsContent: {
    padding: 16,
  },
  locationCard: {
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
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationType: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
    fontWeight: '500',
  },
  storeType: {
    color: '#28a745',
    backgroundColor: '#d4edda',
  },
  warehouseType: {
    color: '#6f42c1',
    backgroundColor: '#e2d9f3',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  radioContainer: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  selectedInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  proceedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  proceedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});