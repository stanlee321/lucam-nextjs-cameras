import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Paper, 
  Divider, 
  Skeleton,
  Container,
  IconButton,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Component to display a statistic card with icon
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: React.ReactNode;
  icon: React.ReactNode; 
  color: string 
}) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box 
          sx={{ 
            bgcolor: `${color}15`, // Light version of the color
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            mr: 1
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCameras: 5,
    activeCameras: 4,
    inactiveCameras: 1,
    totalUsers: 3,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Simulate loading data from API
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // If still loading auth or not authenticated, don't render content
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="medium">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name || 'User'}!
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Cameras" 
            value={pageLoading ? <Skeleton width={60} /> : stats.totalCameras}
            icon={<VideocamIcon />}
            color="#1976d2" // Blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Cameras" 
            value={pageLoading ? <Skeleton width={60} /> : stats.activeCameras}
            icon={<CheckCircleIcon />}
            color="#4caf50" // Green
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Inactive Cameras" 
            value={pageLoading ? <Skeleton width={60} /> : stats.inactiveCameras}
            icon={<CancelIcon />}
            color="#f44336" // Red
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={pageLoading ? <Skeleton width={60} /> : stats.totalUsers}
            icon={<PeopleIcon />}
            color="#ff9800" // Orange
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {pageLoading ? (
              <>
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
              </>
            ) : (
              <>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Camera 'Front Gate' went offline
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      10 minutes ago
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <VideocamIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      User 'admin' added new camera
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      1 hour ago
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <PeopleIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      System update completed
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Yesterday at 10:30
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {pageLoading ? (
              <>
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
              </>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    All systems operational
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last checked: 5 minutes ago
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Storage: 68% used (1.2TB free)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    3.8TB total capacity
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Next scheduled backup
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tomorrow at 02:00
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 