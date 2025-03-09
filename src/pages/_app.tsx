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

// Auth guard component to handle protected routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // This effect will only run on the client, after the component has mounted
  useEffect(() => {
    setMounted(true);
    
    const currentPath = router.pathname;
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(`${route}/`)
    );
    
    // If not loading and not authenticated and not on a public route, redirect to login
    if (!loading && !isAuthenticated && !isPublicRoute) {
      console.log('Redirecting to login from', currentPath);
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      });
    }
    
    // If authenticated and on login page, redirect to dashboard
    if (!loading && isAuthenticated && currentPath === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);
  
  // Render a consistent initial state server and client
  // Only conditionally render after mounting on client
  if (!mounted) {
    // During SSR and initial client render, just render children without checks
    // This avoids hydration mismatch
    return <>{children}</>;
  }
  
  // After mounting on client, apply authentication logic
  const currentPath = router.pathname;
  const isPublicRoute = publicRoutes.some(route => 
    currentPath === route || currentPath.startsWith(`${route}/`)
  );
  
  // Show placeholder while loading or redirect happening
  if (!isAuthenticated && !isPublicRoute && !loading) {
    return null; // Don't render protected content while redirecting
  }
  
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
            <AuthGuard>
              {isLoginPage ? (
                <Component {...pageProps} />
              ) : (
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
              )}
            </AuthGuard>
          </ThemeProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </>
  );
} 