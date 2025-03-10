import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authService, UserAuth } from '../services/api/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserAuth | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

// Default context value - only used during SSR
const defaultContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State management
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    const initialize = async () => {
      try {
        // Skip if already initialized
        if (initialized) {
          console.log('AuthContext already initialized, skipping');
          return;
        }

        console.log('Initializing AuthContext...');
        setLoading(true);

        // Check if user is already authenticated using the service
        const isLoggedIn = authService.isAuthenticated();
        console.log('Initial auth check:', isLoggedIn);

        if (isLoggedIn) {
          // Get user data
          const userData = authService.getUser();
          console.log('User data from auth service:', userData);
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }

        setInitialized(true);
      } catch (err) {
        console.error('Error during AuthContext initialization:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Setup listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (['lucam_auth_token', 'lucam_auth_user', 'lucam_auth_expires'].includes(event.key || '')) {
        console.log('Auth storage changed in another tab, updating state');
        // Reinitialize auth state
        const isLoggedIn = authService.isAuthenticated();
        const userData = authService.getUser();
        
        setIsAuthenticated(isLoggedIn);
        setUser(userData);
      }
    };

    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);

    // Clean up the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialized]);

  // Login handler
  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      console.log('Logging in...', { username });
      const response = await authService.login(username, password);
      console.log('Login response:', response);

      if (response.success && response.data) {
        // Set authentication state
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log('Login successful, auth state updated');
        return true;
      } else {
        // Handle login failure
        console.error('Login failed:', response.error);
        setError(response.error || 'Login failed');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    console.log('Logging out from AuthContext');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    // Redirect to login page
    router.push('/login');
  };

  // Debug auth state on changes
  useEffect(() => {
    console.log('AuthContext state changed:', { 
      isAuthenticated, 
      user: user?.username,
      loading,
      error
    });
  }, [isAuthenticated, user, loading, error]);

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 