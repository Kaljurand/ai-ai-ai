import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useStoredState from "./useStoredState";


function Root() {
  const [darkMode, setDarkMode] = useStoredState('darkMode', false);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: { main: '#2da44e' },
          background: {
            default: darkMode ? '#0d1117' : '#f6f8fa',
            paper: darkMode ? '#161b22' : '#ffffff'
          }
        },
        typography: {
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#161b22' : '#24292e'
              }
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                textTransform: 'none'
              }
            }
          }
        }
      }),
    [darkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App darkMode={darkMode} setDarkMode={setDarkMode} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
