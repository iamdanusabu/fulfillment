
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';

export default function LoginScreen() {
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isSmallMobile = width < 480;

  const handleLogin = async () => {
    if (!domain || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login({ domain, username, password });
      
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      await AsyncStorage.setItem('token_expires_in', response.expires_in.toString());
      
      // Navigate to dashboard
      router.replace('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: isSmallMobile ? 16 : isLandscape && !isTablet ? 40 : 20,
          justifyContent: isLandscape && !isTablet ? 'flex-start' : 'center',
          paddingTop: isLandscape && !isTablet ? 40 : 0,
        }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[
        styles.formContainer,
        {
          maxWidth: isTablet ? 500 : isLandscape ? 400 : '100%',
          width: '100%',
          paddingHorizontal: isSmallMobile ? 20 : 30,
          paddingVertical: isLandscape && !isTablet ? 20 : 30,
        }
      ]}>
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Domain</Text>
          <TextInput
            style={styles.input}
            value={domain}
            onChangeText={setDomain}
            placeholder="Enter domain"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
