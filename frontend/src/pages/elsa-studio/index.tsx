import { useEffect } from 'react';

export default function ElsaStudioPage() {
  const studioUrl = 'http://localhost:5014';

  useEffect(() => {
    window.open(studioUrl, '_blank');
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 130px)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--ce-accent), var(--ce-accent-hover))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 16,
      }}>
        CE
      </div>
      <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--ce-text)' }}>
        Elsa Workflow Designer
      </div>
      <div style={{ fontSize: 13, color: 'var(--ce-text-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
        The workflow designer opens in a new tab. If it didn't open automatically, click below.
      </div>
      <a
        href={studioUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '10px 24px', borderRadius: 8,
          background: 'var(--ce-accent)', color: '#fff',
          textDecoration: 'none', fontWeight: 600, fontSize: 14,
        }}
      >
        Open Workflow Designer
      </a>
      <div style={{ fontSize: 11, color: 'var(--ce-text-muted)', marginTop: 8 }}>
        Login: admin / password
      </div>
    </div>
  );
}
