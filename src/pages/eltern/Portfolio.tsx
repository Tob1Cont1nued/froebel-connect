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
import CloseIcon from '@mui/icons-material/Close';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { useChildren } from '../../hooks/useChildren';
import { usePortfolio, type PortfolioItem } from '../../hooks/usePortfolio';

export default function Portfolio() {
  const { firstChild, loading: childLoading } = useChildren();
  const { entries, loading: entriesLoading } = usePortfolio(firstChild?.id);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  if (childLoading || entriesLoading) return (
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

      {firstChild && (
        <Card sx={{ mb: 2, bgcolor: '#1A3545', color: 'white' }}>
          <CardContent sx={{ py: '12px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: 32 }}>{firstChild.emoji}</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{firstChild.name}s Lerngeschichten</Typography>
              {firstChild.kita_name && <Typography variant="caption" sx={{ opacity: 0.8 }}>{firstChild.kita_name}</Typography>}
            </Box>
          </CardContent>
        </Card>
      )}

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
              <IconButton size="small" onClick={() => setSelected(null)}><CloseIcon /></IconButton>
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
