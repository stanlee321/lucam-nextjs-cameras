import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Videocam as CameraIcon,
  Home as HomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { cameraService } from '@/services/api';

export default function NewCameraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Camera form state
  const [camera, setCamera] = useState({
    name: '',
    location: '',
    ipAddress: '',
    port: '554', // Default RTSP port
    active: true,
    notes: '',
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCamera(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'port' 
          ? value === '' ? '' : Number(value) // Convert port to number, but allow empty string for validation
          : value,
    }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!camera.name.trim()) {
      newErrors.name = 'Camera name is required';
    }
    
    if (!camera.location.trim()) {
      newErrors.location = 'Camera location is required';
    }
    
    if (!camera.ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(camera.ipAddress)) {
      newErrors.ipAddress = 'Please enter a valid IP address (e.g., 192.168.1.1)';
    }
    
    if (!camera.port.toString().trim()) {
      newErrors.port = 'Port is required';
    } else if (!/^\d+$/.test(camera.port.toString()) || parseInt(camera.port.toString()) < 1 || parseInt(camera.port.toString()) > 65535) {
      newErrors.port = 'Please enter a valid port number (1-65535)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure port is a number
      const cameraToSubmit = {
        ...camera,
        port: typeof camera.port === 'string' ? Number(camera.port) : camera.port
      };
      
      console.log('Submitting camera data:', cameraToSubmit);
      
      // Create camera
      const response = await cameraService.createCamera(cameraToSubmit);
      
      console.log('Create camera response:', response);
      
      if (response.success) {
        setError('Camera created successfully');
        // Redirect to cameras page after a short delay
        setTimeout(() => {
          router.push('/cameras');
        }, 1500);
      } else {
        // Show detailed error message from API
        const errorMessage = response.error || 'Failed to create camera';
        setError(errorMessage);
        
        // If it's a port-related error, set a specific field error
        if (errorMessage.toLowerCase().includes('port')) {
          setErrors(prev => ({ 
            ...prev, 
            port: 'Invalid port format. Must be a number between 1-65535.'
          }));
        }
      }
    } catch (err) {
      console.error('Error in handle submit:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel and return to cameras list
  const handleCancel = () => {
    router.push('/cameras');
  };
  
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/" passHref legacyBehavior>
            <MuiLink 
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
              underline="hover"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </MuiLink>
          </Link>
          <Link href="/cameras" passHref legacyBehavior>
            <MuiLink
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
              underline="hover"
            >
              <CameraIcon sx={{ mr: 0.5 }} fontSize="small" />
              Cameras
            </MuiLink>
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <AddIcon sx={{ mr: 0.5 }} fontSize="small" />
            Add Camera
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
          Add New Camera
        </Typography>
      </Box>
      
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        elevation={3} 
        sx={{ p: 4 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Camera Details
            </Typography>
            <Divider />
          </Grid>
          
          {/* Camera Name */}
          <Grid item xs={12} md={6}>
            <TextField
              name="name"
              label="Camera Name"
              value={camera.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name || 'Enter a descriptive name for the camera'}
              disabled={loading}
            />
          </Grid>
          
          {/* Camera Location */}
          <Grid item xs={12} md={6}>
            <TextField
              name="location"
              label="Location"
              value={camera.location}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.location}
              helperText={errors.location || 'Where is this camera installed?'}
              disabled={loading}
            />
          </Grid>
          
          {/* IP Address */}
          <Grid item xs={12} md={6}>
            <TextField
              name="ipAddress"
              label="IP Address"
              value={camera.ipAddress}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.ipAddress}
              helperText={errors.ipAddress || 'Example: 192.168.1.100'}
              disabled={loading}
            />
          </Grid>
          
          {/* Port */}
          <Grid item xs={12} md={6}>
            <TextField
              name="port"
              label="Port"
              value={camera.port}
              onChange={handleChange}
              fullWidth
              required
              type="number" // Ensure we're using number input
              inputProps={{ min: 1, max: 65535 }} // Add min/max constraints
              error={!!errors.port}
              helperText={errors.port || 'Default RTSP port: 554 (must be a number)'}
              disabled={loading}
            />
          </Grid>
          
          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={camera.active}
                  onChange={handleChange}
                  color="success"
                  disabled={loading}
                />
              }
              label={camera.active ? 'Active' : 'Inactive'}
            />
            <Typography variant="body2" color="text.secondary">
              {camera.active 
                ? 'Camera will be operational immediately' 
                : 'Camera will be added but set to inactive state'}
            </Typography>
          </Grid>
          
          {/* Notes (Optional) */}
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes (Optional)"
              value={camera.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              helperText="Add any additional information about this camera"
              disabled={loading}
            />
          </Grid>
          
          {/* Form Actions */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Camera'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
} 