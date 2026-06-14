import { useState, useMemo, useEffect } from 'react';
import { kitaColor } from '../../utils/kitaColors';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTraegerFachkraefte, type FachkraftItem } from '../../hooks/useTraegerFachkraefte';
import { useKitas } from '../../hooks/useKitas';

function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function CreateDialog({
  open, onClose, onSave, kitas,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { email: string; name: string; kita_id: string; password: string }) => Promise<{ error: unknown }>;
  kitas: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({ name: '', email: '', kita_id: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: '', email: '', kita_id: '', password: generatePassword() });
      setError('');
      setCreated(false);
      setCopied(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return; }
    if (!form.email.trim()) { setError('E-Mail ist Pflichtfeld.'); return; }
    setSaving(true);
    setError('');
    const { error: err } = await onSave(form);
    setSaving(false);
    if (err) {
      setError('Fehler beim Anlegen. E-Mail existiert möglicherweise bereits.');
    } else {
      setCreated(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Fachkraft angelegt ✓</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Alert severity="success">
            <strong>{form.name}</strong> wurde erfolgreich angelegt.
          </Alert>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Temporäres Passwort — bitte an die Person weitergeben:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.100', borderRadius: 2, px: 2, py: 1.5 }}>
              <Typography variant="body1" sx={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>
                {form.password}
              </Typography>
              <IconButton size="small" onClick={handleCopy} aria-label="Passwort kopieren">
                {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Login: <strong>{form.email}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onClose} sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}>
            Fertig
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Neue Fachkraft anlegen</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Name" required fullWidth autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <TextField label="E-Mail-Adresse" required fullWidth type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <TextField
          label="Einrichtung"
          select fullWidth value={form.kita_id}
          onChange={(e) => setForm((f) => ({ ...f, kita_id: e.target.value }))}
        >
          <MenuItem value=""><em>Keine Zuordnung</em></MenuItem>
          {kitas.map((k) => <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>)}
        </TextField>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Temporäres Passwort (wird nach dem Anlegen angezeigt)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.100', borderRadius: 2, px: 2, py: 1 }}>
            <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace', fontWeight: 600 }}>{form.password}</Typography>
            <Button size="small" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>Neu</Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
        >
          {saving ? 'Anlegen…' : 'Anlegen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditDialog({
  fachkraft, onClose, onSave, kitas,
}: {
  fachkraft: FachkraftItem | null;
  onClose: () => void;
  onSave: (id: string, data: { name: string; kita_id: string | null }) => Promise<unknown>;
  kitas: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({ name: '', kita_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fachkraft) setForm({ name: fachkraft.name, kita_id: fachkraft.kita_id ?? '' });
  }, [fachkraft]);

  const handleSave = async () => {
    if (!form.name.trim() || !fachkraft) return;
    setSaving(true);
    await onSave(fachkraft.id, { name: form.name.trim(), kita_id: form.kita_id || null });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={!!fachkraft} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Fachkraft bearbeiten</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Name" required fullWidth autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
        <TextField
          label="Einrichtung" select fullWidth value={form.kita_id}
          onChange={(e) => setForm((f) => ({ ...f, kita_id: e.target.value }))}
        >
          <MenuItem value=""><em>Keine Zuordnung</em></MenuItem>
          {kitas.map((k) => <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>)}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
        >
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteDialog({ fachkraft, onClose, onConfirm }: {
  fachkraft: FachkraftItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <Dialog open={!!fachkraft} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Fachkraft entfernen?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Das Profil von <strong>{fachkraft?.name}</strong> ({fachkraft?.email}) wird gelöscht.
          Der Login-Account bleibt in Supabase erhalten — kann dort manuell entfernt werden.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" color="error" disabled={deleting}
          startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : undefined}
          onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false); onClose(); }}>
          {deleting ? 'Wird entfernt…' : 'Entfernen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TraegerFachkraefte() {
  const { fachkraefte, loading, createFachkraft, updateFachkraft, deleteFachkraft } = useTraegerFachkraefte();
  const { kitas } = useKitas();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FachkraftItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FachkraftItem | null>(null);
  const isMobile = useMediaQuery('(max-width:700px)');

  const filtered = useMemo(() =>
    fachkraefte.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.kita_name ?? '').toLowerCase().includes(search.toLowerCase())
    ), [fachkraefte, search]);

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Fachkräfte</Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Lädt…' : `${fachkraefte.length} Fachkraft${fachkraefte.length !== 1 ? '\\u0308e' : ''} gesamt`}
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' }, flexShrink: 0 }}
        >
          Neue Fachkraft
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Nach Name, E-Mail oder Einrichtung suchen …"
        size="small" fullWidth value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> } }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#95C11F' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
          <PeopleIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">{search ? 'Keine Fachkräfte gefunden.' : 'Noch keine Fachkräfte angelegt.'}</Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((f) => (
            <Card key={f.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{f.name}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{f.email}</Typography>
                  {f.kita_id && f.kita_name ? (() => { const c = kitaColor(f.kita_id); return (
                    <Chip label={f.kita_name} size="small" sx={{ mt: 0.75, bgcolor: c.bg, color: c.color, fontWeight: 600, border: 'none' }} />
                  ); })() : (
                    <Chip label="Keine Einrichtung" size="small" color="warning" variant="outlined" sx={{ mt: 0.75 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => setEditTarget(f)} aria-label="Bearbeiten"><EditOutlinedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => setDeleteTarget(f)} aria-label="Löschen" sx={{ color: 'error.main' }}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
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
                <TableCell>Seit</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{f.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{f.email}</TableCell>
                  <TableCell>
                    {f.kita_id && f.kita_name ? (() => { const c = kitaColor(f.kita_id); return (
                      <Chip label={f.kita_name} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: 'none' }} />
                    ); })() : (
                      <Chip label="Keine Zuordnung" size="small" color="warning" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>
                    {new Date(f.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditTarget(f)} aria-label={`${f.name} bearbeiten`}><EditOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(f)} aria-label={`${f.name} entfernen`} sx={{ color: 'error.main', ml: 0.5 }}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filtered.length > 0 && search && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {filtered.length} von {fachkraefte.length} Fachkräften
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.disabled">
        FRÖBEL.connect Träger-Dashboard · DSGVO-konform · Hosting in Deutschland
      </Typography>

      <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} onSave={createFachkraft} kitas={kitas} />
      <EditDialog fachkraft={editTarget} onClose={() => setEditTarget(null)} onSave={updateFachkraft} kitas={kitas} />
      <DeleteDialog fachkraft={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteFachkraft(deleteTarget!.id)} />
    </Box>
  );
}
