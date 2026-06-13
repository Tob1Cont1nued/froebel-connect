import { useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CHILD_PRESETS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🐯', '🦁', '🐸',
  '🐙', '🦋', '🌻', '🌈', '⭐', '🌙',
  '🚂', '🚗', '✈️', '⚽', '🎨', '🦄',
];

interface Props {
  childId: string;
  emoji: string;
  photoUrl: string | null;
  name: string;
  size?: number;
  onSaved?: () => void;
}

export function renderChildAvatar(
  emoji: string,
  photoUrl: string | null,
  size: number,
  name?: string
) {
  if (photoUrl?.startsWith('preset:')) {
    const e = photoUrl.replace('preset:', '');
    return (
      <Avatar sx={{ width: size, height: size, bgcolor: '#95C11F', fontSize: size * 0.48 }}>
        {e}
      </Avatar>
    );
  }
  if (photoUrl) {
    return <Avatar src={photoUrl} alt={name} sx={{ width: size, height: size }} />;
  }
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: 'grey.100', fontSize: size * 0.55 }}>
      {emoji}
    </Avatar>
  );
}

export default function ChildAvatarPicker({ childId, emoji, photoUrl, name, size = 40, onSaved }: Props) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width:899px)');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const savePhotoUrl = async (url: string | null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('children').update({ photo_url: url }).eq('id', childId);
    onSaved?.();
  };

  const handlePresetSelect = async (e: string) => {
    await savePhotoUrl(`preset:${e}`);
    setOpen(false);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile || !session) return;
    setUploading(true);
    const path = `${childId}.jpg`;
    const { error } = await supabase.storage
      .from('child-avatars')
      .upload(path, selectedFile, { upsert: true, contentType: selectedFile.type });
    if (!error) {
      const { data } = supabase.storage.from('child-avatars').getPublicUrl(path);
      await savePhotoUrl(`${data.publicUrl}?t=${Date.now()}`);
    }
    setUploading(false);
    setPreview(null);
    setSelectedFile(null);
    setOpen(false);
  };

  const handleRemove = async () => {
    await savePhotoUrl(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <>
      <Box
        role="button"
        aria-label={`Avatar von ${name} ändern`}
        sx={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        {renderChildAvatar(emoji, photoUrl, size, name)}
        <Box sx={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.38, height: size * 0.38,
          bgcolor: '#1A3545', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid white',
        }}>
          <EditIcon sx={{ fontSize: size * 0.2, color: 'white' }} />
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Avatar für {name} ändern</DialogTitle>
        <DialogContent>
          {preview && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar src={preview} sx={{ width: 80, height: 80 }} />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<CameraAltOutlinedIcon />}
                fullWidth
                onClick={() => cameraInputRef.current?.click()}
              >
                Kamera
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              fullWidth
              onClick={() => fileInputRef.current?.click()}
            >
              {isMobile ? 'Galerie' : 'Foto hochladen'}
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label={`Foto für ${name} aus Galerie hochladen`}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            aria-label={`Foto für ${name} mit Kamera aufnehmen`}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary">oder Avatar wählen</Typography>
          </Divider>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
            {CHILD_PRESETS.map((e) => {
              const isActive = photoUrl === `preset:${e}`;
              return (
                <Box
                  key={e}
                  onClick={() => handlePresetSelect(e)}
                  sx={{
                    fontSize: 26, textAlign: 'center', py: 0.75, borderRadius: 2, cursor: 'pointer',
                    bgcolor: isActive ? 'primary.light' : 'grey.100',
                    border: '2px solid',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: 'grey.200' },
                  }}
                >
                  {e}
                </Box>
              );
            })}
          </Box>

          {photoUrl && (
            <Button size="small" color="error" sx={{ mt: 1.5 }} onClick={handleRemove}>
              Bild entfernen
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          {selectedFile && (
            <Button
              variant="contained"
              onClick={handleSavePhoto}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' } }}
            >
              {uploading ? 'Wird gespeichert…' : 'Speichern'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
