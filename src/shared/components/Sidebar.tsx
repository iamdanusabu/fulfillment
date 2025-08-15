import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isMobile = width < 768;
  const sidebarWidth = isTablet ? 250 : 200;
  const collapsedWidth = 60;

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
    // Keep sidebar open after navigation for better UX
    // Users can manually toggle it if needed
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('token_expires_in');
    router.replace('/login');
  };

  // Always render sidebar, but show collapsed version when not open
  const currentWidth = isOpen ? sidebarWidth : collapsedWidth;
  const showLabels = isOpen;

  return (
    <View style={[
      styles.sidebar, 
      { 
        width: currentWidth,
        position: 'relative',
        zIndex: 1,
        height: '100%',
        top: 0,
        left: 0,
      }
    ]}>
      <View style={styles.menuItems}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem, 
              !showLabels && styles.menuItemCollapsed,
              item.isActive && styles.activeMenuItem
            ]}
            onPress={() => handleNavigation(item.route)}
          >
            <MaterialIcons 
              name={item.icon as any} 
              size={24} 
              color={item.isActive ? '#007AFF' : '#666'} 
            />
            {showLabels && (
              <Text style={[styles.menuText, item.isActive && styles.activeMenuText]}>
                {item.title}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.bottomSection, !showLabels && styles.bottomSectionCollapsed]}>
        <TouchableOpacity 
          style={[styles.logoutButton, !showLabels && styles.logoutButtonCollapsed]} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#dc3545" />
          {showLabels && <Text style={styles.logoutText}>Logout</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    paddingVertical: 20,
    justifyContent: 'space-between',
    position: 'relative',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
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
  menuItemCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
    marginHorizontal: 8,
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
  bottomSectionCollapsed: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  logoutButtonCollapsed: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  logoutText: {
    marginLeft: 8,
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});