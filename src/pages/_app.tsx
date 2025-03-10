import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useRouter } from 'next/router';

// Layout components
import MainLayout from '../components/layout/MainLayout';

// Auth Provider
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Theme Provider
import { ThemeProvider } from '../contexts/ThemeContext';

// Global CSS
import '../styles/globals.css';

// Font configuration
const inter = Inter({ subsets: ['latin'] });

// Base theme configuration (will be overridden by ThemeContext)
const baseTheme = createTheme({
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

// Public routes that don't require authentication
export const publicRoutes = ['/login'];

// Auth Route Guard
function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Only run client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle auth-based routing
  useEffect(() => {
    // Skip during SSR or if not mounted yet
    if (!mounted) return;
    
    const currentPath = router.pathname;
    
    console.log('AuthRouteGuard checking auth:', {
      path: currentPath,
      isAuthenticated,
      loading,
    });
    
    // Skip redirects during loading
    if (loading) return;
    
    // Special handling for cameras page - ensure solid auth state
    if (currentPath.startsWith('/cameras') && !loading && !isAuthenticated) {
      console.warn('Not authenticated for cameras page, redirecting to login');
      router.replace({
        pathname: '/login',
        query: { returnUrl: '/cameras' }
      });
      return;
    }
    
    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(
      route => currentPath === route || currentPath.startsWith(`${route}/`)
    );
    
    // Case 1: User is not authenticated but trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      console.log(`Redirecting to login from ${currentPath}`);
      router.replace({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      });
    }
    
    // Case 2: User is authenticated but trying to access login page
    if (isAuthenticated && currentPath === '/login') {
      console.log('Already authenticated, redirecting to dashboard');
      router.replace('/');
    }
  }, [isAuthenticated, loading, mounted, router]);
  
  // Always render children - redirects happen in the effect
  return <>{children}</>;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LucaM Camera System</title>
      </Head>
      <MuiThemeProvider theme={baseTheme}>
        <CssBaseline />
        <AuthProvider>
          <ThemeProvider>
            <AuthRouteGuard>
              {isLoginPage ? (
                <Component {...pageProps} />
              ) : (
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
              )}
            </AuthRouteGuard>
          </ThemeProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </>
  );
} 