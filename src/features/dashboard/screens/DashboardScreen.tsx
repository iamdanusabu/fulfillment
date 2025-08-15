
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

interface FilterSettings {
  sources: string[];
  statuses: string[];
  paymentStatuses: string[];
}

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

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setStats(prev => ({ ...prev, loading: true, error: null }));
      }

      const [sourceCounts, readyForPickupCount, activePicklistsCount, totalOrdersCount] = await Promise.all([
        loadSourceCounts(),
        loadReadyForPickupCount(),
        loadActivePicklistsCount(),
        loadTotalOrdersCount(),
      ]);

      setStats({
        sourceCounts,
        readyForPickupCount,
        activePicklistsCount,
        totalOrdersCount,
        loading: false,
        error: null,
      });
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
      const savedSettings = await AsyncStorage.getItem("orderFilterSettings");
      let sources: string[] = [];

      if (savedSettings) {
        const settings: FilterSettings = JSON.parse(savedSettings);
        sources = settings.sources;
      } else {
        sources = [
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
      }

      const config = getConfig();
      const countPromises = sources.map(async (source) => {
        try {
          const url = `${config.endpoints.orders}?source=${encodeURIComponent(source)}&pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
          const response = await fetchWithToken(url);
          return {
            name: source,
            count: response?.totalRecords || 0,
            error: false,
          };
        } catch (error) {
          // Handle 404 and other "no orders" scenarios as 0 count, not an error
          if (error instanceof Error && (error.message.includes('404') || error.message.includes('No orders found'))) {
            return {
              name: source,
              count: 0,
              error: false,
            };
          }
          // Only treat other errors as actual errors
          console.error(`Failed to get count for source ${source}:`, error);
          return {
            name: source,
            count: 0,
            error: true,
          };
        }
      });

      return await Promise.all(countPromises);
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
      const savedSettings = await AsyncStorage.getItem("orderFilterSettings");
      let sources: string[] = [];

      if (savedSettings) {
        const settings: FilterSettings = JSON.parse(savedSettings);
        sources = settings.sources;
      } else {
        sources = [
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
      }

      const config = getConfig();
      const sourceParam = sources.join(",");
      const url = `${config.endpoints.orders}?pageNo=1&pageSize=20&hasFulfilmentJob=true&expand=item%2Cbin%2Clocation_hint%2Cpayment&pagination=true&source=${encodeURIComponent(sourceParam)}&status=Ready&paymentStatus=PAID%2CUNPAID`;
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
      'Shopify': { displayName: 'Shopify', icon: <ShopifyIcon width={20} height={20} /> },
      'bigcommerce': { displayName: 'BigCommerce', icon: <BigCommerceIcon width={20} height={20} /> },
      'Breakaway': { displayName: 'Breakaway', icon: '🏃' },
      'Ecwid': { displayName: 'Ecwid', icon: <EcwidIcon width={20} height={20} /> },
      'PHONE ORDER': { displayName: 'Phone Order', icon: '📞' },
      'DELIVERY': { displayName: 'Delivery', icon: '🚚' },
      'BAR TAB': { displayName: 'Bar Tab', icon: '🍺' },
      'TIKT': { displayName: 'TIKT', icon: '🎫' },
      'TABLE': { displayName: 'Table', icon: '🍽️' },
      'OTHER': { displayName: 'Other', icon: '📦' },
      'MANUAL': { displayName: 'Manual', icon: '✏️' },
      'FanVista': { displayName: 'FanVista', icon: '📱' },
      'QSR': { displayName: 'QSR', icon: '🍔' },
      'Tapin2': { displayName: 'Tapin2', icon: '💳' },
    };
    
    return sourceMap[sourceName] || { displayName: sourceName, icon: '📦' };
  };

  if (stats.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const workingSources = stats.sourceCounts.filter(source => !source.error);
  const errorSources = stats.sourceCounts.filter(source => source.error);

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
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={[
            styles.keyMetricsContainer,
            { flexDirection: isTablet || isLandscape ? 'row' : 'column' }
          ]}>
            <TouchableOpacity
              style={[styles.keyMetricCard, styles.totalOrdersCard, isTablet || isLandscape ? { flex: 1 } : {}]}
              onPress={() => navigateToOrders()}
            >
              <MaterialIcons name="shopping-cart" size={32} color="#fff" />
              <View style={styles.metricContent}>
                <Text style={styles.metricNumber}>{stats.totalOrdersCount}</Text>
                <Text style={styles.metricLabel}>Total Orders</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyMetricCard, styles.readyForPickupCard, isTablet || isLandscape ? { flex: 1 } : {}]}
              onPress={() => router.push('/orders?hasFulfilmentJob=true&status=Ready')}
            >
              <MaterialIcons name="local-shipping" size={32} color="#fff" />
              <View style={styles.metricContent}>
                <Text style={styles.metricNumber}>{stats.readyForPickupCount}</Text>
                <Text style={styles.metricLabel}>Ready for Pickup</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyMetricCard, styles.activePicklistsCard, isTablet || isLandscape ? { flex: 1 } : {}]}
              onPress={() => router.push('/picklist')}
            >
              <MaterialIcons name="inventory" size={32} color="#fff" />
              <View style={styles.metricContent}>
                <Text style={styles.metricNumber}>{stats.activePicklistsCount}</Text>
                <Text style={styles.metricLabel}>Active Picklists</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders by Source Section */}
        {workingSources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orders by Source</Text>
            <View style={styles.sourcesGrid}>
              {workingSources.map((sourceCount) => {
                const sourceInfo = getSourceInfo(sourceCount.name);
                return (
                  <TouchableOpacity
                    key={sourceCount.name}
                    style={styles.sourceCard}
                    onPress={() => navigateToOrders(sourceCount.name)}
                  >
                    <View style={styles.sourceHeader}>
                      <View style={styles.sourceIconContainer}>
                        {typeof sourceInfo.icon === 'string' ? (
                          <Text style={styles.sourceIcon}>{sourceInfo.icon}</Text>
                        ) : (
                          sourceInfo.icon
                        )}
                      </View>
                      <Text style={styles.sourceNumber}>{sourceCount.count}</Text>
                    </View>
                    <Text style={styles.sourceLabel}>{sourceInfo.displayName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Connection Issues Section */}
        {errorSources.length > 0 && (
          <View style={styles.section}>
            <View style={styles.errorSectionHeader}>
              <MaterialIcons name="warning" size={20} color="#ffc107" />
              <Text style={styles.errorSectionTitle}>Connection Issues</Text>
            </View>
            <View style={styles.errorSourcesList}>
              {errorSources.map((source) => (
                <View key={source.name} style={styles.errorSourceItem}>
                  <MaterialIcons name="error-outline" size={16} color="#dc3545" />
                  <Text style={styles.errorSourceText}>{source.name}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.errorHint}>
              These sources couldn't be loaded. Pull to refresh to try again.
            </Text>
          </View>
        )}

        {/* Bottom Section with Quick Order Lookup and Quick Actions */}
        <View style={[
          styles.bottomSection,
          { flexDirection: isTablet || isLandscape ? 'row' : 'column' }
        ]}>
          {/* Quick Order Lookup */}
          <View style={[styles.quickSection, isTablet || isLandscape ? { flex: 1, marginRight: 16 } : {}]}>
            <Text style={styles.sectionTitle}>Quick Order Lookup</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={startScanning}
            >
              <MaterialIcons name="qr-code-scanner" size={24} color="#007AFF" />
              <Text style={styles.scanButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={[styles.quickSection, isTablet || isLandscape ? { flex: 1 } : {}]}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, { flex: 1, marginRight: 8 }]}
                onPress={() => router.push('/orders')}
              >
                <MaterialIcons name="receipt-long" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>View Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { flex: 1, marginLeft: 8 }]}
                onPress={() => router.push('/picklist')}
              >
                <MaterialIcons name="list-alt" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Manage Picklists</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  keyMetricsContainer: {
    gap: 12,
  },
  keyMetricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalOrdersCard: {
    backgroundColor: '#4F83FD',
  },
  readyForPickupCard: {
    backgroundColor: '#47B881',
  },
  activePicklistsCard: {
    backgroundColor: '#57C4C4',
  },
  metricContent: {
    marginLeft: 16,
    flex: 1,
  },
  metricNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: '#fff',
    lineHeight: 38,
  },
  metricLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    opacity: 0.9,
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceIcon: {
    fontSize: 20,
  },
  sourceNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  sourceLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: '500',
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
  bottomSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    gap: 16,
  },
  quickSection: {
    marginBottom: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8f2ff',
    borderStyle: 'dashed',
  },
  scanButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 0,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
