import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const items = [
  { label: 'Fachkräfte',  icon: <PeopleOutlinedIcon />,         path: '/leitung/fachkraefte' },
  { label: 'Rundmails',   icon: <EmailOutlinedIcon />,          path: '/leitung/rundmails' },
  { label: 'Mein Profil', icon: <AccountCircleOutlinedIcon />,  path: '/leitung/profil' },
];

export default function LeitungMehr() {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Mehr</Typography>
      <Card>
        <List disablePadding>
          {items.map((item, i) => (
            <Box key={item.path}>
              {i > 0 && <Divider />}
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon sx={{ minWidth: 40, color: '#1A3545' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  <ChevronRightIcon fontSize="small" color="action" />
                </ListItemButton>
              </ListItem>
            </Box>
          ))}
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/team/dashboard')}>
              <ListItemIcon sx={{ minWidth: 40, color: '#95C11F' }}><ArrowBackIcon /></ListItemIcon>
              <ListItemText primary="Zum Team-Portal" slotProps={{ primary: { sx: { color: '#95C11F', fontWeight: 600 } } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Card>
    </Box>
  );
}
