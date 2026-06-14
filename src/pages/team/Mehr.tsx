import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ProfileAvatar from '../../components/ProfileAvatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ChecklistIcon from '@mui/icons-material/Checklist';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export default function TeamMehr() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const items = [
    ...(profile?.is_leitung ? [{
      icon: <AdminPanelSettingsOutlinedIcon sx={{ color: '#95C11F' }} />,
      label: 'Leitung-Verwaltung',
      desc: 'Zur Kita-Administration wechseln',
      action: () => navigate('/leitung/dashboard'),
    }] : []),
    { icon: <ChecklistIcon sx={{ color: '#1A3545' }} />, label: 'Aufgaben', desc: 'Meine ToDo-Liste', action: () => navigate('/team/todos') },
    { icon: <RestaurantMenuIcon sx={{ color: '#E65100' }} />, label: 'Speiseplan', desc: 'Mittagessen & Vesper eintragen', action: () => navigate('/team/essenplan') },
    { icon: <PersonOutlinedIcon />, label: 'Mein Profil', desc: profile?.email ?? '', action: () => navigate('/team/profil') },
    { icon: <AccessibilityNewIcon />, label: 'Barrierefreiheit', desc: 'Schriftgröße, Kontrast, Vorlesefunktion', action: () => navigate('/team/barrierefreiheit') },
    { icon: <LockOutlinedIcon />, label: 'Datenschutz & Sicherheit', desc: 'DSGVO-konform', action: () => navigate('/team/sicherheit') },
    { icon: <HelpOutlinedIcon />, label: 'Hilfe & Support', desc: 'FAQ, Kontakt', action: () => navigate('/team/datenschutz') },
    { icon: <LogoutIcon sx={{ color: '#C62828' }} />, label: 'Abmelden', color: '#C62828', action: async () => { await signOut(); navigate('/login'); } },
  ];

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ProfileAvatar avatarUrl={profile?.avatar_url} initials={avatarInitials} size={56} alt={profile?.name ?? 'Profil'} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{profile?.name ?? ''}</Typography>
          <Typography variant="body2" color="text.secondary">{profile?.email ?? ''}</Typography>
          <Chip label="Fachkraft" size="small" sx={{ mt: 0.5 }} variant="outlined" />
        </Box>
      </Card>

      <Card>
        <List disablePadding>
          {items.map((item, i) => (
            <Box key={item.label}>
              {i > 0 && <Divider variant="inset" component="li" />}
              <ListItemButton onClick={item.action} sx={{ py: 1.25 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} secondary={item.desc}
                  slotProps={{ primary: { sx: { fontWeight: 600, color: (item as any).color } } }} />
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
        FRÖBEL.connect v0.1.0 · DSGVO-konform · Hosting in Deutschland
      </Typography>
    </Box>
  );
}
