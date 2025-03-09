import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Button,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Camera as CameraIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Sidebar width
const DRAWER_WIDTH = 260;

// Sidebar navigation items
const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Cameras', icon: <CameraIcon />, path: '/cameras' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Client-side only effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Function to determine if a route is the active route
  const isActive = (path: string) => {
    if (!mounted) return false;
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  // Role-based badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return '#e53935'; // red
      case 'Admin':
        return '#1976d2'; // blue
      default:
        return '#757575'; // gray
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
        },
      }}
      open
    >
      {/* App Title / Logo */}
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          LucaM Camera System
        </Typography>
      </Box>
      
      {/* User Profile Section */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        {!mounted ? (
          <>
            <Skeleton variant="circular" width={65} height={65} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={120} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 1, borderRadius: 1 }} />
          </>
        ) : (
          <>
            <Avatar 
              sx={{ 
                width: 65, 
                height: 65, 
                bgcolor: 'primary.main',
                mb: 1,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="medium" align="center" gutterBottom>
              {user?.name || 'User'}
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                backgroundColor: getRoleBadgeColor(user?.role || ''),
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 500,
                mb: 1,
              }}
            >
              {user?.role || 'User'}
            </Box>
          </>
        )}
      </Box>
      
      {/* Navigation Menu */}
      <List component="nav">
        {navigationItems.map((item) => (
          <Link href={item.path} passHref key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={isActive(item.path)}
                sx={{ 
                  pl: 3,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 45 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
      
      <Divider sx={{ mt: 'auto' }} />
      
      {/* Logout Button */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ pl: 3 }}>
            <ListItemIcon sx={{ minWidth: 45 }}>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ color: 'error' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
} 