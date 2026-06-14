import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../context/AuthContext';
import { useKitas } from '../../hooks/useKitas';
import { useNavigate } from 'react-router-dom';
import AvatarPicker from '../../components/AvatarPicker';

export default function LeitungProfil() {
  const { profile, signOut } = useAuth();
  const { kitas } = useKitas();
  const navigate = useNavigate();
  const kita = kitas.find((k) => k.id === profile?.kita_id);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 500, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Mein Profil</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
          <AvatarPicker size={88} initials={profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.name ?? '–'}</Typography>
            <Typography variant="body2" color="text.secondary">{profile?.email ?? '–'}</Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<AdminPanelSettingsIcon fontSize="small" />}
                label="Kita-Leitung"
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, border: 'none' }}
              />
              {kita && (
                <Chip label={kita.name} size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 600, border: 'none' }} />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary' }}
            onClick={() => navigate('/team/dashboard')}
          >
            Zum Team-Portal wechseln
          </Button>
          <Divider />
          <Button
            startIcon={<LogoutIcon />}
            fullWidth
            color="error"
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            onClick={async () => { await signOut(); navigate('/login'); }}
          >
            Abmelden
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
