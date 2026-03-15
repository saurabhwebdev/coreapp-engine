import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
}

export default function ErrorPage({
  code = 500,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. The engineering team has been notified. Please try again or contact support if the issue persists.',
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F5F2',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Cracked foundation pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} preserveAspectRatio="none" viewBox="0 0 1200 800">
        {/* Crack lines radiating from center */}
        <g stroke="#C54B4B" strokeWidth="1.5" fill="none">
          <path d="M600,400 L620,340 L650,280 L640,200 L660,120" />
          <path d="M600,400 L560,350 L520,320 L480,260 L440,180" />
          <path d="M600,400 L580,450 L550,520 L560,600 L540,680" />
          <path d="M600,400 L660,430 L720,450 L780,440 L860,460" />
          <path d="M600,400 L540,410 L470,430 L400,420 L320,440" />
          <path d="M650,280 L700,260 L760,270" />
          <path d="M520,320 L500,280 L460,270" />
          <path d="M660,430 L680,480 L720,520" />
          <path d="M540,410 L510,450 L480,500" />
        </g>
        {/* Impact point */}
        <circle cx="600" cy="400" r="8" fill="none" stroke="#C54B4B" strokeWidth="2" />
        <circle cx="600" cy="400" r="20" fill="none" stroke="#C54B4B" strokeWidth="0.5" strokeDasharray="3,3" />
        <circle cx="600" cy="400" r="40" fill="none" stroke="#C54B4B" strokeWidth="0.3" strokeDasharray="2,4" />
      </svg>

      {/* Subtle noise overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(26,32,53,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,32,53,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        animation: 'ce-fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        maxWidth: 520,
        padding: '0 24px',
      }}>
        {/* Error code with "structural failure" look */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          {/* Warning symbol */}
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(197, 75, 75, 0.08)',
            border: '1px solid rgba(197, 75, 75, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C54B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Error code */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: '#C54B4B',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(197, 75, 75, 0.06)',
            borderRadius: 6,
            border: '1px solid rgba(197, 75, 75, 0.1)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#C54B4B',
              animation: 'ce-error-pulse 2s ease-in-out infinite',
            }} />
            Error {code}
          </div>
        </div>

        <h2 style={{
          margin: '0 0 12px',
          fontSize: 26,
          fontWeight: 700,
          color: '#2D3142',
          letterSpacing: '-0.3px',
        }}>
          {title}
        </h2>

        <p style={{
          margin: '0 0 36px',
          fontSize: 15,
          color: '#7A7D8E',
          lineHeight: 1.7,
        }}>
          {message}
        </p>

        {/* Diagnostic info box */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: 10,
          padding: 16,
          marginBottom: 32,
          textAlign: 'left',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 1, color: '#A7A9B7', marginBottom: 10,
          }}>
            Diagnostic
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '6px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            <span style={{ color: '#A7A9B7' }}>Timestamp</span>
            <span style={{ color: '#2D3142' }}>{new Date().toISOString()}</span>
            <span style={{ color: '#A7A9B7' }}>Path</span>
            <span style={{ color: '#2D3142' }}>{window.location.pathname}</span>
            <span style={{ color: '#A7A9B7' }}>Status</span>
            <span style={{ color: '#C54B4B' }}>{code} Internal Error</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: '#C2703E',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(194,112,62,0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(194,112,62,0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(194,112,62,0.25)'; }}
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              color: '#2D3142',
              border: '1px solid #E8E4DE',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C2703E'; e.currentTarget.style.color = '#C2703E'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E4DE'; e.currentTarget.style.color = '#2D3142'; }}
          >
            Dashboard
          </button>
        </div>

        <div style={{
          marginTop: 48,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#A7A9B7',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          CoreEngine v1.0 &middot; Incident logged &middot; Support notified
        </div>
      </div>

      <style>{`
        @keyframes ce-error-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
