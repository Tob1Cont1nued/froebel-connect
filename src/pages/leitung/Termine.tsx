import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Termin {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: string;
  description: string | null;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  event:   { label: 'Veranstaltung', color: '#1565C0', bg: '#E3F2FD' },
  closure: { label: 'Schließung',    color: '#C2185B', bg: '#FCE4EC' },
  meeting: { label: 'Elterngespräch',color: '#7B1FA2', bg: '#F3E5F5' },
  info:    { label: 'Info',           color: '#E65100', bg: '#FFF3E0' },
};

export default function LeitungTermine() {
  const { profile } = useAuth();
  const [termine, setTermine] = useState<Termin[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'event', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('get_kita_upcoming_appointments', { p_kita_id: profile.kita_id });
    setTermine(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile?.kita_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) { setError('Titel und Datum sind Pflichtfelder.'); return; }
    setSaving(true); setError('');
    const { error: err } = await supabase.from('appointments').insert({
      kita_id: profile!.kita_id!,
      title: form.title.trim(),
      date: new Date(form.date).toISOString(),
      time: form.time || null,
      type: form.type as 'event' | 'closure' | 'meeting' | 'info',
      description: form.description.trim() || null,
    });
    setSaving(false);
    if (err) { setError('Fehler: ' + err.message); return; }
    setOpen(false);
    setForm({ title: '', date: '', time: '', type: 'event', description: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id);
    setTermine((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Termine</Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Lädt…' : `${termine.length} anstehende Termine`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setOpen(true); setError(''); }}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
        >
          Neuer Termin
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2,3].map((i) => <Card key={i}><CardContent><Skeleton width="60%" /><Skeleton width="40%" /></CardContent></Card>)}
        </Box>
      ) : termine.length === 0 ? (
        <Card>
          <Box sx={{ p: 6, textAlign: 'center', color: 'text.disabled' }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">Keine anstehenden Termine.</Typography>
          </Box>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {termine.map((t) => {
            const typeInfo = TYPE_LABELS[t.type] ?? TYPE_LABELS.info;
            return (
              <Card key={t.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Chip label={typeInfo.label} size="small" sx={{ bgcolor: typeInfo.bg, color: typeInfo.color, fontWeight: 600, border: 'none', fontSize: 11 }} />
                      <Button
                        size="small"
                        color="error"
                        sx={{ minWidth: 0, p: 0.5 }}
                        onClick={() => handleDelete(t.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(t.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                    {t.time ? ` · ${t.time} Uhr` : ''}
                  </Typography>
                  {t.description && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">{t.description}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuer Termin</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Titel" required fullWidth value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Datum" type="date" required fullWidth value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Uhrzeit" type="time" fullWidth value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          <TextField label="Art" select fullWidth value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            {Object.entries(TYPE_LABELS).map(([val, { label }]) => <MenuItem key={val} value={val}>{label}</MenuItem>)}
          </TextField>
          <TextField label="Beschreibung (optional)" multiline minRows={2} fullWidth value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
