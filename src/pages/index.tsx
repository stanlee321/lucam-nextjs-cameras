import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Paper, 
  Box, 
  LinearProgress, 
  Skeleton
} from '@mui/material';
import { 
  Videocam as CameraIcon, 
  VideoLabel as CameraOnlineIcon,
  VideocamOff as CameraOfflineIcon,
  People as UserIcon,
  Assessment as ReportIcon 
} from '@mui/icons-material';
import { cameraService, userService } from '@/services/api';
import { Camera, User } from '@/services/api/types';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCameras: 0,
    activeCameras: 0,
    totalUsers: 0,
    activeUsers: 0,
  });

  // Simulating fetching dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get cameras with no filters to get all cameras
        const camerasResponse = await cameraService.getCameras();
        const usersResponse = await userService.getUsers();
        
        if (camerasResponse.success && camerasResponse.data && usersResponse.success && usersResponse.data) {
          const cameras = camerasResponse.data.data;
          const users = usersResponse.data.data;
          
          setStats({
            totalCameras: camerasResponse.data.total,
            activeCameras: cameras.filter(camera => camera.active).length,
            totalUsers: usersResponse.data.total,
            activeUsers: users.filter(user => user.active).length,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) => (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              bgcolor: `${color}22`, // Using alpha for a lighter background
              color,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div">
              {loading ? <Skeleton width={40} /> : value}
            </Typography>
            <Typography color="textSecondary">{title}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="textSecondary" paragraph>
        Welcome to the Camera Administrator Dashboard. Here you can monitor the status of your cameras and users.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Cameras" 
            value={stats.totalCameras} 
            icon={<CameraIcon fontSize="large" />} 
            color="#1976d2" // Primary blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Cameras" 
            value={stats.activeCameras} 
            icon={<CameraOnlineIcon fontSize="large" />} 
            color="#4caf50" // Green
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<UserIcon fontSize="large" />} 
            color="#ff9800" // Orange
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Users" 
            value={stats.activeUsers} 
            icon={<UserIcon fontSize="large" />} 
            color="#673ab7" // Purple
          />
        </Grid>
      </Grid>
      
      {/* Camera Status Graph */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Camera Status
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={200} />
            ) : (
              <Box sx={{ mt: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ width: 150 }}>
                    Active Cameras
                  </Typography>
                  <Box flex={1} ml={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalCameras ? (stats.activeCameras / stats.totalCameras) * 100 : 0} 
                      color="success"
                      sx={{ height: 20, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" ml={1}>
                    {stats.activeCameras}/{stats.totalCameras}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ width: 150 }}>
                    Inactive Cameras
                  </Typography>
                  <Box flex={1} ml={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalCameras ? ((stats.totalCameras - stats.activeCameras) / stats.totalCameras) * 100 : 0} 
                      color="error"
                      sx={{ height: 20, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" ml={1}>
                    {stats.totalCameras - stats.activeCameras}/{stats.totalCameras}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Quick Links / Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            {loading ? (
              <Box>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={40} />
              </Box>
            ) : (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" paragraph>
                  ✅ View and manage cameras from the Cameras page
                </Typography>
                <Typography variant="body1" paragraph>
                  ✅ Monitor activity from the Activity Log
                </Typography>
                <Typography variant="body1" paragraph>
                  ✅ Generate reports from the Reports page
                </Typography>
                <Typography variant="body1" paragraph>
                  ✅ Manage users and permissions from the Users page
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
} 