import { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  BellOutlined,
  FileOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { getDashboardStats, type DashboardStatsDto } from '../../services/dashboard';
import dayjs from 'dayjs';

const httpMethodColors: Record<string, { bg: string; color: string }> = {
  GET: { bg: 'rgba(74, 127, 193, 0.1)', color: '#4A7FC1' },
  POST: { bg: 'rgba(61, 139, 110, 0.1)', color: '#3D8B6E' },
  PUT: { bg: 'rgba(212, 151, 59, 0.1)', color: '#D4973B' },
  DELETE: { bg: 'rgba(197, 75, 75, 0.08)', color: '#C54B4B' },
  PATCH: { bg: 'rgba(148, 103, 189, 0.1)', color: '#7B61C1' },
};

const accentStyles: Record<string, { bg: string; color: string }> = {
  copper: { bg: 'rgba(194, 112, 62, 0.08)', color: '#C2703E' },
  info: { bg: 'rgba(74, 127, 193, 0.08)', color: '#4A7FC1' },
  success: { bg: 'rgba(61, 139, 110, 0.1)', color: '#3D8B6E' },
  warning: { bg: 'rgba(212, 151, 59, 0.1)', color: '#D4973B' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface StatItem {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: 'copper' | 'info' | 'success' | 'warning';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!stats) return <div>Failed to load dashboard data.</div>;

  const statCards: StatItem[] = [
    { icon: <UserOutlined />, value: stats.userCount, label: 'Total Users', accent: 'copper' },
    { icon: <TeamOutlined />, value: stats.roleCount, label: 'Roles', accent: 'info' },
    { icon: <BankOutlined />, value: stats.tenantCount, label: 'Tenants', accent: 'success' },
    { icon: <BellOutlined />, value: stats.unreadNotificationCount, label: 'Unread Notifications', accent: 'warning' },
    { icon: <FileOutlined />, value: stats.totalFileCount, label: 'Files', accent: 'info' },
    { icon: <DatabaseOutlined />, value: formatBytes(stats.totalFileSize), label: 'Storage', accent: 'success' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {statCards.map((stat, i) => {
          const style = accentStyles[stat.accent];
          return (
            <div
              key={stat.label}
              className={`ce-stat-card ce-stagger-${i + 1}`}
              data-accent={stat.accent}
            >
              <div
                className="ce-stat-icon"
                style={{ background: style.bg, color: style.color }}
              >
                {stat.icon}
              </div>
              <div className="ce-stat-value">{stat.value}</div>
              <div className="ce-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <Card title="Recent Activity" style={{ marginTop: 24 }}>
        <Table
          dataSource={stats.recentAuditLogs}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: 'User',
              dataIndex: 'userName',
              key: 'userName',
              render: (v: string) => v || '-',
            },
            {
              title: 'Method',
              dataIndex: 'httpMethod',
              key: 'httpMethod',
              render: (v: string) => {
                if (!v) return '-';
                const style = httpMethodColors[v];
                return (
                  <Tag
                    style={
                      style
                        ? { background: style.bg, color: style.color }
                        : undefined
                    }
                  >
                    {v}
                  </Tag>
                );
              },
            },
            {
              title: 'URL',
              dataIndex: 'url',
              key: 'url',
              ellipsis: true,
              render: (v: string) =>
                v ? <span className="ce-mono">{v}</span> : '-',
            },
            {
              title: 'Status',
              dataIndex: 'httpStatusCode',
              key: 'httpStatusCode',
              render: (v: number) => {
                if (!v) return '-';
                const isOk = v < 400;
                const isWarn = v >= 400 && v < 500;
                const bg = isOk
                  ? 'rgba(61, 139, 110, 0.1)'
                  : isWarn
                    ? 'rgba(212, 151, 59, 0.1)'
                    : 'rgba(197, 75, 75, 0.08)';
                const color = isOk ? '#3D8B6E' : isWarn ? '#D4973B' : '#C54B4B';
                return <Tag style={{ background: bg, color }}>{v}</Tag>;
              },
            },
            {
              title: 'Duration',
              dataIndex: 'executionDuration',
              key: 'executionDuration',
              render: (v: number) => <span className="ce-mono">{v}ms</span>,
            },
            {
              title: 'Time',
              dataIndex: 'executionTime',
              key: 'executionTime',
              render: (v: string) => dayjs(v).format('HH:mm:ss'),
            },
          ]}
        />
      </Card>
    </div>
  );
}
