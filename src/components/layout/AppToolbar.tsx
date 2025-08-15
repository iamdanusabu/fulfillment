
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTabTitle } from './useTabTitle';
import { useRouter, usePathname } from 'expo-router';

interface AppToolbarProps {
  title?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function AppToolbar({ title, onMenuToggle, showMenuButton = true }: AppToolbarProps) {
  const { width, height } = useWindowDimensions();
  const { tabTitle } = useTabTitle();
  const router = useRouter();
  const pathname = usePathname();

  const isLandscape = width > height;
  const isTablet = width >= 768 || (isLandscape && width >= 600);
  const isSmallMobile = width < 480;

  const displayTitle = title || tabTitle || 'OrderUp';

  // Determine if we should show a back button
  const showBackButton = pathname !== '/dashboard' && pathname !== '/orders' && pathname !== '/picklist' && pathname !== '/settings';

  // Get page-specific actions
  const getPageActions = () => {
    if (pathname === '/dashboard') {
      return (
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]} onPress={() => window.location.reload()}>
          <MaterialIcons name="refresh" size={isSmallMobile ? 20 : 24} color="#007AFF" />
        </TouchableOpacity>
      );
    }
    
    if (pathname === '/picklist') {
      return (
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/orders?mode=picklist')}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Create</Text>
        </TouchableOpacity>
      );
    }

    return null;
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : showMenuButton && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuToggle}>
            <MaterialIcons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={[
          styles.title,
          {
            fontSize: isSmallMobile ? 18 : isLandscape && !isTablet ? 20 : 24,
          }
        ]}>
          {displayTitle}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        {getPageActions()}
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}>
          <MaterialIcons name="notifications" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}>
          <MaterialIcons name="account-circle" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
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
