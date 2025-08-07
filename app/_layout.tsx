
import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Sidebar } from '../src/shared/components/Sidebar';
import { Header } from '../src/shared/components/Header';

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <View style={styles.container}>
      <Header title="OrderUp" onMenuToggle={toggleSidebar} />
      
      <View style={styles.content}>
        <Sidebar isOpen={sidebarOpen || isTablet} onToggle={toggleSidebar} />
        
        <View style={[
          styles.mainContent,
          { marginLeft: (sidebarOpen || isTablet) ? 0 : 0 }
        ]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="picklist" />
          </Stack>
        </View>
      </View>
      
      {sidebarOpen && !isTablet && (
        <View style={styles.overlay} onTouchEnd={toggleSidebar} />
      )}
    </View>
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
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
