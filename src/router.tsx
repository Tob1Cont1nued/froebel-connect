import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ElternLayout from './components/ElternLayout';
import Dashboard from './pages/eltern/Dashboard';
import NachrichtenLayout, { EmptyState as NachrichtenEmpty } from './pages/eltern/NachrichtenLayout';
import NachrichtenDetail from './pages/eltern/NachrichtenDetail';
import Abwesenheit from './pages/eltern/Abwesenheit';
import Termine from './pages/eltern/Termine';
import Portfolio from './pages/eltern/Portfolio';
import Mehr from './pages/eltern/Mehr';
import Dokumente from './pages/eltern/Dokumente';
import TeamLayout from './components/TeamLayout';
import TeamDashboard from './pages/team/Dashboard';
import TeamMehr from './pages/team/Mehr';
import TraegerLayout from './components/TraegerLayout';
import TraegerDashboard from './pages/traeger/Dashboard';
import ComingSoon from './pages/ComingSoon';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  {
    path: '/eltern',
    element: <ProtectedRoute role="eltern"><ElternLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      {
        path: 'nachrichten',
        element: <NachrichtenLayout />,
        children: [
          { index: true, element: <NachrichtenEmpty /> },
          { path: ':convId', element: <NachrichtenDetail /> },
        ],
      },
      { path: 'abwesenheit', element: <Abwesenheit /> },
      { path: 'termine', element: <Termine /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'dokumente', element: <Dokumente /> },
      { path: 'mehr', element: <Mehr /> },
    ],
  },
  {
    path: '/team',
    element: <ProtectedRoute role="fachkraft"><TeamLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeamDashboard /> },
      { path: 'nachrichten', element: <ComingSoon title="Team-Nachrichten" /> },
      { path: 'kinder', element: <ComingSoon title="Kinderverwaltung" /> },
      { path: 'dienstplan', element: <ComingSoon title="Dienstplan" /> },
      { path: 'mehr', element: <TeamMehr /> },
    ],
  },
  {
    path: '/traeger',
    element: <ProtectedRoute role="traeger"><TraegerLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TraegerDashboard /> },
      { path: 'einrichtungen', element: <ComingSoon title="Einrichtungen" /> },
      { path: 'fachkraefte', element: <ComingSoon title="Fachkräfte" /> },
      { path: 'rundmails', element: <ComingSoon title="Rundmails" /> },
      { path: 'auswertungen', element: <ComingSoon title="Auswertungen" /> },
    ],
  },
]);
