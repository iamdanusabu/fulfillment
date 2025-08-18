
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
          throw new Error('INVALID_QR_CODE');
        }
      }

      // Validate that we have a reasonable order number (not too short/long)
      if (orderNumber.length < 1 || orderNumber.length > 20) {
        throw new Error('INVALID_ORDER_ID');
      }

      // Try to fetch the order to validate it exists
      const order = await ordersApi.getOrderById(orderNumber);
      
      if (order) {
        // Navigate to order details
        router.push(`/orders/${orderNumber}`);
      } else {
        throw new Error('ORDER_NOT_FOUND');
      }
      
    } catch (error) {
      console.error('QR scan error:', error);
      
      let errorTitle = 'QR Code Error';
      let errorMessage = 'Failed to process QR code. Please try again.';
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_QR_CODE':
            errorTitle = 'Invalid QR Code';
            errorMessage = 'This QR code does not contain a valid order ID. Please scan a QR code that contains an order number.';
            break;
          case 'INVALID_ORDER_ID':
            errorTitle = 'Invalid Order ID';
            errorMessage = 'The Order ID from this QR code is not valid. Please scan a QR code with a valid order number.';
            break;
          case 'ORDER_NOT_FOUND':
            errorTitle = 'Order Not Found';
            errorMessage = 'The Order ID from this QR code was not found in the system. Please check the QR code and try again.';
            break;
          default:
            if (error.message.includes('not found') || error.message.includes('404')) {
              errorTitle = 'Order Not Found';
              errorMessage = 'The Order ID from this QR code was not found in the system. Please check the QR code and try again.';
            } else if (error.message.includes('Network')) {
              errorTitle = 'Network Error';
              errorMessage = 'Unable to validate the order. Please check your connection and try again.';
            }
            break;
        }
      }
      
      Alert.alert(errorTitle, errorMessage, [
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
