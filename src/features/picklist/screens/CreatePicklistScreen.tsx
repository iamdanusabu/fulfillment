
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

  const markAllPicked = () => {
    setItems(prev =>
      prev.map(item => ({ ...item, pickedQuantity: item.requiredQuantity }))
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
      const binName = item.bin?.name || 'Unassigned Bin';
      if (!groups[binName]) {
        groups[binName] = [];
      }
      groups[binName].push(item);
    });

    return groups;
  }, [items]);

  const renderPicklistItem = ({ item }: { item: PicklistItem }) => {
    const isPicked = item.pickedQuantity > 0;
    const isFullyPicked = item.pickedQuantity === item.requiredQuantity;
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.sku}>SKU: {item.upc}</Text>
          <View style={styles.inventoryInfo}>
            <Text style={styles.inventoryText}>Available: {item.availableQuantity || 0}</Text>
            <Text style={styles.inventoryText}>QOH: {item.requiredQuantity}</Text>
          </View>
        </View>

        <View style={styles.quantitySection}>
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>
              {item.pickedQuantity}/{item.requiredQuantity}
            </Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => updatePickedQuantity(item.id, item.pickedQuantity - 1)}
                style={[styles.quantityButton, styles.decrementButton]}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => updatePickedQuantity(item.id, item.pickedQuantity + 1)}
                style={[styles.quantityButton, styles.incrementButton]}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {isFullyPicked ? (
            <View style={styles.pickedBadge}>
              <Text style={styles.pickedText}>Picked</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.pickButton}
              onPress={() => updatePickedQuantity(item.id, item.requiredQuantity)}
            >
              <Text style={styles.pickButtonText}>Pick</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderBinSection = (binName: string, binItems: PicklistItem[]) => (
    <View key={binName} style={styles.binSection}>
      <View style={styles.binHeader}>
        <MaterialIcons name="inventory-2" size={20} color="#333" />
        <Text style={styles.binName}>{binName}</Text>
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

  const orderIds = (params.orderIds as string).split(',');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Picklist</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.infoText}>Orders: {orderIds.length}</Text>
          <Text style={styles.infoText}>Items: {totalItemsCount}</Text>
          <Text style={styles.infoText}>Store: Fly LLC</Text>
          <Text style={styles.infoText}>ID: 1</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {pickedItemsCount} of {totalItemsCount} items picked
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
          style={styles.markAllButton}
          onPress={markAllPicked}
        >
          <Text style={styles.markAllText}>Mark All Picked</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.proceedButton, !hasPickedItems && styles.disabledButton]}
          onPress={handleFulfillment}
          disabled={!hasPickedItems}
        >
          <Text style={styles.proceedText}>Proceed to Fulfillment</Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    fontWeight: '500',
  },
  itemsList: {
    flex: 1,
  },
  itemsContent: {
    padding: 16,
  },
  binSection: {
    marginBottom: 20,
  },
  binHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  binName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sku: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inventoryInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  inventoryText: {
    fontSize: 12,
    color: '#666',
  },
  quantitySection: {
    alignItems: 'flex-end',
  },
  quantityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  decrementButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  incrementButton: {
    backgroundColor: '#007bff',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pickedBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  pickedText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pickButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  pickButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  markAllButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  markAllText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  proceedButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  proceedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
