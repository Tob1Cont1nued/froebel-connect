import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { supabase } from '../../lib/supabase';

interface KindRow {
  id: string;
  name: string;
  age: number | null;
  emoji: string;
  photo_url: string | null;
  kita_id: string;
  kita_name: string;
}

function kindEmoji(k: KindRow) {
  if (k.photo_url?.startsWith('preset:')) return k.photo_url.replace('preset:', '');
  return k.emoji;
}

export default function TraegerKinder() {
  const navigate = useNavigate();
  const [kinder, setKinder] = useState<KindRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isMobile = useMediaQuery('(max-width:700px)');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_all_kita_children').then(({ data }: { data: KindRow[] | null }) => {
      setKinder(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() =>
    kinder.filter((k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      (k.kita_name ?? '').toLowerCase().includes(search.toLowerCase())
    ), [kinder, search]);

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Betreute Kinder</Typography>
        <Typography variant="caption" color="text.secondary">
          {loading ? 'Lädt…' : `${kinder.length} Kinder in allen Einrichtungen`}
        </Typography>
      </Box>

      <TextField
        placeholder="Nach Name oder Einrichtung suchen …"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#95C11F' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
          <ChildCareIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">
            {search ? 'Keine Kinder gefunden.' : 'Noch keine Kinder angelegt.'}
          </Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((k) => (
            <Card
              key={k.id}
              sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              onClick={() => navigate(`/traeger/einrichtungen/${k.kita_id}`)}
            >
              <Box sx={{ fontSize: 28, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {kindEmoji(k)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{k.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {k.age ? `${k.age} Jahre · ` : ''}{k.kita_name}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', bgcolor: 'grey.50' } }}>
                <TableCell>Kind</TableCell>
                <TableCell>Alter</TableCell>
                <TableCell>Einrichtung</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((k) => (
                <TableRow
                  key={k.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/traeger/einrichtungen/${k.kita_id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ fontSize: 22, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {kindEmoji(k)}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{k.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{k.age ? `${k.age} J.` : '–'}</TableCell>
                  <TableCell>
                    <Chip label={k.kita_name} size="small" variant="outlined" sx={{ fontSize: 12 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filtered.length > 0 && search && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {filtered.length} von {kinder.length} Kindern
        </Typography>
      )}
    </Box>
  );
}
