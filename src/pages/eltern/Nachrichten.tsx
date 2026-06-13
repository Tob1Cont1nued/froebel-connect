import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useApp } from '../../context/AppContext';

export default function Nachrichten() {
  const navigate = useNavigate();
  const { conversations, deleteConversation } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmId) return;
    await deleteConversation(confirmId);
    setConfirmId(null);
    navigate('/eltern/nachrichten');
  };

  return (
    <Box>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nachrichten</Typography>
      </Box>
      <List disablePadding>
        {conversations.map((conv, i) => (
          <Box key={conv.id}>
            {i > 0 && <Divider variant="inset" component="li" />}
            <ListItem
              alignItems="flex-start"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, '&:hover .delete-btn': { opacity: 1 } }}
              onClick={() => navigate(`/eltern/nachrichten/${conv.id}`)}
              secondaryAction={
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setConfirmId(conv.id); }}
                  sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.15s', color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Badge badgeContent={conv.unread} color="error" invisible={conv.unread === 0} overlap="circular">
                  <Avatar sx={{ bgcolor: '#1A3545', fontWeight: 700 }}>{conv.avatar}</Avatar>
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
    </Box>
  );
}
