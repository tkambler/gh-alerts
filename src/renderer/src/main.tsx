import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { margin: 0, padding: 0, height: '100%' },
        body: { margin: 0, padding: 0, height: '100%' },
        '#root': { height: '100%' },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
