import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

export default function ComingSoon({ title }: { title?: string }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, color: 'text.disabled', minHeight: 300 }}>
      <BuildOutlinedIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
        {title ?? 'In Entwicklung'}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', mb: 2 }}>
        Dieser Bereich wird in einer der nächsten Versionen verfügbar sein.
      </Typography>
      <Chip label="Kommt bald" size="small" variant="outlined" />
    </Box>
  );
}
