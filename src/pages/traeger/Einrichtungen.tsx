import { useState, useMemo, useEffect } from 'react';
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
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PeopleIcon from '@mui/icons-material/People';
import { useKitas, type KitaItem } from '../../hooks/useKitas';

const EMPTY_FORM = { name: '', city: '', address: '' };

function KitaDialog({
  open,
  kita,
  onClose,
  onSave,
}: {
  open: boolean;
  kita: KitaItem | null;
  onClose: () => void;
  onSave: (data: { name: string; city: string; address: string }) => Promise<void>;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!kita;

  useEffect(() => {
    if (open) {
      setForm(kita ? { name: kita.name, city: kita.city ?? '', address: kita.address ?? '' } : EMPTY_FORM);
      setError('');
    }
  }, [open, kita]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return; }
    setSaving(true);
    await onSave({ name: form.name.trim(), city: form.city.trim(), address: form.address.trim() });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Einrichtung bearbeiten' : 'Neue Einrichtung anlegen'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 0 }}>{error}</Alert>}
        <TextField
          label="Name der Einrichtung"
          required
          fullWidth
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <TextField
          label="Stadt"
          fullWidth
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <TextField
          label="Adresse"
          fullWidth
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
        >
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteDialog({
  kita,
  onClose,
  onConfirm,
}: {
  kita: KitaItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    await onConfirm().catch(() => setError('Löschen fehlgeschlagen. Möglicherweise sind noch Kinder oder Fachkräfte dieser Einrichtung zugeordnet.'));
    setDeleting(false);
    if (!error) onClose();
  };

  return (
    <Dialog open={!!kita} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Einrichtung löschen?</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        <Typography variant="body2" color="text.secondary">
          <strong>{kita?.name}</strong> wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={deleting}
          startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : undefined}>
          {deleting ? 'Wird gelöscht…' : 'Löschen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TraegerEinrichtungen() {
  const { kitas, loading, createKita, updateKita, deleteKita } = useKitas();
  const [search, setSearch] = useState('');
  const [editKita, setEditKita] = useState<KitaItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KitaItem | null>(null);
  const isMobile = useMediaQuery('(max-width:700px)');

  const filtered = useMemo(() =>
    kitas.filter((k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      (k.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (k.address ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [kitas, search]
  );

  const openCreate = () => { setEditKita(null); setDialogOpen(true); };
  const openEdit = (k: KitaItem) => { setEditKita(k); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);

  const handleSave = async (data: { name: string; city: string; address: string }) => {
    if (editKita) await updateKita(editKita.id, data);
    else await createKita(data);
  };

  const handleDelete = async () => {
    if (deleteTarget) await deleteKita(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Einrichtungen</Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Lädt…' : `${kitas.length} Einrichtung${kitas.length !== 1 ? 'en' : ''} gesamt`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' }, flexShrink: 0 }}
        >
          Neue Einrichtung
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Nach Name, Stadt oder Adresse suchen …"
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
          <BusinessIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">
            {search ? 'Keine Einrichtungen gefunden.' : 'Noch keine Einrichtungen angelegt.'}
          </Typography>
        </Box>
      ) : isMobile ? (
        /* Mobile card view */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((k) => (
            <Card key={k.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{k.name}</Typography>
                  {(k.city || k.address) && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {[k.city, k.address].filter(Boolean).join(' · ')}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<ChildCareIcon />} label={`${k.childrenCount} Kinder`} size="small" variant="outlined" />
                    <Chip icon={<PeopleIcon />} label={`${k.staffCount} Fachkräfte`} size="small" variant="outlined" />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => openEdit(k)} aria-label="Bearbeiten">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteTarget(k)} aria-label="Löschen" sx={{ color: 'error.main' }}>
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        /* Desktop table view */
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', bgcolor: 'grey.50' } }}>
                <TableCell>Einrichtung</TableCell>
                <TableCell>Stadt</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell align="center">Kinder</TableCell>
                <TableCell align="center">Fachkräfte</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((k) => (
                <TableRow key={k.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{k.name}</TableCell>
                  <TableCell>{k.city ?? '–'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{k.address ?? '–'}</TableCell>
                  <TableCell align="center">
                    <Chip label={k.childrenCount} size="small" sx={{ minWidth: 36 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={k.staffCount} size="small" sx={{ minWidth: 36 }} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(k)} aria-label={`${k.name} bearbeiten`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(k)} aria-label={`${k.name} löschen`} sx={{ color: 'error.main', ml: 0.5 }}>
                      <DeleteOutlinedIcon fontSize="small" />
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
          {filtered.length} von {kitas.length} Einrichtungen
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.disabled">
        FRÖBEL.connect Träger-Dashboard · DSGVO-konform · Hosting in Deutschland
      </Typography>

      <KitaDialog open={dialogOpen} kita={editKita} onClose={closeDialog} onSave={handleSave} />
      <DeleteDialog kita={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </Box>
  );
}
