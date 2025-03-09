import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { mode, setTheme } = useTheme();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [success, setSuccess] = useState<string | null>(null);
  
  // Mock registration info (in a real app, this would come from the API)
  const registrationInfo = {
    name: 'John Smith',
    company: 'Acme Corporation',
    email: 'john.smith@acmecorp.com',
    registrationDate: '2023-01-15',
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value as 'en' | 'es');
    setSuccess('Language preference saved');
    // In a real app, this would save the preference to the server/localStorage
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Theme"
                  secondary="Choose between light and dark theme"
                />
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mode === 'dark'}
                        onChange={(e) => {
                          setTheme(e.target.checked ? 'dark' : 'light');
                          setSuccess('Theme updated successfully');
                        }}
                      />
                    }
                    label={mode === 'dark' ? 'Dark' : 'Light'}
                  />
                </Box>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Language"
                  secondary="Select your preferred language"
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <Select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as 'en' | 'es');
                      setSuccess('Language updated successfully');
                    }}
                    size="small"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Registration Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Registration Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Name" secondary={registrationInfo.name} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Company" secondary={registrationInfo.company} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Email" secondary={registrationInfo.email} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Registration Date" 
                  secondary={new Date(registrationInfo.registrationDate).toLocaleDateString()} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="API Endpoint"
                  value="https://api.example.com/v1"
                  fullWidth
                  disabled
                  helperText="Contact administrator to change"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  defaultValue={30}
                  fullWidth
                  InputProps={{
                    inputProps: { min: 1, max: 120 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={() => setSuccess('Settings saved successfully')}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

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