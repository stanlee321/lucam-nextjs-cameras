import { Breadcrumbs, Typography, Button, TextField, Box, Checkbox, FormControlLabel, CircularProgress, Alert, Paper, FormHelperText } from '@mui/material';
import Home from '@mui/icons-material/Home';
import Videocam from '@mui/icons-material/Videocam';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cameraService } from '@/services/api';
import { authService } from '@/services/api/authService';

export default function NewCameraPage() {
  const router = useRouter();
  
  // Camera form state
  const [camera, setCamera] = useState({
    name: '',
    location: '',
    ipAddress: '',
    port: '554', // Default RTSP port
    active: true
  });
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Add useEffect to check auth status
  useEffect(() => {
    // Check authentication status when component mounts
    const token = authService.getToken();
    const user = authService.getUser();
    const isAuth = authService.isAuthenticated();
    
    console.log('[CAMERA FORM] Auth status on mount:', {
      isAuthenticated: isAuth,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      user: user ? {
        id: user.id,
        username: user.username,
        role: user.role
      } : null
    });
    
    // If needed, verify token with API
    const verifyToken = async () => {
      try {
        const result = await authService.verifyToken();
        console.log('[CAMERA FORM] Token verification result:', result);
      } catch (err) {
        console.error('[CAMERA FORM] Token verification error:', err);
      }
    };
    
    if (token) {
      verifyToken();
    }
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setCamera(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user corrects it
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!camera.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!camera.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!camera.ipAddress.trim()) {
      errors.ipAddress = 'IP Address is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(camera.ipAddress)) {
      errors.ipAddress = 'Invalid IP Address format';
    }
    
    if (!camera.port) {
      errors.port = 'Port is required';
    } else {
      const portNum = parseInt(camera.port as string);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        errors.port = 'Port must be a number between 1 and 65535';
      }
    }
    
    setFormErrors(errors);
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate form before submission
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }
    
    // Ensure we have a valid authentication token
    const token = authService.getToken();
    if (!token) {
      setError('Authentication required. Please log in again.');
      setTimeout(() => {
        router.push('/login?returnUrl=/cameras/new');
      }, 2000);
      setLoading(false);
      return;
    }
    
    // Check if user has admin privileges
    const user = authService.getUser();
    console.log('[CAMERA FORM] Current user:', user);
    
    if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Admin')) {
      setError('You do not have permission to create cameras. Admin access required.');
      setLoading(false);
      return;
    }
    
    try {
      // Format camera data according to API requirements
      const cameraData = {
        ...camera,
        // Ensure port is sent as a number as required by the API
        port: camera.port ? (typeof camera.port === 'string' ? parseInt(camera.port) : camera.port) : 554
      };
      
      console.log('[CAMERA FORM] Submitting camera data:', cameraData);
      console.log('[CAMERA FORM] Using token:', token.substring(0, 10) + '...');
      
      const response = await cameraService.createCamera(cameraData);
      
      console.log('[CAMERA FORM] Create camera response:', response);
      
      if (response.success && response.data) {
        // Show success message
        setSuccess('Camera created successfully!');
        
        // Redirect to cameras list after a brief delay
        setTimeout(() => {
          router.push('/cameras');
        }, 1500);
      } else {
        // Handle different error scenarios
        if (response.error?.includes('Authentication required')) {
          setError('Authentication error: ' + response.error);
          // Redirect to login if authentication failed
          setTimeout(() => {
            router.push('/login?returnUrl=/cameras/new');
          }, 2000);
        } else if (response.error?.includes('permission')) {
          setError('Permission error: ' + response.error);
        } else if (response.error?.includes('port') || response.error?.includes('Port')) {
          // Specific error for port issues
          setFormErrors(prev => ({ 
            ...prev, 
            port: response.error || 'Invalid port format' 
          }));
          setError('Validation error: Please check the form fields.');
        } else if (response.error?.includes('IP') || response.error?.includes('ip')) {
          // Specific error for IP address issues
          setFormErrors(prev => ({ 
            ...prev, 
            ipAddress: response.error || 'Invalid IP address format' 
          }));
          setError('Validation error: Please check the form fields.');
        } else {
          // Generic error
          setError(response.error || 'Failed to create camera. Please try again.');
        }
      }
    } catch (err) {
      console.error('[CAMERA FORM] Error creating camera:', err);
      setError('An unexpected error occurred while creating the camera. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/" passHref>
          <Typography
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.secondary' }}
            component="a"
          >
            <Home sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Typography>
        </Link>
        <Link href="/cameras" passHref>
          <Typography
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.secondary' }}
            component="a"
          >
            <Videocam sx={{ mr: 0.5 }} fontSize="small" />
            Cameras
          </Typography>
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          New Camera
        </Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" gutterBottom>
        Add New Camera
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Camera Name"
              name="name"
              value={camera.name}
              onChange={handleChange}
              required
              fullWidth
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading}
            />
            
            <TextField
              label="Location"
              name="location"
              value={camera.location}
              onChange={handleChange}
              required
              fullWidth
              error={!!formErrors.location}
              helperText={formErrors.location}
              disabled={loading}
            />
            
            <TextField
              label="IP Address"
              name="ipAddress"
              value={camera.ipAddress}
              onChange={handleChange}
              required
              fullWidth
              placeholder="192.168.1.100"
              error={!!formErrors.ipAddress}
              helperText={formErrors.ipAddress || "Camera's IP address on the network (e.g., 192.168.1.100)"}
              disabled={loading}
            />
            
            <TextField
              label="Port"
              name="port"
              value={camera.port}
              onChange={handleChange}
              required
              fullWidth
              placeholder="554"
              error={!!formErrors.port}
              helperText={formErrors.port || "RTSP port (default: 554)"}
              disabled={loading}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="active"
                  checked={camera.active}
                  onChange={handleChange}
                  disabled={loading}
                />
              }
              label="Active"
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push('/cameras')}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Creating...' : 'Create Camera'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Add a Debug button for admin users */}
      {process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Debug Options</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              size="small" 
              variant="outlined" 
              color="secondary"
              onClick={async () => {
                try {
                  // Log current auth state
                  const currentToken = authService.getToken();
                  const currentUser = authService.getUser();
                  console.log('Current auth state:', { currentToken: !!currentToken, currentUser });
                  
                  // Try admin login
                  const response = await authService.login('admin', 'adminpass');
                  console.log('Debug login result:', response);
                  
                  if (response.success) {
                    setSuccess('Admin login successful! Refreshing page...');
                    setTimeout(() => window.location.reload(), 1000);
                  } else {
                    setError('Admin login failed: ' + response.error);
                  }
                } catch (err) {
                  console.error('Debug login error:', err);
                  setError('Login error: ' + (err instanceof Error ? err.message : 'Unknown error'));
                }
              }}
            >
              Login as Admin
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              color="warning"
              onClick={() => {
                authService.logout();
                setError('Logged out. Redirecting to login page...');
                setTimeout(() => router.push('/login?returnUrl=/cameras/new'), 1500);
              }}
            >
              Force Logout
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
} 