import { ApiResponse } from './types';
import apiClient, { initApiClient } from './apiClient';

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
  expiresIn: number; // This might be returned as expires_in from API
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// API integration enabled flag
const API_ENABLED = process.env.NEXT_PUBLIC_API_ENABLED === 'true';

// Real API login credentials as per documentation
const API_CREDENTIALS = {
  'admin': {
    password: 'adminpass',  // As shown in API docs
  },
  'user': {
    password: 'userpass',   // As shown in API docs
  }
};

// Mock login credentials for demo purposes (only used when API_ENABLED is false)
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

class AuthService {
  // Storage keys - renamed for clarity
  private readonly AUTH_TOKEN_KEY = 'lucam_auth_token';
  private readonly AUTH_USER_KEY = 'lucam_auth_user';
  private readonly AUTH_EXPIRES_KEY = 'lucam_auth_expires';

  // Additional variables for reliability
  private authToken: string | null = null;
  private authUser: UserAuth | null = null;
  private authExpires: number = 0;
  private initialized: boolean = false;

  constructor() {
    // Initialize from localStorage if we're in the browser
    if (this.isBrowser()) {
      try {
        this.authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
        
        const userJson = localStorage.getItem(this.AUTH_USER_KEY);
        this.authUser = userJson ? JSON.parse(userJson) : null;
        
        const expiresStr = localStorage.getItem(this.AUTH_EXPIRES_KEY);
        this.authExpires = expiresStr ? parseInt(expiresStr, 10) : 0;
        
        this.initialized = true;
        console.log('AuthService initialized from localStorage', {
          hasToken: !!this.authToken,
          hasUser: !!this.authUser,
          expires: this.authExpires ? new Date(this.authExpires).toISOString() : null
        });
      } catch (e) {
        console.error('Error initializing auth service from localStorage:', e);
        // If there's an error, clear everything to be safe
        this.clearAuth();
        this.initialized = true;
      }
    }
    
    // Initialize the API client with this auth service instance
    // This breaks the circular dependency
    initApiClient(this);
  }

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
    if (API_ENABLED) {
      try {
        console.log('Attempting login with API...', username);
        
        // For debugging - check if we're using credentials from the API doc
        if (API_CREDENTIALS[username as keyof typeof API_CREDENTIALS]) {
          const expectedPassword = API_CREDENTIALS[username as keyof typeof API_CREDENTIALS].password;
          console.log(`Using credentials for ${username}, expected password matches: ${password === expectedPassword}`);
        }
        
        // Call the real API using a direct fetch to avoid circular dependencies
        console.log('Making direct login request to API');
        
        // Build the API URL
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081';
        const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
        const loginUrl = `${API_URL}/${API_VERSION}/auth/login`;
        
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        console.log('Login API response status:', response.status);
        
        const data = await response.json();
        console.log('Login response data structure:', Object.keys(data));
        
        if (data.success && data.data) {
          console.log('Login successful, processing response');
          
          // Extract data from response
          const { token, user } = data.data;
          
          // Handle case differences in the API response (expires_in vs expiresIn)
          const expiresIn = data.data.expiresIn || data.data.expires_in || 86400; // Default to 24 hours
          
          console.log('Token details:', {
            tokenLength: token ? token.length : 0,
            expiresIn,
            user: user ? user.username : null
          });
          
          const expiresAt = Date.now() + expiresIn * 1000;
          
          // Save to memory first
          this.authToken = token;
          this.authUser = user;
          this.authExpires = expiresAt;
          
          // Then save to localStorage
          this.saveToStorage(token, user, expiresAt);
          
          return {
            success: true,
            data: {
              token,
              user,
              expiresIn
            }
          };
        } else {
          console.error('Login failed:', data.error);
          return {
            success: false,
            error: data.error || 'Login failed'
          };
        }
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          error: 'Failed to login. Please check your credentials and try again.'
        };
      }
    } else {
      // Fallback to mock implementation
      console.log('Using mock authentication (API_ENABLED is false)');
      
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
      
      // Save to memory first
      this.authToken = token;
      this.authUser = userRecord.user;
      this.authExpires = expiresAt;
      
      // Then save to localStorage
      this.saveToStorage(token, userRecord.user, expiresAt);
      
      return {
        success: true,
        data: {
          token,
          user: userRecord.user,
          expiresIn
        }
      };
    }
  }

  /**
   * Logout user by removing auth data
   */
  logout(): void {
    console.log('Logging out and clearing auth data');
    
    // Clear memory
    this.authToken = null;
    this.authUser = null;
    this.authExpires = 0;
    
    // Clear storage
    this.clearAuth();
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    // Force initialization if not already done
    if (!this.initialized && this.isBrowser()) {
      try {
        this.authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
        
        const userJson = localStorage.getItem(this.AUTH_USER_KEY);
        this.authUser = userJson ? JSON.parse(userJson) : null;
        
        const expiresStr = localStorage.getItem(this.AUTH_EXPIRES_KEY);
        this.authExpires = expiresStr ? parseInt(expiresStr, 10) : 0;
        
        this.initialized = true;
      } catch (e) {
        console.error('Error initializing auth service during isAuthenticated:', e);
        this.clearAuth();
        this.initialized = true;
        return false;
      }
    }
    
    // Check both memory and storage
    const hasToken = !!this.authToken;
    const hasUser = !!this.authUser;
    const isExpired = Date.now() >= this.authExpires;
    
    const isValid = hasToken && hasUser && !isExpired;
    
    console.log('Auth check:', { 
      hasToken, 
      hasUser,
      expiresAt: this.authExpires ? new Date(this.authExpires).toISOString() : null,
      now: new Date().toISOString(),
      isExpired,
      isValid 
    });
    
    // If token has expired, clear everything
    if (hasToken && isExpired) {
      console.log('Token expired, clearing auth');
      this.logout();
      return false;
    }
    
    return isValid;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    // Force check auth status first - this will reinitialize if needed
    if (!this.isAuthenticated()) {
      return null;
    }
    
    // Double-check token from both memory and storage
    if (!this.authToken && this.isBrowser()) {
      this.authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    }
    
    return this.authToken;
  }

  /**
   * Get the current authenticated user
   */
  getUser(): UserAuth | null {
    // Force check auth status first - this will reinitialize if needed
    if (!this.isAuthenticated()) {
      return null;
    }
    
    // Double-check user from both memory and storage
    if (!this.authUser && this.isBrowser()) {
      try {
        const userJson = localStorage.getItem(this.AUTH_USER_KEY);
        this.authUser = userJson ? JSON.parse(userJson) : null;
      } catch (e) {
        console.error('Error parsing user JSON:', e);
        return null;
      }
    }
    
    return this.authUser;
  }

  /**
   * Get token expiration timestamp
   */
  getExpiresAt(): number {
    if (!this.initialized && this.isBrowser()) {
      const expiresStr = localStorage.getItem(this.AUTH_EXPIRES_KEY);
      this.authExpires = expiresStr ? parseInt(expiresStr, 10) : 0;
      this.initialized = true;
    }
    
    return this.authExpires;
  }

  /**
   * Verify if the token is still valid
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user: UserAuth | null }>> {
    // First check if we have a token and it's not expired based on local information
    if (!this.isAuthenticated()) {
      console.log('Token not valid based on local check');
      return { 
        success: false, 
        error: 'Invalid or expired token' 
      };
    }
    
    if (API_ENABLED) {
      try {
        console.log('Verifying token with API...');
        
        // Make a direct request to verify endpoint to avoid circular dependencies
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081';
        const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
        const verifyUrl = `${API_URL}/${API_VERSION}/auth/verify`;
        
        const response = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (!response.ok) {
          console.error('Token verification failed with status:', response.status);
          this.logout();
          return {
            success: false,
            error: `Token verification failed: ${response.statusText}`
          };
        }
        
        const data = await response.json();
        console.log('Token verification response:', data);
        
        if (!data.success) {
          // If verification fails, clear the stored auth data
          console.log('Token verification failed, logging out');
          this.logout();
          return data;
        } else {
          console.log('Token verified successfully');
          
          // Update the user information
          if (data.data && data.data.user) {
            this.authUser = data.data.user;
            
            // Update in storage
            if (this.isBrowser()) {
              localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(data.data.user));
            }
          }
          
          return data;
        }
      } catch (error) {
        console.error('Token verification error:', error);
        this.logout();
        return {
          success: false,
          error: 'Failed to verify token'
        };
      }
    } else {
      // Fallback to mock implementation
      console.log('Using mock token verification (API_ENABLED is false)');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // We already checked isAuthenticated() above, so just return success
      return {
        success: true,
        data: {
          valid: true,
          user: this.getUser()
        }
      };
    }
  }

  /**
   * Save authentication data to memory and storage
   */
  private saveToStorage(token: string, user: UserAuth, expiresAt: number): void {
    if (!this.isBrowser()) return;
    
    console.log('Saving auth data to localStorage');
    try {
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.AUTH_EXPIRES_KEY, expiresAt.toString());
      
      // Confirm data was saved
      const savedToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(this.AUTH_USER_KEY);
      const savedExpires = localStorage.getItem(this.AUTH_EXPIRES_KEY);
      
      console.log('Saved auth data confirmation:', {
        tokenSaved: !!savedToken,
        userSaved: !!savedUser,
        expiresSaved: !!savedExpires
      });
    } catch (e) {
      console.error('Error saving auth data to localStorage:', e);
    }
  }

  /**
   * Clear all auth data from localStorage
   */
  private clearAuth(): void {
    if (!this.isBrowser()) return;
    
    console.log('Clearing auth data from localStorage');
    try {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      localStorage.removeItem(this.AUTH_USER_KEY);
      localStorage.removeItem(this.AUTH_EXPIRES_KEY);
      
      // Confirm data was cleared
      const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
      const user = localStorage.getItem(this.AUTH_USER_KEY);
      const expires = localStorage.getItem(this.AUTH_EXPIRES_KEY);
      
      console.log('Auth data cleared confirmation:', {
        tokenCleared: !token,
        userCleared: !user,
        expiresCleared: !expires
      });
    } catch (e) {
      console.error('Error clearing auth data from localStorage:', e);
    }
  }
}

// Create a single instance
export const authService = new AuthService(); 