import { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ExportOutlined } from '@ant-design/icons';

export default function ElsaStudioPage() {
  const elsaUrl = 'http://localhost:14000';
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    fetch(`${elsaUrl}/health`)
      .then((r) => setStatus(r.ok ? 'online' : 'offline'))
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <div className="ce-page-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 'calc(100vh - 160px)', gap: 16,
    }}>
      {status === 'checking' ? (
        <Spin size="large" />
      ) : status === 'online' ? (
        <CheckCircleFilled style={{ fontSize: 40, color: 'var(--ce-success)' }} />
      ) : (
        <CloseCircleFilled style={{ fontSize: 40, color: 'var(--ce-danger)' }} />
      )}

      <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--ce-text)' }}>
        Elsa Workflow Engine
      </div>
      <div style={{ fontSize: 13, color: 'var(--ce-text-muted)', textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
        {status === 'online'
          ? 'The workflow engine is running. Open Elsa Studio to design and manage workflows.'
          : status === 'offline'
            ? 'The workflow engine is not reachable. Make sure it\'s running on port 14000.'
            : 'Checking connection...'}
      </div>

      {status === 'online' && (
        <Button
          type="primary"
          size="large"
          icon={<ExportOutlined />}
          onClick={() => window.open(elsaUrl, '_blank')}
          style={{ marginTop: 8 }}
        >
          Open Elsa Studio
        </Button>
      )}

      <div style={{
        marginTop: 24, padding: 16, borderRadius: 'var(--ce-radius)',
        background: 'var(--ce-bg-inset)', border: '1px solid var(--ce-border-light)',
        maxWidth: 500, width: '100%',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 10 }}>
          Connection Details
        </div>
        <div className="ce-settings-group" style={{ marginBottom: 0 }}>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Server URL</span>
            <span className="ce-mono">{elsaUrl}</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Login</span>
            <span className="ce-mono">admin / password</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Database</span>
            <span className="ce-mono">Same as CoreApp (Elsa schema)</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Activities</span>
            <span className="ce-mono">48 built-in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
