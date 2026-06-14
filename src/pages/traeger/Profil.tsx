import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import AvatarPicker from '../../components/AvatarPicker';

export default function TraegerProfil() {
  const navigate = useNavigate();
  const { profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);

  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const handleSave = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    await updateProfile({ name: nameInput.trim() });
    setSaving(false);
    setEditing(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      {/* Avatar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: '24px !important' }}>
          <AvatarPicker initials={avatarInitials} size={80} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.name}</Typography>
            <Chip label="Träger-Admin" size="small" sx={{ mt: 0.5, bgcolor: '#E8EAF6', color: '#1A237E', fontWeight: 600 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Details */}
      <Card sx={{ mb: 2 }}>
        <List disablePadding>
          {/* Name */}
          <ListItem
            divider
            secondaryAction={
              editing ? (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={handleSave} disabled={saving} color="primary">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setEditing(false); setNameInput(profile?.name ?? ''); }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <IconButton size="small" onClick={() => setEditing(true)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              )
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}><BadgeOutlinedIcon color="action" /></ListItemIcon>
            {editing ? (
              <TextField
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                size="small"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setNameInput(profile?.name ?? ''); } }}
                sx={{ maxWidth: 220 }}
              />
            ) : (
              <ListItemText primary={profile?.name} secondary="Name" />
            )}
          </ListItem>

          {/* Email */}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}><EmailOutlinedIcon color="action" /></ListItemIcon>
            <ListItemText primary={profile?.email} secondary="E-Mail-Adresse" />
          </ListItem>
        </List>
      </Card>

      <Divider sx={{ my: 2 }} />

      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        sx={{ borderRadius: 3 }}
        onClick={async () => { await signOut(); navigate('/login'); }}
      >
        Abmelden
      </Button>
    </Box>
  );
}
