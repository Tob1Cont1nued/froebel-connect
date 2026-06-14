import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PlaceIcon from '@mui/icons-material/Place';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PeopleIcon from '@mui/icons-material/People';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EventIcon from '@mui/icons-material/Event';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import GroupsIcon from '@mui/icons-material/Groups';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import { supabase } from '../../lib/supabase';
import { useKitas } from '../../hooks/useKitas';
import { useTraegerFachkraefte } from '../../hooks/useTraegerFachkraefte';

interface KindDetail {
  id: string;
  name: string;
  age: number | null;
  emoji: string;
  photo_url: string | null;
}

interface AppointmentDetail {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: string;
  description: string | null;
}

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  event:   { icon: <CelebrationOutlinedIcon fontSize="small" />, color: '#6A1B9A', bg: '#F3E5F5' },
  meeting: { icon: <GroupsIcon fontSize="small" />,             color: '#0B5394', bg: '#E3F2FD' },
  closure: { icon: <EventBusyIcon fontSize="small" />,          color: '#C62828', bg: '#FFEBEE' },
  info:    { icon: <InfoOutlinedIcon fontSize="small" />,       color: '#E65100', bg: '#FFF3E0' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long' });
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function EditDialog({
  open,
  name,
  city,
  address,
  onClose,
  onSave,
}: {
  open: boolean;
  name: string;
  city: string;
  address: string;
  onClose: () => void;
  onSave: (data: { name: string; city: string; address: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ name, city, address });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ name, city, address });
  }, [open, name, city, address]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({ name: form.name.trim(), city: form.city.trim(), address: form.address.trim() });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Einrichtung bearbeiten</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Name" required fullWidth value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
        <TextField label="Stadt" fullWidth value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        <TextField label="Adresse" fullWidth value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}>
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function EinrichtungDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { kitas, loading: kitasLoading, updateKita } = useKitas();
  const { fachkraefte } = useTraegerFachkraefte();

  const [tab, setTab] = useState(0);
  const [kinder, setKinder] = useState<KindDetail[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const kita = kitas.find((k) => k.id === id);
  const kitaFachkraefte = fachkraefte.filter((f) => f.kita_id === id);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setDetailLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const [{ data: kinderData }, { data: appoData }] = await Promise.all([
      sb.rpc('get_kita_children_list', { p_kita_id: id }),
      sb.rpc('get_kita_upcoming_appointments', { p_kita_id: id }),
    ]);
    setKinder(kinderData ?? []);
    setAppointments(appoData ?? []);
    setDetailLoading(false);
  }, [id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleSave = async (data: { name: string; city: string; address: string }) => {
    if (id) await updateKita(id, data);
  };

  if (!kitasLoading && !kita) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Einrichtung nicht gefunden.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/traeger/einrichtungen')}>Zurück zur Übersicht</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Back + Header */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/traeger/einrichtungen')}
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
      >
        Alle Einrichtungen
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A237E', flexShrink: 0, mt: 0.5 }}>
              <EventIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {kitasLoading || !kita ? (
                <>
                  <Skeleton width={260} height={28} />
                  <Skeleton width={180} height={20} />
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{kita.name}</Typography>
                  {(kita.city || kita.address) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <PlaceIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {[kita.city, kita.address].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                    <Chip icon={<ChildCareIcon />} label={`${kita.childrenCount} Kinder`} size="small" color="success" variant="outlined" />
                    <Chip icon={<PeopleIcon />} label={`${kita.staffCount} Fachkräfte`} size="small" color="primary" variant="outlined" />
                    <Chip label="Aktiv" size="small" color="success" />
                  </Box>
                </>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={() => setEditOpen(true)}
              sx={{ flexShrink: 0 }}
              aria-label="Einrichtung bearbeiten"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <Tab label={`Fachkräfte (${kitaFachkraefte.length})`} />
        <Tab label={`Kinder (${kinder.length || kita?.childrenCount || 0})`} />
        <Tab label={`Nächste Termine (${appointments.length})`} />
      </Tabs>

      {/* Tab: Fachkräfte */}
      {tab === 0 && (
        <Card>
          {kitaFachkraefte.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2">Noch keine Fachkräfte zugeordnet.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {kitaFachkraefte.map((f, i) => (
                <ListItem
                  key={f.id}
                  divider={i < kitaFachkraefte.length - 1}
                  secondaryAction={
                    <IconButton size="small" component="a" href={`mailto:${f.email}`} aria-label={`E-Mail an ${f.name}`}>
                      <EmailOutlinedIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#95C11F', color: '#1A3545', fontWeight: 700, fontSize: 14 }}>
                      {initials(f.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{f.name}</Typography>}
                    secondary={f.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      )}

      {/* Tab: Kinder */}
      {tab === 1 && (
        detailLoading ? (
          <Grid container spacing={1.5}>
            {[...Array(8)].map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : kinder.length === 0 ? (
          <Card>
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
              <ChildCareIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2">Noch keine Kinder zugeordnet.</Typography>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={1.5}>
            {kinder.map((k) => (
              <Grid key={k.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                  {k.photo_url && !k.photo_url.startsWith('preset:') ? (
                    <Avatar src={k.photo_url} sx={{ width: 40, height: 40, flexShrink: 0 }} />
                  ) : (
                    <Box sx={{ width: 40, height: 40, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {k.photo_url?.startsWith('preset:') ? k.photo_url.replace('preset:', '') : k.emoji}
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{k.name}</Typography>
                    {k.age && (
                      <Typography variant="caption" color="text.secondary">{k.age} Jahre</Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Tab: Termine */}
      {tab === 2 && (
        detailLoading ? (
          <Card>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={{ p: 2, borderBottom: i < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Skeleton width={200} />
                <Skeleton width={120} />
              </Box>
            ))}
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
              <EventIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2">Keine bevorstehenden Termine.</Typography>
            </Box>
          </Card>
        ) : (
          <Card>
            <List disablePadding>
              {appointments.map((a, i) => {
                const meta = TYPE_META[a.type] ?? TYPE_META.info;
                return (
                  <ListItem key={a.id} divider={i < appointments.length - 1} alignItems="flex-start">
                    <ListItemAvatar>
                      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                        {meta.icon}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{a.title}</Typography>}
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {formatDate(a.date)}{a.time ? ` · ${a.time} Uhr` : ''}
                          </Typography>
                          {a.description && (
                            <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                              {a.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Card>
        )
      )}

      <EditDialog
        open={editOpen}
        name={kita?.name ?? ''}
        city={kita?.city ?? ''}
        address={kita?.address ?? ''}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
