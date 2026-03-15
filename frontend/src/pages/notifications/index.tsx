import { useState, useEffect } from 'react';
import { Badge, Button, Space, Tag, message, Tabs } from 'antd';
import { CheckOutlined, DeleteOutlined, CheckCircleOutlined, BellOutlined } from '@ant-design/icons';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, type UserNotificationDto } from '../../services/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const severityConfig: Record<number, { color: string; label: string }> = {
  0: { color: '#4A7FC1', label: 'Info' },
  1: { color: '#3D8B6E', label: 'Success' },
  2: { color: '#D4973B', label: 'Warning' },
  3: { color: '#C54B4B', label: 'Error' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotificationDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stateFilter, setStateFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadNotifications = async (p = page, state = stateFilter) => {
    setLoading(true);
    try {
      const res = await getNotifications({ skipCount: (p - 1) * pageSize, maxResultCount: pageSize, state });
      setNotifications(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch { message.error('Failed to mark as read'); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      message.success('All marked as read');
      loadNotifications();
    } catch { message.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      message.success('Deleted');
      loadNotifications();
    } catch { message.error('Failed to delete'); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="ce-page-enter">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', marginBottom: 16,
        borderBottom: '1px solid var(--ce-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
            {totalCount} notification{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button icon={<CheckCircleOutlined />} onClick={handleMarkAllAsRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="ce-stagger-2">
        <Tabs
          activeKey={stateFilter === undefined ? 'all' : String(stateFilter)}
          onChange={(key) => {
            const state = key === 'all' ? undefined : Number(key);
            setStateFilter(state);
            setPage(1);
            loadNotifications(1, state);
          }}
          items={[
            { key: 'all', label: 'All' },
            { key: '0', label: 'Unread' },
            { key: '1', label: 'Read' },
          ]}
        />
      </div>

      <div className="ce-stagger-3">
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ce-text-muted)' }}>
            Loading...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="ce-empty">
            <div className="ce-empty-icon">
              <BellOutlined />
            </div>
            <div>No notifications</div>
          </div>
        )}

        {!loading && notifications.map((item) => {
          const severity = severityConfig[item.notification.severity] || severityConfig[0];
          const isUnread = item.state === 0;

          return (
            <div
              key={item.id}
              className={`ce-notif-card${isUnread ? ' ce-unread' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Space>
                    {isUnread && <Badge status="processing" />}
                    <Tag color={severity.color}>{severity.label}</Tag>
                    <strong style={{ color: 'var(--ce-text)' }}>{item.notification.title}</strong>
                  </Space>
                  <p style={{ margin: '6px 0 0', color: 'var(--ce-text-secondary)', fontSize: 13 }}>
                    {item.notification.message}
                  </p>
                  <small style={{ color: 'var(--ce-text-muted)', fontSize: 12 }}>
                    {dayjs(item.creationTime).fromNow()}
                  </small>
                </div>
                <Space>
                  {isUnread && (
                    <Button size="small" icon={<CheckOutlined />} onClick={() => handleMarkAsRead(item.id)}>
                      Read
                    </Button>
                  )}
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)} />
                </Space>
              </div>
            </div>
          );
        })}

        {!loading && totalCount > pageSize && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Space>
              <Button
                size="small"
                disabled={page <= 1}
                onClick={() => { const p = page - 1; setPage(p); loadNotifications(p); }}
              >
                Previous
              </Button>
              <span style={{ color: 'var(--ce-text-secondary)', fontSize: 13 }}>
                Page {page} of {totalPages}
              </span>
              <Button
                size="small"
                disabled={page >= totalPages}
                onClick={() => { const p = page + 1; setPage(p); loadNotifications(p); }}
              >
                Next
              </Button>
            </Space>
          </div>
        )}
      </div>
    </div>
  );
}
