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
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ProfileAvatar from './ProfileAvatar';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';

const DRAWER_WIDTH = 240;
const HEADER_HEIGHT = 80;

const navItems = [
  { label: 'Dashboard', icon: <HomeOutlinedIcon />, path: '/team/dashboard' },
  { label: 'Nachrichten', icon: <ChatBubbleOutlinedIcon />, path: '/team/nachrichten' },
  { label: 'Kinder', icon: <PeopleOutlinedIcon />, path: '/team/kinder' },
  { label: 'Dienstplan', icon: <CalendarTodayOutlinedIcon />, path: '/team/dienstplan' },
  { label: 'Mehr', icon: <GridViewOutlinedIcon />, path: '/team/mehr' },
];

export default function TeamLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { unreadCount } = useApp();
  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const navValue = navItems.findIndex((item) => location.pathname.startsWith(item.path));
  const currentLabel = navValue >= 0 ? navItems[navValue].label : '';

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, height: HEADER_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
          FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#95C11F' }} />
          <Typography variant="caption" sx={{ color: '#95C11F', fontWeight: 600 }}>
            Fachkraft
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
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.path === '/team/nachrichten' && unreadCount > 0 ? (
                    <Badge badgeContent={unreadCount} color="error">{item.icon}</Badge>
                  ) : item.icon}
                </ListItemIcon>
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
        <Button
          startIcon={<LogoutIcon />}
          size="small"
          fullWidth
          sx={{ mt: 1, color: 'rgba(255,255,255,0.65)', justifyContent: 'flex-start', textTransform: 'none', '&:hover': { color: 'white' } }}
          onClick={async () => { await signOut(); navigate('/login'); }}
        >
          Abmelden
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Desktop sidebar */}
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

      {/* Main column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', minWidth: 0 }}>
        <AppBar position="static" sx={{ bgcolor: '#1A3545', color: 'white', flexShrink: 0 }} elevation={1}>
          <Toolbar sx={{ minHeight: { md: HEADER_HEIGHT } }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: 'white', display: { md: 'none' } }}
            >
              FRÖBEL<span style={{ color: '#95C11F' }}>.connect</span>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'rgba(149,193,31,0.25)',
                color: '#95C11F',
                px: 1,
                py: 0.25,
                borderRadius: 2,
                display: { md: 'none' },
                ml: 1,
              }}
            >
              Fachkraft
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'white', display: { xs: 'none', md: 'block' } }}
            >
              {currentLabel}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              size="small"
              sx={{ mr: 0.5 }}
              aria-label={unreadCount > 0 ? `Benachrichtigungen, ${unreadCount} ungelesen` : 'Benachrichtigungen'}
              onClick={() => navigate('/team/nachrichten')}
            >
              <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
            <ProfileAvatar avatarUrl={profile?.avatar_url} initials={avatarInitials} size={34} alt={profile?.name ?? 'Profil'} onClick={() => navigate('/team/profil')} />
          </Toolbar>
        </AppBar>

        <Box component="main" id="main-content" sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>

        <Paper sx={{ display: { md: 'none' }, flexShrink: 0, borderRadius: 0 }} elevation={3}>
          <BottomNavigation
            value={navValue >= 0 ? navValue : false}
            onChange={(_, newValue: number) => navigate(navItems[newValue].path)}
            showLabels
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.path === '/team/nachrichten' && unreadCount > 0 ? <Badge badgeContent={unreadCount} color="error">{item.icon}</Badge> : item.icon}
                sx={{ minWidth: 0, '& .MuiBottomNavigationAction-label': { fontSize: 10 } }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}
