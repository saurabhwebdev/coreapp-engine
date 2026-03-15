import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      const returnUrl = sessionStorage.getItem('returnUrl') || '/';
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl, { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  if (auth.error) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: 'var(--ce-bg)', fontFamily: 'var(--ce-font)',
      }}>
        <div style={{
          background: 'var(--ce-bg-card)', borderRadius: 14, padding: '40px 48px',
          boxShadow: 'var(--ce-shadow-lg)', textAlign: 'center', maxWidth: 420,
          border: '1px solid var(--ce-border-light)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--ce-danger-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 24, color: 'var(--ce-danger)',
          }}>!</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--ce-text)' }}>
            Authentication Failed
          </h3>
          <p style={{ margin: '0 0 24px', color: 'var(--ce-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            {auth.error.message}
          </p>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '10px 24px',
              background: 'var(--ce-accent)', color: '#fff', borderRadius: 8,
              textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: 'var(--ce-bg)', fontFamily: 'var(--ce-font)', gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--ce-accent, #C2703E), var(--ce-accent-hover, #B5642F))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 16,
        animation: 'ce-pulse 1.5s ease-in-out infinite',
      }}>
        CE
      </div>
      <div style={{ color: 'var(--ce-text-secondary)', fontSize: 14, fontWeight: 500 }}>
        Signing you in...
      </div>
      <style>{`
        @keyframes ce-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
