import { useState, useEffect, useMemo } from 'react';
import { kitaColor } from '../../utils/kitaColors';
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
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { supabase } from '../../lib/supabase';

interface ElternRow {
  id: string;
  name: string;
  email: string;
  kita_id: string;
  kita_name: string;
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function TraegerEltern() {
  const navigate = useNavigate();
  const [eltern, setEltern] = useState<ElternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isMobile = useMediaQuery('(max-width:700px)');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_all_eltern').then(({ data }: { data: ElternRow[] | null }) => {
      setEltern(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() =>
    eltern.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.kita_name ?? '').toLowerCase().includes(search.toLowerCase())
    ), [eltern, search]);

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Eltern-Accounts</Typography>
        <Typography variant="caption" color="text.secondary">
          {loading ? 'Lädt…' : `${eltern.length} Eltern-Accounts in allen Einrichtungen`}
        </Typography>
      </Box>

      <TextField
        placeholder="Nach Name, E-Mail oder Einrichtung suchen …"
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
          <GroupsIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">
            {search ? 'Keine Eltern gefunden.' : 'Noch keine Eltern-Accounts angelegt.'}
          </Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((e) => (
            <Card
              key={e.id}
              sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              onClick={() => navigate(`/traeger/einrichtungen/${e.kita_id}`)}
            >
              <Avatar sx={{ bgcolor: '#E3F2FD', color: '#0B5394', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {initials(e.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{e.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{e.email}</Typography>
                {(() => { const c = kitaColor(e.kita_id); return (
                  <Chip label={e.kita_name} size="small" sx={{ mt: 0.5, height: 18, fontSize: 11, bgcolor: c.bg, color: c.color, fontWeight: 600, border: 'none' }} />
                ); })()}
              </Box>
              <IconButton
                size="small"
                component="a"
                href={`mailto:${e.email}`}
                onClick={(ev) => ev.stopPropagation()}
                aria-label={`E-Mail an ${e.name}`}
              >
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
                <TableCell>Einrichtung</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((e) => (
                <TableRow
                  key={e.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/traeger/einrichtungen/${e.kita_id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#E3F2FD', color: '#0B5394', fontWeight: 700, fontSize: 12 }}>
                        {initials(e.name)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{e.email}</TableCell>
                  <TableCell>
                    {(() => { const c = kitaColor(e.kita_id); return (
                      <Chip label={e.kita_name} size="small" sx={{ fontSize: 12, bgcolor: c.bg, color: c.color, fontWeight: 600, border: 'none' }} />
                    ); })()}
                  </TableCell>
                  <TableCell align="right" onClick={(ev) => ev.stopPropagation()}>
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

      {filtered.length > 0 && search && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {filtered.length} von {eltern.length} Eltern-Accounts
        </Typography>
      )}
    </Box>
  );
}
