import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
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
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
