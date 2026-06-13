import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useDocuments } from '../../hooks/useDocuments';

export default function Dokumente() {
  const { documents, loading } = useDocuments();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [snackbar, setSnackbar] = useState('');

  const categories = ['Alle', ...Array.from(new Set(documents.map((d) => d.category)))];

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Alle' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 2, maxWidth: { xs: 600, md: 900 }, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Dokumente</Typography>

      <TextField
        fullWidth size="small" placeholder="Dokument suchen …"
        value={search} onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> } }}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {categories.map((cat) => (
          <Chip key={cat} label={cat} size="small" onClick={() => setActiveCategory(cat)}
            variant={activeCategory === cat ? 'filled' : 'outlined'}
            sx={activeCategory === cat ? { bgcolor: '#1A3545', color: 'white', fontWeight: 600 } : {}}
          />
        ))}
      </Box>

      {filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">Keine Dokumente gefunden.</Typography>
        </Card>
      ) : (
        <Card>
          <List disablePadding>
            {filtered.map((doc, i) => (
              <Box key={doc.id}>
                {i > 0 && <Divider />}
                <ListItemButton onClick={() => setSnackbar(`„${doc.title}" wird heruntergeladen …`)} sx={{ py: 1.5, gap: 1.5 }}>
                  <Box sx={{ fontSize: 28, flexShrink: 0 }}>{doc.icon}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{doc.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.category} · {doc.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })} {doc.size ? `· ${doc.size}` : ''}
                    </Typography>
                  </Box>
                  <DownloadIcon fontSize="small" sx={{ color: '#95C11F', flexShrink: 0 }} />
                </ListItemButton>
              </Box>
            ))}
          </List>
        </Card>
      )}

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" onClose={() => setSnackbar('')} sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
