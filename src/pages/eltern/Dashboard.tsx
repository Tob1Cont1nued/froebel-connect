import { useState } from 'react';
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
import Collapse from '@mui/material/Collapse';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useChildren } from '../../hooks/useChildren';
import { useAppointments } from '../../hooks/useAppointments';
import { useAbsences } from '../../hooks/useAbsences';

function childAvatar(child: { emoji: string; photo_url: string | null }) {
  if (child.photo_url?.startsWith('preset:')) return { type: 'emoji' as const, value: child.photo_url.replace('preset:', '') };
  if (child.photo_url?.startsWith('http')) return { type: 'photo' as const, value: child.photo_url };
  return { type: 'emoji' as const, value: child.emoji };
}

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
  const { children, loading: childLoading } = useChildren();
  const { appointments, loading: aptLoading } = useAppointments();
  const { absences } = useAbsences();

  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Guten Morgen' : today.getHours() < 17 ? 'Guten Tag' : 'Guten Abend';
  const firstName = profile?.name?.split(' ')[0] ?? '';

  const nextAppointments = appointments.filter((a) => a.date >= today).slice(0, 4);
  const todayStr = today.toISOString().split('T')[0];
  const activeAbsences = absences.filter((a) => a.to >= today || a.from.toISOString().split('T')[0] >= todayStr);
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
          {children.length > 0 && (
            <>
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {children.map((child, i) => {
                  const av = childAvatar(child);
                  const isExpanded = expandedChildId === child.id;
                  return (
                    <Box key={child.id}>
                      {i > 0 && <Divider sx={{ my: 0.75, borderColor: 'rgba(255,255,255,0.1)' }} />}
                      {/* Klickbare Zeile */}
                      <Box
                        onClick={() => setExpandedChildId(isExpanded ? null : child.id)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', borderRadius: 2, px: 0.5, py: 0.5, transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' } }}
                      >
                        {av.type === 'photo'
                          ? <Box component="img" src={av.value} sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <Box sx={{ fontSize: 32, lineHeight: 1 }}>{av.value}</Box>
                        }
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{child.name}</Typography>
                          {child.kita_name && <Typography variant="body2" sx={{ opacity: 0.75 }}>{child.kita_name}</Typography>}
                        </Box>
                        <Chip label="Anwesend" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
                        <KeyboardArrowDownIcon sx={{ opacity: 0.55, fontSize: 22, flexShrink: 0, transition: 'transform 0.25s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </Box>
                      {/* Aufgeklapptes Profil */}
                      <Collapse in={isExpanded} timeout={220}>
                        <Box sx={{ mx: 0.5, mb: 0.5, mt: 0.5, p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                            <Box>
                              <Typography variant="caption" sx={{ opacity: 0.55, display: 'block', mb: 0.25 }}>Alter</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{child.age != null ? `${child.age} Jahre` : '–'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ opacity: 0.55, display: 'block', mb: 0.25 }}>Einrichtung</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{child.kita_name ?? '–'}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button size="small" variant="outlined" startIcon={<EventBusyIcon sx={{ fontSize: 14 }} />}
                              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontSize: 12, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
                              onClick={(e) => { e.stopPropagation(); navigate('/eltern/abwesenheit'); }}>
                              Abwesenheit
                            </Button>
                            <Button size="small" variant="outlined" startIcon={<FolderOutlinedIcon sx={{ fontSize: 14 }} />}
                              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontSize: 12, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
                              onClick={(e) => { e.stopPropagation(); navigate('/eltern/portfolio'); }}>
                              Portfolio
                            </Button>
                            <Button size="small" variant="outlined" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontSize: 12, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
                              onClick={(e) => { e.stopPropagation(); navigate('/eltern/dokumente'); }}>
                              Dokumente
                            </Button>
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
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

          {activeAbsences.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ pb: '8px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    <EventBusyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle', color: '#E65100' }} />
                    Gemeldete Abwesenheiten
                  </Typography>
                  <Button size="small" endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />} onClick={() => navigate('/eltern/abwesenheit')}>Alle</Button>
                </Box>
                {activeAbsences.slice(0, 3).map((a, i) => (
                  <Box key={a.id}>
                    {i > 0 && <Divider sx={{ my: 0.5 }} />}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, px: 1, borderRadius: 2 }}>
                      {(() => { const av = childAvatar({ emoji: a.childEmoji ?? '👶', photo_url: a.childPhotoUrl ?? null }); return av.type === 'photo'
                        ? <Box component="img" src={av.value} sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        : <Box sx={{ fontSize: 20 }}>{av.value}</Box>; })()}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {a.childName ?? ''} · {a.reason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.from.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                          {a.from.toDateString() !== a.to.toDateString() && ` – ${a.to.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={a.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                        size="small"
                        color={a.status === 'confirmed' ? 'success' : 'warning'}
                        variant={a.status === 'confirmed' ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

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
          <Box sx={{ height: 20, mb: 1 }} /> {/* Platzhalter für "Schnellzugriff"-Label */}
          <Card>
            <CardContent sx={{ pb: '8px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>📅 Nächste Termine</Typography>
                <Button size="small" endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />} onClick={() => navigate('/eltern/termine')}>Alle</Button>
              </Box>
              {aptLoading ? <CircularProgress size={20} sx={{ m: 1 }} /> : nextAppointments.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ py: 1, px: 1 }}>Keine bevorstehenden Termine.</Typography>
              ) : nextAppointments.map((apt, i) => (
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
