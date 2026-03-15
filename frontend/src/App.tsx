import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { oidcConfig } from './auth/config';
import { applyColorThemeCss, getAntTokensForTheme } from './utils/theme';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthCallback from './auth/AuthCallback';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/dashboard';
import UsersPage from './pages/identity/users';
import RolesPage from './pages/identity/roles';
import TenantsPage from './pages/tenants';
import AuditLogsPage from './pages/audit-logs';
import BackgroundJobsPage from './pages/background-jobs';
import NotificationsPage from './pages/notifications';
import FilesPage from './pages/files';
import WorkflowsPage from './pages/workflows';
import WorkflowEditor from './pages/workflows/editor';
import ChatPage from './pages/chat';
import FormsPage from './pages/forms';
import ReportsPage from './pages/reports';
import HealthPage from './pages/health';
import SettingsPage from './pages/settings';
import ProfilePage from './pages/profile';
import NotFound from './pages/error/NotFound';
import ErrorPage from './pages/error/ErrorPage';
import EmptyState from './components/EmptyState';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const sharedTokens = {
  colorPrimary: '#C2703E',
  colorSuccess: '#34A853',
  colorWarning: '#EA8600',
  colorError: '#D93025',
  colorInfo: '#1A73E8',
  borderRadius: 8,
  borderRadiusSM: 5,
  borderRadiusLG: 12,
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  controlHeight: 36,
};

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedTokens,
    colorBgBase: '#FFFFFF',
    colorBgLayout: '#F8F8F8',
    colorBorder: '#E0E0E0',
    colorBorderSecondary: '#EBEBEB',
    colorText: '#1D1D1F',
    colorTextSecondary: '#6E6E73',
  },
};

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedTokens,
    colorPrimary: '#E08A4A',
    colorBgBase: '#1E1E1E',
    colorBgLayout: '#1E1E1E',
    colorBgContainer: '#2D2D2D',
    colorBorder: '#404040',
    colorBorderSecondary: '#353535',
    colorText: '#F5F5F5',
    colorTextSecondary: '#B3B3B3',
  },
};

export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ce-theme') === 'dark');
  const [, setThemeVersion] = useState(0);

  useEffect(() => {
    applyColorThemeCss();
    const handler = () => { setThemeVersion((v) => v + 1); };
    window.addEventListener('theme-changed', handler);
    return () => window.removeEventListener('theme-changed', handler);
  }, []);

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('ce-theme') === 'dark');
    window.addEventListener('storage', handler);
    // Also listen for our own theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { window.removeEventListener('storage', handler); observer.disconnect(); };
  }, []);

  // Test component to verify ErrorBoundary — navigate to /test-error
  function TestError(): never { throw new Error('This is a test error to verify the ErrorBoundary is working.'); }

  return (
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            ...(isDark ? darkTheme : lightTheme),
            token: {
              ...(isDark ? darkTheme : lightTheme).token,
              ...getAntTokensForTheme(isDark),
            },
          }}
          renderEmpty={() => <EmptyState compact title="No data" description="Nothing to display." />}
        >
          <AntApp>
            <BrowserRouter>
              <Routes>
                <Route path="/callback" element={<AuthCallback />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="identity/users" element={<UsersPage />} />
                  <Route path="identity/roles" element={<RolesPage />} />
                  <Route path="tenants" element={<TenantsPage />} />
                  <Route path="background-jobs" element={<BackgroundJobsPage />} />
                  <Route path="health" element={<HealthPage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="workflows" element={<WorkflowsPage />} />
                  <Route path="workflows/:id" element={<WorkflowEditor />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="forms" element={<FormsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="test-error" element={<TestError />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
