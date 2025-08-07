import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      isActive: pathname === '/settings' || pathname.startsWith('/settings/')
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
    // Auto-close sidebar after navigation on all devices
    onToggle();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('token_expires_in');
    router.replace('/login');
  };

  // Don't render sidebar when closed
  if (!isOpen) return null;

  return (
    <View style={styles.sidebar}>
      <View style={styles.menuItems}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.menuItem, item.isActive && styles.activeMenuItem]}
            onPress={() => handleNavigation(item.route)}
          >
            <MaterialIcons 
              name={item.icon as any} 
              size={24} 
              color={item.isActive ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.menuText, item.isActive && styles.activeMenuText]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#dc3545" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    paddingVertical: 20,
    justifyContent: 'space-between',
    position: 'relative',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  logoutText: {
    marginLeft: 8,
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});