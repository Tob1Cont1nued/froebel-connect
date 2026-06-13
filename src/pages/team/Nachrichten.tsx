import { useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useApp } from '../../context/AppContext';

function NachrichtenListe() {
  const navigate = useNavigate();
  const { conversations, deleteConversation } = useApp();
  const matchDetail = useMatch('/team/nachrichten/:convId');
  const activeId = matchDetail?.params.convId;
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmId) return;
    await deleteConversation(confirmId);
    setConfirmId(null);
    if (activeId === confirmId) navigate('/team/nachrichten');
  };

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nachrichten</Typography>
      </Box>
      <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
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
                  <Avatar sx={{ bgcolor: '#95C11F', color: '#1A3545', fontWeight: 700 }}>{conv.avatar}</Avatar>
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
