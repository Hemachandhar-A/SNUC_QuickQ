import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { StudentLayout } from './layout/StudentLayout';
import { StaffLayout } from './layout/StaffLayout';
import { AdminLayout } from './layout/AdminLayout';
import { Skeleton } from './components/ui/Skeleton';

const Login = lazy(() => import('./pages/Login/LoginPage'));
const StudentHome = lazy(() => import('./pages/Student/Home/StudentHome'));
const StudentAlerts = lazy(() => import('./pages/Student/AlertsFairness/StudentAlerts'));
const StudentSustainability = lazy(() => import('./pages/Student/SustainabilityLog/SustainabilityLog'));
const StaffDashboard = lazy(() => import('./pages/Staff/Dashboard/StaffDashboard'));
const QueueMonitor = lazy(() => import('./pages/Staff/QueueMonitor/QueueMonitor'));
const ShockEvents = lazy(() => import('./pages/Staff/ShockEvents/ShockEvents'));
const AdminOverview = lazy(() => import('./pages/Admin/Overview/AdminOverview'));
const DemandForecast = lazy(() => import('./pages/Admin/DemandForecast/DemandForecast'));
const CongestionHeatmap = lazy(() => import('./pages/Admin/CongestionHeatmap/CongestionHeatmap'));
const FairnessAudit = lazy(() => import('./pages/Admin/FairnessAudit/FairnessAudit'));
const SustainabilityAnalytics = lazy(() => import('./pages/Admin/SustainabilityAnalytics/SustainabilityAnalytics'));

function PageFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function Protected({ children, role }) {
  let userRole = null;
  try {
    const raw = localStorage.getItem('hostel-mess-auth');
    if (raw) {
      const data = JSON.parse(raw);
      userRole = data?.state?.user?.role;
    }
  } catch (_) {}
  if (!userRole) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to={userRole === 'student' ? '/student' : userRole === 'staff' ? '/staff' : '/admin'} replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={<PageFallback />}><Login /></Suspense> },
  {
    path: '/student',
    element: <Protected role="student"><StudentLayout /></Protected>,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><StudentHome /></Suspense> },
      { path: 'alerts', element: <Suspense fallback={<PageFallback />}><StudentAlerts /></Suspense> },
      { path: 'sustainability', element: <Suspense fallback={<PageFallback />}><StudentSustainability /></Suspense> },
      { path: 'schedules', element: <Suspense fallback={<PageFallback />}><StudentHome /></Suspense> },
    ],
  },
  {
    path: '/staff',
    element: <Protected role="staff"><StaffLayout /></Protected>,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><StaffDashboard /></Suspense> },
      { path: 'monitor', element: <Suspense fallback={<PageFallback />}><QueueMonitor /></Suspense> },
      { path: 'shock', element: <Suspense fallback={<PageFallback />}><ShockEvents /></Suspense> },
    ],
  },
  {
    path: '/admin',
    element: <Protected role="admin"><AdminLayout /></Protected>,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><AdminOverview /></Suspense> },
      { path: 'forecast', element: <Suspense fallback={<PageFallback />}><DemandForecast /></Suspense> },
      { path: 'heatmap', element: <Suspense fallback={<PageFallback />}><CongestionHeatmap /></Suspense> },
      { path: 'audit', element: <Suspense fallback={<PageFallback />}><FairnessAudit /></Suspense> },
      { path: 'sustainability', element: <Suspense fallback={<PageFallback />}><SustainabilityAnalytics /></Suspense> },
    ],
  },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
