import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  ListItemIcon,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

interface NavbarProps {
  toggleSidebar?: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Menu anchor states
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Menu open states
  const isNotificationsOpen = Boolean(notificationAnchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);
  
  // Client-side only effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle notification click
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  // Handle user menu click
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setNotificationAnchorEl(null);
    setUserMenuAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  // Handle navigate to profile
  const handleNavigateToProfile = () => {
    handleMenuClose();
    router.push('/profile');
  };
  
  // Handle navigate to settings
  const handleNavigateToSettings = () => {
    handleMenuClose();
    router.push('/settings');
  };
  
  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {toggleSidebar && (
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* This space is intentionally left empty for title or logo */}
        </Typography>
        
        {/* Notifications */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              aria-label="show notifications"
              aria-controls={isNotificationsOpen ? 'notifications-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isNotificationsOpen ? 'true' : undefined}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* User Menu */}
        <Box sx={{ ml: 2 }}>
          {!mounted ? (
            <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuClick}
                aria-label="account settings"
                aria-controls={isUserMenuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {mounted && (
          <>
            {/* Notifications Menu */}
            <Menu
              id="notifications-menu"
              anchorEl={notificationAnchorEl}
              open={isNotificationsOpen}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  width: 320,
                  maxHeight: 'calc(100% - 96px)',
                  mt: 1.5,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              <Divider />
              <MenuItem>Camera 'Front Gate' is offline for 10 minutes</MenuItem>
              <MenuItem>New user 'John Smith' has been added</MenuItem>
              <MenuItem>System update is available</MenuItem>
              <Divider />
              <MenuItem 
                sx={{ 
                  justifyContent: 'center', 
                  color: 'primary.main',
                  py: 1.5,
                }}
              >
                View All Notifications
              </MenuItem>
            </Menu>
            
            {/* User Menu */}
            <Menu
              id="user-menu"
              anchorEl={userMenuAnchorEl}
              open={isUserMenuOpen}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  width: 220,
                  maxHeight: 'calc(100% - 96px)',
                  mt: 1.5,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || ''}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    mt: 1,
                    backgroundColor: user?.role === 'SuperAdmin' ? '#e53935' : user?.role === 'Admin' ? '#1976d2' : '#757575',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {user?.role || 'User'}
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={handleNavigateToProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleNavigateToSettings}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
} 