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
import ElternProfil from './pages/eltern/Profil';
import Dokumente from './pages/eltern/Dokumente';
import TeamLayout from './components/TeamLayout';
import TeamDashboard from './pages/team/Dashboard';
import TeamKinder from './pages/team/Kinder';
import TeamDienstplan from './pages/team/Dienstplan';
import TeamProfil from './pages/team/Profil';
import TeamNachrichten, { EmptyState as TeamNachrichtenEmpty } from './pages/team/Nachrichten';
import TeamNachrichtenDetail from './pages/team/NachrichtenDetail';
import TeamMehr from './pages/team/Mehr';
import TraegerLayout from './components/TraegerLayout';
import TraegerDashboard from './pages/traeger/Dashboard';
import ComingSoon from './pages/ComingSoon';
import ErrorPage from './pages/ErrorPage';
import Datenschutz from './pages/Datenschutz';
import Sicherheit from './pages/Sicherheit';
import Hilfe from './pages/Hilfe';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace />, errorElement: <ErrorPage /> },
  { path: '/login', element: <Login />, errorElement: <ErrorPage /> },
  {
    path: '/eltern',
    errorElement: <ErrorPage />,
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
      { path: 'profil', element: <ElternProfil /> },
      { path: 'datenschutz', element: <Datenschutz backPath="/eltern/mehr" /> },
      { path: 'sicherheit', element: <Sicherheit backPath="/eltern/mehr" /> },
      { path: 'hilfe', element: <Hilfe backPath="/eltern/mehr" /> },
    ],
  },
  {
    path: '/team',
    errorElement: <ErrorPage />,
    element: <ProtectedRoute role="fachkraft"><TeamLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeamDashboard /> },
      {
        path: 'nachrichten',
        element: <TeamNachrichten />,
        children: [
          { index: true, element: <TeamNachrichtenEmpty /> },
          { path: ':convId', element: <TeamNachrichtenDetail /> },
        ],
      },
      { path: 'kinder', element: <TeamKinder /> },
      { path: 'dienstplan', element: <TeamDienstplan /> },
      { path: 'mehr', element: <TeamMehr /> },
      { path: 'profil', element: <TeamProfil /> },
      { path: 'datenschutz', element: <Datenschutz backPath="/team/mehr" /> },
      { path: 'sicherheit', element: <Sicherheit backPath="/team/mehr" /> },
    ],
  },
  {
    path: '/traeger',
    errorElement: <ErrorPage />,
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
