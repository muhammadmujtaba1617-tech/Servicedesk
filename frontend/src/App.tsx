import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout, AuthLayout } from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css'

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Main Pages
import Dashboard from './pages/Dashboard';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import AgentsPage from './pages/AgentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SLAPage from './pages/SLAPage';
import SettingsPage from './pages/SettingsPage';
const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page</p>
      <a href="/dashboard" className="btn-primary">
        Go to Dashboard
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Main Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<ProtectedRoute requiredRole={['admin']}><UsersPage /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute requiredRole={['admin']}><AgentsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute requiredRole={['admin', 'agent']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute requiredRole={['admin']}><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRole={['admin']}><SettingsPage /></ProtectedRoute>} />
            <Route path="/sla" element={<ProtectedRoute requiredRole={['agent']}><SLAPage /></ProtectedRoute>} />
          </Route>

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
