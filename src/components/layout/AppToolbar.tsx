
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTabTitle } from './useTabTitle';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';

interface AppToolbarProps {
  title?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function AppToolbar({ title, onMenuToggle, showMenuButton = true }: AppToolbarProps) {
  const { width, height } = useWindowDimensions();
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { tabTitle } = useTabTitle();

  const isLandscape = width > height;
  const isTablet = width >= 768 || (isLandscape && width >= 600);
  const isSmallMobile = width < 480;

  const displayTitle = title || tabTitle || 'OrderUp';

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const handleQRPress = async () => {
    if (hasPermission === null) {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
        return;
      }
    } else if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes');
      return;
    }
    
    setScanned(false);
    setShowScanner(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setShowScanner(false);
    
    // Extract order ID from QR code data
    let orderId = data;
    
    // If it's a URL, extract the order ID
    if (data.includes('/orders/')) {
      const parts = data.split('/orders/');
      if (parts.length > 1) {
        orderId = parts[1].split('?')[0].split('/')[0];
      }
    }
    
    if (orderId) {
      // Navigate to order detail screen
      router.push(`/orders/${orderId}`);
    } else {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid order ID');
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
        {showMenuButton && !isTablet && (
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
        <TouchableOpacity 
          style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}
          onPress={handleQRPress}
        >
          <MaterialIcons name="qr-code-scanner" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}>
          <MaterialIcons name="notifications" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, isSmallMobile && styles.smallIconButton]}>
          <MaterialIcons name="account-circle" size={isSmallMobile ? 20 : 24} color="#666" />
        </TouchableOpacity>
      </View>
      
      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowScanner(false)}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Order QR Code</Text>
          </View>
          
          {hasPermission && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.scanner}
            />
          )}
          
          <View style={styles.scannerInstructions}>
            <Text style={styles.instructionText}>
              Position the QR code within the frame to scan
            </Text>
            {scanned && (
              <TouchableOpacity 
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  scannerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40, // Offset for close button
  },
  scanner: {
    flex: 1,
  },
  scannerInstructions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  scanAgainButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
