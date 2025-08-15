import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Dimensions } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { Sidebar } from '../shared/components/Sidebar';
import { AppToolbar } from '../components/layout/AppToolbar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StoreProvider } from '../contexts/StoreContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from '../features/orders/components/QRCodeScanner';


function RootLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
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

  // Function to toggle QR scanner visibility
  const toggleQRScanner = () => {
    setShowQRScanner(!showQRScanner);
  };

  // Handler for when QR scanner is closed
  const handleQRClose = () => {
    setShowQRScanner(false);
  };

  // Handler for when a QR code result is obtained
  const handleQRResult = (result) => {
    if (result) {
      // Navigate or process the scanned data
      if (result.startsWith('http')) {
        router.push(result); // Example: Navigate to a URL
      } else {
        // Handle other types of data, e.g., product IDs
        console.log('Scanned data:', result);
        // Example: navigate to a product detail page if result is a product ID
        // router.push(`/products/${result}`);
      }
    }
    setShowQRScanner(false); // Close scanner after processing
  };

  // Always show sidebar and header when authenticated, except on login page
  const showSidebarAndHeader = isAuthenticated && pathname !== '/login' && pathname !== '/';
  // On tablets, sidebar is always open; on mobile, it can be toggled
  const showSidebar = showSidebarAndHeader && (isTablet || sidebarOpen);

  // Force re-render when dimensions change to fix Android rendering issues
  const screenKey = `${width}x${height}-${isTablet}-${isLandscape}`;

  // Effect to handle sidebar visibility based on screen size and orientation
  useEffect(() => {
    let previousIsTablet = isTablet;

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newWidth = window.width;
      const newHeight = window.height;
      const newIsTablet = newWidth >= 768;

      // Only adjust sidebar state if device type actually changed (mobile <-> tablet)
      if (newIsTablet !== previousIsTablet) {
        setSidebarOpen(newIsTablet);
        previousIsTablet = newIsTablet;
      }
      // If staying on same device type, preserve current sidebar state
    });

    return () => subscription?.remove();
  }, []);

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container} key={screenKey}>
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
          styles.rightContent,
          {
            flex: 1,
            minWidth: 0, // Prevents flex child from overflowing
          }
        ]}>
          {/* Toolbar positioned to the right of sidebar */}
          {showSidebarAndHeader && (
            <AppToolbar
              onMenuToggle={toggleSidebar}
              showMenuButton={isMobile}
              onScanPress={toggleQRScanner}
            />
          )}

          <View style={[
            styles.mainContent,
            {
              flex: 1,
              paddingHorizontal: isSmallMobile ? 8 : 16,
              paddingVertical: isLandscape && isMobile ? 8 : 16,
              minWidth: 0, // Prevents flex child from overflowing
              position: 'relative',
            }
          ]}>
            <Stack screenOptions={{
              headerShown: false,
              animation: 'none',
              animationDuration: 0,
              contentStyle: {
                backgroundColor: '#f8f9fa',
                paddingHorizontal: isSmallMobile ? 4 : 0,
                flex: 1,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
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

      {showQRScanner && (
        <QRCodeScanner
          onClose={handleQRClose}
          onResult={handleQRResult}
        />
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
    overflow: 'hidden', // Prevents content from overflowing container
    width: '100%',
    height: '100%',
  },
  rightContent: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    minHeight: 0, // Helps with flex layout in landscape
    minWidth: 0, // Prevents flex child from overflowing parent
    maxWidth: '100%', // Ensures content never exceeds container width
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