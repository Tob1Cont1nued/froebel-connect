import { useState, useEffect, useMemo } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ElternRow { id: string; name: string; email: string; }

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function LeitungEltern() {
  const { profile } = useAuth();
  const [list, setList] = useState<ElternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isMobile = useMediaQuery('(max-width:700px)');

  useEffect(() => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_kita_eltern', { p_kita_id: profile.kita_id }).then(({ data }: { data: ElternRow[] | null }) => {
      setList(data ?? []);
      setLoading(false);
    });
  }, [profile?.kita_id]);

  const filtered = useMemo(() =>
    list.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Eltern-Accounts</Typography>
        <Typography variant="caption" color="text.secondary">
          {loading ? 'Lädt…' : `${list.length} Eltern-Accounts in dieser Einrichtung`}
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
          <FamilyRestroomIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">{search ? 'Keine Eltern gefunden.' : 'Noch keine Eltern-Accounts.'}</Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((e) => (
            <Card key={e.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#F3E5F5', color: '#7B1FA2', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initials(e.name)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{e.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{e.email}</Typography>
              </Box>
              <IconButton size="small" component="a" href={`mailto:${e.email}`} aria-label={`E-Mail an ${e.name}`}>
                <EmailOutlinedIcon fontSize="small" />
              </IconButton>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', bgcolor: 'grey.50' } }}>
                <TableCell>Name</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#F3E5F5', color: '#7B1FA2', fontWeight: 700, fontSize: 12 }}>{initials(e.name)}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{e.email}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" component="a" href={`mailto:${e.email}`} aria-label={`E-Mail an ${e.name}`}>
                      <EmailOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}
