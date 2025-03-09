import React, { useEffect, useState } from 'react';
import { Box, CssBaseline, Toolbar, CircularProgress } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { publicRoutes } from '../../pages/_app';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Client-side only effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // If not mounted yet, render a simple container
  // This prevents hydration errors
  if (!mounted) {
    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    );
  }
  
  // If loading auth state on client, show loading spinner
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top Navigation Bar */}
      <Navbar />
      
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: '260px', // Same as drawer width
          width: { sm: `calc(100% - 260px)` },
        }}
      >
        <Toolbar /> {/* Spacer to push content below appbar */}
        {children}
      </Box>
    </Box>
  );
} 