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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { cameraService } from '@/services/api';
import { Camera } from '@/services/api/types';

export default function CamerasPage() {
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
    try {
      setLoading(true);
      const response = await cameraService.getCameras({
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        active: showInactive ? undefined : true,
        search: searchTerm.trim() || undefined,
      });

      if (response.success && response.data) {
        setCameras(response.data.data);
        setTotalCameras(response.data.total);
      } else {
        setError(response.error || 'Failed to fetch cameras');
      }
    } catch (err) {
      setError('Error loading cameras. Please try again.');
      console.error('Error loading cameras:', err);
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
    try {
      const response = await cameraService.updateCamera(camera.id, {
        active: !camera.active,
      });

      if (response.success && response.data) {
        setSuccess(`Camera ${response.data.name} ${response.data.active ? 'enabled' : 'disabled'}`);
        // Update the camera in the list
        setCameras(prevCameras =>
          prevCameras.map(c => (c.id === camera.id ? response.data! : c))
        );
      } else {
        setError(response.error || 'Failed to update camera status');
      }
    } catch (err) {
      setError('Error updating camera status. Please try again.');
      console.error('Error updating camera:', err);
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
  const handleDeleteCamera = async () => {
    if (!cameraToDelete) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      const response = await cameraService.deleteCamera(cameraToDelete.id);

      if (response.success) {
        setSuccess(`Camera ${cameraToDelete.name} deleted`);
        // Remove camera from the list
        setCameras(prevCameras => prevCameras.filter(c => c.id !== cameraToDelete.id));
        setTotalCameras(prev => prev - 1);
      } else {
        setError(response.error || 'Failed to delete camera');
      }
    } catch (err) {
      setError('Error deleting camera. Please try again.');
      console.error('Error deleting camera:', err);
    } finally {
      setDeleteDialogOpen(false);
      setCameraToDelete(null);
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

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cameras</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/cameras/new"
        >
          Add Camera
        </Button>
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
                      <Tooltip title="Edit">
                        <IconButton
                          component={Link}
                          href={`/cameras/${camera.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCameraToDelete(camera);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
          <Button onClick={handleDeleteCamera} color="error" variant="contained">
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