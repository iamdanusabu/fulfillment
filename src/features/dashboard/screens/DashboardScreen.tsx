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
  const isSmallMobile = width < 400;

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
          // 404 means no orders for this source, not an error
          if (error instanceof Error && error.message.includes('404')) {
            return {
              name: source,
              count: 0,
              error: false,
            };
          }
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

        {/* Quick Order Lookup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Order Lookup</Text>
          <TouchableOpacity
            style={styles.qrScanCard}
            onPress={startScanning}
          >
            <View style={styles.qrIconContainer}>
              <MaterialIcons name="qr-code-scanner" size={24} color="#007AFF" />
            </View>
            <View style={styles.qrScanContent}>
              <Text style={styles.qrScanTitle}>Scan QR Code</Text>
              <Text style={styles.qrScanSubtitle}>Quickly find an order by scanning its QR code</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.viewOrdersButton]}
              onPress={() => router.push('/orders')}
            >
              <MaterialIcons name="receipt-long" size={24} color="#fff" />
              <Text style={styles.quickActionButtonText}>View Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.managePicklistsButton]}
              onPress={() => router.push('/picklist')}
            >
              <MaterialIcons name="list-alt" size={24} color="#fff" />
              <Text style={styles.quickActionButtonText}>Manage Picklists</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Sources Section */}
        {workingSources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orders by Source</Text>
            <View style={styles.sourcesGrid}>
              {workingSources.map((sourceCount) => (
                <TouchableOpacity
                  key={sourceCount.name}
                  style={styles.sourceCard}
                  onPress={() => navigateToOrders(sourceCount.name)}
                >
                  <Text style={styles.sourceNumber}>{sourceCount.count}</Text>
                  <Text style={styles.sourceLabel}>{sourceCount.name}</Text>
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f8f9fa',
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
    marginHorizontal: 16,
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
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  qrScanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qrIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  qrScanContent: {
    flex: 1,
  },
  qrScanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  qrScanSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewOrdersButton: {
    backgroundColor: '#007AFF',
  },
  managePicklistsButton: {
    backgroundColor: '#007AFF',
  },
  quickActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  sourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sourceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    minWidth: 100,
    flex: 1,
    maxWidth: '48%',
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sourceNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  sourceLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
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
});