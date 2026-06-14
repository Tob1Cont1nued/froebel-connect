import { useState, useEffect, useCallback } from 'react';
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
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PeopleIcon from '@mui/icons-material/People';
import SendIcon from '@mui/icons-material/Send';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Rundmail {
  id: string;
  subject: string;
  body: string;
  recipient_type: string;
  recipient_count: number;
  sent_at: string;
}

const RECIPIENT_OPTIONS = [
  { value: 'alle',        label: 'Alle (Eltern & Fachkräfte)' },
  { value: 'eltern',      label: 'Nur Eltern' },
  { value: 'fachkraefte', label: 'Nur Fachkräfte' },
];

export default function LeitungRundmails() {
  const { profile } = useAuth();
  const [mails, setMails] = useState<Rundmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '', recipient_type: 'alle' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('get_rundmails');
    // Filter to only this kita's mails (or all if kita_id matches)
    setMails((data ?? []).filter((m: Rundmail & { kita_id: string | null }) => m.kita_id === profile?.kita_id));
    setLoading(false);
  }, [profile?.kita_id]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!form.subject.trim() || !form.body.trim()) { setError('Betreff und Nachricht sind Pflichtfelder.'); return; }
    setSending(true); setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcError } = await (supabase as any).rpc('send_rundmail', {
      p_subject: form.subject.trim(),
      p_body: form.body.trim(),
      p_recipient_type: form.recipient_type,
      p_kita_id: profile?.kita_id ?? null,
    });
    setSending(false);
    if (rpcError) { setError('Senden fehlgeschlagen: ' + rpcError.message); return; }
    setOpen(false);
    setForm({ subject: '', body: '', recipient_type: 'alle' });
    load();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Rundmails</Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Lädt…' : `${mails.length} versendete Rundmail${mails.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setOpen(true); setError(''); setForm({ subject: '', body: '', recipient_type: 'alle' }); }}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
        >
          Neue Rundmail
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2].map((i) => <Card key={i}><CardContent><Skeleton width="60%" /><Skeleton width="80%" /></CardContent></Card>)}
        </Box>
      ) : mails.length === 0 ? (
        <Card>
          <Box sx={{ p: 6, textAlign: 'center', color: 'text.disabled' }}>
            <EmailOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>Noch keine Rundmails versendet.</Typography>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => { setOpen(true); setError(''); }}
              sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
            >
              Erste Rundmail verfassen
            </Button>
          </Box>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mails.map((m) => (
            <Card key={m.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{m.subject}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {new Date(m.sent_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {m.body}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip icon={<PeopleIcon />} label={`${m.recipient_count} Empfänger`} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, border: 'none' }} />
                  <Chip label={RECIPIENT_OPTIONS.find((o) => o.value === m.recipient_type)?.label ?? m.recipient_type} size="small" variant="outlined" sx={{ fontSize: 12 }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailOutlinedIcon color="action" /> Neue Rundmail verfassen
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Betreff" required fullWidth value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} autoFocus />
          <TextField label="Nachricht" required fullWidth multiline minRows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <TextField label="Empfänger" select fullWidth value={form.recipient_type} onChange={(e) => setForm((f) => ({ ...f, recipient_type: e.target.value }))}>
            {RECIPIENT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={sending}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending}
            startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
          >
            {sending ? 'Wird gesendet…' : 'Rundmail senden'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
