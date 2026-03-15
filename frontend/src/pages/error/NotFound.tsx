import { useNavigate } from 'react-router-dom';

export default function NotFound() {
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
      {/* Blueprint grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(26,32,53,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,32,53,0.03) 1px, transparent 1px),
          linear-gradient(rgba(26,32,53,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,32,53,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
      }} />

      {/* Decorative dashed path that leads nowhere */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} preserveAspectRatio="none">
        <defs>
          <pattern id="diag" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0,6 L6,0" stroke="#C2703E" strokeWidth="0.5" />
          </pattern>
        </defs>
        <path d="M0,400 L200,400 L200,250 L450,250 L450,400 L600,400" fill="none" stroke="#C2703E" strokeWidth="1.5" strokeDasharray="8,6" />
        <path d="M700,200 L900,200 L900,350 L1100,350" fill="none" stroke="#C2703E" strokeWidth="1.5" strokeDasharray="8,6" />
        <rect x="190" y="240" width="270" height="170" fill="url(#diag)" stroke="#C2703E" strokeWidth="1" strokeDasharray="4,4" rx="2" />
        <circle cx="200" cy="400" r="4" fill="#C2703E" />
        <circle cx="450" cy="250" r="4" fill="none" stroke="#C2703E" strokeWidth="1.5" />
        <text x="300" y="230" fill="#C2703E" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="2">SECTION NOT FOUND</text>
      </svg>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        animation: 'ce-fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {/* The big 404 as architectural element */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <div style={{
            fontSize: 'clamp(120px, 20vw, 220px)',
            fontWeight: 800,
            color: 'transparent',
            WebkitTextStroke: '2px #E8E4DE',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            userSelect: 'none',
          }}>
            404
          </div>
          {/* Copper overlay number, offset */}
          <div style={{
            position: 'absolute',
            top: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(120px, 20vw, 220px)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #C2703E 0%, #D4973B 60%, #C2703E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            userSelect: 'none',
            opacity: 0.15,
          }}>
            404
          </div>

          {/* Dimension lines */}
          <svg style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 300, height: 20, overflow: 'visible' }}>
            <line x1="20" y1="10" x2="280" y2="10" stroke="#C2703E" strokeWidth="0.75" />
            <line x1="20" y1="5" x2="20" y2="15" stroke="#C2703E" strokeWidth="0.75" />
            <line x1="280" y1="5" x2="280" y2="15" stroke="#C2703E" strokeWidth="0.75" />
            <text x="150" y="7" fill="#C2703E" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">UNDEFINED ROUTE</text>
          </svg>
        </div>

        <h2 style={{
          margin: '0 0 12px',
          fontSize: 24,
          fontWeight: 700,
          color: '#2D3142',
          letterSpacing: '-0.3px',
        }}>
          Blueprint not found
        </h2>
        <p style={{
          margin: '0 0 36px',
          fontSize: 15,
          color: '#7A7D8E',
          maxWidth: 400,
          lineHeight: 1.6,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          The section you're looking for doesn't exist in this build.
          It may have been moved, renamed, or hasn't been drafted yet.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
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
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
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
            Go Back
          </button>
        </div>

        {/* Footer coordinates */}
        <div style={{
          marginTop: 48,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#A7A9B7',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          CoreEngine v1.0 &middot; Section {window.location.pathname} &middot; Status 404
        </div>
      </div>
    </div>
  );
}
