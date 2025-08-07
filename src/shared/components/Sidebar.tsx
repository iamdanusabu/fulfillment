
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { id: 'orders', title: 'Orders', icon: 'list-alt', route: '/orders' },
    { id: 'picklist', title: 'Picklist', icon: 'inventory', route: '/picklist' },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
    if (!isTablet) {
      onToggle();
    }
  };

  return (
    <View style={[
      styles.sidebar,
      { width: isOpen || isTablet ? (isTablet ? 250 : 200) : 0 },
      !isTablet && styles.mobileSidebar
    ]}>
      {(isOpen || isTablet) && (
        <View style={styles.sidebarContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            {!isTablet && (
              <TouchableOpacity onPress={onToggle} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                pathname === item.route && styles.activeMenuItem
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <MaterialIcons 
                name={item.icon as any} 
                size={24} 
                color={pathname === item.route ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.menuText,
                pathname === item.route && styles.activeMenuText
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    overflow: 'hidden',
  },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: '#e3f2fd',
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
