import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CloseIcon from '@mui/icons-material/Close';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { useChildren } from '../../hooks/useChildren';
import { usePortfolio, type PortfolioItem } from '../../hooks/usePortfolio';

export default function Portfolio() {
  const { children, loading: childLoading } = useChildren();
  const [tabIndex, setTabIndex] = useState(0);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  const activeChild = children[tabIndex] ?? null;
  const { entries, loading: entriesLoading } = usePortfolio(activeChild?.id);

  if (childLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio</Typography>
        <Chip icon={<PhotoLibraryOutlinedIcon />} label={`${entries.length} Einträge`} size="small" variant="outlined" />
      </Box>

      {/* Kind-Auswahl (nur bei mehreren Kindern) */}
      {children.length > 1 && (
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600, minHeight: 40 } }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {children.map((c) => (
            <Tab key={c.id} label={`${c.emoji} ${c.name.split(' ')[0]}`} />
          ))}
        </Tabs>
      )}

      {activeChild && (
        <Card sx={{ mb: 2, bgcolor: '#1A3545', color: 'white' }}>
          <CardContent sx={{ py: '12px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: 32 }}>{activeChild.emoji}</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{activeChild.name}s Lerngeschichten</Typography>
              {activeChild.kita_name && <Typography variant="caption" sx={{ opacity: 0.8 }}>{activeChild.kita_name}</Typography>}
            </Box>
          </CardContent>
        </Card>
      )}

      {entriesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : entries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
          <PhotoLibraryOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">Noch keine Portfolio-Einträge.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5 }}>
          {entries.map((entry) => (
            <Card key={entry.id} sx={{ cursor: 'pointer', transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.02)' } }} onClick={() => setSelected(entry)}>
              <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, bgcolor: 'grey.100', borderRadius: '16px 16px 0 0' }}>
                {entry.emoji}
              </Box>
              <CardContent sx={{ py: '8px !important', px: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }} noWrap>{entry.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selected.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selected.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelected(null)} aria-label="Schließen"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ fontSize: 80, textAlign: 'center', py: 2 }}>{selected.emoji}</Box>
              <Typography variant="body2" color="text.secondary">{selected.description}</Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
