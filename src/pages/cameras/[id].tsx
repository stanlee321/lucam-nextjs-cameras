import { useState, useEffect } from 'react';
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
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Videocam as CameraIcon,
  Home as HomeIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { cameraService } from '@/services/api';
import { Camera } from '@/services/api/types';

export default function EditCameraPage() {
  const router = useRouter();
  const { id } = router.query;
  const cameraId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Camera form state
  const [cameraData, setCameraData] = useState<Partial<Camera>>({
    name: '',
    location: '',
    ipAddress: '',
    port: '554', // Default RTSP port
    active: true,
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch camera data when ID is available
  useEffect(() => {
    const fetchCamera = async () => {
      if (!cameraId) return;
      
      try {
        setLoading(true);
        const response = await cameraService.getCameraById(cameraId);
        
        if (response.success && response.data) {
          setCameraData(response.data);
        } else {
          setError(response.error || 'Failed to fetch camera details');
        }
      } catch (err) {
        setError('Error loading camera details. Please try again.');
        console.error('Error loading camera:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCamera();
  }, [cameraId]);
  
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
    
    if (!cameraData.name?.trim()) {
      newErrors.name = 'Camera name is required';
    }
    
    if (!cameraData.location?.trim()) {
      newErrors.location = 'Camera location is required';
    }
    
    if (!cameraData.ipAddress?.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else if (cameraData.ipAddress && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(cameraData.ipAddress)) {
      newErrors.ipAddress = 'Please enter a valid IP address (e.g., 192.168.1.1)';
    }
    
    if (!cameraData.port?.toString().trim()) {
      newErrors.port = 'Port is required';
    } else if (cameraData.port && (!/^\d+$/.test(cameraData.port.toString()) || 
               parseInt(cameraData.port.toString()) < 1 || 
               parseInt(cameraData.port.toString()) > 65535)) {
      newErrors.port = 'Please enter a valid port number (1-65535)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !cameraId) {
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await cameraService.updateCamera(cameraId, {
        name: cameraData.name,
        location: cameraData.location,
        ipAddress: cameraData.ipAddress,
        port: cameraData.port,
        active: cameraData.active,
      });
      
      if (response.success && response.data) {
        setSuccess('Camera updated successfully');
        // Update local state with returned data
        setCameraData(response.data);
      } else {
        setError(response.error || 'Failed to update camera');
      }
    } catch (err) {
      setError('Error updating camera. Please try again.');
      console.error('Error updating camera:', err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle camera deletion
  const handleDelete = async () => {
    if (!cameraId) return;
    
    try {
      setSaving(true);
      
      const response = await cameraService.deleteCamera(cameraId);
      
      if (response.success) {
        // Redirect to cameras list on successful deletion
        router.push('/cameras');
      } else {
        setError(response.error || 'Failed to delete camera');
        setConfirmDelete(false);
      }
    } catch (err) {
      setError('Error deleting camera. Please try again.');
      console.error('Error deleting camera:', err);
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };
  
  // Cancel and return to cameras list
  const handleCancel = () => {
    router.push('/cameras');
  };
  
  // Show loading skeleton while fetching camera data
  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Skeleton width={100} />
            <Skeleton width={100} />
            <Skeleton width={150} />
          </Breadcrumbs>
          <Skeleton variant="text" width={250} height={60} sx={{ mt: 2 }} />
        </Box>
        
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width="100%" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={56} />
              <Skeleton variant="text" width={200} sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={56} />
              <Skeleton variant="text" width={200} sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={56} />
              <Skeleton variant="text" width={200} sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width={150} height={40} />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }
  
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
            Edit Camera
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
          Edit Camera: {cameraData.name}
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
              value={cameraData.name || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name || 'Enter a descriptive name for the camera'}
              disabled={saving}
            />
          </Grid>
          
          {/* Camera Location */}
          <Grid item xs={12} md={6}>
            <TextField
              name="location"
              label="Location"
              value={cameraData.location || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.location}
              helperText={errors.location || 'Where is this camera installed?'}
              disabled={saving}
            />
          </Grid>
          
          {/* IP Address */}
          <Grid item xs={12} md={6}>
            <TextField
              name="ipAddress"
              label="IP Address"
              value={cameraData.ipAddress || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.ipAddress}
              helperText={errors.ipAddress || 'Example: 192.168.1.100'}
              disabled={saving}
            />
          </Grid>
          
          {/* Port */}
          <Grid item xs={12} md={6}>
            <TextField
              name="port"
              label="Port"
              value={cameraData.port || '554'}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.port}
              helperText={errors.port || 'Default RTSP port: 554'}
              disabled={saving}
            />
          </Grid>
          
          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={cameraData.active || false}
                  onChange={handleChange}
                  color="success"
                  disabled={saving}
                />
              }
              label={cameraData.active ? 'Active' : 'Inactive'}
            />
            <Typography variant="body2" color="text.secondary">
              {cameraData.active 
                ? 'Camera is operational' 
                : 'Camera is currently inactive'}
            </Typography>
          </Grid>
          
          {/* Camera ID (Read only) */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Camera ID"
              value={cameraData.id || ''}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              disabled
              helperText="System assigned ID (read-only)"
            />
          </Grid>
          
          {/* Last Seen (Read only) */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Last Seen"
              value={cameraData.lastSeen ? new Date(cameraData.lastSeen).toLocaleString() : 'Never'}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              disabled
              helperText="Last time camera was seen online (read-only)"
            />
          </Grid>
          
          {/* Form Actions */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
              >
                Delete
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Delete Camera</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete camera "{cameraData.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
} 