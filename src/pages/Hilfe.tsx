import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

const faqs = [
  {
    q: 'Wie melde ich mein Kind krank?',
    a: 'Unter "Mehr" → "Abwesenheit melden" kannst du dein Kind für einen oder mehrere Tage abmelden. Wähle den Grund (z. B. Krankheit) und bestätige die Meldung. Die Fachkraft wird automatisch informiert.',
  },
  {
    q: 'Wie schreibe ich der Kita eine Nachricht?',
    a: 'Tippe auf "Nachrichten" in der Navigation. Mit dem Stift-Icon oben rechts kannst du eine neue Nachricht an eine Fachkraft senden.',
  },
  {
    q: 'Wo sehe ich die Termine meines Kindes?',
    a: 'Unter "Termine" findest du alle Kita-Veranstaltungen und persönliche Elterngespräche. Allgemeine Termine sind für alle Eltern sichtbar, persönliche Gespräche nur für dich.',
  },
  {
    q: 'Was ist das Portfolio?',
    a: 'Das Portfolio dokumentiert die Entwicklung deines Kindes. Fachkräfte tragen Beobachtungen, Fotos und Meilensteine ein, die du hier einsehen kannst.',
  },
  {
    q: 'Wie ändere ich mein Passwort?',
    a: 'Gehe zu "Mehr" → "Datenschutz & Sicherheit". Dort kannst du dein Passwort ändern, indem du das aktuelle und das neue Passwort eingibst.',
  },
  {
    q: 'Wie lösche ich eine Konversation?',
    a: 'In der Nachrichtenliste: auf dem Desktop erscheint beim Hovern ein Mülleimer-Icon. Auf dem Smartphone wischst du die Konversation nach links.',
  },
  {
    q: 'Warum werde ich automatisch abgemeldet?',
    a: 'Aus Sicherheitsgründen wirst du nach 30 Minuten ohne Aktivität automatisch abgemeldet. So sind die Daten deines Kindes geschützt, auch wenn du vergisst dich abzumelden.',
  },
];

export default function Hilfe({ backPath }: { backPath: string }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2, maxWidth: 680, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(backPath)} size="small" aria-label="Zurück">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Hilfe & Support</Typography>
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Häufige Fragen
      </Typography>
      <Box sx={{ mb: 3 }}>
        {faqs.map((faq, i) => (
          <Accordion key={i} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:not(:first-of-type)': { borderTop: 0 }, '&:first-of-type': { borderRadius: '8px 8px 0 0' }, '&:last-of-type': { borderRadius: '0 0 8px 8px' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{faq.q}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{faq.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
        Kontakt
      </Typography>
      <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EmailOutlinedIcon color="action" fontSize="small" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>E-Mail</Typography>
            <Typography variant="body2" color="text.secondary">info@froebel.de</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PhoneOutlinedIcon color="action" fontSize="small" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Telefon</Typography>
            <Typography variant="body2" color="text.secondary">+49 30 28 59 79-0</Typography>
          </Box>
        </Box>
        <Divider />
        <Typography variant="caption" color="text.disabled">
          Mo – Fr · 8:00 – 17:00 Uhr
        </Typography>
      </Card>
    </Box>
  );
}
