import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useAuth } from '../../context/AuthContext';
import { useChildren } from '../../hooks/useChildren';
import { useKitaAbsences } from '../../hooks/useKitaAbsences';

export default function TeamDashboard() {
  const { profile } = useAuth();
  const { children, loading: childrenLoading } = useChildren();
  const { absences, loading: absencesLoading, confirmAbsence } = useKitaAbsences();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const kitaName = children[0]?.kita_name ?? 'Kita';

  const absentTodayIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of absences) {
      if (a.from_date <= todayStr && a.to_date >= todayStr && a.status !== 'rejected') {
        ids.add(a.child_id);
      }
    }
    return ids;
  }, [absences, todayStr]);

  const pendingAbsences = absences.filter((a) => a.status === 'pending');
  const presentCount = children.filter((c) => !absentTodayIds.has(c.id)).length;
  const absentCount = absentTodayIds.size;
  const loading = childrenLoading || absencesLoading;

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
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {kitaName}
          </Typography>
        </CardContent>
      </Card>

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
            const isAbsent = absentTodayIds.has(child.id);
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
                  {isAbsent ? (
                    <Chip icon={<CancelIcon />} label="Abwesend" size="small" color="error" variant="outlined" />
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
