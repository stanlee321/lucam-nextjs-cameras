import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

// Create a default theme context
const defaultThemeContext: ThemeContextType = {
  mode: 'light',
  toggleTheme: () => {},
  theme: createTheme({
    palette: {
      mode: 'light',
    },
  }),
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use localStorage to persist theme preference, defaulting to 'light'
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>('light');

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('theme_mode');
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    }
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme_mode', newMode);
    }
  };

  // Create a theme instance based on the current mode
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode palette
            primary: {
              main: '#1976d2',
            },
            secondary: {
              main: '#dc004e',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
          }
        : {
            // Dark mode palette
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#f48fb1',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#1976d2' : '#272727',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleTheme,
        theme,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 