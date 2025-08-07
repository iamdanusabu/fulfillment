
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        // Small delay to ensure proper navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (token) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show a loading state while checking authentication
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
