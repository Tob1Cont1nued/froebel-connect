import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { useChildren, type ChildItem } from '../../hooks/useChildren';
import { useKitaAbsences } from '../../hooks/useKitaAbsences';
import { usePortfolio } from '../../hooks/usePortfolio';

function ChildDetail({ child, onClose }: { child: ChildItem; onClose: () => void }) {
  const { absences } = useKitaAbsences();
  const { entries } = usePortfolio(child.id);

  const childAbsences = absences.filter((a) => a.child_id === child.id);
  const today = new Date().toISOString().split('T')[0];
  const isAbsentToday = childAbsences.some(
    (a) => a.from_date <= today && a.to_date >= today && a.status !== 'rejected'
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
        <Avatar sx={{ width: 44, height: 44, fontSize: 24, bgcolor: 'grey.100' }}>
          {child.emoji}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{child.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {child.age !== null ? `${child.age} Jahre` : ''}{child.kita_name ? ` · ${child.kita_name}` : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Status heute */}
        <Box sx={{ mb: 2 }}>
          {isAbsentToday ? (
            <Chip icon={<CancelIcon />} label="Heute abwesend" color="error" variant="outlined" size="small" />
          ) : (
            <Chip icon={<CheckCircleIcon />} label="Heute anwesend" color="success" variant="outlined" size="small" />
          )}
        </Box>

        {/* Abwesenheiten */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Abwesenheiten ({childAbsences.length})
        </Typography>
        {childAbsences.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>Keine Abwesenheiten eingetragen.</Typography>
        ) : (
          <Card variant="outlined" sx={{ mb: 2 }}>
            {childAbsences.slice(0, 5).map((a, i) => (
              <Box key={a.id}>
                {i > 0 && <Divider />}
                <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventBusyIcon fontSize="small" color={a.status === 'pending' ? 'warning' : 'disabled'} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(a.from_date).toLocaleDateString('de-DE')}
                      {a.from_date !== a.to_date && ` – ${new Date(a.to_date).toLocaleDateString('de-DE')}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{a.reason}</Typography>
                  </Box>
                  <Chip
                    label={a.status === 'pending' ? 'Offen' : 'Bestätigt'}
                    size="small"
                    color={a.status === 'pending' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            ))}
          </Card>
        )}

        {/* Portfolio */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Portfolio ({entries.length} Einträge)
        </Typography>
        {entries.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.disabled' }}>
            <PhotoLibraryOutlinedIcon fontSize="small" />
            <Typography variant="body2">Noch keine Portfolio-Einträge.</Typography>
          </Box>
        ) : (
          <Card variant="outlined">
            {entries.slice(0, 3).map((e, i) => (
              <Box key={e.id}>
                {i > 0 && <Divider />}
                <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: 20 }}>{e.emoji}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{e.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {e.date.toLocaleDateString('de-DE')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function TeamKinder() {
  const { children, loading } = useChildren();
  const { absences } = useKitaAbsences();
  const [selected, setSelected] = useState<ChildItem | null>(null);
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const absentTodayIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of absences) {
      if (a.from_date <= today && a.to_date >= today && a.status !== 'rejected') {
        ids.add(a.child_id);
      }
    }
    return ids;
  }, [absences, today]);

  const filtered = children.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const present = children.filter((c) => !absentTodayIds.has(c.id)).length;
  const absent = absentTodayIds.size;

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <Chip label={`${children.length} Kinder gesamt`} variant="outlined" size="small" />
        <Chip icon={<CheckCircleIcon />} label={`${present} anwesend`} color="success" variant="outlined" size="small" />
        <Chip icon={<CancelIcon />} label={`${absent} abwesend`} color="error" variant="outlined" size="small" />
      </Box>

      {/* Search */}
      <TextField
        size="small"
        fullWidth
        placeholder="Kind suchen …"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Children list */}
      {loading ? (
        <Typography color="text.secondary">Laden…</Typography>
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary">Keine Kinder gefunden.</Typography>
      ) : (
        <Card>
          {filtered.map((child, i) => {
            const isAbsent = absentTodayIds.has(child.id);
            return (
              <Box key={child.id}>
                {i > 0 && <Divider />}
                <Box
                  onClick={() => setSelected(child)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background 0.15s',
                  }}
                >
                  <Avatar sx={{ width: 40, height: 40, fontSize: 22, bgcolor: 'grey.100' }}>
                    {child.emoji}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{child.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {child.age !== null ? `${child.age} Jahre` : 'Alter unbekannt'}
                    </Typography>
                  </Box>
                  {isAbsent ? (
                    <Chip icon={<CancelIcon />} label="Abwesend" size="small" color="error" variant="outlined" />
                  ) : (
                    <Chip icon={<CheckCircleIcon />} label="Anwesend" size="small" color="success" variant="outlined" />
                  )}
                </Box>
              </Box>
            );
          })}
        </Card>
      )}

      {selected && <ChildDetail child={selected} onClose={() => setSelected(null)} />}
    </Box>
  );
}
