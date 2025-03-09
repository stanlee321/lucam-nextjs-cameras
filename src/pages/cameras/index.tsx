import { useState, useEffect, ChangeEvent } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Switch,
  Checkbox,
  TextField,
  InputAdornment,
  FormControlLabel,
  Tooltip,
  TablePagination,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Camera as CameraIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { cameraService } from '@/services/api/cameraService';
import { Camera } from '@/services/api/types';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function CamerasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCameras, setTotalCameras] = useState(0);
  const [selectedCameras, setSelectedCameras] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable' | null>(null);

  // Fetch cameras based on filters
  const fetchCameras = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await cameraService.getCameras({
        page: page + 1, // MUI Table uses 0-based index, API uses 1-based
        limit: rowsPerPage,
        search: searchTerm.trim() || undefined,
        active: showInactive ? undefined : true,
      });
      
      if (response.success && response.data) {
        setCameras(response.data.data);
        setTotalCameras(response.data.total);
      } else {
        setError(response.error || 'Failed to fetch cameras');
        setCameras([]);
      }
    } catch (err) {
      console.error('Error fetching cameras:', err);
      setError('An error occurred while fetching cameras');
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchCameras();
  }, [page, rowsPerPage, showInactive, searchTerm]);

  // Handle search input
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  // Toggle camera active status
  const handleToggleActive = async (camera: Camera) => {
    // Check permissions
    if (user?.role !== 'SuperAdmin' && user?.role !== 'Admin') {
      setError('You do not have permission to update camera status');
      return;
    }
    
    try {
      const response = await cameraService.updateCamera(camera.id, {
        ...camera,
        active: !camera.active
      });
      
      if (response.success) {
        // Refresh the camera list
        fetchCameras();
      } else {
        setError(response.error || 'Failed to update camera status');
      }
    } catch (err) {
      console.error('Error updating camera:', err);
      setError('An error occurred while updating the camera');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedCameras.length === 0) {
      setBulkActionDialogOpen(false);
      return;
    }

    try {
      const response = await cameraService.bulkUpdateCameras(selectedCameras, {
        active: bulkAction === 'enable',
      });

      if (response.success && response.data) {
        setSuccess(
          `${response.data.updated} cameras ${bulkAction === 'enable' ? 'enabled' : 'disabled'}`
        );
        fetchCameras(); // Refresh the list
        setSelectedCameras([]); // Clear selection
      } else {
        setError(response.error || 'Failed to perform bulk action');
      }
    } catch (err) {
      setError('Error performing bulk action. Please try again.');
      console.error('Error with bulk action:', err);
    } finally {
      setBulkActionDialogOpen(false);
    }
  };

  // Handle delete camera
  const handleDeleteCamera = async (cameraId: number) => {
    // Check permissions
    if (user?.role !== 'SuperAdmin' && user?.role !== 'Admin') {
      setError('You do not have permission to delete cameras');
      return;
    }
    
    try {
      setLoading(true);
      const response = await cameraService.deleteCamera(cameraId);
      
      if (response.success) {
        // Refresh the camera list
        fetchCameras();
        // Show success message
        setSuccess('Camera deleted successfully');
      } else {
        setError(response.error || 'Failed to delete camera');
      }
    } catch (err) {
      console.error('Error deleting camera:', err);
      setError('An error occurred while deleting the camera');
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of all cameras on the page
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = cameras.map(camera => camera.id);
      setSelectedCameras(newSelected);
      return;
    }
    setSelectedCameras([]);
  };

  // Handle selection of a single camera
  const handleSelectClick = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const selectedIndex = selectedCameras.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedCameras, id];
    } else {
      newSelected = selectedCameras.filter(cameraId => cameraId !== id);
    }

    setSelectedCameras(newSelected);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Computed properties
  const numSelected = selectedCameras.length;
  const isSelected = (id: number) => selectedCameras.includes(id);

  // Add camera button (with permission check)
  const renderAddCameraButton = () => {
    const canAddCamera = user?.role === 'SuperAdmin' || user?.role === 'Admin';
    
    return (
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => router.push('/cameras/new')}
        disabled={!canAddCamera}
        sx={{ ml: 2 }}
      >
        Add Camera
      </Button>
    );
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
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <CameraIcon sx={{ mr: 0.5 }} fontSize="small" />
            Cameras
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h4" component="h1">
            Cameras
          </Typography>
          
          <Box>
            {numSelected > 0 && (
              <Tooltip title="Delete selected">
                <IconButton 
                  onClick={() => {
                    setBulkAction('disable');
                    setBulkActionDialogOpen(true);
                  }}
                  disabled={user?.role !== 'SuperAdmin' && user?.role !== 'Admin'}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            {renderAddCameraButton()}
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Search Cameras"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Show Inactive"
          />
        </Box>
      </Paper>

      {/* Bulk actions toolbar */}
      {numSelected > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.dark', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">{numSelected} selected</Typography>
            <Box>
              <Button
                color="inherit"
                onClick={() => {
                  setBulkAction('enable');
                  setBulkActionDialogOpen(true);
                }}
                sx={{ mr: 1 }}
              >
                Enable Selected
              </Button>
              <Button
                color="inherit"
                onClick={() => {
                  setBulkAction('disable');
                  setBulkActionDialogOpen(true);
                }}
              >
                Disable Selected
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Cameras Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={numSelected > 0 && numSelected < cameras.length}
                  checked={cameras.length > 0 && numSelected === cameras.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all cameras' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Port</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Last Seen</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={100} height={30} /></TableCell>
                </TableRow>
              ))
            ) : cameras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No cameras found
                </TableCell>
              </TableRow>
            ) : (
              cameras.map((camera) => {
                const isItemSelected = isSelected(camera.id);
                const labelId = `enhanced-table-checkbox-${camera.id}`;

                return (
                  <TableRow
                    key={camera.id}
                    hover
                    onClick={(event) => {
                      if ((event.target as HTMLElement).tagName !== 'INPUT' && 
                          (event.target as HTMLElement).tagName !== 'BUTTON' &&
                          !(event.target as HTMLElement).closest('button')) {
                        handleSelectClick({
                          target: { checked: !isItemSelected }
                        } as React.ChangeEvent<HTMLInputElement>, camera.id);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ 
                      cursor: 'pointer',
                      opacity: camera.active ? 1 : 0.7,
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleSelectClick(event, camera.id)}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell id={labelId}>{camera.id}</TableCell>
                    <TableCell>{camera.name}</TableCell>
                    <TableCell>{camera.location}</TableCell>
                    <TableCell>{camera.ipAddress || 'Not set'}</TableCell>
                    <TableCell>{camera.port || '554'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          checked={camera.active}
                          onChange={() => handleToggleActive(camera)}
                          color={camera.active ? 'success' : 'default'}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {camera.active ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {camera.lastSeen ? new Date(camera.lastSeen).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            aria-label="edit"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/cameras/${camera.id}`);
                            }}
                            disabled={user?.role !== 'SuperAdmin' && user?.role !== 'Admin'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCameraToDelete(camera);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={user?.role !== 'SuperAdmin' && user?.role !== 'Admin'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCameras}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Camera</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete camera "{cameraToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteCamera(cameraToDelete?.id || 0)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
      >
        <DialogTitle>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {bulkAction === 'enable' ? 'enable' : 'disable'} {numSelected} selected cameras?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkAction} color="primary" variant="contained">
            Confirm
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