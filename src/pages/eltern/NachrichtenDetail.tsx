import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useApp } from '../../context/AppContext';
import { useMessages } from '../../hooks/useMessages';

export default function NachrichtenDetail() {
  const { convId } = useParams<{ convId: string }>();
  const navigate = useNavigate();
  const { conversations, sendMessage, markAsRead } = useApp();
  const { messages, refetch } = useMessages(convId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conv = conversations.find((c) => c.id === convId);

  useEffect(() => {
    if (convId) markAsRead(convId);
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!conv) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Konversation nicht gefunden.</Typography>
      </Box>
    );
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !convId) return;
    setInput('');
    await sendMessage(convId, text);
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Paper elevation={1} sx={{ borderRadius: 0, flexShrink: 0 }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <IconButton edge="start" onClick={() => navigate('/eltern/nachrichten')} aria-label="Zurück" sx={{ display: { md: 'none' }, mr: 0 }}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1A3545', fontSize: 13 }}>{conv.avatar}</Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{conv.from}</Typography>
            <Typography variant="caption" color="text.secondary">{conv.fromRole}</Typography>
          </Box>
        </Toolbar>
        <Divider />
      </Paper>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((msg) => (
          <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }}>
            <Box sx={{
              maxWidth: { xs: '80%', md: '65%' }, px: 2, py: 1,
              borderRadius: msg.isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              bgcolor: msg.isMe ? '#1A3545' : 'white',
              color: msg.isMe ? 'white' : 'text.primary',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="body2">{msg.text}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', textAlign: 'right', mt: 0.25 }}>
                {msg.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      <Paper elevation={2} sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end', borderRadius: 0, flexShrink: 0 }}>
        <TextField multiline maxRows={4} fullWidth size="small" placeholder="Nachricht schreiben …"
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          inputProps={{ 'aria-label': 'Nachricht schreiben' }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
        <IconButton onClick={handleSend} disabled={!input.trim()} aria-label="Nachricht senden"
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#6B8A15', color: 'white' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
}
