import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  // Sobald das Profil geladen ist und ein Login lief → weiterleiten
  useEffect(() => {
    if (pendingRedirect && profile) {
      if (profile.role === 'fachkraft' && profile.is_leitung) navigate('/leitung/dashboard');
      else if (profile.role === 'fachkraft') navigate('/team/dashboard');
      else if (profile.role === 'traeger') navigate('/traeger/dashboard');
      else navigate('/eltern/dashboard');
    }
  }, [pendingRedirect, profile, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await signIn(email, password);
    if (err) {
      setError('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
      setLoading(false);
      return;
    }
    setPendingRedirect(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1A3545 0%, #2D5468 50%, #1A3545 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
          FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
          Kita-App · Sicher & DSGVO-konform
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2.5 }}>
            Anmelden
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="E-Mail-Adresse"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ mb: 2 }}
            autoComplete="email"
          />
          <TextField
            label="Passwort"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ mb: 3 }}
            autoComplete="current-password"
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#6B8A15', color: 'white' } }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#1A3545' }} /> : 'Anmelden'}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Erste Anmeldung?{' '}
            <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}>
              Zugang anfordern
            </Box>
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 3 }}>
        DSGVO-konform · Hosting in Deutschland · ISO 27001
      </Typography>
    </Box>
  );
}
