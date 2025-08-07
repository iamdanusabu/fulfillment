import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { Sidebar } from '../src/shared/components/Sidebar';
import { Header } from '../src/shared/components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isTablet = width >= 768;

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showSidebarAndHeader = isAuthenticated && pathname !== '/login' && pathname !== '/';
  const showSidebar = showSidebarAndHeader && (sidebarOpen || isTablet);

  // Effect to handle sidebar visibility based on screen size
  useEffect(() => {
    const updateLayout = () => {
      const isLarge = window.innerWidth >= 768;
      // For large devices, start with sidebar open, for mobile start closed
      setSidebarOpen(isLarge);
    };

    if (typeof window !== 'undefined') {
      updateLayout();
      window.addEventListener('resize', updateLayout);
      return () => window.removeEventListener('resize', updateLayout);
    }
  }, []);


  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {showSidebarAndHeader && (
        <Header
            title="OrderUp"
            onMenuToggle={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
      )}

      <View style={styles.content}>
        {showSidebarAndHeader && (
          <Sidebar isOpen={showSidebar} onToggle={toggleSidebar} />
        )}

        <View style={[
          styles.mainContent,
          { flex: showSidebarAndHeader ? 1 : 1 }
        ]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="picklist" />
          </Stack>
        </View>
      </View>

      {showSidebar && !isTablet && (
        <View style={styles.overlay} onTouchEnd={toggleSidebar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
});