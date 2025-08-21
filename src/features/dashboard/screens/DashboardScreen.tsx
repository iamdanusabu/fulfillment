import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithToken } from "../../../shared/services/fetchWithToken";
import { getConfig } from "../../../environments";
import { QRCodeScanner } from '../../orders/components/QRCodeScanner';
import { useQRScanner } from '../../orders/hooks/useQRScanner';
import { AppToolbar } from '../../../components/layout/AppToolbar';
import { ShopifyIcon } from '../../../shared/components/ShopifyIcon';
import { BigCommerceIcon } from '../../../shared/components/BigCommerceIcon';
import { EcwidIcon } from '../../../shared/components/EcwidIcon';
import { BreakawayIcon } from '../../../shared/components/BreakawayIcon';
import { BarTabIcon } from '../../../shared/components/BarTabIcon';
import { TikTokIcon } from '../../../shared/components/TikTokIcon';
import { DeliveryIcon } from '../../../shared/components/DeliveryIcon';
import { PhoneIcon } from '../../../shared/components/PhoneIcon';
import { OtherIcon } from '../../../shared/components/OtherIcon';
import { QSRIcon } from '../../../shared/components/QSRIcon';
import { Tapin2Icon } from '../../../shared/components/Tapin2Icon';
import { TableIcon } from '../../../shared/components/TableIcon';
import { ManualIcon } from '../../../shared/components/ManualIcon';
import { FanVistaIcon } from '../../../shared/components/FanVistaIcon';
import { ShoppingCartIcon } from '../../../shared/components/ShoppingCartIcon';



interface SourceCount {
  name: string;
  count: number;
  error?: boolean;
}

interface DashboardStats {
  sourceCounts: SourceCount[];
  readyForPickupCount: number;
  activePicklistsCount: number;
  totalOrdersCount: number;
  loading: boolean;
  error: string | null;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    sourceCounts: [],
    readyForPickupCount: 0,
    activePicklistsCount: 0,
    totalOrdersCount: 0,
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // QR Scanner integration
  const { isScanning, startScanning, stopScanning, handleScan } = useQRScanner();

  const isLandscape = width > height;
  const isTablet = width >= 768;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('dashboard_cache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setStats({
          ...parsedData,
          loading: false,
          error: null,
        });
        return true; // Indicates cached data was loaded
      }
    } catch (error) {
      console.error("Failed to load cached data:", error);
    }
    return false; // No cached data found
  };

  const saveCachedData = async (data: any) => {
    try {
      const cacheData = {
        sourceCounts: data.sourceCounts,
        readyForPickupCount: data.readyForPickupCount,
        activePicklistsCount: data.activePicklistsCount,
        totalOrdersCount: data.totalOrdersCount,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem('dashboard_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to save cached data:", error);
    }
  };

  const loadDashboardData = async (isRefresh = false) => {
    try {
      // Load cached data first if not refreshing
      if (!isRefresh) {
        const hasCachedData = await loadCachedData();
        if (!hasCachedData) {
          setStats(prev => ({ ...prev, loading: true, error: null }));
        }
      } else {
        setRefreshing(true);
      }

      // Load fresh data from API
      const [sourceCounts, readyForPickupCount, activePicklistsCount, totalOrdersCount] = await Promise.all([
        loadSourceCounts(),
        loadReadyForPickupCount(),
        loadActivePicklistsCount(),
        loadTotalOrdersCount(),
      ]);

      const newData = {
        sourceCounts,
        readyForPickupCount,
        activePicklistsCount,
        totalOrdersCount,
        loading: false,
        error: null,
      };

      // Update state with fresh data
      setStats(newData);

      // Save fresh data to cache
      await saveCachedData(newData);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard data",
      }));
    } finally {
      setRefreshing(false);
    }
  };

  const loadSourceCounts = async (): Promise<SourceCount[]> => {
    try {
      // List of all possible sources to check
      const allSources = [
        "Shopify",
        "Tapin2",
        "Breakaway",
        "bigcommerce",
        "Ecwid",
        "PHONE ORDER",
        "DELIVERY",
        "BAR TAB",
        "TIKT",
        "TABLE",
        "OTHER",
        "MANUAL",
        "FanVista",
        "QSR",
      ];

      const config = getConfig();
      const sourcesWithData: SourceCount[] = [];

      // Check each source and only include ones with data
      for (const source of allSources) {
        try {
          const url = `${config.endpoints.orders}?source=${encodeURIComponent(source)}&pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
          const response = await fetchWithToken(url);
          const count = response?.totalRecords || 0;

          // Only include sources with actual data
          if (count > 0) {
            sourcesWithData.push({
              name: source,
              count: count,
              error: false,
            });
          }
        } catch (error) {
          // Skip sources that return 404 or have no data
          if (error instanceof Error && (error.message.includes('404') || error.message.includes('No orders found'))) {
            // Do nothing - we skip 404 sources
            continue;
          }
          // Log other errors but don't include them
          console.error(`Failed to get count for source ${source}:`, error);
        }
      }

      return sourcesWithData;
    } catch (error) {
      console.error("Failed to load source counts:", error);
      return [];
    }
  };

  const loadTotalOrdersCount = async (): Promise<number> => {
    try {
      const config = getConfig();
      const url = `${config.endpoints.orders}?pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
      const response = await fetchWithToken(url);
      return response?.totalRecords || 0;
    } catch (error) {
      console.error("Failed to load total orders count:", error);
      return 0;
    }
  };

  const loadReadyForPickupCount = async (): Promise<number> => {
    try {
      const config = getConfig();
      // Get all orders ready for pickup without source filtering
      const url = `${config.endpoints.orders}?pageNo=1&pageSize=20&hasFulfilmentJob=true&expand=item%2Cbin%2Clocation_hint%2Cpayment&pagination=true&status=Ready&paymentStatus=PAID%2CUNPAID`;
      const response = await fetchWithToken(url);
      return response?.totalRecords || 0;
    } catch (error) {
      console.error("Failed to load ready for pickup count:", error);
      return 0;
    }
  };

  const loadActivePicklistsCount = async (): Promise<number> => {
    try {
      const config = getConfig();
      const url = `${config.endpoints.activePicklists}?pageNo=1&pageSize=20&status=OPEN&pagination=true`;
      const response = await fetchWithToken(url);
      return response?.totalRecords || 0;
    } catch (error) {
      console.error("Failed to load active picklists count:", error);
      return 0;
    }
  };

  const navigateToOrders = (source?: string) => {
    const route = source ? `/orders?source=${source}` : "/orders";
    router.push(route);
  };

  const onRefresh = () => {
    loadDashboardData(true);
  };

  // Helper function to get source display name and icon
  const getSourceInfo = (sourceName: string) => {
    const sourceMap: { [key: string]: { displayName: string; icon: string | React.ReactElement } } = {
      'Shopify': { displayName: 'Shopify', icon: <ShopifyIcon width={28} height={28} /> },
      'bigcommerce': { displayName: 'BigCommerce', icon: <BigCommerceIcon width={28} height={28} /> },
      'Breakaway': { displayName: 'Breakaway', icon: <BreakawayIcon width={28} height={28} /> },
      'Ecwid': { displayName: 'Ecwid', icon: <EcwidIcon width={28} height={28} /> },
      'PHONE ORDER': { displayName: 'Phone Order', icon: <PhoneIcon width={24} height={24} /> },
      'DELIVERY': { displayName: 'Delivery', icon: <DeliveryIcon width={24} height={24} /> },
      'BAR TAB': { displayName: 'Bar Tab', icon: <BarTabIcon width={24} height={24} /> },
      'TIKT': { displayName: 'TIKT', icon: <TikTokIcon width={28} height={28} /> },
      'TABLE': { displayName: 'Table', icon: <TableIcon width={24} height={24} /> },
      'OTHER': { displayName: 'Other', icon: <OtherIcon width={24} height={24} /> },
      'MANUAL': { displayName: 'Manual', icon: <ManualIcon width={24} height={24} /> },
      'FanVista': { displayName: 'FanVista', icon: <FanVistaIcon width={28} height={28} /> },
      'QSR': { displayName: 'QSR', icon: <QSRIcon width={24} height={24} /> },
      'Tapin2': { displayName: 'Tapin2', icon: <Tapin2Icon width={24} height={24} /> },
    };

    return sourceMap[sourceName] || { displayName: sourceName, icon: '📦' };
  };

  if (stats.loading && stats.sourceCounts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stats.error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={20} color="#dc3545" />
            <Text style={styles.errorText}>{stats.error}</Text>
          </View>
        )}

        {/* Key Metrics Section */}
        <View style={styles.section}>
          <View style={styles.keyMetricsGrid}>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigateToOrders()}
            >
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricNumber}>{stats.totalOrdersCount}</Text>
              </View>
              <ShoppingCartIcon size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => router.push('/orders?hasFulfilmentJob=true&status=Ready')}
            >
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Ready for Pickup</Text>
                <Text style={styles.metricNumber}>{stats.readyForPickupCount}</Text>
              </View>
              <MaterialIcons name="inventory-2" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => router.push('/picklist')}
            >
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Active Picklists</Text>
                <Text style={styles.metricNumber}>{stats.activePicklistsCount}</Text>
              </View>
              <MaterialIcons name="list-alt" size={24} color="#666" />
            </TouchableOpacity>

            <View style={styles.metricCard}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Total Sources</Text>
                <Text style={styles.metricNumber}>{stats.sourceCounts.length}</Text>
              </View>
              <MaterialIcons name="hub" size={24} color="#666" />
            </View>
          </View>
        </View>

        {/* Orders by Source Section */}
        {stats.sourceCounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orders by Source</Text>
            <View style={styles.sourcesGrid}>
              {stats.sourceCounts.map((sourceCount) => {
                const sourceInfo = getSourceInfo(sourceCount.name);
                return (
                  <TouchableOpacity
                    key={sourceCount.name}
                    style={styles.sourceCard}
                    onPress={() => navigateToOrders(sourceCount.name)}
                  >
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceLabel}>{sourceInfo.displayName}</Text>
                      <Text style={styles.sourceNumber}>{sourceCount.count}</Text>
                    </View>
                    <View style={styles.sourceIconContainer}>
                      {typeof sourceInfo.icon === 'string' ? (
                        <Text style={styles.sourceIcon}>{sourceInfo.icon}</Text>
                      ) : (
                        sourceInfo.icon
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}



        {/* QR Code Scanner Modal */}
        <QRCodeScanner
          visible={isScanning}
          onClose={stopScanning}
          onScan={handleScan}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    color: '#721c24',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  keyMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '22%',
    maxWidth: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#1a1a1a',
  },
  sourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sourceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    flex: 1,
    maxWidth: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceIconContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  sourceIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: '500',
    marginBottom: 4,
  },
  sourceNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  errorSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 8,
  },
  errorSourcesList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  errorSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  errorSourceText: {
    marginLeft: 8,
    color: '#721c24',
    fontSize: 14,
  },
  errorHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  actionIcon: {
    marginBottom: 8,
    selfAlign: 'center',
  },
});