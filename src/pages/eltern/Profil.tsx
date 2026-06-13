import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
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
import ChildCareIcon from '@mui/icons-material/ChildCare';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { useChildren } from '../../hooks/useChildren';

export default function ElternProfil() {
  const navigate = useNavigate();
  const { profile, signOut, updateProfile } = useAuth();
  const { children } = useChildren();

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

  const handleCancel = () => {
    setNameInput(profile?.name ?? '');
    setEditing(false);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 560, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Card sx={{ mb: 2.5, background: 'linear-gradient(135deg, #1A3545 0%, #2D5468 100%)', color: 'white' }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 28, fontWeight: 700, bgcolor: '#95C11F', color: '#1A3545', mx: 'auto', mb: 1.5 }}>
            {avatarInitials}
          </Avatar>

          {editing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mt: 0.5 }}>
              <TextField
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                size="small"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white', borderRadius: 2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
                  input: { textAlign: 'center', fontWeight: 700, fontSize: 18 },
                  width: 220,
                }}
              />
              <IconButton size="small" onClick={handleSave} disabled={saving} sx={{ color: '#95C11F' }}>
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancel} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.name ?? ''}</Typography>
              <IconButton size="small" onClick={() => { setNameInput(profile?.name ?? ''); setEditing(true); }} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}>
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}

          <Chip label="Eltern-Account" size="small" sx={{ mt: 1, bgcolor: 'rgba(149,193,31,0.2)', color: '#95C11F', fontWeight: 600, border: '1px solid rgba(149,193,31,0.4)' }} />
        </CardContent>
      </Card>

      {/* Kontodaten */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Kontodaten
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        <List disablePadding>
          <ListItem sx={{ py: 1.25 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><EmailOutlinedIcon color="action" /></ListItemIcon>
            <ListItemText
              primary="E-Mail"
              secondary={profile?.email ?? '–'}
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem sx={{ py: 1.25 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><BadgeOutlinedIcon color="action" /></ListItemIcon>
            <ListItemText
              primary="Rolle"
              secondary="Eltern-Account"
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
            />
          </ListItem>
        </List>
      </Card>

      {/* Kinder */}
      {children.length > 0 && (
        <>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
            Meine Kinder
          </Typography>
          <Card sx={{ mb: 2.5 }}>
            <List disablePadding>
              {children.map((child, i) => (
                <Box key={child.id}>
                  {i > 0 && <Divider variant="inset" component="li" />}
                  <ListItem sx={{ py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 16, bgcolor: 'grey.100' }}>{child.emoji}</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={child.name}
                      secondary={child.age !== null ? `${child.age} Jahre · ${child.kita_name ?? 'Kita'}` : child.kita_name ?? 'Kita'}
                      slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Card>
        </>
      )}

      {/* Abmelden */}
      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={async () => { await signOut(); navigate('/login'); }}
        sx={{ borderRadius: 2 }}
      >
        Abmelden
      </Button>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        FRÖBEL.connect · DSGVO-konform · Hosting in Deutschland
      </Typography>
    </Box>
  );
}
