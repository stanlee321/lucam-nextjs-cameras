import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;

    // If we're already authenticated and not in loading state
    if (isAuthenticated && !authLoading) {
      console.log('Already authenticated, redirecting from login');
      const returnUrl = router.query.returnUrl as string || '/';
      router.push(returnUrl);
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Form input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user types
    if (error) setError(null);
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const { username, password } = credentials;
    
    // Simple validation
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('Submitting login form');
      const success = await login(username, password);
      
      console.log('Login result:', success);
      
      if (success) {
        // Get the return URL from query parameters or default to dashboard
        const returnUrl = router.query.returnUrl as string || '/';
        console.log('Login successful, redirecting to', returnUrl);
        
        // Use router.replace instead of push to avoid adding to history
        router.replace(returnUrl);
      } else {
        setError(authError || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If loading auth state, show loading
  if (authLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <>
      <Head>
        <title>Login | LucaM Camera System</title>
      </Head>
      
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper 
          elevation={4} 
          sx={{ 
            p: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              LucaM Camera System
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Enter your credentials to access the system
            </Typography>
          </Box>
          
          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.2 }}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                API Credentials (from documentation):
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Admin: <strong>admin / adminpass</strong><br />
                User: <strong>user / userpass</strong>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} LucaM Camera System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </>
  );
} 