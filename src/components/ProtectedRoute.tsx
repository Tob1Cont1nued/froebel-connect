import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../lib/database.types';

interface Props {
  children: React.ReactNode;
  role: Role;
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

  if (profile && profile.role !== role) {
    const redirect = profile.role === 'eltern' ? '/eltern/dashboard'
      : profile.role === 'fachkraft' ? '/team/dashboard'
      : '/traeger/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
