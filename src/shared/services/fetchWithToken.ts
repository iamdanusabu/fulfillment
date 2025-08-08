
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

  try {
    const response = await fetch(`${config.baseURL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      tokenService.clearToken();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseText = await response.text();
    
    // Handle empty responses
    if (!responseText) {
      return null;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.warn('Response is not valid JSON:', responseText);
      return responseText;
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
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
