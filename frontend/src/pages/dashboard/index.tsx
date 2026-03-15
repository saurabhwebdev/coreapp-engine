import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  BellOutlined,
  FileOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { getDashboardStats, type DashboardStatsDto } from '../../services/dashboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const methodColors: Record<string, string> = {
  GET: '#007AFF', POST: '#30D158', PUT: '#FF9F0A', DELETE: '#FF3B30', PATCH: '#AF52DE',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!stats) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ce-text-muted)' }}>Failed to load dashboard.</div>;

  const metrics = [
    { icon: <UserOutlined />, value: stats.userCount, label: 'Users', color: '#C2703E' },
    { icon: <TeamOutlined />, value: stats.roleCount, label: 'Roles', color: '#007AFF' },
    { icon: <BankOutlined />, value: stats.tenantCount, label: 'Tenants', color: '#30D158' },
    { icon: <BellOutlined />, value: stats.unreadNotificationCount, label: 'Unread', color: '#FF9F0A' },
    { icon: <FileOutlined />, value: stats.totalFileCount, label: 'Files', color: '#AF52DE' },
    { icon: <CloudOutlined />, value: formatBytes(stats.totalFileSize), label: 'Storage', color: '#007AFF' },
  ];

  return (
    <div className="ce-page-enter">
      {/* ─── Metrics Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 1,
        background: 'var(--ce-border-light)',
        borderRadius: 'var(--ce-radius)',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`ce-stagger-${i + 1}`}
            style={{
              background: 'var(--ce-bg-card)',
              padding: '20px 16px',
              textAlign: 'center',
              transition: 'background 0.12s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ce-bg-card)'; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${m.color}10`, color: m.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, marginBottom: 10,
            }}>
              {m.icon}
            </div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: 'var(--ce-text)',
              letterSpacing: -1, lineHeight: 1, marginBottom: 4,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {m.value}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 500, color: 'var(--ce-text-muted)',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Two-column layout ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* Left: Activity Feed */}
        <div style={{
          background: 'var(--ce-bg-card)',
          border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--ce-border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ce-text)' }}>Recent Activity</span>
            <span style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>
              Last {stats.recentAuditLogs.length} requests
            </span>
          </div>

          {stats.recentAuditLogs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ce-text-muted)', fontSize: 13 }}>
              No recent activity
            </div>
          ) : (
            <div>
              {stats.recentAuditLogs.map((log, i) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 18px',
                    borderBottom: i < stats.recentAuditLogs.length - 1 ? '1px solid var(--ce-border-light)' : 'none',
                    transition: 'background 0.08s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Method badge */}
                  <span style={{
                    fontFamily: 'var(--ce-mono)', fontSize: 10, fontWeight: 600,
                    color: methodColors[log.httpMethod || ''] || 'var(--ce-text-muted)',
                    width: 40, textAlign: 'center', flexShrink: 0,
                    padding: '2px 0',
                    background: `${methodColors[log.httpMethod || ''] || '#888'}10`,
                    borderRadius: 4,
                  }}>
                    {log.httpMethod || '—'}
                  </span>

                  {/* URL */}
                  <span style={{
                    flex: 1, fontFamily: 'var(--ce-mono)', fontSize: 12,
                    color: 'var(--ce-text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {log.url || '—'}
                  </span>

                  {/* Status */}
                  <span style={{
                    fontFamily: 'var(--ce-mono)', fontSize: 11, fontWeight: 600, flexShrink: 0,
                    color: (log.httpStatusCode || 0) < 400
                      ? 'var(--ce-success)'
                      : (log.httpStatusCode || 0) < 500 ? 'var(--ce-warning)' : 'var(--ce-danger)',
                  }}>
                    {log.httpStatusCode || '—'}
                  </span>

                  {/* Duration */}
                  <span style={{
                    fontFamily: 'var(--ce-mono)', fontSize: 11,
                    color: 'var(--ce-text-muted)', flexShrink: 0, width: 48, textAlign: 'right',
                  }}>
                    {log.executionDuration}ms
                  </span>

                  {/* Time */}
                  <span style={{
                    fontSize: 11, color: 'var(--ce-text-muted)',
                    flexShrink: 0, width: 52, textAlign: 'right',
                  }}>
                    {dayjs(log.executionTime).format('HH:mm:ss')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Stats Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Platform Health */}
          <div style={{
            background: 'var(--ce-bg-card)',
            border: '1px solid var(--ce-border-light)',
            borderRadius: 'var(--ce-radius)',
            padding: 18,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ce-text)', marginBottom: 14 }}>
              Platform Health
            </div>
            {[
              { label: 'API Status', value: 'Operational', color: '#30D158' },
              { label: 'Database', value: 'Connected', color: '#30D158' },
              { label: 'Auth Server', value: 'Active', color: '#30D158' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--ce-border-light)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--ce-text-secondary)' }}>{item.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: item.color }}>{item.value}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'var(--ce-bg-card)',
            border: '1px solid var(--ce-border-light)',
            borderRadius: 'var(--ce-radius)',
            padding: 18,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ce-text)', marginBottom: 14 }}>
              Quick Summary
            </div>
            {[
              { label: 'Active Users', value: stats.userCount, sub: 'registered' },
              { label: 'Active Tenants', value: stats.tenantCount, sub: 'organizations' },
              { label: 'Unread Alerts', value: stats.unreadNotificationCount, sub: 'pending' },
              { label: 'Total Storage', value: formatBytes(stats.totalFileSize), sub: 'used' },
            ].map((item, i) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < 3 ? '1px solid var(--ce-border-light)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ce-text-secondary)' }}>{item.label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 18, fontWeight: 700, color: 'var(--ce-text)',
                    letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {item.value}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--ce-text-muted)', marginLeft: 4 }}>
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Engine Info */}
          <div style={{
            background: 'var(--ce-bg-inset)',
            border: '1px solid var(--ce-border-light)',
            borderRadius: 'var(--ce-radius)',
            padding: 14,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--ce-mono)', fontSize: 10, fontWeight: 500,
              color: 'var(--ce-text-muted)', letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              CoreEngine v1.0 &middot; ABP 10.1.0 &middot; .NET 10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
