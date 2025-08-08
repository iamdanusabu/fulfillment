import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithToken } from "../../../shared/services/fetchWithToken";
import { getConfig } from "../../../environments";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [activePicklistsCount, setActivePicklistsCount] = useState(0);
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
        loadReadyForPickupCount(),
        loadActivePicklistsCount(),
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceCounts = async () => {
    try {
      // Get sources from settings
      const savedSettings = await AsyncStorage.getItem("orderFilterSettings");
      let sources: string[] = [];

      if (savedSettings) {
        const settings: FilterSettings = JSON.parse(savedSettings);
        sources = settings.sources;
      } else {
        // Default sources if no settings found
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

      // Get count for each source
      const config = getConfig();
      const countPromises = sources.map(async (source) => {
        try {
          const url = `${config.endpoints.orders}?source=${encodeURIComponent(source)}&pageNo=1&pageSize=1&hasFulfilmentJob=false&pagination=true`;
          const response = await fetchWithToken(url);
          return {
            name: source,
            count: response?.totalRecords || 0,
          };
        } catch (error) {
          console.error(`Failed to get count for source ${source}:`, error);
          return {
            name: source,
            count: 0,
          };
        }
      });

      const counts = await Promise.all(countPromises);
      setSourceCounts(counts);
    } catch (error) {
      console.error("Failed to load source counts:", error);
    }
  };

  const loadReadyForPickupCount = async () => {
    try {
      // Get sources from settings to use in the API call
      const savedSettings = await AsyncStorage.getItem("orderFilterSettings");
      let sources: string[] = [];

      if (savedSettings) {
        const settings: FilterSettings = JSON.parse(savedSettings);
        sources = settings.sources;
      } else {
        // Default sources if no settings found
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
      const url = `${config.endpoints.orders}?pageNo=1&pageSize=1&hasFulfilmentJob=true&expand=item,bin,location_hint,payment&pagination=true&source=${encodeURIComponent(sourceParam)}&status=Ready&paymentStatus=PAID,UNPAID`;
      const response = await fetchWithToken(url);
      setReadyForPickupCount(response?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to load ready for pickup count:", error);
      setReadyForPickupCount(0);
    }
  };

  const loadActivePicklistsCount = async () => {
    try {
      const config = getConfig();
      // Call the fulfillments endpoint to get active picklists
      const url = `${config.endpoints.inventoryFulfillments}?status=OPEN&pageNo=1&pageSize=1&pagination=true`;
      const response = await fetchWithToken(url);
      setActivePicklistsCount(response?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to load active picklists count:", error);
      setActivePicklistsCount(0);
    }
  };

  const navigateToOrders = (source?: string) => {
    const route = source ? `/orders?source=${source}` : "/orders";
    router.push(route);
  };

  const navigateToPicklists = () => {
    router.push("/picklist");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Quick Stats Overview */}
      <View style={styles.quickStatsContainer}>
        <TouchableOpacity
          style={[styles.quickStatCard, styles.readyForPickupCard]}
          onPress={() => router.push('/orders?status=Ready&hasFulfilmentJob=true')}
        >
          <MaterialIcons
            name="assignment-turned-in"
            size={32}
            color="#28a745"
          />
          <Text style={styles.quickStatNumber}>{readyForPickupCount}</Text>
          <Text style={styles.quickStatLabel}>Ready for Pickup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickStatCard, styles.activePicklistsCard]}
          onPress={navigateToPicklists}
        >
          <MaterialIcons name="list-alt" size={32} color="#007AFF" />
          <Text style={styles.quickStatNumber}>{activePicklistsCount}</Text>
          <Text style={styles.quickStatLabel}>Active Picklists</Text>
        </TouchableOpacity>
      </View>

      {/* Orders by Source Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="store" size={24} color="#333" />
          <Text style={styles.sectionTitle}>Orders by Source</Text>
        </View>

        <View style={styles.sourceGrid}>
          {sourceCounts.map((sourceCount) => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  readyForPickupCard: {
    borderLeftColor: "#28a745",
  },
  activePicklistsCard: {
    borderLeftColor: "#007AFF",
  },
  quickStatNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  sourceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sourceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    minWidth: 110,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sourceNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  sourceLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
});
