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
} from '@mui/icons-material';
import Link from 'next/link';
import { cameraService } from '@/services/api';

export default function NewCameraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Camera form state
  const [cameraData, setCameraData] = useState({
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
    setCameraData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!cameraData.name.trim()) {
      newErrors.name = 'Camera name is required';
    }
    
    if (!cameraData.location.trim()) {
      newErrors.location = 'Camera location is required';
    }
    
    if (!cameraData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(cameraData.ipAddress)) {
      newErrors.ipAddress = 'Please enter a valid IP address (e.g., 192.168.1.1)';
    }
    
    if (!cameraData.port.toString().trim()) {
      newErrors.port = 'Port is required';
    } else if (!/^\d+$/.test(cameraData.port.toString()) || parseInt(cameraData.port.toString()) < 1 || parseInt(cameraData.port.toString()) > 65535) {
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
    
    try {
      setLoading(true);
      
      const response = await cameraService.createCamera({
        name: cameraData.name,
        location: cameraData.location,
        ipAddress: cameraData.ipAddress,
        port: cameraData.port,
        active: cameraData.active,
      });
      
      if (response.success && response.data) {
        // Redirect to cameras list on success
        router.push('/cameras');
      } else {
        setError(response.error || 'Failed to create camera');
      }
    } catch (err) {
      setError('Error creating camera. Please try again.');
      console.error('Error creating camera:', err);
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
          <Link href="/" passHref>
            <MuiLink 
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
              underline="hover"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </MuiLink>
          </Link>
          <Link href="/cameras" passHref>
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
            Add New Camera
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
              value={cameraData.name}
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
              value={cameraData.location}
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
              value={cameraData.ipAddress}
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
              value={cameraData.port}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.port}
              helperText={errors.port || 'Default RTSP port: 554'}
              disabled={loading}
            />
          </Grid>
          
          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={cameraData.active}
                  onChange={handleChange}
                  color="success"
                  disabled={loading}
                />
              }
              label={cameraData.active ? 'Active' : 'Inactive'}
            />
            <Typography variant="body2" color="text.secondary">
              {cameraData.active 
                ? 'Camera will be operational immediately' 
                : 'Camera will be added but set to inactive state'}
            </Typography>
          </Grid>
          
          {/* Notes (Optional) */}
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes (Optional)"
              value={cameraData.notes}
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