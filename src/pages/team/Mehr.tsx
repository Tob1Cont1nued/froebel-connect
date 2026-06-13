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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { mockUsers } from '../../mockData';

export default function TeamMehr() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const user = mockUsers.fachkraft;

  const items = [
    { icon: <PersonOutlinedIcon />, label: 'Mein Profil', desc: user.email, action: () => {} },
    { icon: <LockOutlinedIcon />, label: 'Datenschutz & Sicherheit', desc: 'DSGVO-konform', action: () => {} },
    { icon: <HelpOutlinedIcon />, label: 'Hilfe & Support', desc: 'FAQ, Kontakt', action: () => {} },
    { icon: <LogoutIcon sx={{ color: '#C62828' }} />, label: 'Abmelden', color: '#C62828', action: async () => { await signOut(); navigate('/login'); } },
  ];

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: '#1A3545', fontSize: 20, fontWeight: 700 }}>
          {user.avatar}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
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
                <ListItemText
                  primary={item.label}
                  secondary={item.desc}
                  slotProps={{ primary: { sx: { fontWeight: 600, color: item.color } } }}
                />
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
