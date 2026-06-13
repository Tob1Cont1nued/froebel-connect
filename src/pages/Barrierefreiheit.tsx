import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ContrastIcon from '@mui/icons-material/Contrast';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { useA11y } from '../context/AccessibilityContext';

export default function Barrierefreiheit({ backPath }: { backPath: string }) {
  const navigate = useNavigate();
  const { fontSize, contrast, setFontSize, setContrast } = useA11y();

  return (
    <Box sx={{ p: 2, maxWidth: 560, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(backPath)} size="small" aria-label="Zurück">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Barrierefreiheit</Typography>
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Schriftgröße
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <TextFieldsIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Passe die Textgröße in der gesamten App an.
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={fontSize}
            exclusive
            onChange={(_, v) => v && setFontSize(v)}
            fullWidth
            size="small"
            aria-label="Schriftgröße wählen"
          >
            <ToggleButton value="normal" aria-label="Standard">
              <Box sx={{ fontSize: '0.85rem', fontWeight: 700, mr: 0.5 }}>A</Box>
              Standard
            </ToggleButton>
            <ToggleButton value="large" aria-label="Groß">
              <Box sx={{ fontSize: '1.05rem', fontWeight: 700, mr: 0.5 }}>A</Box>
              Groß
            </ToggleButton>
            <ToggleButton value="xlarge" aria-label="Sehr groß">
              <Box sx={{ fontSize: '1.25rem', fontWeight: 700, mr: 0.5 }}>A</Box>
              Sehr groß
            </ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Kontrast
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <ContrastIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Erhöhter Kontrast verbessert die Lesbarkeit bei Sehbeeinträchtigungen.
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={contrast}
            exclusive
            onChange={(_, v) => v && setContrast(v)}
            fullWidth
            size="small"
            aria-label="Kontrast wählen"
          >
            <ToggleButton value="normal" aria-label="Normaler Kontrast">Standard</ToggleButton>
            <ToggleButton value="high" aria-label="Erhöhter Kontrast">Erhöht</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Vorlesefunktion
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <RecordVoiceOverOutlinedIcon color="action" sx={{ mt: 0.25, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              FRÖBEL.connect unterstützt die Vorlesefunktion deines Betriebssystems vollständig.
              Aktiviere sie in den Systemeinstellungen:
              <br />· <strong>iOS:</strong> Einstellungen → Bedienungshilfen → Gesprochene Inhalte
              <br />· <strong>Android:</strong> Einstellungen → Bedienungshilfen → TalkBack
              <br />· <strong>Windows:</strong> Einstellungen → Bedienungshilfen → Narrator
              <br />· <strong>macOS:</strong> Systemeinstellungen → Bedienungshilfen → VoiceOver
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Einstellungen werden lokal auf diesem Gerät gespeichert.
      </Typography>
    </Box>
  );
}
