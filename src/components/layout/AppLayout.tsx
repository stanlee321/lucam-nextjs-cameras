import { useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Videocam as CameraIcon,
  Dashboard as DashboardIcon,
  History as ActivityIcon,
  People as UserIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useTheme } from '@/context/ThemeContext';

const drawerWidth = 240;

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

// Define the user role type
type UserRoleType = 'SuperAdmin' | 'Admin' | 'Viewer';

interface NavItem {
  text: string;
  path: string;
  icon: ReactNode;
  role?: UserRoleType; // Min role required, undefined means all
}

// Helper function to check if a user has sufficient permissions
const hasAccess = (requiredRole: UserRoleType | undefined, userRole: UserRoleType): boolean => {
  // No role required means everyone can access
  if (!requiredRole) return true;
  
  // Access mapping: which roles can access which level
  const accessMap: Record<UserRoleType, UserRoleType[]> = {
    'SuperAdmin': ['SuperAdmin', 'Admin', 'Viewer'],
    'Admin': ['Admin', 'Viewer'],
    'Viewer': ['Viewer']
  };
  
  // Check if the user's role can access the required role level
  return accessMap[userRole].includes(requiredRole);
};

export default function AppLayout({ children, title = 'Administrator App' }: AppLayoutProps) {
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // In a real app, this would come from an auth context
  const userRole: UserRoleType = 'SuperAdmin'; // Mock user role

  const navItems: NavItem[] = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Cameras', path: '/cameras', icon: <CameraIcon /> },
    { text: 'Activity Log', path: '/activity', icon: <ActivityIcon /> },
    { text: 'Users', path: '/users', icon: <UserIcon />, role: 'Admin' },
    { text: 'Reports', path: '/reports', icon: <ReportIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => hasAccess(item.role, userRole));

  // Handle navigation and close mobile drawer if needed
  const handleNavigation = useCallback((path: string) => {
    console.log('Navigating to:', path);
    console.log('Current path:', router.pathname);
    
    // If already on the same page, don't do anything
    if (router.pathname === path) {
      return;
    }
    
    // Otherwise, navigate to the path
    router.push(path);
    
    // Close mobile drawer after navigation
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [router, isMobile]);

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin Portal
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavItems.map((item) => {
          const isActive = router.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {/* Language Toggle (would connect to i18n) */}
          <Tooltip title="Toggle language">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <TranslateIcon />
            </IconButton>
          </Tooltip>
          
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          
          {/* User Menu would go here */}
          <Button color="inherit">Log Out</Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 