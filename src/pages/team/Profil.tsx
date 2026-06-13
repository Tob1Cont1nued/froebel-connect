import { useState, useEffect } from 'react';
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
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import AvatarPicker from '../../components/AvatarPicker';
import { useShifts } from '../../hooks/useShifts';
import { supabase } from '../../lib/supabase';

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

const WEEKDAY = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function TeamProfil() {
  const navigate = useNavigate();
  const { profile, signOut, updateProfile } = useAuth();
  const { shifts } = useShifts(getMonday(new Date()));

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [kitaName, setKitaName] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('kitas').select('name').eq('id', profile.kita_id).single()
      .then(({ data }: { data: { name: string } | null }) => setKitaName(data?.name ?? null));
  }, [profile?.kita_id]);

  const avatarInitials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const myShifts = shifts.filter((s) => s.profile_id === profile?.id);

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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <AvatarPicker size={72} initials={avatarInitials} />
          </Box>

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
              <IconButton size="small" onClick={handleSave} disabled={saving} aria-label="Namen speichern" sx={{ color: '#95C11F' }}>
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancel} aria-label="Bearbeitung abbrechen" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.name ?? ''}</Typography>
              <IconButton size="small" onClick={() => { setNameInput(profile?.name ?? ''); setEditing(true); }} aria-label="Namen bearbeiten" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}>
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}

          <Chip
            label="Fachkraft"
            size="small"
            sx={{ mt: 1, bgcolor: 'rgba(149,193,31,0.2)', color: '#95C11F', fontWeight: 600, border: '1px solid rgba(149,193,31,0.4)' }}
          />
        </CardContent>
      </Card>

      {/* Info */}
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
              secondary="Fachkraft"
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
            />
          </ListItem>
          {kitaName && (
            <>
              <Divider variant="inset" component="li" />
              <ListItem sx={{ py: 1.25 }}>
                <ListItemIcon sx={{ minWidth: 40 }}><HomeWorkOutlinedIcon color="action" /></ListItemIcon>
                <ListItemText
                  primary="Einrichtung"
                  secondary={kitaName}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Card>

      {/* This week's shifts */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Meine Schichten diese Woche
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        {myShifts.length === 0 ? (
          <CardContent sx={{ py: '12px !important' }}>
            <Typography variant="body2" color="text.disabled">Keine Schichten eingetragen.</Typography>
          </CardContent>
        ) : (
          <List disablePadding>
            {myShifts.map((s, i) => {
              const date = new Date(s.date + 'T00:00:00');
              const dayLabel = `${WEEKDAY[date.getDay() === 0 ? 6 : date.getDay() - 1]}, ${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;
              return (
                <Box key={s.id}>
                  {i > 0 && <Divider variant="inset" component="li" />}
                  <ListItem sx={{ py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AccessTimeIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={dayLabel}
                      secondary={`${s.start_time} – ${s.end_time} Uhr`}
                      slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
                    />
                    <Chip label="Ich" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                  </ListItem>
                </Box>
              );
            })}
          </List>
        )}
      </Card>

      {/* Sign out */}
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
