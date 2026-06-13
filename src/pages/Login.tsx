import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Divider from '@mui/material/Divider';
import type { Role } from '../mockData';

const roles: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'eltern', label: 'Eltern', emoji: '👨‍👩‍👧', desc: 'Für Familien' },
  { value: 'fachkraft', label: 'Fachkraft', emoji: '👩‍🏫', desc: 'Erzieher:innen' },
  { value: 'traeger', label: 'Verwaltung', emoji: '🏢', desc: 'Träger & Leitung' },
];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('eltern');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (role === 'eltern') navigate('/eltern/dashboard');
    else if (role === 'fachkraft') navigate('/team/dashboard');
    else navigate('/traeger/dashboard');
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
      {/* Wordmark */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
          FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
          Kita-App · Kita Langebusch, Münster
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Anmelden
          </Typography>

          {/* Role selector */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Ich bin …
          </Typography>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, v) => v && setRole(v)}
            fullWidth
            size="small"
            sx={{ mb: 3 }}
          >
            {roles.map((r) => (
              <ToggleButton
                key={r.value}
                value={r.value}
                sx={{
                  flexDirection: 'column',
                  py: 1.5,
                  gap: 0.25,
                  borderRadius: '12px !important',
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'secondary.dark' },
                  },
                }}
              >
                <span style={{ fontSize: 20 }}>{r.emoji}</span>
                <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {r.label}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7, lineHeight: 1 }}>
                  {r.desc}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            label="E-Mail-Adresse"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ mb: 2 }}
            placeholder={
              role === 'eltern'
                ? 'sandra.meier@example.de'
                : role === 'fachkraft'
                ? 'stefanie.mueller@froebel.de'
                : 'thomas.becker@froebel.de'
            }
          />
          <TextField
            label="Passwort"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ mb: 3 }}
          />

          <Button variant="contained" size="large" fullWidth onClick={handleLogin}>
            Anmelden
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
