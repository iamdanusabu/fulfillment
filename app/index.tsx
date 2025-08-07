
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        // Use a small delay to ensure the root layout is mounted
        setTimeout(() => {
          if (token) {
            router.replace('/dashboard');
          } else {
            router.replace('/login');
          }
        }, 100);
      } catch (error) {
        console.error('Error checking auth:', error);
        setTimeout(() => {
          router.replace('/login');
        }, 100);
      }
    };

    checkAuth();
  }, [router]);

  // Show a loading state while navigating
  return (
    <View style={styles.container}>
      <Text>Loading...</Text>
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
});
