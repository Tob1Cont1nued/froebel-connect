import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileAvatar from './ProfileAvatar';

const DRAWER_WIDTH = 240;

const navItems = [
  { icon: <DashboardOutlinedIcon />, label: 'Dashboard', path: '/traeger/dashboard' },
  { icon: <BusinessOutlinedIcon />, label: 'Einrichtungen', path: '/traeger/einrichtungen' },
  { icon: <PeopleOutlinedIcon />, label: 'Fachkräfte', path: '/traeger/fachkraefte' },
  { icon: <EmailOutlinedIcon />, label: 'Rundmails', path: '/traeger/rundmails' },
  { icon: <BarChartIcon />, label: 'Auswertungen', path: '/traeger/auswertungen' },
];

export default function TraegerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
          FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Träger-Dashboard
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
      <List>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  color: active ? 'white' : 'rgba(255,255,255,0.65)',
                  bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
                  mb: 0.25,
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 600 : 400 } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
        <Button
          startIcon={<LogoutIcon />}
          size="small"
          fullWidth
          sx={{ color: 'rgba(255,255,255,0.65)', justifyContent: 'flex-start', textTransform: 'none', '&:hover': { color: 'white' } }}
          onClick={async () => { await signOut(); navigate('/login'); }}
        >
          Abmelden
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar — permanent */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#1A3545', color: 'white' },
        }}
      >
        {sidebar}
      </Drawer>

      {/* Mobile sidebar — temporary (hamburger) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#1A3545', color: 'white' },
        }}
      >
        {sidebar}
      </Drawer>

      {/* Main column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary' }} elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Menü öffnen"
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1 }}>
              Überblick – Alle Einrichtungen
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}>
              Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Typography>
            <ProfileAvatar
              avatarUrl={profile?.avatar_url ?? null}
              initials={avatarInitials}
              size={34}
              alt={profile?.name ?? 'Profil'}
              onClick={() => navigate('/traeger/profil')}
            />
          </Toolbar>
        </AppBar>

        <Box component="main" id="main-content" sx={{ flex: 1, bgcolor: 'background.default', overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
