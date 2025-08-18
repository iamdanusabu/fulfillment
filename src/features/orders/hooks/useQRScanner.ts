
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ordersApi } from '../api/ordersApi';

export function useQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleScan = async (scannedData: string) => {
    setIsLoading(true);
    
    try {
      // Extract order number from scanned data
      // The scanned data might be a direct order number or contain it
      let orderNumber = scannedData.trim();
      
      // If it's a URL or contains additional data, try to extract order number
      if (orderNumber.includes('order')) {
        const matches = orderNumber.match(/order[^\d]*(\d+)/i);
        if (matches && matches[1]) {
          orderNumber = matches[1];
        }
      }
      
      // If it looks like a pure number, use it directly
      if (!/^\d+$/.test(orderNumber)) {
        // Try to find any number in the scanned data
        const numberMatch = orderNumber.match(/\d+/);
        if (numberMatch) {
          orderNumber = numberMatch[0];
        } else {
          throw new Error('No valid order number found in QR code');
        }
      }

      // Try to fetch the order to validate it exists
      const order = await ordersApi.getOrderById(orderNumber);
      
      if (order) {
        // Navigate to order details
        router.push(`/orders/${orderNumber}`);
      } else {
        throw new Error('Order not found');
      }
      
    } catch (error) {
      console.error('QR scan error:', error);
      
      let errorMessage = 'Failed to find order';
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404')) {
          errorMessage = 'Order not found. Please check the QR code and try again.';
        } else if (error.message.includes('No valid order number')) {
          errorMessage = 'Invalid QR code. Please scan a valid order QR code.';
        } else {
          errorMessage = 'Failed to process QR code. Please try again.';
        }
      }
      
      Alert.alert('QR Code Error', errorMessage, [
        {
          text: 'Try Again',
          onPress: () => setIsScanning(true),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isScanning,
    isLoading,
    startScanning,
    stopScanning,
    handleScan,
  };
}
