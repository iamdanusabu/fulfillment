import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { useTabTitle } from './useTabTitle';

interface AppToolbarProps {
  title?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  onQRScan?: () => void;
}

export function AppToolbar({ title, onMenuToggle, showMenuButton = true, onQRScan }: AppToolbarProps) {
  const { width, height } = useWindowDimensions();
  const { tabTitle } = useTabTitle();
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  const isLandscape = width > height;
  const isTablet = width >= 768 || (isLandscape && width >= 600);
  const isSmallMobile = width < 480;

  // Determine if we should show a back button
  const showBackButton = pathname !== '/dashboard' && pathname !== '/orders' && pathname !== '/picklist' && pathname !== '/settings';

  // Get page-specific actions - keep all navigation buttons
  const getPageActions = () => {
    const actions = [];
    
    // Add QR scanner button for order lookup on dashboard and orders pages
    if (pathname === '/orders' || pathname === '/dashboard') {
      actions.push(
        <TouchableOpacity 
          key="qr-scanner"
          style={[styles.iconButton, isSmallMobile && styles.smallIconButton]} 
          onPress={onQRScan}
        >
          <MaterialIcons name="qr-code-scanner" size={isSmallMobile ? 20 : 24} color="#007AFF" />
        </TouchableOpacity>
      );
    }

    // Add refresh button on dashboard
    if (pathname === '/dashboard') {
      actions.push(
        <TouchableOpacity 
          key="refresh"
          style={[styles.iconButton, isSmallMobile && styles.smallIconButton]} 
          onPress={() => window.location.reload()}
        >
          <MaterialIcons name="refresh" size={isSmallMobile ? 20 : 24} color="#007AFF" />
        </TouchableOpacity>
      );
    }

    // Add create picklist button on picklist page
    if (pathname === '/picklist') {
      actions.push(
        <TouchableOpacity 
          key="create-picklist"
          style={styles.actionButton} 
          onPress={() => router.push('/orders?mode=picklist')}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Create</Text>
        </TouchableOpacity>
      );
    }

    // Add filter/search buttons on orders page
    if (pathname === '/orders') {
      actions.push(
        <TouchableOpacity 
          key="filter"
          style={[styles.iconButton, isSmallMobile && styles.smallIconButton]} 
          onPress={() => {/* Add filter functionality */}}
        >
          <MaterialIcons name="filter-list" size={isSmallMobile ? 20 : 24} color="#007AFF" />
        </TouchableOpacity>
      );
    }

    return actions.length > 0 ? actions : null;
  };

  // Dynamic title based on route and params
  const getDynamicTitle = () => {
    if (pathname === '/dashboard') {
      return 'Dashboard';
    }
    if (pathname === '/orders' && params.mode === 'picklist') {
      return 'Select Orders for Picklist';
    }
    if (pathname === '/orders' && !params.mode) {
      return 'Orders';
    }
    if (pathname === '/orders/[orderId]') {
      return 'Order Details';
    }
    if (pathname === '/picklist' && !pathname.includes('/create') && !pathname.includes('/location') && !pathname.includes('/packing')) {
      return 'Picklist';
    }
    if (pathname === '/picklist/create') {
      return params.fulfillmentId ? 'Update Picklist' : 'Create Picklist';
    }
    if (pathname === '/picklist/location-selection') {
      return 'Select Location';
    }
    if (pathname === '/picklist/packing') {
      return 'Packing';
    }
    if (pathname === '/settings') {
      return 'Settings';
    }
    // Fallback to existing title logic
    const displayTitle = title || tabTitle || 'OrderUp';
    return displayTitle;
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <View style={[
      styles.toolbar,
      {
        paddingHorizontal: isSmallMobile ? 12 : 16,
        paddingVertical: isLandscape && !isTablet ? 8 : 12,
      }
    ]}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : showMenuButton && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuToggle}>
            <MaterialIcons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
      </View>

      <View style={styles.rightSection}>
        {getPageActions()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1000,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  smallIconButton: {
    padding: 6,
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
});