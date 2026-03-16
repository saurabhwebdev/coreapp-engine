import { useState, useEffect } from 'react';
import { Button, message, Spin } from 'antd';
import { CopyOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

export default function ElsaStudioPage() {
  const [elsaStatus, setElsaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const elsaUrl = `${window.location.protocol}//${window.location.hostname}:44305`;

  useEffect(() => {
    // Check if Elsa API is reachable
    fetch(`${elsaUrl}/elsa/api/descriptors/activities`, { method: 'HEAD' })
      .then((res) => setElsaStatus(res.ok || res.status === 401 ? 'online' : 'offline'))
      .catch(() => setElsaStatus('offline'));
  }, []);

  const handleCopyToken = async () => {
    try {
      const res = await fetch(`${elsaUrl}/elsa/api/identity/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password' }),
      });
      const data = await res.json();
      if (data.accessToken) {
        await navigator.clipboard.writeText(data.accessToken);
        message.success('Elsa JWT token copied to clipboard');
      } else {
        message.error('Failed to get token');
      }
    } catch {
      message.error('Could not connect to Elsa API');
    }
  };

  return (
    <div className="ce-page-enter">
      {/* Status */}
      <div style={{
        background: 'var(--ce-bg-card)', border: '1px solid var(--ce-border-light)',
        borderRadius: 'var(--ce-radius)', padding: 20, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {elsaStatus === 'checking' ? (
              <Spin size="small" />
            ) : elsaStatus === 'online' ? (
              <CheckCircleFilled style={{ color: 'var(--ce-success)', fontSize: 18 }} />
            ) : (
              <CloseCircleFilled style={{ color: 'var(--ce-danger)', fontSize: 18 }} />
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ce-text)' }}>
                Elsa Workflow Engine
              </div>
              <div style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>
                {elsaStatus === 'online' ? 'Running and connected' : elsaStatus === 'offline' ? 'Not reachable' : 'Checking...'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<CopyOutlined />} onClick={handleCopyToken} disabled={elsaStatus !== 'online'}>
              Copy API Token
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{
          background: 'var(--ce-bg-card)', border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)', padding: 20,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ce-text)', marginBottom: 8 }}>
            Elsa API Endpoints
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Workflow Definitions', path: '/elsa/api/workflow-definitions' },
              { label: 'Workflow Instances', path: '/elsa/api/workflow-instances' },
              { label: 'Activity Descriptors', path: '/elsa/api/descriptors/activities' },
              { label: 'Identity Login', path: '/elsa/api/identity/login' },
            ].map((ep) => (
              <div key={ep.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ce-text-secondary)' }}>{ep.label}</span>
                <span className="ce-mono" style={{ fontSize: 11 }}>{ep.path}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--ce-bg-card)', border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)', padding: 20,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ce-text)', marginBottom: 8 }}>
            Elsa Studio (Visual Designer)
          </div>
          <div style={{ fontSize: 13, color: 'var(--ce-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            Elsa Studio is a Blazor WebAssembly app that provides a drag-and-drop workflow designer.
            It connects to the Elsa API running on this server.
          </div>
          <div style={{ fontSize: 12, color: 'var(--ce-text-muted)', marginBottom: 12 }}>
            To set up Elsa Studio, run the Docker image:
          </div>
          <div style={{
            background: 'var(--ce-bg-inset)', borderRadius: 6, padding: '10px 12px',
            fontFamily: 'var(--ce-mono)', fontSize: 11, color: 'var(--ce-text)',
            lineHeight: 1.8,
          }}>
            docker run -d -p 5173:8080 \<br/>
            &nbsp;&nbsp;-e ELSASERVER__URL=https://host.docker.internal:44305/elsa/api \<br/>
            &nbsp;&nbsp;elsa-workflows/elsa-studio-v3:latest
          </div>
        </div>
      </div>

      {/* Quick Test */}
      <div style={{
        background: 'var(--ce-bg-card)', border: '1px solid var(--ce-border-light)',
        borderRadius: 'var(--ce-radius)', padding: 20,
      }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ce-text)', marginBottom: 8 }}>
          Integration Info
        </div>
        <div className="ce-settings-group" style={{ marginBottom: 0 }}>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Engine</span>
            <span className="ce-mono">Elsa Workflows 3.6.0 (MIT License)</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Persistence</span>
            <span className="ce-mono">SQL Server (EF Core) — same database as CoreApp</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Schema</span>
            <span className="ce-mono">[Elsa].* (10 tables)</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Activities</span>
            <span className="ce-mono">48 built-in (HTTP, Scheduling, Control Flow, etc.)</span>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Auth</span>
            <span className="ce-mono">JWT via /elsa/api/identity/login (admin/password)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
