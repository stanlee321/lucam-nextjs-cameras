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

// Create a default context value
const defaultContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  error: null,
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Start with the same state on both server and client
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Only run this effect on the client
  useEffect(() => {
    setMounted(true);
    
    const initialize = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.verifyToken();
          
          if (response.success && response.data?.valid) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear the auth state
            authService.logout();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login(username, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setLoading(false);
        return true;
      } else {
        setError(response.error || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  // Use a value that works for both server and client initially,
  // then update it only on the client
  let isAuthenticated = false;
  
  if (mounted) {
    isAuthenticated = authService.isAuthenticated();
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 