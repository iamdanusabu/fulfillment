
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { getConfig } from '../../../environments';

interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

interface SourceCount {
  name: string;
  count: number;
}

export default function DashboardScreen() {
  const [sourceCounts, setSourceCounts] = useState<SourceCount[]>([]);
  const [readyForPickupCount, setReadyForPickupCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSourceCounts(),
        loadReadyForPickupCount()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceCounts = async () => {
    try {
      // Get sources from settings
      const savedSettings = await AsyncStorage.getItem('orderFilterSettings');
      let sources: string[] = [];
      
      if (savedSettings) {
        const settings: FilterSettings = JSON.parse(savedSettings);
        sources = settings.sources;
      } else {
        // Default sources if no settings found
        sources = [
          'Shopify', 'Tapin2', 'Breakaway', 'bigcommerce', 'Ecwid', 
          'PHONE ORDER', 'DELIVERY', 'BAR TAB', 'TIKT', 'TABLE', 
          'OTHER', 'MANUAL', 'FanVista', 'QSR'
        ];
      }

      // Get count for each source
      const config = getConfig();
      const countPromises = sources.map(async (source) => {
        try {
          const url = `${config.endpoints.orders}?source=${encodeURIComponent(source)}&pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
          const response = await fetchWithToken(url);
          return {
            name: source,
            count: response?.totalRecords || 0
          };
        } catch (error) {
          console.error(`Failed to get count for source ${source}:`, error);
          return {
            name: source,
            count: 0
          };
        }
      });

      const counts = await Promise.all(countPromises);
      setSourceCounts(counts);
    } catch (error) {
      console.error('Failed to load source counts:', error);
    }
  };

  const loadReadyForPickupCount = async () => {
    try {
      const config = getConfig();
      const url = `${config.endpoints.orders}?status=ready&hasFulfilmentJob=false&pageNo=1&pageSize=1&pagination=true`;
      const response = await fetchWithToken(url);
      setReadyForPickupCount(response?.totalRecords || 0);
    } catch (error) {
      console.error('Failed to load ready for pickup count:', error);
      setReadyForPickupCount(0);
    }
  };

  const navigateToOrders = (source?: string) => {
    const route = source ? `/orders?source=${source}` : '/orders';
    router.push(route);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.statsGrid}>
        {sourceCounts.map((sourceCount) => (
          <TouchableOpacity 
            key={sourceCount.name}
            style={styles.statCard}
            onPress={() => navigateToOrders(sourceCount.name)}
          >
            <Text style={styles.statNumber}>{sourceCount.count}</Text>
            <Text style={styles.statLabel}>{sourceCount.name} Orders</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigateToOrders()}
        >
          <Text style={styles.statNumber}>{readyForPickupCount}</Text>
          <Text style={styles.statLabel}>Ready for Pickup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    minWidth: 150,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
