import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ProfileAvatar from './ProfileAvatar';

const DRAWER_WIDTH = 240;
const HEADER_HEIGHT = 80;

const navItems = [
  { label: 'Dashboard',    icon: <HomeOutlinedIcon />,         path: '/leitung/dashboard' },
  { label: 'Fachkräfte',  icon: <PeopleOutlinedIcon />,       path: '/leitung/fachkraefte' },
  { label: 'Kinder',       icon: <ChildCareIcon />,            path: '/leitung/kinder' },
  { label: 'Eltern',       icon: <FamilyRestroomIcon />,       path: '/leitung/eltern' },
  { label: 'Termine',      icon: <CalendarTodayOutlinedIcon />,path: '/leitung/termine' },
  { label: 'Rundmails',    icon: <EmailOutlinedIcon />,        path: '/leitung/rundmails' },
];

const mobileNav = [
  navItems[0],
  navItems[2],
  navItems[3],
  navItems[4],
  { label: 'Mehr', icon: <GridViewOutlinedIcon />, path: '/leitung/mehr' },
];

export default function LeitungLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { unreadCount } = useApp();
  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const navValue = mobileNav.findIndex((item) => location.pathname.startsWith(item.path));
  const currentLabel = navItems.find((item) => location.pathname.startsWith(item.path))?.label ?? 'Leitung';

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, height: HEADER_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
          FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#95C11F' }} />
          <Typography variant="caption" sx={{ color: '#95C11F', fontWeight: 600 }}>
            Kita-Leitung
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
      <List sx={{ px: 1, flex: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  color: active ? 'white' : 'rgba(255,255,255,0.65)',
                  bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 600 : 400 } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
        <Tooltip title="Zurück zum Team-Portal" placement="right">
          <Button
            startIcon={<ArrowBackIcon />}
            size="small"
            fullWidth
            sx={{ mb: 0.5, color: 'rgba(255,255,255,0.65)', justifyContent: 'flex-start', textTransform: 'none', '&:hover': { color: 'white' } }}
            onClick={() => navigate('/team/dashboard')}
          >
            Team-Portal
          </Button>
        </Tooltip>
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
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1A3545',
            color: 'white',
            borderRight: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', minWidth: 0 }}>
        <AppBar position="static" sx={{ bgcolor: '#1A3545', color: 'white', flexShrink: 0 }} elevation={1}>
          <Toolbar sx={{ minHeight: { md: HEADER_HEIGHT } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', display: { md: 'none' } }}>
              FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
            </Typography>
            <Typography
              variant="caption"
              sx={{ bgcolor: 'rgba(149,193,31,0.25)', color: '#95C11F', px: 1, py: 0.25, borderRadius: 2, display: { md: 'none' }, ml: 1 }}
            >
              Leitung
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', display: { xs: 'none', md: 'block' } }}>
              {currentLabel}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              size="small"
              sx={{ mr: 0.5 }}
              onClick={() => navigate('/team/nachrichten')}
              aria-label="Nachrichten"
            >
              <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
            <ProfileAvatar
              avatarUrl={profile?.avatar_url}
              initials={avatarInitials}
              size={34}
              alt={profile?.name ?? 'Profil'}
              onClick={() => navigate('/leitung/profil')}
            />
          </Toolbar>
        </AppBar>

        <Box component="main" id="main-content" sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>

        <Paper sx={{ display: { md: 'none' }, flexShrink: 0, borderRadius: 0 }} elevation={3}>
          <BottomNavigation
            value={navValue >= 0 ? navValue : false}
            onChange={(_, newValue: number) => navigate(mobileNav[newValue].path)}
            showLabels
          >
            {mobileNav.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                sx={{ minWidth: 0, '& .MuiBottomNavigationAction-label': { fontSize: 10 } }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}
