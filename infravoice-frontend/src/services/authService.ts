import api from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  subscription_tier: string;
  api_quota: number;
  api_calls_used: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const authService = {
  async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/api/v1/auth/login', credentials);
    const { access_token, refresh_token } = response.data;
    
    // Store tokens based on remember me preference
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', access_token);
    storage.setItem('refresh_token', refresh_token);
    
    // Also store the preference for token refresh
    localStorage.setItem('remember_me', rememberMe.toString());
    
    return response.data;
  },

  async signup(data: SignupData): Promise<User> {
    const response = await api.post<User>('/api/v1/auth/signup', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout');
    } finally {
      // Clear from both storages
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('remember_me');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
  },

  async refresh(): Promise<AuthTokens> {
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const refreshToken = storage.getItem('refresh_token');
    
    const response = await api.post<AuthTokens>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    const { access_token, refresh_token } = response.data;
    storage.setItem('access_token', access_token);
    storage.setItem('refresh_token', refresh_token);
    
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/v1/auth/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    return storage.getItem('refresh_token');
  },
};

export default authService;
