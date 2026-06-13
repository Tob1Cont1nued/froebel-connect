import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#1A3545' }}>{title}</Typography>
      {children}
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.7 }}>{children}</Typography>;
}

export default function Datenschutz({ backPath }: { backPath: string }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2, maxWidth: 680, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(backPath)} size="small" aria-label="Zurück">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Datenschutz & Impressum</Typography>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Section title="Impressum">
            <P>FRÖBEL Bildung und Erziehung gGmbH</P>
            <P>Schmidstraße 12 · 10179 Berlin</P>
            <P>Telefon: +49 30 28 59 79-0</P>
            <P>E-Mail: info@froebel.de</P>
            <P>Handelsregister: HRB 100234 B · Amtsgericht Berlin-Charlottenburg</P>
            <P>Geschäftsführung: Stephan Groksch</P>
          </Section>

          <Divider sx={{ my: 2 }} />

          <Section title="Datenschutzerklärung">
            <P>
              Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten
              ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, BDSG).
            </P>
          </Section>

          <Section title="Verantwortlicher">
            <P>
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist die FRÖBEL Bildung und Erziehung gGmbH,
              Schmidstraße 12, 10179 Berlin. Datenschutzbeauftragte·r: datenschutz@froebel.de
            </P>
          </Section>

          <Section title="Welche Daten wir verarbeiten">
            <P>Im Rahmen der Nutzung von FRÖBEL.connect verarbeiten wir folgende Daten:</P>
            <P>· Stammdaten: Name, E-Mail-Adresse, Rolle (Elternteil / Fachkraft)</P>
            <P>· Kinderdaten: Name, Alter, Kita-Zuordnung</P>
            <P>· Kommunikationsdaten: Nachrichten zwischen Eltern und Fachkräften</P>
            <P>· Abwesenheitsmeldungen und Termine</P>
            <P>· Portfolio-Einträge (Entwicklungsdokumentation)</P>
          </Section>

          <Section title="Zweck & Rechtsgrundlage">
            <P>
              Die Verarbeitung erfolgt zur Erfüllung des Betreuungsvertrags (Art. 6 Abs. 1 lit. b DSGVO)
              sowie zur Wahrung berechtigter Interessen der Einrichtung (Art. 6 Abs. 1 lit. f DSGVO).
              Kommunikations- und Abwesenheitsdaten werden ausschließlich für die Kita-Verwaltung genutzt.
            </P>
          </Section>

          <Section title="Speicherdauer">
            <P>
              Ihre Daten werden gespeichert, solange das Betreuungsverhältnis besteht. Nach Beendigung werden
              personenbezogene Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </P>
          </Section>

          <Section title="Datenweitergabe">
            <P>
              Ihre Daten werden nicht an Dritte weitergegeben. Die Datenhaltung erfolgt ausschließlich auf
              Servern in der EU (Supabase EU-Region, Frankfurt).
            </P>
          </Section>

          <Section title="Ihre Rechte">
            <P>Sie haben jederzeit das Recht auf:</P>
            <P>· Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</P>
            <P>· Berichtigung unrichtiger Daten (Art. 16 DSGVO)</P>
            <P>· Löschung Ihrer Daten (Art. 17 DSGVO)</P>
            <P>· Einschränkung der Verarbeitung (Art. 18 DSGVO)</P>
            <P>· Datenübertragbarkeit (Art. 20 DSGVO)</P>
            <P>· Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</P>
            <P>
              Zur Ausübung Ihrer Rechte wenden Sie sich an: datenschutz@froebel.de
            </P>
          </Section>

          <Section title="Beschwerderecht">
            <P>
              Sie haben das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
              Zuständig ist der Berliner Beauftragte für Datenschutz und Informationsfreiheit.
            </P>
          </Section>

          <Section title="Sicherheit">
            <P>
              Alle Daten werden verschlüsselt übertragen (TLS/HTTPS). Der Zugriff ist durch Authentifizierung
              geschützt. Datenbankzugriffe sind durch Row-Level-Security (RLS) abgesichert — jede·r Nutzer·in
              sieht ausschließlich die für sie bestimmten Daten.
            </P>
          </Section>

          <Typography variant="caption" color="text.disabled">
            Stand: Juni 2025 · FRÖBEL.connect v0.1.0
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
