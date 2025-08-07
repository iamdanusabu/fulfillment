
import { getConfig } from '../../../environments';

export interface LoginCredentials {
  domain: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const config = getConfig();
    const authCredentials = btoa(`${config.clientId}:${config.clientSecret}`);
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('domain', credentials.domain);
    formData.append('scope', 'write');

    const response = await fetch(`${config.baseURL}${config.endpoints.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authCredentials}`,
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Login failed');
    }

    return data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const config = getConfig();
    const authCredentials = btoa(`${config.clientId}:${config.clientSecret}`);
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);

    const response = await fetch(`${config.baseURL}${config.endpoints.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authCredentials}`,
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Token refresh failed');
    }

    return data;
  },
};
