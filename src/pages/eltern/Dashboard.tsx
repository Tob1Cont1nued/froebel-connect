import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useChildren } from '../../hooks/useChildren';
import { useAppointments } from '../../hooks/useAppointments';

const appointmentColors = {
  event: '#1565C0', closure: '#C62828', meeting: '#2E7D32', info: '#E65100',
};
const appointmentLabels = {
  event: 'Veranstaltung', closure: 'Schließtag', meeting: 'Gespräch', info: 'Info',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { conversations } = useApp();
  const { firstChild, loading: childLoading } = useChildren();
  const { appointments, loading: aptLoading } = useAppointments();

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Guten Morgen' : today.getHours() < 17 ? 'Guten Tag' : 'Guten Abend';
  const firstName = profile?.name?.split(' ')[0] ?? '';

  const nextAppointments = appointments.filter((a) => a.date >= today).slice(0, 4);
  const unreadConversations = conversations.filter((c) => c.unread > 0);

  if (childLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 1100 }, mx: 'auto', width: '100%' }}>
      {/* Hero */}
      <Card sx={{ mb: 2.5, background: 'linear-gradient(135deg, #1A3545 0%, #2D5468 100%)', color: 'white' }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>{greeting},</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{firstName} 👋</Typography>
          {firstChild && (
            <>
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ fontSize: 36 }}>{firstChild.emoji}</Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{firstChild.name}</Typography>
                  {firstChild.kita_name && <Typography variant="body2" sx={{ opacity: 0.8 }}>{firstChild.kita_name}</Typography>}
                </Box>
                <Chip label="Anwesend" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {/* Linke Spalte */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 0.5 }}>Schnellzugriff</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
            <Button variant="contained" size="large" startIcon={<EventBusyIcon />} onClick={() => navigate('/eltern/abwesenheit')}
              sx={{ py: 1.5, borderRadius: 3, bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#6B8A15', color: 'white' } }}>
              Abwesenheit melden
            </Button>
            <Button variant="outlined" size="large" startIcon={<ChatBubbleOutlinedIcon />} onClick={() => navigate('/eltern/nachrichten')}
              sx={{ py: 1.5, borderRadius: 3 }}>
              Nachricht senden
            </Button>
          </Box>

          {unreadConversations.length > 0 && (
            <Card>
              <CardContent sx={{ pb: '8px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>💬 Neue Nachrichten</Typography>
                  <Button size="small" endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />} onClick={() => navigate('/eltern/nachrichten')}>Alle</Button>
                </Box>
                {unreadConversations.map((conv) => (
                  <Box key={conv.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', borderRadius: 2, px: 1, py: 0.75, '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/eltern/nachrichten/${conv.id}`)}>
                    <Avatar sx={{ bgcolor: '#1A3545', width: 36, height: 36, fontSize: 14 }}>{conv.avatar}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{conv.from}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>{conv.preview}</Typography>
                    </Box>
                    <Chip label={conv.unread} size="small" color="error" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Rechte Spalte */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent sx={{ pb: '8px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>📅 Nächste Termine</Typography>
                <Button size="small" endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />} onClick={() => navigate('/eltern/termine')}>Alle</Button>
              </Box>
              {aptLoading ? <CircularProgress size={20} sx={{ m: 1 }} /> : nextAppointments.map((apt, i) => (
                <Box key={apt.id}>
                  {i > 0 && <Divider sx={{ my: 0.5 }} />}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, px: 1, borderRadius: 2 }}>
                    <Box sx={{ width: 4, height: 36, borderRadius: 2, bgcolor: appointmentColors[apt.type], flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{apt.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {apt.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                        {apt.time ? ` · ${apt.time}` : ''}
                      </Typography>
                    </Box>
                    <Chip label={appointmentLabels[apt.type]} size="small"
                      sx={{ bgcolor: appointmentColors[apt.type] + '20', color: appointmentColors[apt.type], fontWeight: 600, fontSize: 10 }} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
