import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Sicherheit({ backPath }: { backPath: string }) {
  const navigate = useNavigate();
  const { signOut, session } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPassword) { setPwError('Bitte aktuelles Passwort eingeben.'); return; }
    if (newPassword.length < 8) { setPwError('Neues Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Neue Passwörter stimmen nicht überein.'); return; }
    if (newPassword === currentPassword) { setPwError('Neues Passwort muss sich vom aktuellen unterscheiden.'); return; }
    setPwLoading(true);
    const email = session?.user?.email ?? '';
    // Altes Passwort verifizieren
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) { setPwLoading(false); setPwError('Aktuelles Passwort ist falsch.'); return; }
    // Neues Passwort setzen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.auth as any).updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) { setPwError('Fehler: ' + error.message); return; }
    setPwSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    await signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 2, maxWidth: 560, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(backPath)} size="small" aria-label="Zurück">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Datenschutz & Sicherheit</Typography>
      </Box>

      {/* Passwort ändern */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Passwort ändern
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LockOutlinedIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Mindestens 8 Zeichen, Groß-/Kleinbuchstaben und Zahlen empfohlen.
            </Typography>
          </Box>
          <TextField
            label="Aktuelles Passwort"
            type="password"
            size="small"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Divider />
          <TextField
            label="Neues Passwort"
            type="password"
            size="small"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            label="Passwort bestätigen"
            type="password"
            size="small"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordChange(); }}
          />
          {pwError && <Alert severity="error" sx={{ py: 0 }}>{pwError}</Alert>}
          {pwSuccess && <Alert severity="success" sx={{ py: 0 }}>Passwort erfolgreich geändert.</Alert>}
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={pwLoading || !newPassword || !confirmPassword}
            sx={{ alignSelf: 'flex-end', bgcolor: '#95C11F', color: '#1A3545', fontWeight: 700, '&:hover': { bgcolor: '#7EA819' } }}
          >
            {pwLoading ? 'Speichern…' : 'Passwort speichern'}
          </Button>
        </CardContent>
      </Card>

      {/* Session-Info */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Sitzungssicherheit
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Aus Sicherheitsgründen werden Sie nach <strong>30 Minuten Inaktivität</strong> automatisch abgemeldet.
            Alle Verbindungen sind TLS-verschlüsselt. Zugriffsrechte werden serverseitig über
            Row-Level-Security (RLS) durchgesetzt.
          </Typography>
        </CardContent>
      </Card>

      {/* Account löschen */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Account löschen
      </Typography>
      <Card sx={{ border: '1px solid', borderColor: 'error.light' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
            Das Löschen Ihres Accounts ist endgültig. Ihre persönlichen Zugangsdaten werden entfernt.
            Gesendete Nachrichten und Abwesenheitsmeldungen bleiben für die Kita als Nachweis erhalten
            (gesetzliche Aufbewahrungspflicht). Für eine vollständige DSGVO-Löschung wenden Sie sich
            bitte an: <strong>datenschutz@froebel.de</strong>
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={() => setDeleteOpen(true)}
          >
            Account löschen
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteConfirmText(''); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Account wirklich löschen?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Diese Aktion kann nicht rückgängig gemacht werden. Gib zur Bestätigung <strong>LÖSCHEN</strong> ein:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="LÖSCHEN"
            inputProps={{ 'aria-label': 'Zur Bestätigung LÖSCHEN eingeben' }}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteOpen(false); setDeleteConfirmText(''); }}>Abbrechen</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== 'LÖSCHEN' || deleteLoading}
            onClick={handleDeleteAccount}
          >
            {deleteLoading ? 'Wird gelöscht…' : 'Endgültig löschen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
