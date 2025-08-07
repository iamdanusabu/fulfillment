
import { getConfig } from '../../environments';

class TokenService {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
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
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
