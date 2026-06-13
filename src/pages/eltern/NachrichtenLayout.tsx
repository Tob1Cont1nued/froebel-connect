import { useState, useEffect } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useApp } from '../../context/AppContext';
import { useKitaFachkraefte } from '../../hooks/useKitaFachkraefte';

function NachrichtenListe() {
  const navigate = useNavigate();
  const { conversations, createConversation } = useApp();
  const { fachkraefte } = useKitaFachkraefte();
  const matchDetail = useMatch('/eltern/nachrichten/:convId');
  const activeId = matchDetail?.params.convId;

  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [pendingNavId, setPendingNavId] = useState<string | null>(null);

  // Navigate only after the new conv has landed in conversations state
  useEffect(() => {
    if (!pendingNavId) return;
    const found = conversations.find((c) => c.id === pendingNavId);
    if (found) {
      navigate(`/eltern/nachrichten/${pendingNavId}`);
      setPendingNavId(null);
    }
  }, [pendingNavId, conversations, navigate]);

  const handleClose = () => {
    setOpen(false);
    setRecipientId('');
    setMessageText('');
    setSendError(false);
  };

  const handleSend = async () => {
    if (!recipientId || !messageText.trim()) return;
    setSending(true);
    setSendError(false);
    const recipient = fachkraefte.find((f) => f.id === recipientId);
    const convId = await createConversation(recipientId, recipient?.name ?? 'Fachkraft', null, messageText.trim());
    setSending(false);
    if (!convId) { setSendError(true); return; }
    handleClose();
    setPendingNavId(convId); // navigate after state commit
  };

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nachrichten</Typography>
        <Tooltip title="Neue Nachricht">
          <IconButton
            size="small"
            onClick={() => setOpen(true)}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
        {conversations.map((conv, i) => (
          <Box key={conv.id}>
            {i > 0 && <Divider variant="inset" component="li" />}
            <ListItem
              alignItems="flex-start"
              sx={{
                cursor: 'pointer',
                bgcolor: activeId === conv.id ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate(`/eltern/nachrichten/${conv.id}`)}
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

      {/* New conversation dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>Neue Nachricht</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {sendError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              Nachricht konnte nicht gesendet werden. Bitte führe zuerst die SQL-Policies im Supabase-Dashboard aus.
            </Alert>
          )}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            An
          </Typography>
          <List disablePadding sx={{ mb: 2 }}>
            {fachkraefte.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                Keine Fachkräfte gefunden.
              </Typography>
            )}
            {fachkraefte.map((f) => (
              <ListItem
                key={f.id}
                onClick={() => setRecipientId(f.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  bgcolor: recipientId === f.id ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  px: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1A3545', width: 36, height: 36, fontSize: 13 }}>
                    {f.initials}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{f.name}</Typography>}
                  secondary={<Typography variant="caption">Fachkraft</Typography>}
                />
                {recipientId === f.id && (
                  <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />
                )}
              </ListItem>
            ))}
          </List>
          <TextField
            label="Nachricht"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Was möchtest du mitteilen?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={sending}>Abbrechen</Button>
          <Button
            variant="contained"
            disabled={!recipientId || !messageText.trim() || sending}
            onClick={handleSend}
            startIcon={sending ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {sending ? 'Senden…' : 'Senden'}
          </Button>
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

export default function NachrichtenLayout() {
  const matchDetail = useMatch('/eltern/nachrichten/:convId');
  const hasConv = !!matchDetail;

  return (
    <Box sx={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* List panel — full width on mobile (hidden when conv open), fixed width on desktop */}
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

      {/* Detail panel — hidden on mobile when no conv, always visible on desktop */}
      <Box
        sx={{
          flex: 1,
          display: { xs: hasConv ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Outlet context={{ inLayout: true }} />
      </Box>
    </Box>
  );
}
