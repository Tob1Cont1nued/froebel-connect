import { useState, useMemo, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import ProfileAvatar from '../../components/ProfileAvatar';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import SickIcon from '@mui/icons-material/Sick';
import { useShifts } from '../../hooks/useShifts';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getMonday, addDays, localDateStr as toDateStr, isoWeekNumber } from '../../lib/dateUtils';


const DAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

type StaffEntry = {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  byDate: Map<string, { start: string; end: string }>;
};

type DayEntry = {
  short: string;
  date: Date;
  dateStr: string;
  isToday: boolean;
};

function MobileView({ days, staffMap, profile, krankMap }: { days: DayEntry[]; staffMap: StaffEntry[]; profile: { id: string } | null; krankMap: Map<string, Set<string>> }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {days.map((day) => {
        const working = staffMap.filter((s) => s.byDate.has(day.dateStr));
        const sickStaff = staffMap.filter((s) => !s.byDate.has(day.dateStr) && krankMap.get(s.id)?.has(day.dateStr));
        return (
          <Card key={day.dateStr} sx={{ overflow: 'hidden' }}>
            <Box sx={{
              px: 2, py: 1,
              bgcolor: day.isToday ? '#95C11F' : '#1A3545',
              color: day.isToday ? '#1A3545' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {day.short}, {day.date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              </Typography>
              {day.isToday && (
                <Chip label="Heute" size="small" sx={{ bgcolor: 'rgba(26,53,69,0.15)', color: '#1A3545', fontWeight: 700, height: 20, fontSize: 10 }} />
              )}
            </Box>

            {working.length === 0 && sickStaff.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" color="text.disabled">Keine Schichten eingetragen</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {working.map((staff, i) => {
                  const shift = staff.byDate.get(day.dateStr)!;
                  const isMe = staff.id === profile?.id;
                  const isKrank = krankMap.get(staff.id)?.has(day.dateStr);
                  return (
                    <Box key={staff.id}>
                      {i > 0 && <Divider component="li" />}
                      <ListItem sx={{ py: 1, bgcolor: isKrank ? 'rgba(194,24,91,0.05)' : isMe ? 'rgba(149,193,31,0.07)' : 'transparent' }}>
                        <Box sx={{ mr: 1.5, flexShrink: 0 }}>
                          <ProfileAvatar avatarUrl={staff.avatarUrl} initials={staff.initials} size={30} alt={staff.name} />
                        </Box>
                        <ListItemText
                          primary={staff.name}
                          secondary={isKrank ? 'Krank gemeldet' : `${shift.start} – ${shift.end} Uhr`}
                          slotProps={{
                            primary: { variant: 'body2', sx: { fontWeight: isMe ? 700 : 500, color: isKrank ? '#C2185B' : 'inherit' } },
                            secondary: { sx: { color: isKrank ? '#C2185B' : 'inherit' } },
                          }}
                        />
                        {isKrank ? (
                          <Chip icon={<SickIcon sx={{ fontSize: '13px !important' }} />} label="Krank" size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: '#FCE4EC', color: '#C2185B', fontWeight: 700, ml: 1, border: 'none' }} />
                        ) : isMe && (
                          <Chip label="Ich" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#95C11F', color: '#1A3545', fontWeight: 700, ml: 1 }} />
                        )}
                      </ListItem>
                    </Box>
                  );
                })}
                {sickStaff.map((staff, i) => {
                  const isMe = staff.id === profile?.id;
                  return (
                    <Box key={staff.id}>
                      {(working.length > 0 || i > 0) && <Divider component="li" />}
                      <ListItem sx={{ py: 1, bgcolor: 'rgba(194,24,91,0.05)' }}>
                        <Box sx={{ mr: 1.5, flexShrink: 0 }}>
                          <ProfileAvatar avatarUrl={staff.avatarUrl} initials={staff.initials} size={30} alt={staff.name} />
                        </Box>
                        <ListItemText
                          primary={staff.name}
                          secondary="Krank gemeldet"
                          slotProps={{
                            primary: { variant: 'body2', sx: { fontWeight: isMe ? 700 : 500, color: '#C2185B' } },
                            secondary: { sx: { color: '#C2185B' } },
                          }}
                        />
                        <Chip icon={<SickIcon sx={{ fontSize: '13px !important' }} />} label="Krank" size="small"
                          sx={{ height: 20, fontSize: 10, bgcolor: '#FCE4EC', color: '#C2185B', fontWeight: 700, ml: 1, border: 'none' }} />
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            )}
          </Card>
        );
      })}
    </Box>
  );
}

function DesktopView({ days, staffMap, profile, krankMap }: { days: DayEntry[]; staffMap: StaffEntry[]; profile: { id: string } | null; loading: boolean; krankMap: Map<string, Set<string>> }) {
  const COL_NAME = 160;
  const COL_DAY = 110;

  return (
    <Card sx={{ overflow: 'auto' }}>
      <Box sx={{ minWidth: COL_NAME + COL_DAY * 5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', borderBottom: '2px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Box sx={{ width: COL_NAME, flexShrink: 0, px: 2, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Mitarbeiter·in
            </Typography>
          </Box>
          {days.map((day) => (
            <Box
              key={day.dateStr}
              sx={{
                width: COL_DAY, flexShrink: 0, px: 1.5, py: 1.5, textAlign: 'center',
                bgcolor: day.isToday ? 'primary.main' : 'transparent',
                color: day.isToday ? 'white' : 'inherit',
                borderLeft: '1px solid', borderColor: 'divider',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, opacity: day.isToday ? 0.85 : 0.6 }}>
                {day.short}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {day.date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              </Typography>
            </Box>
          ))}
        </Box>

        {staffMap.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
            <Typography variant="body2">Keine Schichten für diese Woche eingetragen.</Typography>
          </Box>
        )}

        {staffMap.map((staff, rowIdx) => {
          const isMe = staff.id === profile?.id;
          return (
            <Box
              key={staff.id}
              sx={{
                display: 'flex',
                borderTop: rowIdx === 0 ? 'none' : '1px solid',
                borderColor: 'divider',
                bgcolor: isMe ? 'rgba(149,193,31,0.06)' : 'transparent',
                '&:hover': { bgcolor: isMe ? 'rgba(149,193,31,0.1)' : 'action.hover' },
              }}
            >
              <Box sx={{ width: COL_NAME, flexShrink: 0, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <ProfileAvatar avatarUrl={staff.avatarUrl} initials={staff.initials} size={32} alt={staff.name} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: isMe ? 700 : 500 }} noWrap>{staff.name.split(' ')[0]}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }} noWrap>{staff.name.split(' ').slice(1).join(' ')}</Typography>
                </Box>
              </Box>
              {days.map((day) => {
                const shift = staff.byDate.get(day.dateStr);
                const isKrank = krankMap.get(staff.id)?.has(day.dateStr);
                return (
                  <Box
                    key={day.dateStr}
                    sx={{
                      width: COL_DAY, flexShrink: 0, px: 1, py: 1.5, textAlign: 'center',
                      borderLeft: '1px solid', borderColor: 'divider',
                      bgcolor: isKrank ? 'rgba(194,24,91,0.04)' : day.isToday ? 'rgba(149,193,31,0.06)' : 'transparent',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isKrank ? (
                      <Box sx={{ bgcolor: '#FCE4EC', color: '#C2185B', borderRadius: 1.5, px: 1, py: 0.5, minWidth: 72, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SickIcon sx={{ fontSize: 14, mb: 0.25 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, lineHeight: 1 }}>Krank</Typography>
                      </Box>
                    ) : shift ? (
                      <Box sx={{
                        bgcolor: isMe ? '#95C11F' : '#1A3545',
                        color: isMe ? '#1A3545' : 'white',
                        borderRadius: 1.5, px: 1, py: 0.5, minWidth: 72,
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, display: 'block', lineHeight: 1.3 }}>{shift.start}</Typography>
                        <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.8, display: 'block', lineHeight: 1.2 }}>{shift.end}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>—</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

export default function TeamDienstplan() {
  const { profile } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const { shifts, loading } = useShifts(weekStart);
  const isMobile = useMediaQuery('(max-width:700px)');

  // Load sick leaves that overlap with the viewed week (not just >= today)
  const [krankmeldungen, setKrankmeldungen] = useState<Array<{
    id: string; fachkraft_id: string; fachkraft_name: string; from_date: string; to_date: string;
  }>>([]);

  const weekStartStr = useMemo(() => toDateStr(weekStart), [weekStart]);
  const weekEndStr = useMemo(() => toDateStr(addDays(weekStart, 4)), [weekStart]);

  const loadWeekKrankmeldungen = useCallback(async () => {
    if (!profile?.kita_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('krankmeldungen')
      .select('*, profiles(name)')
      .eq('kita_id', profile.kita_id)
      .lte('from_date', weekEndStr)
      .gte('to_date', weekStartStr)
      .order('from_date', { ascending: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setKrankmeldungen((data ?? []).map((r: any) => ({
      id: r.id,
      fachkraft_id: r.fachkraft_id,
      fachkraft_name: r.profiles?.name ?? 'Unbekannt',
      from_date: r.from_date,
      to_date: r.to_date,
    })));
  }, [profile?.kita_id, weekStartStr, weekEndStr]);

  useEffect(() => { loadWeekKrankmeldungen(); }, [loadWeekKrankmeldungen]);

  const todayStr = toDateStr(new Date());

  const days = useMemo(() =>
    DAY_SHORT.map((short, i) => {
      const date = addDays(weekStart, i);
      return { short, date, dateStr: toDateStr(date), isToday: toDateStr(date) === todayStr };
    }),
    [weekStart, todayStr]
  );

  const staffMap = useMemo(() => {
    const map = new Map<string, StaffEntry>();
    for (const s of shifts) {
      if (!map.has(s.profile_id)) {
        map.set(s.profile_id, { id: s.profile_id, name: s.profile_name, initials: s.profile_initials, avatarUrl: s.profile_avatar_url, byDate: new Map() });
      }
      map.get(s.profile_id)!.byDate.set(s.date, { start: s.start_time, end: s.end_time });
    }
    return [...map.values()].sort((a, b) => {
      if (a.id === profile?.id) return -1;
      if (b.id === profile?.id) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [shifts, profile?.id]);

  const krankMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const k of krankmeldungen) {
      if (!map.has(k.fachkraft_id)) map.set(k.fachkraft_id, new Set());
      // Parse as local noon to avoid UTC-midnight timezone shifts
      const cur = new Date(k.from_date + 'T12:00:00');
      const end = new Date(k.to_date + 'T12:00:00');
      while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        map.get(k.fachkraft_id)!.add(`${y}-${m}-${d}`);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [krankmeldungen]);

  // Extend staffMap with sick Fachkräfte who have no shifts this week
  const extendedStaffMap = useMemo(() => {
    const staffIds = new Set(staffMap.map((s) => s.id));
    const weekDates = days.map((d) => d.dateStr);
    const sickOnly: StaffEntry[] = [];
    for (const [fachkraftId, sickDates] of krankMap.entries()) {
      if (staffIds.has(fachkraftId)) continue;
      if (!weekDates.some((d) => sickDates.has(d))) continue;
      const k = krankmeldungen.find((km) => km.fachkraft_id === fachkraftId);
      if (!k) continue;
      sickOnly.push({
        id: fachkraftId,
        name: k.fachkraft_name,
        initials: k.fachkraft_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
        avatarUrl: null,
        byDate: new Map(),
      });
    }
    return [...staffMap, ...sickOnly.sort((a, b) => a.name.localeCompare(b.name))];
  }, [staffMap, krankMap, krankmeldungen, days]);

  const friday = addDays(weekStart, 4);
  const kw = isoWeekNumber(weekStart);

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto', width: '100%' }}>
      {/* Week navigator */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1A3545 0%, #2D5468 100%)', color: 'white' }}>
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setWeekStart(addDays(weekStart, -7))} sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase' }}>
              Kalenderwoche {kw}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: isMobile ? '2-digit' : 'long' })} – {friday.toLocaleDateString('de-DE', { day: '2-digit', month: isMobile ? '2-digit' : 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setWeekStart(addDays(weekStart, 7))} sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Card>

      {/* Jump to today */}
      {toDateStr(weekStart) !== toDateStr(getMonday(new Date())) && (
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            icon={<TodayIcon />}
            label="Zur aktuellen Woche"
            size="small"
            onClick={() => setWeekStart(getMonday(new Date()))}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      )}

      {/* Loading state */}
      {loading && (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>Lädt…</Typography>
      )}

      {/* Responsive views */}
      {!loading && isMobile && (
        <MobileView days={days} staffMap={extendedStaffMap} profile={profile} krankMap={krankMap} />
      )}
      {!loading && !isMobile && (
        <DesktopView days={days} staffMap={extendedStaffMap} profile={profile} loading={loading} krankMap={krankMap} />
      )}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#95C11F' }} />
          <Typography variant="caption" color="text.secondary">Meine Schicht</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#1A3545' }} />
          <Typography variant="caption" color="text.secondary">Kolleg·in</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>—</Typography>
          <Typography variant="caption" color="text.secondary">Frei</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#FCE4EC' }} />
          <Typography variant="caption" color="text.secondary">Krank</Typography>
        </Box>
      </Box>
    </Box>
  );
}
