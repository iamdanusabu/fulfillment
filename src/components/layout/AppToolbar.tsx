
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTabTitle } from './useTabTitle';

interface AppToolbarProps {
  title?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function AppToolbar({ title, onMenuToggle, showMenuButton = true }: AppToolbarProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { tabTitle } = useTabTitle();
  const displayTitle = title || tabTitle || 'OrderUp';

  return (
    <View style={styles.toolbar}>
      <View style={styles.leftSection}>
        {showMenuButton && !isTablet && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuToggle}>
            <MaterialIcons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{displayTitle}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="notifications" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="account-circle" size={24} color="#666" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  title: {
    fontSize: 20,
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
});
