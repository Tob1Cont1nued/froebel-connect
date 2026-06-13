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
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useApp } from '../../context/AppContext';
import { currentChild } from '../../mockData';

const reasons = ['Krankheit', 'Arzttermin', 'Urlaub / Familienzeit', 'Persönliche Gründe', 'Sonstiges'];

export default function Abwesenheit() {
  const { absences, addAbsence } = useApp();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [snackbar, setSnackbar] = useState(false);

  const handleSubmit = () => {
    if (!from || !reason) return;
    addAbsence({
      from: new Date(from),
      to: to ? new Date(to) : new Date(from),
      reason,
      note: note || undefined,
      status: 'pending',
    });
    setFrom('');
    setTo('');
    setReason('');
    setNote('');
    setSnackbar(true);
  };

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
        Abwesenheit melden
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EventBusyIcon color="secondary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {currentChild.name} – {currentChild.kita}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Abwesend ab"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              size="small"
            />
            <TextField
              label="Abwesend bis"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: from } }}
              fullWidth
              size="small"
              helperText="leer = gleicher Tag"
            />
          </Box>

          <TextField
            select
            label="Grund"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            {reasons.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Anmerkung (optional)"
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            size="small"
            placeholder="z. B. Symptome, Arztbesuch geplant …"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={!from || !reason}
            onClick={handleSubmit}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#6B8A15', color: 'white' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
          >
            Abwesenheit melden
          </Button>
        </CardContent>
      </Card>

      {/* History */}
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
                    {a.note && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                        {a.note}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={a.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                    size="small"
                    color={a.status === 'confirmed' ? 'success' : 'warning'}
                    icon={a.status === 'confirmed' ? <CheckCircleOutlinedIcon /> : undefined}
                    variant={a.status === 'confirmed' ? 'filled' : 'outlined'}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Card>

      <Snackbar
        open={snackbar}
        autoHideDuration={3500}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(false)} sx={{ width: '100%' }}>
          Abwesenheit wurde gemeldet und an das Kita-Team weitergeleitet.
        </Alert>
      </Snackbar>
    </Box>
  );
}
