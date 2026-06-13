import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useAbsences } from '../../hooks/useAbsences';
import { useChildren } from '../../hooks/useChildren';

const reasons = ['Krankheit', 'Arzttermin', 'Urlaub / Familienzeit', 'Persönliche Gründe', 'Sonstiges'];

export default function Abwesenheit() {
  const { children, firstChild, loading: childLoading } = useChildren();
  const { absences, addAbsence, loading } = useAbsences();
  const [selectedChildId, setSelectedChildId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [snackbar, setSnackbar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? firstChild;

  const handleSubmit = async () => {
    if (!from || !reason || !selectedChild) return;
    setSubmitting(true);
    await addAbsence({
      childId: selectedChild.id,
      from: new Date(from),
      to: to ? new Date(to) : new Date(from),
      reason,
      note: note || undefined,
    });
    setFrom(''); setTo(''); setReason(''); setNote('');
    setSnackbar(true);
    setSubmitting(false);
  };

  if (childLoading || loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>Abwesenheit melden</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EventBusyIcon color="secondary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Abwesenheit melden</Typography>
          </Box>

          {/* Kind-Auswahl – nur bei mehreren Kindern */}
          {children.length > 1 && (
            <TextField
              select
              label="Kind"
              value={selectedChildId || selectedChild?.id || ''}
              onChange={(e) => setSelectedChildId(e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              {children.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {children.length === 1 && firstChild && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {firstChild.emoji} {firstChild.name} – {firstChild.kita_name ?? 'Kita'}
            </Typography>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField label="Abwesend ab" type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} fullWidth size="small" />
            <TextField label="Abwesend bis" type="date" value={to} onChange={(e) => setTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: from } }} fullWidth size="small" helperText="leer = gleicher Tag" />
          </Box>

          <TextField select label="Grund" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth size="small" sx={{ mb: 2 }}>
            {reasons.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>

          <TextField label="Anmerkung (optional)" multiline rows={3} value={note} onChange={(e) => setNote(e.target.value)}
            fullWidth size="small" placeholder="z. B. Symptome, Arztbesuch geplant …" sx={{ mb: 2 }} />

          <Button variant="contained" fullWidth size="large" disabled={!from || !reason || submitting} onClick={handleSubmit}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#6B8A15', color: 'white' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
            {submitting ? <CircularProgress size={22} sx={{ color: '#1A3545' }} /> : 'Abwesenheit melden'}
          </Button>
        </CardContent>
      </Card>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Gemeldete Abwesenheiten ({absences.length})
      </Typography>
      <Card>
        {absences.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Noch keine Meldungen</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {absences.map((a, i) => (
              <Box key={a.id}>
                {i > 0 && <Divider />}
                <ListItem sx={{ py: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.reason}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.from.toLocaleDateString('de-DE') === a.to.toLocaleDateString('de-DE')
                        ? a.from.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
                        : `${a.from.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} – ${a.to.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    </Typography>
                    {a.note && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>{a.note}</Typography>}
                  </Box>
                  <Chip label={a.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'} size="small"
                    color={a.status === 'confirmed' ? 'success' : 'warning'}
                    icon={a.status === 'confirmed' ? <CheckCircleOutlinedIcon /> : undefined}
                    variant={a.status === 'confirmed' ? 'filled' : 'outlined'} />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Card>

      <Snackbar open={snackbar} autoHideDuration={3500} onClose={() => setSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar(false)} sx={{ width: '100%' }}>
          Abwesenheit wurde gemeldet und an das Kita-Team weitergeleitet.
        </Alert>
      </Snackbar>
    </Box>
  );
}
