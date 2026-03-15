import { useEffect, useState, useCallback, useRef } from 'react';
import { Spin } from 'antd';
import {
  ReloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  ClockCircleOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { getHealthStatus, type HealthReport } from '../../services/health';
import api from '../../services/api';

/* ── Helpers ── */

const statusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'healthy') return '#30D158';
  if (s === 'unhealthy') return '#FF3B30';
  return '#FF9F0A'; // degraded / unknown
};

const statusIcon = (status: string, size = 14) => {
  const s = status.toLowerCase();
  if (s === 'healthy') return <CheckCircleFilled style={{ color: '#30D158', fontSize: size }} />;
  if (s === 'unhealthy') return <CloseCircleFilled style={{ color: '#FF3B30', fontSize: size }} />;
  return <WarningFilled style={{ color: '#FF9F0A', fontSize: size }} />;
};

const parseDuration = (dur: string): string => {
  // Format "00:00:00.0308832" → "30.88 ms"
  const parts = dur.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const secs = parseFloat(parts[2]);
    const totalMs = (hours * 3600 + mins * 60 + secs) * 1000;
    if (totalMs < 1) return `${(totalMs * 1000).toFixed(0)} μs`;
    if (totalMs < 1000) return `${totalMs.toFixed(2)} ms`;
    return `${(totalMs / 1000).toFixed(2)} s`;
  }
  return dur;
};

/* ── API Endpoint definitions ── */

interface EndpointCheck {
  name: string;
  url: string;
  status: 'pending' | 'ok' | 'error';
  responseTime: number | null;
}

const ENDPOINTS = [
  { name: 'App Config', url: '/api/abp/application-configuration' },
  { name: 'Auth Server', url: '/.well-known/openid-configuration' },
  { name: 'Identity API', url: '/api/identity/users?maxResultCount=1' },
  { name: 'Tenant API', url: '/api/multi-tenancy/tenants?maxResultCount=1' },
];

/* ── Component ── */

export default function HealthPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [endpoints, setEndpoints] = useState<EndpointCheck[]>(
    ENDPOINTS.map((e) => ({ ...e, status: 'pending', responseTime: null })),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Uptime history — stores last 60 check results
  const [uptimeHistory, setUptimeHistory] = useState<{ time: Date; status: string; duration: number }[]>(() => {
    try {
      const stored = localStorage.getItem('ce-uptime-history');
      if (stored) return JSON.parse(stored).map((h: any) => ({ ...h, time: new Date(h.time) }));
    } catch { /* */ }
    return [];
  });

  const fetchHealth = useCallback(async () => {
    try {
      const res = await getHealthStatus();
      setReport(res.data);
      // Record uptime history
      const dur = parseDuration(res.data.totalDuration);
      const entry = { time: new Date(), status: res.data.status, duration: parseFloat(dur) || 0 };
      setUptimeHistory((prev) => {
        const updated = [...prev, entry].slice(-60); // keep last 60
        try { localStorage.setItem('ce-uptime-history', JSON.stringify(updated)); } catch { /* */ }
        return updated;
      });
    } catch {
      setReport(null);
      const entry = { time: new Date(), status: 'Unreachable', duration: 0 };
      setUptimeHistory((prev) => {
        const updated = [...prev, entry].slice(-60);
        try { localStorage.setItem('ce-uptime-history', JSON.stringify(updated)); } catch { /* */ }
        return updated;
      });
    }
    setLastCheck(new Date());
    setLoading(false);
  }, []);

  const pingEndpoints = useCallback(async () => {
    const results = await Promise.all(
      ENDPOINTS.map(async (ep) => {
        const start = performance.now();
        try {
          await api.get(ep.url, { timeout: 10000 });
          return { ...ep, status: 'ok' as const, responseTime: Math.round(performance.now() - start) };
        } catch {
          return { ...ep, status: 'error' as const, responseTime: Math.round(performance.now() - start) };
        }
      }),
    );
    setEndpoints(results);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchHealth(), pingEndpoints()]);
  }, [fetchHealth, pingEndpoints]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const entries = report ? Object.entries(report.entries) : [];
  const healthyCount = entries.filter(([, e]) => e.status.toLowerCase() === 'healthy').length;
  const failedCount = entries.length - healthyCount;

  /* ── Shared card style ── */
  const card: React.CSSProperties = {
    background: 'var(--ce-bg-card)',
    border: '1px solid var(--ce-border-light)',
    borderRadius: 'var(--ce-radius)',
    overflow: 'hidden',
  };

  const sectionHeader: React.CSSProperties = {
    padding: '14px 18px',
    borderBottom: '1px solid var(--ce-border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ce-text)',
  };

  if (loading && !report) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="ce-page-enter">
      {/* ─── Top Summary Bar ─── */}
      <div
        style={{
          ...card,
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          gap: 24,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Overall status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {report ? statusIcon(report.status, 20) : <CloseCircleFilled style={{ color: '#FF3B30', fontSize: 20 }} />}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ce-text)', letterSpacing: -0.3 }}>
              {report?.status || 'Unreachable'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>Overall Status</div>
          </div>
        </div>

        <div style={{ width: 1, height: 36, background: 'var(--ce-border-light)' }} />

        {/* Total duration */}
        <div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: 'var(--ce-text)', letterSpacing: -0.3,
            fontFamily: 'var(--ce-mono)',
          }}>
            {report ? parseDuration(report.totalDuration) : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>Total Duration</div>
        </div>

        <div style={{ width: 1, height: 36, background: 'var(--ce-border-light)' }} />

        {/* Checks passed/failed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#30D158', fontVariantNumeric: 'tabular-nums' }}>
              {healthyCount}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>passed</span>
            {failedCount > 0 && (
              <>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#FF3B30', fontVariantNumeric: 'tabular-nums' }}>
                  {failedCount}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>failed</span>
              </>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>Health Checks</div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Last check */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClockCircleOutlined style={{ fontSize: 12, color: 'var(--ce-text-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>
            {lastCheck ? `Last check: ${lastCheck.toLocaleTimeString()}` : '—'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', border: '1px solid var(--ce-border)',
            borderRadius: 8, background: 'var(--ce-bg-card)', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, color: 'var(--ce-text-secondary)',
            fontFamily: 'inherit', transition: 'all 0.15s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'var(--ce-accent)'; e.currentTarget.style.color = 'var(--ce-accent)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; e.currentTarget.style.color = 'var(--ce-text-secondary)'; }}
        >
          <ReloadOutlined spin={loading} />
          Refresh
        </button>
      </div>

      {/* ─── Uptime Timeline ─── */}
      {uptimeHistory.length > 1 && (
        <div style={{ ...card, marginBottom: 20, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ce-text)' }}>
              Uptime Timeline
            </span>
            <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>
              Last {uptimeHistory.length} checks &middot; {(() => {
                const first = uptimeHistory[0]?.time;
                const last = uptimeHistory[uptimeHistory.length - 1]?.time;
                if (!first || !last) return '';
                const diffMs = new Date(last).getTime() - new Date(first).getTime();
                const mins = Math.round(diffMs / 60000);
                if (mins < 60) return `${mins}m span`;
                return `${Math.round(mins / 60)}h ${mins % 60}m span`;
              })()}
            </span>
          </div>
          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 48 }}>
            {uptimeHistory.map((h, i) => {
              const isHealthy = h.status.toLowerCase() === 'healthy';
              const isUnreachable = h.status.toLowerCase() === 'unreachable';
              const color = isHealthy ? '#30D158' : isUnreachable ? '#FF3B30' : '#FF9F0A';
              const maxDur = Math.max(...uptimeHistory.map((x) => x.duration), 1);
              const barH = Math.max(6, (h.duration / maxDur) * 44);
              return (
                <div
                  key={i}
                  title={`${new Date(h.time).toLocaleTimeString()} — ${h.status} (${h.duration.toFixed(1)}ms)`}
                  style={{
                    flex: 1,
                    height: barH,
                    background: color,
                    borderRadius: 2,
                    opacity: 0.8,
                    transition: 'opacity 0.1s, height 0.3s',
                    cursor: 'default',
                    minWidth: 3,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                />
              );
            })}
          </div>
          {/* Time labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--ce-text-muted)', fontFamily: 'var(--ce-mono)' }}>
              {uptimeHistory[0]?.time ? new Date(uptimeHistory[0].time).toLocaleTimeString() : ''}
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ce-text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: '#30D158' }} /> Healthy
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ce-text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: '#FF9F0A' }} /> Degraded
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ce-text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: '#FF3B30' }} /> Down
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--ce-text-muted)', fontFamily: 'var(--ce-mono)' }}>
              {uptimeHistory[uptimeHistory.length - 1]?.time ? new Date(uptimeHistory[uptimeHistory.length - 1].time).toLocaleTimeString() : ''}
            </span>
          </div>
        </div>
      )}

      {/* ─── Health Checks Grid ─── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={sectionHeader}>
          <span style={sectionTitle}>
            <DatabaseOutlined style={{ marginRight: 8, opacity: 0.5 }} />
            Health Checks
          </span>
          <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>{entries.length} check{entries.length !== 1 && 's'}</span>
        </div>

        {entries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ce-text-muted)', fontSize: 13 }}>
            {report ? 'No health checks configured' : 'Health endpoint unreachable'}
          </div>
        ) : (
          <div>
            {entries.map(([name, entry], i) => (
              <div
                key={name}
                style={{
                  background: 'var(--ce-bg-card)',
                  padding: '18px 20px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--ce-border-light)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ce-bg-card)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Left: Status + Info */}
                  <div style={{ flex: 1 }}>
                    {/* Name + status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {statusIcon(entry.status, 16)}
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ce-text)' }}>{name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        color: statusColor(entry.status), letterSpacing: 0.5,
                        padding: '1px 8px', borderRadius: 10,
                        background: `${statusColor(entry.status)}12`,
                      }}>
                        {entry.status}
                      </span>
                    </div>

                    {/* Description */}
                    {entry.description && (
                      <div style={{ fontSize: 12, color: 'var(--ce-text-secondary)', marginBottom: 10, lineHeight: 1.5, paddingLeft: 24 }}>
                        {entry.description}
                      </div>
                    )}

                    {/* Duration + Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 24 }}>
                      <span style={{
                        fontFamily: 'var(--ce-mono)', fontSize: 11, fontWeight: 600,
                        color: 'var(--ce-text)', background: 'var(--ce-bg-inset)',
                        padding: '3px 10px', borderRadius: 4,
                      }}>
                        {parseDuration(entry.duration)}
                      </span>
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: 0.5, color: 'var(--ce-text-muted)',
                            padding: '3px 8px', borderRadius: 4,
                            border: '1px solid var(--ce-border-light)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Response Time Visual Bar */}
                  <div style={{ width: 160, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--ce-text-muted)', marginBottom: 6, textAlign: 'right' }}>
                      Response Time
                    </div>
                    <div style={{
                      height: 6, background: 'var(--ce-bg-inset)', borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: statusColor(entry.status),
                        width: `${Math.min(100, (parseFloat(parseDuration(entry.duration)) / 100) * 100)}%`,
                        minWidth: 8,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{
                      fontSize: 18, fontWeight: 700, color: 'var(--ce-text)',
                      fontFamily: 'var(--ce-mono)', textAlign: 'right', marginTop: 4,
                      letterSpacing: -0.5,
                    }}>
                      {parseDuration(entry.duration)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Two-column layout ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* API Endpoints */}
        <div style={card}>
          <div style={sectionHeader}>
            <span style={sectionTitle}>
              <ApiOutlined style={{ marginRight: 8, opacity: 0.5 }} />
              API Endpoints
            </span>
            <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>{ENDPOINTS.length} endpoints</span>
          </div>

          <div>
            {endpoints.map((ep, i) => (
              <div
                key={ep.url}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 18px',
                  borderBottom: i < endpoints.length - 1 ? '1px solid var(--ce-border-light)' : 'none',
                  transition: 'background 0.08s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Status icon */}
                <span style={{ flexShrink: 0 }}>
                  {ep.status === 'pending' ? (
                    <Spin size="small" />
                  ) : ep.status === 'ok' ? (
                    <CheckCircleFilled style={{ color: '#30D158', fontSize: 15 }} />
                  ) : (
                    <CloseCircleFilled style={{ color: '#FF3B30', fontSize: 15 }} />
                  )}
                </span>

                {/* Name + URL */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ce-text)' }}>{ep.name}</div>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--ce-mono)',
                    color: 'var(--ce-text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    GET {ep.url}
                  </div>
                </div>

                {/* Response time */}
                <span style={{
                  fontFamily: 'var(--ce-mono)', fontSize: 12, fontWeight: 600,
                  color: ep.status === 'ok'
                    ? (ep.responseTime! < 500 ? '#30D158' : '#FF9F0A')
                    : ep.status === 'error' ? '#FF3B30' : 'var(--ce-text-muted)',
                  flexShrink: 0,
                }}>
                  {ep.responseTime !== null ? `${ep.responseTime} ms` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div style={card}>
          <div style={sectionHeader}>
            <span style={sectionTitle}>
              <CloudServerOutlined style={{ marginRight: 8, opacity: 0.5 }} />
              System Information
            </span>
          </div>

          <div>
            {[
              { label: 'Platform', value: 'ABP Framework 10.1.0', color: '#007AFF' },
              { label: 'Runtime', value: '.NET 10', color: '#512BD4' },
              { label: 'Frontend', value: 'React 19 + Vite', color: '#61DAFB' },
              { label: 'Database', value: 'MS SQL Server', color: '#CC2927' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--ce-border-light)' : 'none',
                  transition: 'background 0.08s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 12, color: 'var(--ce-text-secondary)' }}>{item.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: item.color, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--ce-text)',
                    fontFamily: 'var(--ce-mono)',
                  }}>
                    {item.value}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Engine footer */}
          <div style={{
            padding: 14,
            background: 'var(--ce-bg-inset)',
            borderTop: '1px solid var(--ce-border-light)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--ce-mono)', fontSize: 10, fontWeight: 500,
              color: 'var(--ce-text-muted)', letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              CoreEngine v1.0 &middot; Health Monitor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
