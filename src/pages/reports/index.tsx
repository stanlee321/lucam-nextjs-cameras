import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as CsvIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { reportService } from '@/services/api';
import { Report } from '@/services/api/types';

export default function ReportsPage() {
  // States for report generation form
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  // States for report list
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReports, setTotalReports] = useState(0);

  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch report types and existing reports on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get report types
        const typesResponse = await reportService.getReportTypes();
        if (typesResponse.success && typesResponse.data) {
          setReportTypes(typesResponse.data);
        }
        
        // Get reports
        fetchReports();
      } catch (err) {
        setError('Error loading report data. Please try again.');
        console.error('Error loading report data:', err);
      }
    };
    
    fetchData();
  }, []);

  // Fetch reports with pagination
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReports({
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
      });

      if (response.success && response.data) {
        setReports(response.data.data);
        setTotalReports(response.data.total);
      } else {
        setError(response.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Error loading reports. Please try again.');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update reports list when pagination changes
  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage]);

  // Handle generating a new report
  const handleGenerateReport = async () => {
    if (!reportType) {
      setError('Please select a report type');
      return;
    }

    try {
      setGenerating(true);
      
      const response = await reportService.generateReport(reportType, {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        format,
      });

      if (response.success && response.data) {
        setSuccess(`${reportType} report generated successfully`);
        fetchReports(); // Refresh the reports list
        
        // Reset form
        setReportType('');
        setStartDate(null);
        setEndDate(null);
      } else {
        setError(response.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Error generating report. Please try again.');
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Handle downloading a report
  const handleDownloadReport = async (id: number) => {
    try {
      const response = await reportService.downloadReport(id);
      
      if (response.success && response.data) {
        setSuccess('Report download initiated');
        // In a real app, this would trigger a file download
        console.log('Download URL:', response.data);
      } else {
        setError(response.error || 'Failed to download report');
      }
    } catch (err) {
      setError('Error downloading report. Please try again.');
      console.error('Error downloading report:', err);
    }
  };

  // Handle deleting a report
  const handleDeleteReport = async (id: number) => {
    try {
      const response = await reportService.deleteReport(id);
      
      if (response.success) {
        setSuccess('Report deleted successfully');
        fetchReports(); // Refresh the list
      } else {
        setError(response.error || 'Failed to delete report');
      }
    } catch (err) {
      setError('Error deleting report. Please try again.');
      console.error('Error deleting report:', err);
    }
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      {/* Report Generation Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate New Report
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
                disabled={generating}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue: Date | null) => setStartDate(newValue)}
                disabled={generating}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue: Date | null) => setEndDate(newValue)}
                disabled={generating}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </LocalizationProvider>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="format-label">Format</InputLabel>
              <Select
                labelId="format-label"
                value={format}
                label="Format"
                onChange={(e) => setFormat(e.target.value as 'PDF' | 'CSV')}
                disabled={generating}
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={generating || !reportType}
              startIcon={<DownloadIcon />}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Available Reports List */}
      <Paper>
        <Box p={3} pb={1}>
          <Typography variant="h6">Available Reports</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Generated On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={60} height={36} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={100} height={36} /></TableCell>
                  </TableRow>
                ))
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No reports available
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>
                      <Chip
                        icon={report.format === 'PDF' ? <PdfIcon /> : <CsvIcon />}
                        label={report.format}
                        color={report.format === 'PDF' ? 'error' : 'primary'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.generatedOn).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleDownloadReport(report.id)}
                        title="Download"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteReport(report.id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalReports}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
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