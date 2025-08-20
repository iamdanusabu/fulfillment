import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConfig } from '../../environments';

class TokenService {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string) {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async clearToken() {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'token_expires_in']);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }
}

export const tokenService = new TokenService();

export const fetchWithToken = async (url: string, options: RequestInit = {}) => {
  const config = getConfig();
  const token = await tokenService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${config.baseURL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    tokenService.clearToken();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
      // Handle different HTTP status codes
      if (response.status === 401) {
        console.log('401 Unauthorized - clearing tokens');
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 404) {
        console.log('404 Not Found - resource does not exist');
        throw new Error('404 Not Found - No data available');
      }

      // Try to parse error response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error_description) {
          errorMessage = errorData.error_description;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage);
    }

  const text = await response.text();
  try {
    return JSON.parse(text, (key, value) => 
      typeof value === 'string' && /^\d+n$/.test(value) 
        ? BigInt(value.slice(0, -1)) 
        : value
    );
  } catch {
    return text;
  }
};