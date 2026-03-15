import { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { getBackgroundJobs, type BackgroundJobDto } from '../../services/background-jobs';
import DataTable from '../../components/DataTable';
import dayjs from 'dayjs';

const priorityLabels: Record<number, string> = {
  0: 'Low',
  5: 'Below Normal',
  10: 'Normal',
  15: 'Above Normal',
  20: 'High',
};

const getStatus = (job: BackgroundJobDto): { label: string; color: string } => {
  if (job.isAbandoned) return { label: 'Abandoned', color: '#C54B4B' };
  if (job.tryCount > 0) return { label: 'Retrying', color: '#D4973B' };
  return { label: 'Pending', color: '#4A7FC1' };
};

const shortenJobName = (name: string): string => {
  const parts = name.split('.');
  return parts[parts.length - 1];
};

const tryFormatJson = (raw: string): string => {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

export default function BackgroundJobsPage() {
  const [jobs, setJobs] = useState<BackgroundJobDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadJobs = async (p = page) => {
    setLoading(true);
    try {
      const res = await getBackgroundJobs({
        skipCount: (p - 1) * pageSize,
        maxResultCount: pageSize,
      });
      setJobs(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  return (
    <div className="ce-page-enter">
      <div className="ce-stagger-2">
        <DataTable
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          searchFields={['jobName']}
          searchPlaceholder="Search jobs..."
          compact
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: (p) => { setPage(p); loadJobs(p); },
          }}
          expandable={{
            expandedRowRender: (record) => (
              <pre
                className="ce-mono"
                style={{
                  margin: 0,
                  padding: 12,
                  background: 'var(--ce-bg)',
                  border: '1px solid var(--ce-border-light)',
                  borderRadius: 'var(--ce-radius)',
                  maxHeight: 300,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: 12,
                }}
              >
                {tryFormatJson(record.jobArgs)}
              </pre>
            ),
          }}
          columns={[
            {
              title: 'Job Name',
              dataIndex: 'jobName',
              key: 'jobName',
              ellipsis: true,
              render: (v: string) => (
                <span className="ce-mono" title={v}>
                  {shortenJobName(v)}
                </span>
              ),
            },
            {
              title: 'Try Count',
              dataIndex: 'tryCount',
              key: 'tryCount',
              width: 100,
              align: 'center',
            },
            {
              title: 'Priority',
              dataIndex: 'priority',
              key: 'priority',
              width: 110,
              render: (v: number) => priorityLabels[v] || `P${v}`,
            },
            {
              title: 'Status',
              key: 'status',
              width: 110,
              render: (_: unknown, record: BackgroundJobDto) => {
                const status = getStatus(record);
                return <Tag color={status.color}>{status.label}</Tag>;
              },
            },
            {
              title: 'Created',
              dataIndex: 'creationTime',
              key: 'creationTime',
              width: 170,
              render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              title: 'Last Try',
              dataIndex: 'lastTryTime',
              key: 'lastTryTime',
              width: 170,
              render: (v?: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-',
            },
            {
              title: 'Next Try',
              dataIndex: 'nextTryTime',
              key: 'nextTryTime',
              width: 170,
              render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
            },
          ]}
        />
      </div>
    </div>
  );
}
