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
  TextField,
  InputAdornment,
  MenuItem,
  TablePagination,
  Skeleton,
  Button,
  Chip,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon, 
  Clear as ClearIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { activityLogService } from '@/services/api';
import { ActivityLog } from '@/services/api/types';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Export options
  const [exporting, setExporting] = useState(false);

  // Fetch logs based on filters
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await activityLogService.getActivityLogs({
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        search: searchTerm.trim() || undefined,
        user: userFilter || undefined,
        action: actionFilter || undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });

      if (response.success && response.data) {
        setLogs(response.data.data);
        setTotalLogs(response.data.total);
      } else {
        setError(response.error || 'Failed to fetch activity logs');
      }
    } catch (err) {
      setError('Error loading activity logs. Please try again.');
      console.error('Error loading activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, searchTerm, userFilter, actionFilter, startDate, endDate]);

  // Handle search input
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setUserFilter('');
    setActionFilter('');
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  // Export logs
  const exportLogs = async (format: 'CSV' | 'PDF') => {
    try {
      setExporting(true);
      const response = await activityLogService.exportActivityLogs(format, {
        page: 1,
        limit: 1000, // Export more logs
        search: searchTerm.trim() || undefined,
        user: userFilter || undefined,
        action: actionFilter || undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });

      if (response.success && response.data) {
        setSuccess(`Activity logs exported successfully as ${format}`);
        // In a real app, this would trigger a download
        console.log('Download URL:', response.data);
      } else {
        setError(response.error || `Failed to export logs as ${format}`);
      }
    } catch (err) {
      setError(`Error exporting logs as ${format}. Please try again.`);
      console.error('Error exporting logs:', err);
    } finally {
      setExporting(false);
    }
  };

  // Get unique users and actions for filter dropdowns (in a real app this would come from an API)
  const uniqueUsers = [...new Set(logs.map(log => log.user))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Activity Log</Typography>
        <Box>
          <Tooltip title="Export as CSV">
            <IconButton 
              onClick={() => exportLogs('CSV')}
              disabled={exporting || totalLogs === 0}
              sx={{ mr: 1 }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>
      </Box>

      {/* Search box always visible */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Search Logs"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Additional filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="User"
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="">All Users</MenuItem>
                {uniqueUsers.map(user => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Action"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="">All Actions</MenuItem>
                {uniqueActions.map(action => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue: Date | null) => {
                    setStartDate(newValue);
                    setPage(0);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue: Date | null) => {
                    setEndDate(newValue);
                    setPage(0);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={resetFilters} startIcon={<ClearIcon />}>
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Activity Log Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No activity logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.user}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={() => {
                        setUserFilter(log.user);
                        setShowFilters(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={
                        log.action.includes('Created') || log.action.includes('Added')
                          ? 'success'
                          : log.action.includes('Deleted')
                          ? 'error'
                          : log.action.includes('Updated') || log.action.includes('Edited')
                          ? 'info'
                          : 'default'
                      }
                      onClick={() => {
                        setActionFilter(log.action);
                        setShowFilters(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>{log.details || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalLogs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

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