import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import GroupsIcon from '@mui/icons-material/Groups';
import { useTeamMessages } from '../../hooks/useTeamMessages';
import { useKrankmeldungen } from '../../hooks/useKrankmeldungen';
import { useAuth } from '../../context/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' · ' +
    d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function TeamKanal() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { messages, loading, send } = useTeamMessages();
  const { aktuellKrank } = useKrankmeldungen();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await send(text);
    setText('');
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        {isMobile && (
          <IconButton size="small" onClick={() => navigate('/team/nachrichten')}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: '#E8F5E9', color: '#2E7D32', display: 'flex' }}>
          <GroupsIcon fontSize="small" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Team-Kanal</Typography>
          <Typography variant="caption" color="text.secondary">
            {aktuellKrank.length > 0
              ? `${aktuellKrank.length} Kolleg${aktuellKrank.length === 1 ? 'e' : 'en'} krank`
              : 'Alle anwesend'}
          </Typography>
        </Box>
        {aktuellKrank.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {aktuellKrank.map((k) => (
              <Chip key={k.id} label={k.fachkraft_name.split(' ')[0]} size="small"
                sx={{ bgcolor: '#FCE4EC', color: '#C2185B', fontWeight: 600, border: 'none', fontSize: 11 }} />
            ))}
          </Box>
        )}
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={28} sx={{ color: '#95C11F' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.disabled', pt: 6 }}>
            <GroupsIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">Noch keine Nachrichten im Team-Kanal.</Typography>
            <Typography variant="caption">Schreib die erste Nachricht!</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === profile?.id;
            return (
              <Box key={msg.id} sx={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap: 1, alignItems: 'flex-end' }}>
                {!isOwn && (
                  <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, bgcolor: '#1A3545', flexShrink: 0, mb: 0.25 }}>
                    {initials(msg.sender_name)}
                  </Avatar>
                )}
                <Box sx={{ maxWidth: '72%' }}>
                  {!isOwn && (
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 0.5, display: 'block', mb: 0.25 }}>
                      {msg.sender_name}
                    </Typography>
                  )}
                  <Box sx={{
                    px: 1.5, py: 1,
                    bgcolor: isOwn ? '#95C11F' : 'background.paper',
                    color: isOwn ? '#1A3545' : 'text.primary',
                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    boxShadow: 1,
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.message}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25, textAlign: isOwn ? 'right' : 'left', px: 0.5 }}>
                    {formatTime(msg.created_at)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'flex-end', flexShrink: 0 }}>
        <TextField
          multiline
          maxRows={4}
          fullWidth
          size="small"
          placeholder="Nachricht an das Team …"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!text.trim() || sending}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' }, '&:disabled': { bgcolor: 'action.disabledBackground' }, flexShrink: 0 }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
