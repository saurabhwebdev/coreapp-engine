import { useState, useEffect } from 'react';
import { Tag, DatePicker, Select, Input, Button, Space, Modal, Descriptions, Collapse } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from '../../components/DataTable';
import { getAuditLogs, getAuditLog, type AuditLogDto } from '../../services/audit-log';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const httpMethodColors: Record<string, string> = {
  GET: '#4A7FC1',
  POST: '#3D8B6E',
  PUT: '#D4973B',
  DELETE: '#C54B4B',
  PATCH: '#7A7D8E',
};

const getStatusColor = (code: number): string => {
  if (code < 400) return '#3D8B6E';
  if (code < 500) return '#D4973B';
  return '#C54B4B';
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [detailLog, setDetailLog] = useState<AuditLogDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const pageSize = 20;

  // Filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [httpMethod, setHttpMethod] = useState<string | undefined>();
  const [userName, setUserName] = useState('');
  const [hasException, setHasException] = useState<boolean | undefined>();

  const loadLogs = async (p = page) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        skipCount: (p - 1) * pageSize,
        maxResultCount: pageSize,
        startTime: dateRange[0]?.toISOString(),
        endTime: dateRange[1]?.toISOString(),
        httpMethod,
        userName: userName || undefined,
        hasException,
        sorting: 'executionTime desc',
      });
      setLogs(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const showDetail = async (id: string) => {
    try {
      const res = await getAuditLog(id);
      setDetailLog(res.data);
      setDetailOpen(true);
    } catch {}
  };

  return (
    <div className="ce-page-enter">
      <div
        className="ce-stagger-2"
        style={{
          background: 'var(--ce-bg-card)',
          border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)',
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Space wrap>
          <RangePicker onChange={(dates) => setDateRange(dates ? [dates[0], dates[1]] : [null, null])} />
          <Select
            placeholder="HTTP Method"
            allowClear
            style={{ width: 120 }}
            onChange={setHttpMethod}
            options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({ label: m, value: m }))}
          />
          <Input
            placeholder="Username"
            style={{ width: 150 }}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Select
            placeholder="Has Exception"
            allowClear
            style={{ width: 140 }}
            onChange={setHasException}
            options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => { setPage(1); loadLogs(1); }}
          >
            Search
          </Button>
        </Space>
      </div>

      <div className="ce-stagger-3">
        <DataTable
          dataSource={logs}
          rowKey="id"
          loading={loading}
          showSearch={false}
          size="small"
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: (p) => { setPage(p); loadLogs(p); },
          }}
          columns={[
            {
              title: 'Time',
              dataIndex: 'executionTime',
              key: 'time',
              width: 170,
              render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              title: 'User',
              dataIndex: 'userName',
              key: 'user',
              width: 120,
              render: (v: string) => v || '-',
            },
            {
              title: 'Method',
              dataIndex: 'httpMethod',
              key: 'method',
              width: 80,
              render: (v: string) =>
                v ? <Tag color={httpMethodColors[v]}>{v}</Tag> : '-',
            },
            {
              title: 'URL',
              dataIndex: 'url',
              key: 'url',
              ellipsis: true,
              render: (v: string) => <span className="ce-mono">{v}</span>,
            },
            {
              title: 'Status',
              dataIndex: 'httpStatusCode',
              key: 'status',
              width: 80,
              render: (v: number) =>
                v ? <Tag color={getStatusColor(v)}>{v}</Tag> : '-',
            },
            {
              title: 'Duration',
              dataIndex: 'executionDuration',
              key: 'duration',
              width: 90,
              render: (v: number) => <span className="ce-mono">{v}ms</span>,
            },
            {
              title: 'IP',
              dataIndex: 'clientIpAddress',
              key: 'ip',
              width: 130,
            },
            {
              title: '',
              key: 'actions',
              width: 50,
              render: (_: unknown, r: AuditLogDto) => (
                <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(r.id)} />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Audit Log Detail"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={800}
      >
        {detailLog && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="User">{detailLog.userName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tenant">{detailLog.tenantName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Method">
                <Tag color={detailLog.httpMethod ? httpMethodColors[detailLog.httpMethod] : undefined}>{detailLog.httpMethod || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {detailLog.httpStatusCode && (
                  <Tag color={getStatusColor(detailLog.httpStatusCode)}>{detailLog.httpStatusCode}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="URL" span={2}>
                <span className="ce-mono">{detailLog.url}</span>
              </Descriptions.Item>
              <Descriptions.Item label="IP">{detailLog.clientIpAddress}</Descriptions.Item>
              <Descriptions.Item label="Duration">
                <span className="ce-mono">{detailLog.executionDuration}ms</span>
              </Descriptions.Item>
              <Descriptions.Item label="Time" span={2}>
                {dayjs(detailLog.executionTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Browser" span={2}>
                {detailLog.browserInfo || '-'}
              </Descriptions.Item>
            </Descriptions>

            {detailLog.exceptions && (
              <div
                style={{
                  marginTop: 16,
                  background: 'var(--ce-danger-light)',
                  border: '1px solid var(--ce-border-light)',
                  borderRadius: 'var(--ce-radius)',
                  padding: 16,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#C54B4B' }}>Exception</div>
                <pre className="ce-mono" style={{ margin: 0, maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {detailLog.exceptions}
                </pre>
              </div>
            )}

            {detailLog.actions.length > 0 && (
              <Collapse
                style={{ marginTop: 16 }}
                items={[{
                  key: 'actions',
                  label: `Actions (${detailLog.actions.length})`,
                  children: detailLog.actions.map((a, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <span className="ce-mono">
                        <strong>{a.serviceName}.{a.methodName}</strong> ({a.executionDuration}ms)
                      </span>
                    </div>
                  )),
                }]}
              />
            )}

            {detailLog.entityChanges.length > 0 && (
              <Collapse
                style={{ marginTop: 8 }}
                items={[{
                  key: 'changes',
                  label: `Entity Changes (${detailLog.entityChanges.length})`,
                  children: detailLog.entityChanges.map((e, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      <Tag>{e.changeType}</Tag>{' '}
                      <span className="ce-mono">
                        {e.entityTypeFullName?.split('.').pop()} ({e.entityId})
                      </span>
                    </div>
                  )),
                }]}
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
