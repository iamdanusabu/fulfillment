
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Use a small delay to ensure the root layout is mounted
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 100);

    return () => clearTimeout(timer);
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
