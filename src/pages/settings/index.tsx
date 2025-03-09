import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Container,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Save as SaveIcon,
  HomeRepairService as ServiceIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';

const SettingSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const theme = useMuiTheme();
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: theme.palette.primary.main + '15',
            color: theme.palette.primary.main,
            borderRadius: '50%',
            width: 40,
            height: 40,
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const { user } = useAuth();
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useTheme(); 
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notifyByPush, setNotifyByPush] = useState(false);
  const [language, setLanguage] = useState('en');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side only effect
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to your backend
    console.log({
      darkMode: mode === 'dark',
      notifyByEmail,
      notifyByPush,
      language,
    });
    
    // Show success message
    setSaveSuccess(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="medium">
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Customize your application preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Appearance Settings */}
          <SettingSection title="Appearance" icon={<DarkModeIcon />}>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={mounted && mode === 'dark'} 
                    onChange={toggleTheme}
                    color="primary"
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {mode === 'dark' ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
                    <Typography>{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Typography>
                  </Box>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Choose between dark and light mode for the application interface.
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Choose your preferred language for the application.
              </Typography>
            </Box>
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection title="Notifications" icon={<NotificationsIcon />}>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={notifyByEmail} 
                    onChange={(e) => setNotifyByEmail(e.target.checked)}
                    color="primary"
                  />
                } 
                label="Email Notifications" 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive email notifications for important events.
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={notifyByPush} 
                    onChange={(e) => setNotifyByPush(e.target.checked)}
                    color="primary"
                  />
                } 
                label="Push Notifications" 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive push notifications in your browser.
              </Typography>
            </Box>
          </SettingSection>

          {/* Save Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* User Profile Summary */}
          <SettingSection title="Profile" icon={<PersonIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                sx={{ 
                  bgcolor: muiTheme.palette.primary.main, 
                  color: 'white',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  mr: 2
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || ''}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Role: <strong>{user?.role || 'User'}</strong>
            </Typography>
            <Button variant="outlined" color="primary" size="small" sx={{ mt: 1 }}>
              Edit Profile
            </Button>
          </SettingSection>

          {/* System Info */}
          <SettingSection title="System Information" icon={<ServiceIcon />}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              App Version: <strong>1.0.0</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Last Update: <strong>June 10, 2023</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              System Status: <strong style={{ color: '#4caf50' }}>Operational</strong>
            </Typography>
          </SettingSection>
        </Grid>
      </Grid>

      {/* Success Notification */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSaveSuccess(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
} 