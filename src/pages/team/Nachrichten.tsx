import { useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Badge from '@mui/material/Badge';
import ProfileAvatar from '../../components/ProfileAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useApp } from '../../context/AppContext';
import { useKitaFachkraefte } from '../../hooks/useKitaFachkraefte';
import { useAuth } from '../../context/AuthContext';

function NachrichtenListe() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { conversations, deleteConversation, createConversation } = useApp();
  const { fachkraefte } = useKitaFachkraefte();
  const matchDetail = useMatch('/team/nachrichten/:convId');
  const activeId = matchDetail?.params.convId;
  const teamKanalActive = activeId === 'team-kanal';
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [firstMsg, setFirstMsg] = useState('');
  const [composing, setComposing] = useState(false);

  const colleagues = fachkraefte.filter((f) => f.id !== profile?.id);

  const handleCompose = async () => {
    if (!selectedId || !firstMsg.trim()) return;
    setComposing(true);
    const recipient = colleagues.find((f) => f.id === selectedId);
    const convId = await createConversation(selectedId, recipient?.name ?? 'Kolleg:in', null, firstMsg.trim());
    setComposing(false);
    setComposeOpen(false);
    setSelectedId(null);
    setFirstMsg('');
    if (convId) navigate(`/team/nachrichten/${convId}`);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    await deleteConversation(confirmId);
    setConfirmId(null);
    if (activeId === confirmId) navigate('/team/nachrichten');
  };

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Nachrichten</Typography>
        <IconButton size="small" onClick={() => setComposeOpen(true)} title="Neue Nachricht">
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
      <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
        {/* Team-Kanal (pinned) */}
        <ListItem
          alignItems="flex-start"
          sx={{
            cursor: 'pointer',
            bgcolor: teamKanalActive ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => navigate('/team/nachrichten/team-kanal')}
        >
          <ListItemAvatar>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GroupsIcon fontSize="small" />
            </Box>
          </ListItemAvatar>
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Team-Kanal</Typography>
            <Typography variant="caption" color="text.secondary">Gruppen-Chat für alle Fachkräfte</Typography>
          </Box>
        </ListItem>
        <Divider variant="inset" component="li" />

        {conversations.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.disabled' }}>
            <Typography variant="body2">Noch keine Nachrichten.</Typography>
          </Box>
        )}
        {conversations.map((conv, i) => (
          <Box key={conv.id}>
            {i > 0 && <Divider variant="inset" component="li" />}
            <ListItem
              alignItems="flex-start"
              sx={{
                cursor: 'pointer',
                bgcolor: activeId === conv.id ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                '&:hover .delete-btn': { opacity: 1 },
              }}
              onClick={() => navigate(`/team/nachrichten/${conv.id}`)}
              secondaryAction={
                <IconButton
                  className="delete-btn"
                  size="small"
                  aria-label={`Konversation mit ${conv.from} löschen`}
                  onClick={(e) => { e.stopPropagation(); setConfirmId(conv.id); }}
                  sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.15s', color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Badge badgeContent={conv.unread} color="error" invisible={conv.unread === 0} overlap="circular">
                  <ProfileAvatar avatarUrl={conv.avatarUrl} initials={conv.avatar} size={40} alt={conv.from} />
                </Badge>
              </ListItemAvatar>
              <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: conv.unread > 0 ? 700 : 400 }}>
                    {conv.from}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {conv.lastMessage.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {conv.fromRole}
                </Typography>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ color: conv.unread > 0 ? 'text.primary' : 'text.secondary', fontWeight: conv.unread > 0 ? 500 : 400 }}
                >
                  {conv.preview}
                </Typography>
              </Box>
            </ListItem>
          </Box>
        ))}
      </List>

      {/* Neue Nachricht Dialog */}
      <Dialog open={composeOpen} onClose={() => { setComposeOpen(false); setSelectedId(null); setFirstMsg(''); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Neue Nachricht</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            {colleagues.map((f, i) => (
              <Box key={f.id}>
                {i > 0 && <Divider />}
                <ListItemButton
                  selected={selectedId === f.id}
                  onClick={() => setSelectedId(f.id)}
                  sx={{ px: 2, py: 1.25, '&.Mui-selected': { bgcolor: '#F1F8E9' } }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 700, fontSize: 13 }}>
                      {f.initials}
                    </Avatar>
                  </ListItemAvatar>
                  <Typography variant="body2" sx={{ fontWeight: selectedId === f.id ? 700 : 400 }}>{f.name}</Typography>
                </ListItemButton>
              </Box>
            ))}
          </List>
          {selectedId && (
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <TextField
                fullWidth multiline minRows={2} size="small"
                placeholder="Erste Nachricht …"
                value={firstMsg}
                onChange={(e) => setFirstMsg(e.target.value)}
                autoFocus
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => { setComposeOpen(false); setSelectedId(null); setFirstMsg(''); }}>Abbrechen</Button>
          <Button
            variant="contained" disabled={!selectedId || !firstMsg.trim() || composing}
            onClick={handleCompose}
            sx={{ bgcolor: '#95C11F', '&:hover': { bgcolor: '#7EA819' } }}
          >
            Senden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Konversation löschen Dialog */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Konversation löschen?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Diese Konversation wird aus deiner Liste entfernt. Du kannst sie danach nicht mehr einsehen.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Löschen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function EmptyState() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.disabled', p: 4 }}>
      <ChatBubbleOutlinedIcon sx={{ fontSize: 56, mb: 2 }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>Gespräch auswählen</Typography>
      <Typography variant="caption" sx={{ textAlign: 'center', mt: 0.5 }}>
        Wähle links ein Gespräch aus, um zu antworten.
      </Typography>
    </Box>
  );
}

export { EmptyState };

export default function TeamNachrichten() {
  const matchDetail = useMatch('/team/nachrichten/:convId');
  const hasConv = !!matchDetail;

  return (
    <Box sx={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* List panel */}
      <Box
        sx={{
          width: { xs: '100%', md: 340 },
          display: { xs: hasConv ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          borderRight: { md: '1px solid' },
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <NachrichtenListe />
      </Box>

      {/* Detail panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: hasConv ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
