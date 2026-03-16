import { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ExportOutlined } from '@ant-design/icons';

export default function ElsaStudioPage() {
  const engineUrl = 'http://localhost:14000';
  const studioUrl = 'http://localhost:5014';
  const [engineStatus, setEngineStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [studioStatus, setStudioStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    fetch(`${engineUrl}/health`).then((r) => setEngineStatus(r.ok ? 'online' : 'offline')).catch(() => setEngineStatus('offline'));
    fetch(studioUrl).then((r) => setStudioStatus(r.ok ? 'online' : 'offline')).catch(() => setStudioStatus('offline'));
  }, []);

  const StatusDot = ({ status }: { status: string }) => (
    status === 'checking' ? <Spin size="small" /> :
    status === 'online' ? <CheckCircleFilled style={{ color: 'var(--ce-success)', fontSize: 16 }} /> :
    <CloseCircleFilled style={{ color: 'var(--ce-danger)', fontSize: 16 }} />
  );

  return (
    <div className="ce-page-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 'calc(100vh - 160px)', gap: 20,
    }}>
      <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--ce-text)' }}>
        Workflow Engine
      </div>

      {/* Status cards */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{
          padding: '16px 24px', borderRadius: 'var(--ce-radius)',
          border: '1px solid var(--ce-border-light)', background: 'var(--ce-bg-card)',
          display: 'flex', alignItems: 'center', gap: 10, minWidth: 200,
        }}>
          <StatusDot status={engineStatus} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ce-text)' }}>Elsa Engine</div>
            <div className="ce-mono" style={{ fontSize: 11 }}>localhost:14000</div>
          </div>
        </div>
        <div style={{
          padding: '16px 24px', borderRadius: 'var(--ce-radius)',
          border: '1px solid var(--ce-border-light)', background: 'var(--ce-bg-card)',
          display: 'flex', alignItems: 'center', gap: 10, minWidth: 200,
        }}>
          <StatusDot status={studioStatus} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ce-text)' }}>Elsa Studio</div>
            <div className="ce-mono" style={{ fontSize: 11 }}>localhost:5014</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--ce-text-muted)', textAlign: 'center', maxWidth: 450, lineHeight: 1.6 }}>
        {studioStatus === 'online'
          ? 'Both services running. Click below to open the visual workflow designer.'
          : engineStatus === 'online'
            ? 'Engine running but Studio is not reachable. Start it with: npm run dev:studio'
            : 'Services not running. Start all with: npm run dev'}
      </div>

      {studioStatus === 'online' && (
        <Button type="primary" size="large" icon={<ExportOutlined />}
          onClick={() => window.open(studioUrl, '_blank')} style={{ marginTop: 4 }}>
          Open Workflow Designer
        </Button>
      )}

      <div style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>
        Login: admin / password
      </div>
    </div>
  );
}
