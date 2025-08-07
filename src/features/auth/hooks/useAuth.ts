
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConfig } from '../../../environments';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const login = async (domain: string, username: string, password: string) => {
    setLoading(true);
    
    try {
      const config = getConfig();
      const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
      
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('domain', domain);
      formData.append('scope', 'write');

      const response = await fetch(`${config.baseURL}${config.endpoints.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
        await AsyncStorage.setItem('token_expires_in', data.expires_in.toString());
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error_description || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Failed to connect to server' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('token_expires_in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  };

  return {
    login,
    logout,
    checkAuthStatus,
    loading,
  };
};
