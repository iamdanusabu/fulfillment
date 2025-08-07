
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

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
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
    if (window?.innerWidth && window.innerWidth < 768) {
      onToggle();
    }
  };

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
});
