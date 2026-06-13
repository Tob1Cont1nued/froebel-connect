import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import { useApp } from '../../context/AppContext';

function NachrichtenListe() {
  const navigate = useNavigate();
  const { conversations } = useApp();
  const matchDetail = useMatch('/eltern/nachrichten/:convId');
  const activeId = matchDetail?.params.convId;

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nachrichten</Typography>
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
