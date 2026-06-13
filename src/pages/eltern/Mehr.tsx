import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LanguageIcon from '@mui/icons-material/Language';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useChildren } from '../../hooks/useChildren';
import { useDocuments } from '../../hooks/useDocuments';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  badge?: string;
  action: () => void;
  color?: string;
}

export default function Mehr() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { children } = useChildren();
  const { documents } = useDocuments();

  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Funktionen',
      items: [
        { icon: <EventBusyIcon color="secondary" />, label: 'Abwesenheit melden', desc: 'Kind für einen Tag abmelden', action: () => navigate('/eltern/abwesenheit') },
        { icon: <DescriptionOutlinedIcon color="primary" />, label: 'Dokumente', desc: `${documents.length} Dokumente verfügbar`, badge: documents.length > 0 ? String(documents.length) : undefined, action: () => navigate('/eltern/dokumente') },
        { icon: <AssignmentOutlinedIcon color="primary" />, label: 'Digitale Formulare', desc: 'Einwilligungen, Anmeldungen', action: () => {} },
      ],
    },
    {
      title: 'Einstellungen',
      items: [
        { icon: <LanguageIcon />, label: 'Sprache', desc: 'Deutsch (DE) · 29 weitere verfügbar', action: () => {} },
        { icon: <AccessibilityNewIcon />, label: 'Barrierefreiheit', desc: 'Schriftgröße, Kontrast, Vorlesefunktion', action: () => {} },
        { icon: <PersonOutlinedIcon />, label: 'Mein Profil', desc: profile?.email ?? '', action: () => {} },
        { icon: <LockOutlinedIcon />, label: 'Datenschutz & Sicherheit', desc: 'DSGVO-konform', action: () => navigate('/eltern/sicherheit') },
      ],
    },
    {
      title: 'Hilfe',
      items: [
        { icon: <HelpOutlinedIcon />, label: 'Hilfe & Support', desc: 'FAQ, Kontakt zum Kita-Team', action: () => navigate('/eltern/hilfe') },
        { icon: <LogoutIcon sx={{ color: '#C62828' }} />, label: 'Abmelden', color: '#C62828', action: async () => { await signOut(); navigate('/login'); } },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: '#1A3545', fontSize: 20, fontWeight: 700 }}>{avatarInitials}</Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{profile?.name ?? ''}</Typography>
          {children.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {children.map((c) => `${c.emoji} ${c.name}`).join(' · ')}
            </Typography>
          )}
          <Chip label="Eltern-Account" size="small" sx={{ mt: 0.5 }} variant="outlined" />
        </Box>
      </Card>

      {sections.map((section) => (
        <Box key={section.title} sx={{ mb: 2.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
            {section.title}
          </Typography>
          <Card>
            <List disablePadding>
              {section.items.map((item, i) => (
                <Box key={item.label}>
                  {i > 0 && <Divider variant="inset" component="li" />}
                  <ListItemButton onClick={item.action} sx={{ py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} secondary={item.desc}
                      slotProps={{ primary: { sx: { fontWeight: 600, color: item.color } } }} />
                    {item.badge && <Chip label={item.badge} size="small" color="primary" sx={{ mr: 1 }} />}
                    <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </ListItemButton>
                </Box>
              ))}
            </List>
          </Card>
        </Box>
      ))}

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
        FRÖBEL.connect v0.1.0 · DSGVO-konform · Hosting in Deutschland
      </Typography>
    </Box>
  );
}
