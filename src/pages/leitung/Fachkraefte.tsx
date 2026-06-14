import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SickIcon from '@mui/icons-material/Sick';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useKrankmeldungen } from '../../hooks/useKrankmeldungen';

interface FachkraftRow {
  id: string;
  name: string;
  email: string;
  kita_id: string;
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function LeitungFachkraefte() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<FachkraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { aktuellKrank } = useKrankmeldungen();
  const krankIds = useMemo(() => new Set(aktuellKrank.map((k) => k.fachkraft_id)), [aktuellKrank]);
  const isMobile = useMediaQuery('(max-width:700px)');

  useEffect(() => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_kita_fachkraefte', { p_kita_id: profile.kita_id }).then(({ data }: { data: FachkraftRow[] | null }) => {
      setList(data ?? []);
      setLoading(false);
    });
  }, [profile?.kita_id]);

  const filtered = useMemo(() =>
    list.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto', width: '100%' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Fachkräfte</Typography>
        <Typography variant="caption" color="text.secondary">
          {loading ? 'Lädt…' : `${list.length} Fachkräfte in dieser Einrichtung`}
        </Typography>
      </Box>

      <TextField
        placeholder="Nach Name oder E-Mail suchen …"
        size="small" fullWidth value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> } }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#95C11F' }} /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
          <PeopleOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">{search ? 'Keine Fachkräfte gefunden.' : 'Noch keine Fachkräfte angelegt.'}</Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((f) => {
            const isKrank = krankIds.has(f.id);
            return (
              <Card key={f.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, border: isKrank ? '1px solid #FFCDD2' : undefined }}>
                <Avatar sx={{ bgcolor: isKrank ? '#FCE4EC' : '#E3F2FD', color: isKrank ? '#C2185B' : '#1565C0', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {isKrank ? <SickIcon fontSize="small" /> : initials(f.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{f.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{f.email}</Typography>
                </Box>
                {isKrank && (
                  <Chip icon={<SickIcon sx={{ fontSize: '14px !important' }} />} label="Krank" size="small"
                    sx={{ bgcolor: '#FCE4EC', color: '#C2185B', fontWeight: 600, border: 'none', fontSize: 11 }} />
                )}
              </Card>
            );
          })}
        </Box>
      ) : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', bgcolor: 'grey.50' } }}>
                <TableCell>Name</TableCell>
                <TableCell>E-Mail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((f) => {
                const isKrank = krankIds.has(f.id);
                return (
                  <TableRow key={f.id} hover sx={isKrank ? { bgcolor: '#FFF8F8' } : undefined}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: isKrank ? '#FCE4EC' : '#E3F2FD', color: isKrank ? '#C2185B' : '#1565C0', fontWeight: 700, fontSize: 12 }}>
                          {isKrank ? <SickIcon sx={{ fontSize: 16 }} /> : initials(f.name)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.name}</Typography>
                        {isKrank && <Chip label="Krank" size="small" sx={{ bgcolor: '#FCE4EC', color: '#C2185B', fontWeight: 600, border: 'none', fontSize: 11, height: 20 }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{f.email}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {filtered.length > 0 && search && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {filtered.length} von {list.length} Fachkräften
        </Typography>
      )}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography
          variant="caption"
          sx={{ color: '#95C11F', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/team/dienstplan')}
        >
          → Zum Dienstplan
        </Typography>
      </Box>
    </Box>
  );
}
