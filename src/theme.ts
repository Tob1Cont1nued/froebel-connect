import { createTheme } from '@mui/material/styles';

// FRÖBEL Corporate Design Colors
// Lime green: #95C11F · Dark navy-green: #1A3545
export const theme = createTheme({
  palette: {
    primary: {
      main: '#95C11F',
      light: '#C8E05C',
      dark: '#6B8A15',
      contrastText: '#1A3545',
    },
    secondary: {
      main: '#1A3545',
      light: '#2D5468',
      dark: '#0D1F29',
      contrastText: '#fff',
    },
    background: {
      default: '#F4F6F2',
      paper: '#FFFFFF',
    },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
        },
        sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 16 },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          borderTop: '1px solid rgba(0,0,0,0.08)',
          height: 64,
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});
