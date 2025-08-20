
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
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { CompanyLogo } from '../../../shared/components/CompanyLogo';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isSmallMobile = width < 480;

  const handleLogin = async () => {
    const trimmedDomain = domain.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedUsername || !trimmedPassword || !trimmedDomain) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login({ 
        domain: trimmedDomain, 
        username: trimmedUsername, 
        password: trimmedPassword 
      });
      
      // Store the token and username in AsyncStorage
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      await AsyncStorage.setItem('token_expires_in', response.expires_in.toString());
      await AsyncStorage.setItem('username', trimmedUsername);
      
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingHorizontal: isSmallMobile ? 24 : isLandscape && !isTablet ? 48 : 32,
            justifyContent: isLandscape && !isTablet ? 'flex-start' : 'center',
            paddingTop: isLandscape && !isTablet ? 60 : 80,
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <CompanyLogo size={isSmallMobile ? 72 : 88} />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.appName}>OrderUp</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
        </View>
        
        {/* Form Container */}
        <View style={[
          styles.formContainer,
          {
            maxWidth: isTablet ? 400 : '100%',
            width: '100%',
          }
        ]}>
          {/* Username Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#8e8e93"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8e8e93"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Domain Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={domain}
              onChangeText={setDomain}
              placeholder="Company Domain"
              placeholderTextColor="#8e8e93"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: '#8e8e93',
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: '#000000',
    backgroundColor: '#f2f2f7',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: '#0077ED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#c7c7cc',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
