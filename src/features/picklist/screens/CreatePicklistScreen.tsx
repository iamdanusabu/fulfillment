import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { picklistApi } from '../api/picklistApi';
import { PicklistItem } from '../../../shared/types';

export default function CreatePicklistScreen() {
  const [items, setItems] = useState<PicklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.orderIds && params.locationId) {
      if (params.fulfillmentId) {
        // Fetch existing fulfillment if fulfillmentId is provided
        fetchFulfillment(params.fulfillmentId as string);
      } else {
        simulateFulfillment();
      }
    }
  }, [params.orderIds, params.locationId, params.fulfillmentId]);

  const simulateFulfillment = async () => {
    try {
      setLoading(true);
      const orderIds = (params.orderIds as string).split(',');
      const locationId = params.locationId as string;

      const simulatedItems = await picklistApi.simulateFulfillment(orderIds, locationId);
      setItems(simulatedItems);
    } catch (error) {
      console.error('Failed to simulate fulfillment:', error);
    } finally {
      setLoading(false);
    }
  };

  const [fulfillmentData, setFulfillmentData] = useState<any>(null);

  const fetchFulfillment = async (fulfillmentId: string) => {
    try {
      setLoading(true);
      const fulfillment = await picklistApi.getFulfillment(fulfillmentId);
      setItems(fulfillment.items);
      setFulfillmentData(fulfillment);
    } catch (error) {
      console.error('Failed to fetch fulfillment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePickedQuantity = (itemId: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, pickedQuantity: Math.max(0, Math.min(quantity, item.requiredQuantity)) }
          : item
      )
    );
  };

  const handleFulfillment = async () => {
    try {
      const orderIds = (params.orderIds as string).split(',');
      const locationId = params.locationId as string;
      let result;

      if (params.fulfillmentId) {
        // Update existing fulfillment using PUT
        result = await picklistApi.updateFulfillment(params.fulfillmentId as string, items, fulfillmentData);
      } else {
        // Create new fulfillment
        result = await picklistApi.createFulfillment(orderIds, locationId, items);
      }

      // Navigate to packing screen with fulfillment ID from response
      router.push(`/picklist/packing?fulfillmentId=${result.id || params.fulfillmentId}&orderIds=${params.orderIds}`);
    } catch (error) {
      console.error('Failed to process fulfillment:', error);
    }
  };

  const groupedItems = React.useMemo(() => {
    const groups: { [binName: string]: PicklistItem[] } = {};

    items.forEach(item => {
      const binName = item.bin?.name || 'No Bin Assigned';
      if (!groups[binName]) {
        groups[binName] = [];
      }
      groups[binName].push(item);
    });

    return groups;
  }, [items]);

  const renderPicklistItem = ({ item }: { item: PicklistItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.upc}>UPC: {item.upc}</Text>
        <Text style={styles.location}>Location: {item.location}</Text>
        <Text style={styles.requiredQty}>Required: {item.requiredQuantity}</Text>

        {item.locationHints && item.locationHints.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>💡 Hints:</Text>
            {item.locationHints.map((hint, index) => (
              <Text key={index} style={styles.hintText}>• {hint.hint}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => updatePickedQuantity(item.id, item.pickedQuantity - 1)}
          style={styles.quantityButton}
        >
          <MaterialIcons name="remove" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.quantityInputContainer}>
          <TextInput
            style={styles.quantityInput}
            value={item.pickedQuantity.toString()}
            onChangeText={(text) => updatePickedQuantity(item.id, parseInt(text) || 0)}
            keyboardType="numeric"
          />
          <Text style={styles.requiredQtyLabel}>/ {item.requiredQuantity}</Text>
        </View>

        <TouchableOpacity
          onPress={() => updatePickedQuantity(item.id, item.pickedQuantity + 1)}
          style={styles.quantityButton}
        >
          <MaterialIcons name="add" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBinSection = (binName: string, binItems: PicklistItem[]) => (
    <View key={binName} style={styles.binSection}>
      <View style={styles.binHeader}>
        <MaterialIcons name="inventory" size={20} color="#007AFF" />
        <Text style={styles.binName}>{binName}</Text>
        <Text style={styles.binItemCount}>({binItems.length} items)</Text>
      </View>
      {binItems.map(item => (
        <View key={item.id}>
          {renderPicklistItem({ item })}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading picklist data...</Text>
      </View>
    );
  }

  const pickedItemsCount = items.filter(item => item.pickedQuantity > 0).length;
  const totalItemsCount = items.length;
  const progressPercentage = totalItemsCount > 0 ? (pickedItemsCount / totalItemsCount) * 100 : 0;

  const hasPickedItems = items.some(item => item.pickedQuantity > 0);
  const allItemsPicked = items.every(item => item.pickedQuantity === item.requiredQuantity);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{totalItemsCount} items to pick</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {pickedItemsCount} / {totalItemsCount} items picked ({Math.round(progressPercentage)}%)
          </Text>
        </View>
      </View>

      <FlatList
        data={Object.entries(groupedItems)}
        renderItem={({ item: [binName, binItems] }) => renderBinSection(binName, binItems)}
        keyExtractor={([binName]) => binName}
        style={styles.itemsList}
        contentContainerStyle={styles.itemsContent}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.fulfillButton, !hasPickedItems && styles.disabledButton]}
          onPress={handleFulfillment}
          disabled={!hasPickedItems}
        >
          <Text style={styles.fulfillText}>
            {params.fulfillmentId ? 'Update Picklist' : 'Create Picklist'}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
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

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemsList: {
    flex: 1,
  },
  itemsContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  requiredQty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityInput: {
    width: 50,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    textAlign: 'center',
    marginRight: 4,
  },
  requiredQtyLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  fulfillButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  fulfillText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Styles for the progress bar
  progressContainer: {
    marginTop: 10,
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  binSection: {
    marginBottom: 20,
  },
  binHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  binName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
  binItemCount: {
    fontSize: 12,
    color: '#666',
  },
  upc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  hintsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff9e6',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  hintsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#856404',
    marginLeft: 8,
  },
});