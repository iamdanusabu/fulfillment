
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

  // Effect to handle sidebar visibility based on screen size and orientation
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newWidth = window.width;
      const newHeight = window.height;
      const newIsTablet = newWidth >= 768;
      
      // On tablet, keep sidebar open; on mobile, close it by default
      if (newIsTablet) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    });

    // Initial setup - open sidebar on tablets, close on mobile
    setSidebarOpen(isTablet);

    return () => subscription?.remove();
  }, [isTablet]);

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
            marginLeft: showSidebarAndHeader && isTablet ? (sidebarCollapsed ? 60 : 250) : 0,
            transition: 'margin-left 0.3s ease-in-out',
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

      {showSidebar && isMobile && sidebarOpen && (
        <View style={styles.overlay} onTouchEnd={toggleSidebar} />
      )}
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
