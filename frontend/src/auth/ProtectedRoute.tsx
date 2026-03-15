import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      sessionStorage.setItem('returnUrl', window.location.pathname);
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  if (auth.isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#F7F5F2', fontFamily: "'Plus Jakarta Sans', sans-serif", gap: 20,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #C2703E 0%, #D4973B 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 16,
          animation: 'ce-load-pulse 1.5s ease-in-out infinite',
        }}>
          CE
        </div>
        <div style={{ color: '#7A7D8E', fontSize: 14, fontWeight: 500 }}>Loading...</div>
        <style>{`
          @keyframes ce-load-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
