import { useEffect } from 'react';

export default function ElsaStudioPage() {
  const studioUrl = `https://${window.location.hostname}:44305/elsa-studio/`;

  useEffect(() => {
    // Redirect to Elsa Studio in the same tab
    window.location.href = studioUrl;
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 130px)', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--ce-accent), var(--ce-accent-hover))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 16,
        animation: 'ce-load-pulse 1.5s ease-in-out infinite',
      }}>
        CE
      </div>
      <div style={{ color: 'var(--ce-text-muted)', fontSize: 14 }}>
        Opening Elsa Workflow Designer...
      </div>
      <a href={studioUrl} style={{ fontSize: 12, color: 'var(--ce-accent)' }}>
        Click here if not redirected
      </a>
      <style>{`
        @keyframes ce-load-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
