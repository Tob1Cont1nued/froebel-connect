import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useKitas } from '../../hooks/useKitas';

interface KitaStats {
  kinder: number;
  fachkraefte: number;
  eltern: number;
  termine: number;
}

interface Termin {
  id: string;
  title: string;
  date: string;
}

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onClick?: () => void;
}

function StatCard({ label, value, icon, color, bg, onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        flex: 1,
        minWidth: 140,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': onClick ? { boxShadow: 4, transform: 'translateY(-2px)' } : {},
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: bg, color, display: 'flex' }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A3545', lineHeight: 1 }}>
              {value ?? <Skeleton width={40} />}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{label}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function LeitungDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { kitas } = useKitas();
  const [stats, setStats] = useState<KitaStats | null>(null);
  const [termine, setTermine] = useState<Termin[]>([]);

  const kita = kitas.find((k) => k.id === profile?.kita_id);

  useEffect(() => {
    if (!profile?.kita_id) return;
    const id = profile.kita_id;

    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).rpc('get_leitung_stats', { p_kita_id: id }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).rpc('get_kita_upcoming_appointments', { p_kita_id: id }),
    ]).then(([{ data: s }, { data: t }]) => {
      const row = Array.isArray(s) ? s[0] : s;
      if (row) setStats(row);
      setTermine((t ?? []).slice(0, 5));
    });
  }, [profile?.kita_id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto', width: '100%' }}>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {greeting}, {profile?.name?.split(' ')[0] ?? ''}
        </Typography>
        {kita && (
          <Chip
            label={kita.name}
            size="small"
            sx={{ mt: 0.5, bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, border: 'none' }}
          />
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard
          label="Kinder"
          value={stats?.kinder}
          icon={<ChildCareIcon />}
          color="#2E7D32" bg="#E8F5E9"
          onClick={() => navigate('/leitung/kinder')}
        />
        <StatCard
          label="Fachkräfte"
          value={stats?.fachkraefte}
          icon={<PeopleOutlinedIcon />}
          color="#1565C0" bg="#E3F2FD"
          onClick={() => navigate('/leitung/fachkraefte')}
        />
        <StatCard
          label="Eltern-Accounts"
          value={stats?.eltern}
          icon={<FamilyRestroomIcon />}
          color="#7B1FA2" bg="#F3E5F5"
          onClick={() => navigate('/leitung/eltern')}
        />
        <StatCard
          label="Nächste Termine"
          value={stats?.termine}
          icon={<CalendarTodayOutlinedIcon />}
          color="#E65100" bg="#FFF3E0"
          onClick={() => navigate('/leitung/termine')}
        />
      </Box>

      {/* Upcoming appointments */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#1A3545' }}>
            Nächste Termine
          </Typography>
          {termine.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
              Keine anstehenden Termine.
            </Typography>
          ) : (
            <List disablePadding>
              {termine.map((t, i) => (
                <Box key={t.id}>
                  {i > 0 && <Divider />}
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <Box sx={{ mr: 2, textAlign: 'center', minWidth: 44 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#95C11F', display: 'block', lineHeight: 1 }}>
                        {new Date(t.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={t.title}
                      slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
