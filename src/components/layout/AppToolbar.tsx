
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
  const { width, height } = useWindowDimensions();
  const { tabTitle } = useTabTitle();

  const isLandscape = width > height;
  const isTablet = width >= 768 || (isLandscape && width >= 600);
  const isSmallMobile = width < 480;

  const displayTitle = title || tabTitle || 'OrderUp';

  

  return (
    <View style={[
      styles.toolbar,
      {
        paddingHorizontal: isSmallMobile ? 12 : 16,
        paddingVertical: isLandscape && !isTablet ? 8 : 12,
      }
    ]}>
      <View style={styles.leftSection}>
        {showMenuButton && (
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
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}>
          <MaterialIcons name="notifications" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}>
          <MaterialIcons name="account-circle" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
      </View></div>
      
      
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
  
});
