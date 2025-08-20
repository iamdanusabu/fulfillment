
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
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.formContainer,
          {
            maxWidth: isTablet ? 500 : isLandscape ? 400 : '100%',
            width: '100%',
            paddingHorizontal: isSmallMobile ? 20 : 40,
            paddingVertical: isLandscape && !isTablet ? 30 : 40,
          }
        ]}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <CompanyLogo size={isSmallMobile ? 80 : 100} />
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
          </View>
          
          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#fafafa' }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#fafafa' }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Domain Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Domain</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#fafafa' }]}
              value={domain}
              onChangeText={setDomain}
              placeholder="Enter company domain"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure enterprise login powered by your organization
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.2s',
  },
  loginButton: {
    backgroundColor: '#0077ED',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0077ED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});
