import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { mockUsers, teamChildren } from '../../mockData';

const present = teamChildren.filter((c) => c.present).length;
const absent = teamChildren.filter((c) => !c.present).length;

export default function TeamDashboard() {
  const user = mockUsers.fachkraft;
  const today = new Date();

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1A3545 0%, #2D5468 100%)', color: 'white' }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {today.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Guten Morgen, {user.name.split(' ')[0]}! 👩‍🏫
          </Typography>
          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Kita Langebusch
          </Typography>
        </CardContent>
      </Card>

      {/* Anwesenheit Stats */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Anwesenheit heute
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={4}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">
              {teamChildren.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Gesamt</Typography>
          </Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="success.main">
              {present}
            </Typography>
            <Typography variant="caption" color="text.secondary">Anwesend</Typography>
          </Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="error.main">
              {absent}
            </Typography>
            <Typography variant="caption" color="text.secondary">Abwesend</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Children List */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Kinderliste
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        {teamChildren.map((child, i) => (
          <Box key={child.id}>
            {i > 0 && <Divider />}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
              <Avatar sx={{ width: 36, height: 36, fontSize: 18, bgcolor: 'grey.100' }}>
                {child.emoji}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{child.name}</Typography>
                <Typography variant="caption" color="text.secondary">{child.age} Jahre</Typography>
              </Box>
              {child.present ? (
                <Chip icon={<CheckCircleIcon />} label="Anwesend" size="small" color="success" variant="outlined" />
              ) : (
                <Chip icon={<CancelIcon />} label="Abwesend" size="small" color="error" variant="outlined" />
              )}
            </Box>
          </Box>
        ))}
      </Card>

      {/* Today's notes */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Heutige Notizen
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: 20 }}>📌</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Elterngespräch – Emma Meier
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Heute um 14:30 Uhr mit Jana Weber. Raum 2.
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography sx={{ fontSize: 20 }}>🍳</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Mittagessen heute: Spaghetti Bolognese
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vegetarische Alternative: Gemüsebolognese. Allergiker prüfen.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
