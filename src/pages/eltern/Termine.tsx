import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { appointments } from '../../mockData';

const typeConfig = {
  event: { color: '#1565C0', bg: '#E3F2FD', label: 'Veranstaltung', emoji: '🎉' },
  closure: { color: '#C62828', bg: '#FFEBEE', label: 'Schließtag', emoji: '🔒' },
  meeting: { color: '#2E7D32', bg: '#E8F5E9', label: 'Gespräch', emoji: '🤝' },
  info: { color: '#E65100', bg: '#FFF3E0', label: 'Info', emoji: 'ℹ️' },
};

function groupByMonth(apts: typeof appointments) {
  const groups: Record<string, typeof appointments> = {};
  const sorted = [...apts].sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const apt of sorted) {
    const key = apt.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(apt);
  }
  return groups;
}

export default function Termine() {
  const grouped = groupByMonth(appointments);

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
        Termine & Veranstaltungen
      </Typography>

      {Object.entries(grouped).map(([month, apts]) => (
        <Box key={month} sx={{ mb: 2.5 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1 }}
          >
            {month}
          </Typography>
          <Card>
            {apts.map((apt, i) => {
              const cfg = typeConfig[apt.type];
              return (
                <Box key={apt.id}>
                  {i > 0 && <Divider />}
                  <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
                    {/* Date box */}
                    <Box
                      sx={{
                        minWidth: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: cfg.bg,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
                        {apt.date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: cfg.color, lineHeight: 1.2 }}>
                        {apt.date.getDate()}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {cfg.emoji} {apt.title}
                        </Typography>
                        <Chip
                          label={cfg.label}
                          size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 10, flexShrink: 0 }}
                        />
                      </Box>
                      {apt.time && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          ⏰ {apt.time}
                        </Typography>
                      )}
                      {apt.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
                          {apt.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Card>
        </Box>
      ))}
    </Box>
  );
}
