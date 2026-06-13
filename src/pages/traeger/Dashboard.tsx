import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import BusinessIcon from '@mui/icons-material/Business';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import GroupsIcon from '@mui/icons-material/Groups';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { traegerStats, einrichtungen } from '../../mockData';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  bg: string;
}

function StatCard({ icon, value, label, color, bg }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color }}>
            {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function TraegerDashboard() {
  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Stats grid */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
        Gesamtübersicht
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<BusinessIcon />} value={traegerStats.einrichtungen} label="Einrichtungen" color="#1A237E" bg="#E8EAF6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<ChildCareIcon />} value={traegerStats.kinder} label="Betreute Kinder" color="#2E7D32" bg="#E8F5E9" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<PeopleIcon />} value={traegerStats.fachkraefte} label="Fachkräfte" color="#0B5394" bg="#E3F2FD" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<GroupsIcon />} value={traegerStats.elternAktiv} label="Aktive Eltern-Accounts" color="#E65100" bg="#FFF3E0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<ChatIcon />} value={traegerStats.nachrichtenHeute} label="Nachrichten heute" color="#6A1B9A" bg="#F3E5F5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<EventBusyIcon />} value={traegerStats.abwesenheitenHeute} label="Abwesenheiten heute" color="#C62828" bg="#FFEBEE" />
        </Grid>
      </Grid>

      {/* Einrichtungen table */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
          Einrichtungen (Auswahl)
        </Typography>
        <Button size="small" variant="outlined" endIcon={<BusinessIcon />}>
          Alle 240 anzeigen
        </Button>
      </Box>
      <Card sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary' } }}>
              <TableCell>Einrichtung</TableCell>
              <TableCell>Stadt</TableCell>
              <TableCell align="center">Kinder</TableCell>
              <TableCell align="center">Personal</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {einrichtungen.map((e) => (
              <TableRow key={e.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>{e.name}</TableCell>
                <TableCell>{e.city}</TableCell>
                <TableCell align="center">{e.children}</TableCell>
                <TableCell align="center">{e.staff}</TableCell>
                <TableCell align="center">
                  <Chip label="Aktiv" size="small" color="success" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Quick actions */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
        Schnellaktionen
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<EmailOutlinedIcon />} sx={{ borderRadius: 3 }}>
          Rundmail versenden
        </Button>
        <Button variant="outlined" startIcon={<BusinessIcon />} sx={{ borderRadius: 3 }}>
          Neue Einrichtung anlegen
        </Button>
        <Button variant="outlined" startIcon={<PeopleIcon />} sx={{ borderRadius: 3 }}>
          Account verwalten
        </Button>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.disabled">
        FRÖBEL.connect Träger-Dashboard · DSGVO-konform · Hosting in Deutschland (ISO 27001)
      </Typography>
    </Box>
  );
}
