import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';
import { useIdleLogout } from '../hooks/useIdleLogout';
import type { Role } from '../lib/database.types';

interface Props {
  children: React.ReactNode;
  role: Role | 'leitung';
}

function IdleLogoutWatcher() {
  useIdleLogout();
  return null;
}

function defaultRedirect(profileRole: Role, isLeitung: boolean): string {
  if (profileRole === 'fachkraft' && isLeitung) return '/leitung/dashboard';
  if (profileRole === 'fachkraft') return '/team/dashboard';
  if (profileRole === 'traeger') return '/traeger/dashboard';
  return '/eltern/dashboard';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#95C11F' }} />
      </Box>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (profile) {
    const isLeitung = profile.is_leitung ?? false;
    // leitung pseudo-role: fachkraft with is_leitung flag
    if (role === 'leitung' && !(profile.role === 'fachkraft' && isLeitung)) {
      return <Navigate to={defaultRedirect(profile.role, isLeitung)} replace />;
    }
    if (role !== 'leitung' && profile.role !== role) {
      return <Navigate to={defaultRedirect(profile.role, isLeitung)} replace />;
    }
  }

  return <><IdleLogoutWatcher />{children}</>;
}
