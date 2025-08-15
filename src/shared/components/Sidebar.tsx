import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderUpLogo } from './OrderUpLogo';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onToggle, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const sidebarWidth = isTablet ? (isCollapsed ? 60 : 250) : 200;

  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: 'dashboard', 
      route: '/dashboard',
      isActive: pathname === '/dashboard'
    },
    { 
      title: 'Orders', 
      icon: 'receipt-long', 
      route: '/orders',
      isActive: pathname === '/orders' || pathname.startsWith('/orders/')
    },
    { 
      title: 'Picklists', 
      icon: 'inventory', 
      route: '/picklist/',
      isActive: pathname.startsWith('/picklist')
    },
    { 
      title: 'Settings', 
      icon: 'settings', 
      route: '/settings',
      isActive: pathname === '/settings'
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
    // Auto-close on mobile only
    if (!isTablet) {
      onToggle();
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('token_expires_in');
    router.replace('/login');
  };

  // Always render sidebar container, but control visibility with styles
  // This ensures proper layout calculation on all devices

  return (
    <View style={[
      styles.sidebar, 
      { 
        width: isOpen ? sidebarWidth : 0,
        minWidth: isOpen ? sidebarWidth : 0,
        maxWidth: isOpen ? sidebarWidth : 0,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        flexShrink: 0, // Prevents sidebar from shrinking
      }
    ]}>
      <View style={[
        styles.sidebarContent,
        { 
          width: sidebarWidth,
          opacity: isOpen ? 1 : 0,
        }
      ]}>
        {/* Header with Logo and Collapse Button */}
        <View style={styles.headerSection}>
          <View style={styles.brandingContainer}>
            <OrderUpLogo size={32} />
            {(!isCollapsed || !isTablet) && (
              <Text style={styles.brandingText}>OrderUp</Text>
            )}
          </View>
          {isTablet && (
            <TouchableOpacity 
              style={styles.collapseButton} 
              onPress={onToggleCollapse}
            >
              <MaterialIcons 
                name={isCollapsed ? "chevron-right" : "chevron-left"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          )}
        </View>

      <View style={styles.menuItems}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem, 
              item.isActive && styles.activeMenuItem,
              isCollapsed && isTablet && styles.collapsedMenuItem
            ]}
            onPress={() => handleNavigation(item.route)}
          >
            <MaterialIcons 
              name={item.icon as any} 
              size={24} 
              color={item.isActive ? '#007AFF' : '#666'} 
            />
            {(!isCollapsed || !isTablet) && (
              <Text style={[styles.menuText, item.isActive && styles.activeMenuText]}>
                {item.title}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.bottomSection, isCollapsed && isTablet && styles.collapsedBottomSection]}>
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            isCollapsed && isTablet && styles.collapsedLogoutButton
          ]} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#dc3545" />
          {(!isCollapsed || !isTablet) && (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    transition: 'width 0.3s ease-in-out',
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    transition: 'opacity 0.3s ease-in-out',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandingText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  collapseButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 6,
  },
  collapsedMenuItem: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  activeMenuItem: {
    backgroundColor: '#f0f8ff',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  activeMenuText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  collapsedBottomSection: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  collapsedLogoutButton: {
    paddingHorizontal: 10,
    minWidth: 40,
  },
  logoutText: {
    marginLeft: 8,
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});