import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SickIcon from '@mui/icons-material/Sick';
import { useAuth } from '../../context/AuthContext';
import { useKitaChildren as useChildren } from '../../hooks/useKitaChildren';
import { useKitaAbsences } from '../../hooks/useKitaAbsences';
import { useKrankmeldungen } from '../../hooks/useKrankmeldungen';

export default function TeamDashboard() {
  const { profile } = useAuth();
  const { children, loading: childrenLoading } = useChildren();
  const { absences, loading: absencesLoading, confirmAbsence } = useKitaAbsences();
  const { aktuellKrank, eigeneMeldung, melden, zurueckziehen } = useKrankmeldungen();
  const [krankDialog, setKrankDialog] = useState(false);
  const [krankForm, setKrankForm] = useState({ from_date: new Date().toISOString().split('T')[0], to_date: new Date().toISOString().split('T')[0], note: '' });
  const [krankError, setKrankError] = useState('');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const kitaName = children[0]?.kita_name ?? 'Kita';

  const absentTodayMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of absences) {
      if (a.from_date <= todayStr && a.to_date >= todayStr && a.status !== 'rejected') {
        map.set(a.child_id, a.reason);
      }
    }
    return map;
  }, [absences, todayStr]);

  const pendingAbsences = absences.filter((a) => a.status === 'pending');
  const presentCount = children.filter((c) => !absentTodayMap.has(c.id)).length;
  const absentCount = absentTodayMap.size;
  const loading = childrenLoading || absencesLoading;

  const handleKrankMelden = async () => {
    if (!krankForm.from_date || !krankForm.to_date) { setKrankError('Bitte Datum eingeben.'); return; }
    if (krankForm.to_date < krankForm.from_date) { setKrankError('Enddatum muss nach dem Startdatum liegen.'); return; }
    setKrankError('');
    const err = await melden(krankForm.from_date, krankForm.to_date, krankForm.note);
    if (err) { setKrankError(err); return; }
    setKrankDialog(false);
  };

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1A3545 0%, #2D5468 100%)', color: 'white' }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {today.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Guten Morgen, {profile?.name?.split(' ')[0] ?? ''}!
          </Typography>
          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>{kitaName}</Typography>
            {aktuellKrank.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {aktuellKrank.map((k) => (
                  <Chip key={k.id} icon={<SickIcon sx={{ fontSize: '14px !important', color: '#FCE4EC !important' }} />}
                    label={k.fachkraft_name.split(' ')[0]}
                    size="small"
                    sx={{ bgcolor: 'rgba(194,24,91,0.25)', color: '#FCE4EC', fontWeight: 600, border: 'none', fontSize: 11 }}
                  />
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 1.5 }}>
            {eigeneMeldung ? (
              <Button
                fullWidth
                startIcon={<SickIcon />}
                onClick={() => zurueckziehen(eigeneMeldung.id)}
                sx={{ bgcolor: 'rgba(194,24,91,0.25)', color: '#FCE4EC', fontWeight: 600, borderRadius: 2, py: 1, '&:hover': { bgcolor: 'rgba(194,24,91,0.4)' } }}
              >
                {eigeneMeldung.from_date === eigeneMeldung.to_date
                  ? `Krank ${new Date(eigeneMeldung.from_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · Zurückziehen`
                  : `Krank ${new Date(eigeneMeldung.from_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}–${new Date(eigeneMeldung.to_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · Zurückziehen`
                }
              </Button>
            ) : (
              <Button
                fullWidth
                startIcon={<SickIcon />}
                onClick={() => { setKrankDialog(true); setKrankError(''); }}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', fontWeight: 600, borderRadius: 2, py: 1, border: '1px solid rgba(255,255,255,0.25)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' } }}
              >
                Krank melden
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Krank melden Dialog */}
      <Dialog open={krankDialog} onClose={() => setKrankDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SickIcon color="error" /> Krank melden
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {krankError && <Alert severity="error">{krankError}</Alert>}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Von" type="date" fullWidth required
              value={krankForm.from_date}
              onChange={(e) => setKrankForm((f) => ({ ...f, from_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Bis" type="date" fullWidth required
              value={krankForm.to_date}
              onChange={(e) => setKrankForm((f) => ({ ...f, to_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <TextField
            label="Notiz (optional)" multiline minRows={2} fullWidth
            value={krankForm.note}
            onChange={(e) => setKrankForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="z.B. Erkältung, Arzttermin …"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setKrankDialog(false)}>Abbrechen</Button>
          <Button variant="contained" color="error" onClick={handleKrankMelden} startIcon={<SickIcon />}>
            Krank melden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Anwesenheit heute
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={4}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">
              {loading ? '–' : children.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Gesamt</Typography>
          </Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="success.main">
              {loading ? '–' : presentCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Anwesend</Typography>
          </Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="error.main">
              {loading ? '–' : absentCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Abwesend</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Pending absence requests */}
      {pendingAbsences.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Abwesenheitsmeldungen ({pendingAbsences.length} offen)
          </Typography>
          <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'warning.light' }}>
            {pendingAbsences.map((a, i) => (
              <Box key={a.id}>
                {i > 0 && <Divider />}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, fontSize: 18, bgcolor: 'grey.100', mt: 0.25 }}>
                    {a.child_emoji}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.child_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(a.from_date).toLocaleDateString('de-DE')}
                      {a.from_date !== a.to_date && ` – ${new Date(a.to_date).toLocaleDateString('de-DE')}`}
                      {' · '}{a.reason}
                    </Typography>
                    {a.note && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {a.note}
                      </Typography>
                    )}
                    {a.parent_name && (
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                        gemeldet von {a.parent_name}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => confirmAbsence(a.id)}
                    startIcon={<TaskAltIcon />}
                    sx={{ mt: 0.25, whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    Bestätigen
                  </Button>
                </Box>
              </Box>
            ))}
          </Card>
        </>
      )}

      {/* Children list */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Kinderliste
      </Typography>
      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Laden…</Typography>
          </CardContent>
        </Card>
      ) : children.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Keine Kinder in dieser Kita erfasst.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {children.map((child, i) => {
            const absentReason = absentTodayMap.get(child.id);
            return (
              <Box key={child.id}>
                {i > 0 && <Divider />}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
                  <Avatar sx={{ width: 36, height: 36, fontSize: 18, bgcolor: 'grey.100' }}>
                    {child.emoji}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{child.name}</Typography>
                    {child.age !== null && (
                      <Typography variant="caption" color="text.secondary">{child.age} Jahre</Typography>
                    )}
                  </Box>
                  {absentReason !== undefined ? (
                    <Chip icon={<CancelIcon />} label={absentReason} size="small" color="error" variant="outlined" />
                  ) : (
                    <Chip icon={<CheckCircleIcon />} label="Anwesend" size="small" color="success" variant="outlined" />
                  )}
                </Box>
              </Box>
            );
          })}
        </Card>
      )}
    </Box>
  );
}
