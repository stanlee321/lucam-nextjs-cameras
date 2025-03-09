import { ApiResponse } from './types';

export interface UserAuth {
  id: number;
  username: string;
  name: string;
  role: string;
  email?: string;
}

export interface LoginResponse {
  token: string;
  user: UserAuth;
  expiresIn: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Mock login credentials for demo purposes
const DEMO_CREDENTIALS = {
  'admin': {
    password: 'admin123',
    user: {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'SuperAdmin',
      email: 'admin@example.com'
    }
  },
  'user': {
    password: 'user123',
    user: {
      id: 2,
      username: 'user',
      name: 'Regular User',
      role: 'Viewer',
      email: 'user@example.com'
    }
  }
};

// In a real app, these would be API calls
class AuthService {
  // Storage keys
  private readonly TOKEN_KEY = 'lucam_auth_token';
  private readonly USER_KEY = 'lucam_auth_user';
  private readonly EXPIRES_KEY = 'lucam_auth_expires';

  /**
   * Check if we're in a browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Login user with credentials
   */
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check credentials against mock data (for demo)
    const userRecord = DEMO_CREDENTIALS[username as keyof typeof DEMO_CREDENTIALS];
    
    if (!userRecord || userRecord.password !== password) {
      return { 
        success: false, 
        error: 'Invalid username or password' 
      };
    }
    
    // Generate mock token (in a real app, this would come from the server)
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds
    const expiresAt = Date.now() + expiresIn * 1000;
    const token = `mock-jwt-token-${Date.now()}-${username}`;
    
    // Save auth data to storage
    this.saveAuthData(token, userRecord.user, expiresAt);
    
    return {
      success: true,
      data: {
        token,
        user: userRecord.user,
        expiresIn
      }
    };
  }

  /**
   * Logout user by removing auth data
   */
  logout(): void {
    if (!this.isBrowser()) return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    
    const expiresAt = this.getExpiresAt();
    return !!this.getToken() && Date.now() < expiresAt;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the current authenticated user
   */
  getUser(): UserAuth | null {
    if (!this.isBrowser()) return null;
    
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user JSON:', e);
      return null;
    }
  }

  /**
   * Get token expiration timestamp
   */
  getExpiresAt(): number {
    if (!this.isBrowser()) return 0;
    
    const expiresAtStr = localStorage.getItem(this.EXPIRES_KEY);
    return expiresAtStr ? parseInt(expiresAtStr, 10) : 0;
  }

  /**
   * Verify if the token is still valid
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user: UserAuth | null }>> {
    if (!this.isBrowser()) {
      return { 
        success: false, 
        error: 'Not in browser environment' 
      };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.isAuthenticated()) {
      return { 
        success: false, 
        error: 'Invalid or expired token' 
      };
    }
    
    return {
      success: true,
      data: {
        valid: true,
        user: this.getUser()
      }
    };
  }

  /**
   * Save authentication data to storage
   */
  private saveAuthData(token: string, user: UserAuth, expiresAt: number): void {
    if (!this.isBrowser()) return;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
  }
}

export const authService = new AuthService(); 