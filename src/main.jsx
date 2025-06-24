import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function useStoredState(key, initial) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('storageError', { detail: { key, error: e } }));
    }
  }, [key, state]);
  return [state, setState];
}

function Root() {
  const [darkMode, setDarkMode] = useStoredState('darkMode', false);
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#2e7d32' }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            border: '1px solid #1b5e20',
            backgroundColor: '#256428',
            color: '#fff',
            '&:hover': { backgroundColor: '#1b5e20' }
          }
        }
      }
    }
  }), [darkMode]);
  return (
    <ThemeProvider theme={theme}>
      <App darkMode={darkMode} setDarkMode={setDarkMode} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
