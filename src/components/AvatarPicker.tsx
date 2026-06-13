import { useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PRESETS = ['🦁', '🐻', '🐼', '🦊', '🐨', '🐸', '🦄', '🐙', '🦋', '🌻', '⭐', '🌈'];

interface Props {
  size?: number;
  initials: string;
}

export default function AvatarPicker({ size = 72, initials }: Props) {
  const { profile, session, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width:899px)');

  const currentUrl = profile?.avatar_url ?? null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = async (emoji: string) => {
    await updateProfile({ avatar_url: `preset:${emoji}` });
    setOpen(false);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile || !session) return;
    setUploading(true);
    const path = `${session.user.id}.jpg`;
    const { error } = await supabase.storage.from('avatars').upload(path, selectedFile, { upsert: true, contentType: selectedFile.type });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache-busting
      await updateProfile({ avatar_url: `${data.publicUrl}?t=${Date.now()}` });
    }
    setUploading(false);
    setPreview(null);
    setSelectedFile(null);
    setOpen(false);
  };

  const handleRemove = async () => {
    await updateProfile({ avatar_url: null });
    setOpen(false);
  };

  const renderAvatar = (url: string | null, sz: number) => {
    if (url?.startsWith('preset:')) {
      const emoji = url.replace('preset:', '');
      return (
        <Avatar sx={{ width: sz, height: sz, bgcolor: '#95C11F', fontSize: sz * 0.45 }}>
          {emoji}
        </Avatar>
      );
    }
    if (url) {
      return <Avatar src={url} sx={{ width: sz, height: sz }} />;
    }
    return (
      <Avatar sx={{ width: sz, height: sz, bgcolor: '#95C11F', color: '#1A3545', fontSize: sz * 0.3, fontWeight: 700 }}>
        {initials}
      </Avatar>
    );
  };

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={() => setOpen(true)}>
        {renderAvatar(currentUrl, size)}
        <Box sx={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.36, height: size * 0.36,
          bgcolor: '#1A3545', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid white',
        }}>
          <EditIcon sx={{ fontSize: size * 0.2, color: 'white' }} />
        </Box>
      </Box>

      <Dialog open={open} onClose={() => { setOpen(false); setPreview(null); setSelectedFile(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Profilbild ändern</DialogTitle>
        <DialogContent>
          {/* Preview */}
          {preview && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar src={preview} sx={{ width: 80, height: 80 }} />
            </Box>
          )}

          {/* Upload buttons */}
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

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary">oder Avatar wählen</Typography>
          </Divider>

          {/* Preset grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
            {PRESETS.map((emoji) => {
              const isActive = currentUrl === `preset:${emoji}`;
              return (
                <Box
                  key={emoji}
                  onClick={() => handlePresetSelect(emoji)}
                  sx={{
                    fontSize: 28, textAlign: 'center', py: 0.75, borderRadius: 2, cursor: 'pointer',
                    bgcolor: isActive ? 'primary.light' : 'grey.100',
                    border: isActive ? '2px solid' : '2px solid transparent',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: 'grey.200' },
                  }}
                >
                  {emoji}
                </Box>
              );
            })}
          </Box>

          {currentUrl && (
            <Button size="small" color="error" sx={{ mt: 1.5 }} onClick={handleRemove}>
              Bild entfernen
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setPreview(null); setSelectedFile(null); }}>Abbrechen</Button>
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
