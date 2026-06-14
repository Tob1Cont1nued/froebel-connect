import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import { supabase } from '../../lib/supabase';
import { kitaColor } from '../../utils/kitaColors';

interface KitaRow {
  kita_id: string;
  kita_name: string;
  kinder: number;
  fachkraefte: number;
  eltern: number;
}

interface TrendRow {
  month: string;
  count: number;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1A3545' }}>
      {children}
    </Typography>
  );
}

// Custom dot for line chart
function CustomDot({ cx, cy }: { cx?: number; cy?: number }) {
  return <circle cx={cx} cy={cy} r={4} fill="#95C11F" stroke="#fff" strokeWidth={2} />;
}

export default function TraegerAuswertungen() {
  const [comparison, setComparison] = useState<KitaRow[]>([]);
  const [trend, setTrend] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).rpc('get_kita_comparison'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).rpc('get_absence_trend'),
    ]).then(([{ data: c }, { data: t }]) => {
      setComparison(c ?? []);
      setTrend(t ?? []);
      setLoading(false);
    });
  }, []);

  // Totals from comparison data
  const totals = comparison.reduce(
    (acc, r) => ({ kinder: acc.kinder + r.kinder, fachkraefte: acc.fachkraefte + r.fachkraefte, eltern: acc.eltern + r.eltern }),
    { kinder: 0, fachkraefte: 0, eltern: 0 }
  );

  // Shorten kita names for chart axis
  const chartData = comparison.map((r) => ({
    ...r,
    label: r.kita_name.replace(/^FRÖBEL\s*/i, '').replace(/Kita\s*/i, '').trim() || r.kita_name,
  }));

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Auswertungen</Typography>
        <Typography variant="caption" color="text.secondary">
          Übersicht über alle Einrichtungen und Entwicklungen
        </Typography>
      </Box>

      {/* Summary chips */}
      {!loading && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: `${totals.kinder} Kinder gesamt`, icon: <ChildCareIcon fontSize="small" />, bg: '#E8F5E9', color: '#2E7D32' },
            { label: `${totals.fachkraefte} Fachkräfte gesamt`, icon: <GroupsIcon fontSize="small" />, bg: '#E3F2FD', color: '#1565C0' },
            { label: `${totals.eltern} Eltern-Accounts gesamt`, icon: <PeopleIcon fontSize="small" />, bg: '#F3E5F5', color: '#7B1FA2' },
          ].map((c) => (
            <Chip
              key={c.label}
              icon={c.icon}
              label={c.label}
              size="small"
              sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: 'none', px: 0.5 }}
            />
          ))}
        </Box>
      )}

      {/* Einrichtungsvergleich */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionTitle>Einrichtungsvergleich</SectionTitle>
          {loading ? (
            <Skeleton height={260} variant="rectangular" sx={{ borderRadius: 1 }} />
          ) : comparison.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>Keine Daten verfügbar.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E0E0E0', fontSize: 13 }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="kinder"      name="Kinder"     fill="#95C11F" radius={[4,4,0,0]} maxBarSize={32} />
                <Bar dataKey="fachkraefte" name="Fachkräfte" fill="#1A3545" radius={[4,4,0,0]} maxBarSize={32} />
                <Bar dataKey="eltern"      name="Eltern"     fill="#7B8FA6" radius={[4,4,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Per-Kita detail table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionTitle>Detailansicht pro Einrichtung</SectionTitle>
          {loading ? (
            <>
              {[1, 2, 3].map((i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)}
            </>
          ) : (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 1, px: 1.5, pb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Einrichtung</Typography>
                {['Kinder', 'Fachkräfte', 'Eltern'].map((h) => (
                  <Typography key={h} variant="caption" color="text.secondary" sx={{ fontWeight: 700, textAlign: 'center' }}>{h}</Typography>
                ))}
              </Box>
              <Divider />
              {comparison.map((r, i) => {
                const c = kitaColor(r.kita_id);
                return (
                  <Box
                    key={r.kita_id}
                    sx={{
                      display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 1,
                      px: 1.5, py: 1.25, alignItems: 'center',
                      bgcolor: i % 2 === 0 ? 'transparent' : 'grey.50',
                    }}
                  >
                    <Chip
                      label={r.kita_name}
                      size="small"
                      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: 'none', fontSize: 12, width: 'fit-content', maxWidth: '100%' }}
                    />
                    {[r.kinder, r.fachkraefte, r.eltern].map((val, j) => (
                      <Typography key={j} variant="body2" sx={{ fontWeight: 700, textAlign: 'center', color: '#1A3545' }}>
                        {val}
                      </Typography>
                    ))}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Abwesenheitstrend */}
      <Card>
        <CardContent>
          <SectionTitle>Abwesenheiten — letzte 6 Monate</SectionTitle>
          {loading ? (
            <Skeleton height={200} variant="rectangular" sx={{ borderRadius: 1 }} />
          ) : trend.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>Keine Abwesenheitsdaten vorhanden.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E0E0E0', fontSize: 13 }}
                  formatter={(val) => [`${val} Abwesenheiten`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Abwesenheiten"
                  stroke="#95C11F"
                  strokeWidth={2.5}
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: '#95C11F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
