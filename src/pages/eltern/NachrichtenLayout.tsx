import { useState, useEffect, useRef } from 'react';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useApp } from '../../context/AppContext';
import { useKitaFachkraefte } from '../../hooks/useKitaFachkraefte';
import type { ConvItem } from '../../context/AppContext';

const SWIPE_THRESHOLD = 72;
const SWIPE_MAX = 80;

function SwipeableItem({
  conv,
  active,
  isMobile,
  onNavigate,
  onDelete,
}: {
  conv: ConvItem;
  active: boolean;
  isMobile: boolean;
  onNavigate: () => void;
  onDelete: () => void;
}) {
  const touchStartX = useRef(0);
  const [swipeX, setSwipeX] = useState(0);
  const [swiped, setSwiped] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    if (delta < 0) setSwipeX(Math.max(delta, -SWIPE_MAX));
  };

  const handleTouchEnd = () => {
    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-SWIPE_MAX);
      setSwiped(true);
    } else {
      setSwipeX(0);
      setSwiped(false);
    }
  };

  const reset = () => { setSwipeX(0); setSwiped(false); };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Red delete background (mobile only) */}
      {isMobile && (
        <Box
          role="button"
          aria-label="Löschen"
          tabIndex={-1}
          sx={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: SWIPE_MAX, bgcolor: 'error.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => { reset(); onDelete(); }}
        >
          <DeleteOutlinedIcon sx={{ color: 'white' }} />
        </Box>
      )}

      {/* List item */}
      <ListItem
        alignItems="flex-start"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        sx={{
          cursor: 'pointer',
          bgcolor: active ? 'action.selected' : 'background.paper',
          '&:hover': { bgcolor: 'action.hover' },
          '&:hover .delete-btn': { opacity: 1 },
          transform: isMobile ? `translateX(${swipeX}px)` : 'none',
          transition: swiped || swipeX === 0 ? 'transform 0.2s ease' : 'none',
          position: 'relative', zIndex: 1,
        }}
        onClick={() => { if (swipeX < -10) { reset(); return; } onNavigate(); }}
        secondaryAction={
          !isMobile ? (
            <IconButton
              className="delete-btn"
              size="small"
              aria-label={`Konversation mit ${conv.from} löschen`}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              sx={{ opacity: 0, transition: 'opacity 0.15s', color: 'text.disabled', '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          ) : undefined
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
  );
}

function NachrichtenListe() {
  const navigate = useNavigate();
  const { conversations, createConversation, deleteConversation } = useApp();
  const { fachkraefte } = useKitaFachkraefte();
  const matchDetail = useMatch('/eltern/nachrichten/:convId');
  const activeId = matchDetail?.params.convId;
  const isMobile = useMediaQuery('(max-width:899px)');

  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [pendingNavId, setPendingNavId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
    setPendingNavId(convId);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    await deleteConversation(confirmId);
    setConfirmId(null);
    if (activeId === confirmId) navigate('/eltern/nachrichten');
  };

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nachrichten</Typography>
        <Tooltip title="Neue Nachricht">
          <IconButton
            size="small"
            aria-label="Neue Nachricht schreiben"
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
            <SwipeableItem
              conv={conv}
              active={activeId === conv.id}
              isMobile={isMobile}
              onNavigate={() => navigate(`/eltern/nachrichten/${conv.id}`)}
              onDelete={() => setConfirmId(conv.id)}
            />
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
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>An</Typography>
          <List disablePadding sx={{ mb: 2 }}>
            {fachkraefte.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>Keine Fachkräfte gefunden.</Typography>
            )}
            {fachkraefte.map((f) => (
              <ListItem
                key={f.id}
                onClick={() => setRecipientId(f.id)}
                sx={{
                  cursor: 'pointer', borderRadius: 2,
                  bgcolor: recipientId === f.id ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }, px: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1A3545', width: 36, height: 36, fontSize: 13 }}>{f.initials}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{f.name}</Typography>}
                  secondary={<Typography variant="caption">Fachkraft</Typography>}
                />
                {recipientId === f.id && <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />}
              </ListItem>
            ))}
          </List>
          <TextField
            label="Nachricht" multiline rows={3} fullWidth size="small"
            value={messageText} onChange={(e) => setMessageText(e.target.value)}
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

      {/* Delete confirmation */}
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

export default function NachrichtenLayout() {
  const matchDetail = useMatch('/eltern/nachrichten/:convId');
  const hasConv = !!matchDetail;

  return (
    <Box sx={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
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
