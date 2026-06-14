import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { useEssenplan, localDateStr, addDays } from '../../hooks/useEssenplan';
import type { EssenplanEintrag } from '../../hooks/useEssenplan';

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function formatKW(monday: Date): number {
  const d = new Date(monday);
  d.setHours(12);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const DAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

const MEALS = [
  { key: 'fruehstueck' as const, label: 'Frühstück', emoji: '🍳', color: '#FFF3E0', textColor: '#E65100', fixed: true },
  { key: 'mittagessen' as const, label: 'Mittagessen', emoji: '🍽️', color: '#F1F8E9', textColor: '#33691E', fixed: false },
  { key: 'vesper' as const, label: 'Vesper', emoji: '🍰', color: '#EDE7F6', textColor: '#4527A0', fixed: false },
];

const FRUEHSTUECK_TEXT = 'Frühstücks-Buffet';
const FRUEHSTUECK_DESC = 'Täglich frisch: Brot, Aufschnitt, Käse, Obst & mehr';

type DayEntry = { short: string; date: Date; dateStr: string; isToday: boolean };
type EditTarget = { dateStr: string; dateLabel: string; mahlzeit: 'mittagessen' | 'vesper'; mealLabel: string; existing: EssenplanEintrag | null };

// ─── Edit Dialog ───────────────────────────────────────────────────────────────

function EditDialog({ target, onSave, onDelete, onClose }: {
  target: EditTarget;
  onSave: (gericht: string, beschreibung: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [gericht, setGericht] = useState(target.existing?.gericht ?? '');
  const [beschreibung, setBeschreibung] = useState(target.existing?.beschreibung ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!gericht.trim()) return;
    setSaving(true);
    await onSave(gericht, beschreibung);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    setSaving(true);
    await onDelete();
    setSaving(false);
    onClose();
  };

  const meal = MEALS.find((m) => m.key === target.mahlzeit)!;

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ fontSize: 24 }}>{meal.emoji}</Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{meal.label}</Typography>
          <Typography variant="caption" color="text.secondary">{target.dateLabel}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField
          label="Gericht" required autoFocus fullWidth
          value={gericht}
          onChange={(e) => setGericht(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
          placeholder="z.B. Kartoffelsuppe mit Brot"
        />
        <TextField
          label="Beschreibung / Hinweis (optional)" fullWidth multiline minRows={2}
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder="z.B. vegetarisch, enthält Gluten …"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          {target.existing && (
            <Button color="error" onClick={handleDelete} disabled={saving} startIcon={<DeleteOutlineIcon />}>
              Löschen
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={saving}>Abbrechen</Button>
          <Button variant="contained" onClick={handleSave} disabled={!gericht.trim() || saving}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}>
            Speichern
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

// ─── Mobile View ───────────────────────────────────────────────────────────────

function MobileView({ days, eintraege, onEdit }: {
  days: DayEntry[];
  eintraege: EssenplanEintrag[];
  onEdit: (target: EditTarget) => void;
}) {
  const byKey = useMemo(() => {
    const m = new Map<string, EssenplanEintrag>();
    for (const e of eintraege) m.set(`${e.date}:${e.mahlzeit}`, e);
    return m;
  }, [eintraege]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {days.map((day) => (
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
              <Chip label="Heute" size="small"
                sx={{ bgcolor: 'rgba(26,53,69,0.15)', color: '#1A3545', fontWeight: 700, height: 20, fontSize: 10 }} />
            )}
          </Box>
          <Box>
            {MEALS.map((meal, i) => {
              const entry = meal.fixed ? null : byKey.get(`${day.dateStr}:${meal.key as 'mittagessen' | 'vesper'}`);
              const text = meal.fixed ? FRUEHSTUECK_TEXT : (entry?.gericht ?? null);
              const desc = meal.fixed ? FRUEHSTUECK_DESC : (entry?.beschreibung ?? null);
              return (
                <Box key={meal.key}>
                  {i > 0 && <Divider />}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.25,
                    bgcolor: text ? meal.color : 'transparent' }}>
                    <Box sx={{ fontSize: 20, lineHeight: 1.4, flexShrink: 0, mt: 0.25 }}>{meal.emoji}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: meal.textColor, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                        {meal.label}
                      </Typography>
                      {text ? (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{text}</Typography>
                          {desc && <Typography variant="caption" color="text.secondary">{desc}</Typography>}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Noch nicht eingetragen
                        </Typography>
                      )}
                    </Box>
                    {!meal.fixed && (
                      <IconButton size="small" onClick={() => onEdit({
                        dateStr: day.dateStr,
                        dateLabel: `${day.short}, ${day.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}`,
                        mahlzeit: meal.key as 'mittagessen' | 'vesper',
                        mealLabel: meal.label,
                        existing: entry ?? null,
                      })}
                        sx={{ color: entry ? meal.textColor : 'text.disabled', flexShrink: 0,
                          '&:hover': { bgcolor: meal.color } }}>
                        {entry ? <EditOutlinedIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      ))}
    </Box>
  );
}

// ─── Desktop View ──────────────────────────────────────────────────────────────

function DesktopView({ days, eintraege, onEdit }: {
  days: DayEntry[];
  eintraege: EssenplanEintrag[];
  onEdit: (target: EditTarget) => void;
}) {
  const byKey = useMemo(() => {
    const m = new Map<string, EssenplanEintrag>();
    for (const e of eintraege) m.set(`${e.date}:${e.mahlzeit}`, e);
    return m;
  }, [eintraege]);

  const COL_LABEL = 110;
  const COL_DAY = 148;

  return (
    <Card sx={{ overflow: 'auto' }}>
      <Box sx={{ minWidth: COL_LABEL + COL_DAY * 5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', borderBottom: '2px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Box sx={{ width: COL_LABEL, flexShrink: 0, px: 2, py: 1.5 }} />
          {days.map((day) => (
            <Box key={day.dateStr} sx={{
              width: COL_DAY, flexShrink: 0, px: 1.5, py: 1.5, textAlign: 'center',
              bgcolor: day.isToday ? 'primary.main' : 'transparent',
              color: day.isToday ? 'white' : 'inherit',
              borderLeft: '1px solid', borderColor: 'divider',
            }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, opacity: day.isToday ? 0.85 : 0.6 }}>
                {day.short}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {day.date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Meal rows */}
        {MEALS.map((meal, mealIdx) => (
          <Box key={meal.key} sx={{
            display: 'flex',
            borderTop: mealIdx === 0 ? 'none' : '2px solid',
            borderColor: 'divider',
          }}>
            {/* Row label */}
            <Box sx={{
              width: COL_LABEL, flexShrink: 0, px: 2, py: 1.5,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              bgcolor: meal.color, borderRight: '1px solid', borderColor: 'divider',
            }}>
              <Typography sx={{ fontSize: 18, lineHeight: 1, mb: 0.25 }}>{meal.emoji}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: meal.textColor, lineHeight: 1.2 }}>
                {meal.label}
              </Typography>
              {meal.fixed && (
                <Chip label="Täglich" size="small"
                  sx={{ mt: 0.5, height: 16, fontSize: 9, bgcolor: meal.color, color: meal.textColor, border: `1px solid ${meal.textColor}40` }} />
              )}
            </Box>

            {/* Day cells */}
            {days.map((day) => {
              const entry = meal.fixed ? null : byKey.get(`${day.dateStr}:${meal.key as 'mittagessen' | 'vesper'}`);
              const text = meal.fixed ? FRUEHSTUECK_TEXT : (entry?.gericht ?? null);
              const desc = meal.fixed ? FRUEHSTUECK_DESC : (entry?.beschreibung ?? null);
              return (
                <Box key={day.dateStr} sx={{
                  width: COL_DAY, flexShrink: 0, px: 1.5, py: 1.5,
                  borderLeft: '1px solid', borderColor: 'divider',
                  bgcolor: text ? meal.color : 'transparent',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  minHeight: 80, position: 'relative',
                  ...(!meal.fixed && {
                    cursor: 'pointer',
                    '&:hover': { bgcolor: meal.color, '& .edit-btn': { opacity: 1 } },
                  }),
                }}
                  onClick={!meal.fixed ? () => onEdit({
                    dateStr: day.dateStr,
                    dateLabel: `${day.short}, ${day.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}`,
                    mahlzeit: meal.key as 'mittagessen' | 'vesper',
                    mealLabel: meal.label,
                    existing: entry ?? null,
                  }) : undefined}
                >
                  <Box sx={{ flex: 1 }}>
                    {text ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>{text}</Typography>
                        {desc && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.3, display: 'block' }}>
                            {desc}
                          </Typography>
                        )}
                      </>
                    ) : !meal.fixed ? (
                      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                        Klicken zum Eintragen
                      </Typography>
                    ) : null}
                  </Box>
                  {!meal.fixed && (
                    <IconButton className="edit-btn" size="small"
                      sx={{
                        position: 'absolute', bottom: 6, right: 6,
                        opacity: entry ? 0.5 : 0,
                        color: meal.textColor,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'white' },
                        transition: 'opacity 0.15s',
                      }}
                      onClick={(e) => { e.stopPropagation(); /* parent click handles */ }}
                    >
                      {entry ? <EditOutlinedIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TeamEssenplan() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const { eintraege, loading, upsert, remove } = useEssenplan(weekStart);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const isMobile = useMediaQuery('(max-width:700px)');

  const todayStr = localDateStr(new Date());

  const days = useMemo(() =>
    DAY_SHORT.map((short, i) => {
      const date = addDays(weekStart, i);
      return { short, date, dateStr: localDateStr(date), isToday: localDateStr(date) === todayStr };
    }),
    [weekStart, todayStr],
  );

  const friday = addDays(weekStart, 4);
  const kw = formatKW(weekStart);
  const currentMondayStr = localDateStr(getMonday(new Date()));

  const handleSave = async (gericht: string, beschreibung: string) => {
    if (!editTarget) return;
    await upsert(editTarget.dateStr, editTarget.mahlzeit, gericht, beschreibung);
  };

  const handleDelete = async () => {
    if (!editTarget?.existing) return;
    await remove(editTarget.existing.id);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <RestaurantMenuIcon sx={{ color: '#95C11F' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Speiseplan bearbeiten</Typography>
      </Box>

      {/* Week navigator */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1A3545 0%, #2D5468 100%)', color: 'white' }}>
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setWeekStart(addDays(weekStart, -7))}
            sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase' }}>
              Kalenderwoche {kw}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: isMobile ? '2-digit' : 'long' })} –{' '}
              {friday.toLocaleDateString('de-DE', { day: '2-digit', month: isMobile ? '2-digit' : 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setWeekStart(addDays(weekStart, 7))}
            sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Card>

      {localDateStr(weekStart) !== currentMondayStr && (
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip icon={<TodayIcon />} label="Zur aktuellen Woche" size="small"
            onClick={() => setWeekStart(getMonday(new Date()))} sx={{ cursor: 'pointer' }} />
        </Box>
      )}

      {loading ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>Lädt…</Typography>
      ) : isMobile ? (
        <MobileView days={days} eintraege={eintraege} onEdit={setEditTarget} />
      ) : (
        <DesktopView days={days} eintraege={eintraege} onEdit={setEditTarget} />
      )}

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5 }}>
        {isMobile ? 'Tippe auf + oder ✏ um einen Eintrag hinzuzufügen oder zu bearbeiten.' : 'Klicke auf eine Zelle, um Mittagessen oder Vesper einzutragen.'}
      </Typography>

      {editTarget && (
        <EditDialog
          target={editTarget}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditTarget(null)}
        />
      )}
    </Box>
  );
}
