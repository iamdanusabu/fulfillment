
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { picklistApi } from '../../src/features/picklist/api/picklistApi';
import { PicklistItem } from '../../src/shared/types';

export default function CreatePicklist() {
  const [items, setItems] = useState<PicklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.orderIds && params.locationId) {
      simulateFulfillment();
    }
  }, [params.orderIds, params.locationId]);

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

  const updatePickedQuantity = (itemId: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, pickedQuantity: Math.max(0, Math.min(quantity, item.requiredQuantity)) }
          : item
      )
    );
  };

  const createFulfillment = async () => {
    try {
      const orderIds = (params.orderIds as string).split(',');
      const locationId = params.locationId as string;
      
      const result = await picklistApi.createFulfillment(orderIds, locationId, items);
      
      // Navigate to packing screen with fulfillment ID
      router.push(`/picklist/packing?fulfillmentId=${result.fulfillmentId}&orderIds=${params.orderIds}`);
    } catch (error) {
      console.error('Failed to create fulfillment:', error);
    }
  };

  const renderPicklistItem = ({ item }: { item: PicklistItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.location}>Location: {item.location}</Text>
        <Text style={styles.requiredQty}>Required: {item.requiredQuantity}</Text>
      </View>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => updatePickedQuantity(item.id, item.pickedQuantity - 1)}
          style={styles.quantityButton}
        >
          <MaterialIcons name="remove" size={20} color="#666" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.quantityInput}
          value={item.pickedQuantity.toString()}
          onChangeText={(text) => updatePickedQuantity(item.id, parseInt(text) || 0)}
          keyboardType="numeric"
        />
        
        <TouchableOpacity
          onPress={() => updatePickedQuantity(item.id, item.pickedQuantity + 1)}
          style={styles.quantityButton}
        >
          <MaterialIcons name="add" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Simulating fulfillment...</Text>
      </View>
    );
  }

  const allItemsPicked = items.every(item => item.pickedQuantity > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Picklist Creation</Text>
        <Text style={styles.subtitle}>{items.length} items to pick</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderPicklistItem}
        keyExtractor={(item) => item.id}
        style={styles.itemsList}
        contentContainerStyle={styles.itemsContent}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.fulfillButton, !allItemsPicked && styles.disabledButton]}
          onPress={createFulfillment}
          disabled={!allItemsPicked}
        >
          <Text style={styles.fulfillText}>Create Fulfillment</Text>
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
  quantityInput: {
    width: 60,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    textAlign: 'center',
    marginHorizontal: 8,
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
});
