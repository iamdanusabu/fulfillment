
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Dimensions } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { Sidebar } from '../shared/components/Sidebar';
import { AppToolbar } from '../components/layout/AppToolbar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StoreProvider } from '../contexts/StoreContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RootLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();
  
  // More sophisticated responsive breakpoints
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isMobile = width < 768;
  const isSmallMobile = width < 480;

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

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Always show sidebar and header when authenticated, except on login page
  const showSidebarAndHeader = isAuthenticated && pathname !== '/login' && pathname !== '/';
  // On tablets, sidebar is always open; on mobile, it can be toggled
  const showSidebar = showSidebarAndHeader && (isTablet || sidebarOpen);
  
  // Force re-render when dimensions change to fix Android rendering issues
  const screenKey = `${width}x${height}-${isTablet}-${isLandscape}`;

  // Effect to handle initial sidebar state based on screen size
  useEffect(() => {
    // Only set initial state, don't change on subsequent dimension changes
    if (isTablet) {
      setSidebarOpen(true);
    }
  }, []); // Empty dependency array - only run on mount

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container} key={screenKey}>
      {showSidebarAndHeader && (
        <AppToolbar
          onMenuToggle={toggleSidebar}
          showMenuButton={isMobile}
        />
      )}

      <View style={styles.content}>
        {showSidebarAndHeader && (
          <Sidebar 
            isOpen={showSidebar} 
            onToggle={toggleSidebar}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        )}

        <View style={[
          styles.mainContent,
          {
            flex: 1,
            paddingHorizontal: isSmallMobile ? 8 : 16,
            paddingVertical: isLandscape && isMobile ? 8 : 16,
          }
        ]}>
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              backgroundColor: '#f8f9fa',
              paddingHorizontal: isSmallMobile ? 4 : 0,
            }
          }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="picklist" />
            <Stack.Screen name="settings" />
          </Stack>
        </View>
      </View>

      
    </View>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </StoreProvider>
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
    minHeight: 0, // Helps with flex layout in landscape
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
