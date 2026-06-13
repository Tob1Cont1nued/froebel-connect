import { useRouteError, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

export default function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f5f5f5' }}>
      <Typography variant="h1" sx={{ fontSize: 64, mb: 1 }}>😕</Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        Etwas ist schiefgelaufen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: 320 }}>
        {error?.statusText === '404' ? 'Diese Seite wurde nicht gefunden.' : 'Bitte lade die App neu oder geh zurück zur Startseite.'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
          Neu laden
        </Button>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/login')}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#6B8A15', color: 'white' } }}>
          Startseite
        </Button>
      </Box>
    </Box>
  );
}
