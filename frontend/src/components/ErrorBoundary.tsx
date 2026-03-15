import { Component, type ReactNode } from 'react';
import { Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: 'var(--ce-bg, #FAFAFA)',
          fontFamily: "'DM Sans', -apple-system, sans-serif",
          padding: 24,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            {/* Animated broken box */}
            <div style={{
              width: 80, height: 80, margin: '0 auto 24px',
              position: 'relative',
              animation: 'ceSnapShake 0.6s ease-in-out',
            }}>
              <div style={{
                width: 50, height: 40, borderRadius: 8,
                border: '2px solid #FF3B30', background: 'rgba(255, 59, 48, 0.06)',
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
              }} />
              <div style={{
                width: 56, height: 8, borderRadius: 4,
                background: '#FF3B30', opacity: 0.3,
                position: 'absolute', bottom: 46, left: '50%',
                transform: 'translateX(-50%) rotate(-8deg)',
              }} />
              {/* Crack line */}
              <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 80 80">
                <path d="M30 25 L40 40 L35 55 L42 70" stroke="#FF3B30" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>

            <h2 style={{
              margin: '0 0 8px', fontSize: 22, fontWeight: 700,
              color: 'var(--ce-text, #1D1D1F)', letterSpacing: -0.3,
            }}>
              Oh snap!
            </h2>
            <p style={{
              margin: '0 0 8px', fontSize: 14, color: 'var(--ce-text-secondary, #86868B)',
              lineHeight: 1.6,
            }}>
              Something went wrong while rendering this page.
            </p>

            {/* Error details */}
            {this.state.error && (
              <div style={{
                margin: '16px 0', padding: 12, borderRadius: 8,
                background: 'rgba(255, 59, 48, 0.04)',
                border: '1px solid rgba(255, 59, 48, 0.1)',
                textAlign: 'left',
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  color: '#FF3B30', wordBreak: 'break-word', lineHeight: 1.5,
                }}>
                  {this.state.error.message}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                style={{ background: '#C2703E', borderColor: '#C2703E' }}
              >
                Reload Page
              </Button>
              <Button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}>
                Go to Dashboard
              </Button>
            </div>

            <div style={{
              marginTop: 32, fontSize: 11, color: 'var(--ce-text-muted, #AEAEB2)',
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
            }}>
              COREENGINE ERROR BOUNDARY
            </div>

            <style>{`
              @keyframes ceSnapShake {
                0% { transform: scale(1); }
                15% { transform: scale(1.05) rotate(-2deg); }
                30% { transform: scale(0.98) rotate(1deg); }
                45% { transform: scale(1.02) rotate(-1deg); }
                60% { transform: scale(0.99); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
