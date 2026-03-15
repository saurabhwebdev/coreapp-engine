import { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Popconfirm,
  Spin,
  message,
  Input,
  Modal,
  Form,
  Select,
  Table,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  BarChartOutlined,
  LoadingOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  runReport,
  type ReportDefinitionDto,
  type RunReportResultDto,
} from '../../services/reports';
import EmptyState from '../../components/EmptyState';

dayjs.extend(relativeTime);

const categories = [
  { value: 'Users', label: 'Users' },
  { value: 'Tenants', label: 'Tenants' },
  { value: 'Activity', label: 'Activity' },
  { value: 'System', label: 'System' },
  { value: 'Custom', label: 'Custom' },
];

const categoryColors: Record<string, string> = {
  Users: '#4A7FC1',
  Tenants: '#C2703E',
  Activity: '#3D8B6E',
  System: '#7A7D8E',
  Custom: '#D4973B',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportDefinitionDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<string | undefined>(undefined);
  const [editConfig, setEditConfig] = useState('{}');
  const [saving, setSaving] = useState(false);

  // Run state
  const [runningId, setRunningId] = useState<string | null>(null);

  // Results modal
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsData, setResultsData] = useState<RunReportResultDto | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getReports({ maxResultCount: 100 });
      setReports(res.data.items);
    } catch {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setEditName('');
    setEditDescription('');
    setEditCategory(undefined);
    setEditConfig('{}');
    setEditOpen(true);
  };

  const handleEditReport = (report: ReportDefinitionDto) => {
    setEditingReport(report);
    setEditName(report.name);
    setEditDescription(report.description || '');
    setEditCategory(report.category);
    setEditConfig(report.configJson || '{}');
    setEditOpen(true);
  };

  const handleSaveReport = async () => {
    if (!editName.trim()) {
      message.warning('Please enter a report name');
      return;
    }
    // Validate JSON
    try {
      JSON.parse(editConfig);
    } catch {
      message.warning('Config JSON is not valid');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        category: editCategory,
        configJson: editConfig,
      };
      if (editingReport) {
        await updateReport(editingReport.id, data);
        message.success('Report updated');
      } else {
        await createReport(data);
        message.success('Report created');
      }
      setEditOpen(false);
      loadReports();
    } catch {
      message.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      message.success('Report deleted');
      loadReports();
    } catch {
      message.error('Failed to delete report');
    }
  };

  const handleRun = async (report: ReportDefinitionDto) => {
    setRunningId(report.id);
    try {
      const res = await runReport(report.id);
      setResultsData(res.data);
      setResultsOpen(true);
      loadReports();
    } catch {
      message.error('Failed to run report');
    } finally {
      setRunningId(null);
    }
  };

  const handleViewResults = (report: ReportDefinitionDto) => {
    if (!report.lastRunResult) {
      message.info('No results available. Run the report first.');
      return;
    }
    try {
      const parsed = JSON.parse(report.lastRunResult);
      setResultsData({
        reportId: report.id,
        name: report.name,
        generatedAt: report.lastRunTime || '',
        resultJson: report.lastRunResult,
        rowCount: Array.isArray(parsed) ? parsed.length : 0,
      });
    } catch {
      setResultsData({
        reportId: report.id,
        name: report.name,
        generatedAt: report.lastRunTime || '',
        resultJson: report.lastRunResult,
        rowCount: 0,
      });
    }
    setResultsOpen(true);
  };

  // Build dynamic results table
  const buildResultsColumns = () => {
    if (!resultsData) return [];
    try {
      const rows = JSON.parse(resultsData.resultJson);
      if (!Array.isArray(rows) || rows.length === 0) return [];
      const keys = Object.keys(rows[0]);
      return keys.map((key) => ({
        title: key,
        dataIndex: key,
        key,
        ellipsis: true,
        render: (val: unknown) => {
          if (val === undefined || val === null) return '-';
          if (typeof val === 'boolean') return val ? 'Yes' : 'No';
          return String(val);
        },
      }));
    } catch {
      return [];
    }
  };

  const buildResultsData = () => {
    if (!resultsData) return [];
    try {
      const rows = JSON.parse(resultsData.resultJson);
      if (!Array.isArray(rows)) return [];
      return rows.map((row: Record<string, unknown>, idx: number) => ({ key: idx, ...row }));
    } catch {
      return [];
    }
  };

  const isResultsParseable = () => {
    if (!resultsData) return false;
    try {
      const parsed = JSON.parse(resultsData.resultJson);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  };

  const filtered = reports.filter(
    (r) =>
      !filter ||
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.description?.toLowerCase().includes(filter.toLowerCase()) ||
      r.category?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="ce-page-enter">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', marginBottom: 16,
        borderBottom: '1px solid var(--ce-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
            {filtered.length} report{filtered.length !== 1 ? 's' : ''}
          </span>
          <Input
            placeholder="Search reports..."
            prefix={<SearchOutlined style={{ color: '#7A7D8E' }} />}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: 360 }}
            allowClear
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewReport}>
            New Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No reports yet" description="Create your first report to start generating insights." actionLabel="New Report" onAction={handleNewReport} />
      ) : (
        <div
          className="ce-stagger-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((report) => {
            const catColor = categoryColors[report.category || ''] || '#7A7D8E';
            const isRunning = runningId === report.id;
            let lastRunRows = 0;
            if (report.lastRunResult) {
              try {
                const parsed = JSON.parse(report.lastRunResult);
                if (Array.isArray(parsed)) lastRunRows = parsed.length;
              } catch {
                /* empty */
              }
            }
            return (
              <div
                key={report.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F0EDE8',
                  borderRadius: 10,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 49, 66, 0.06), 0 1px 4px rgba(45, 49, 66, 0.03)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3142', letterSpacing: -0.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#7A7D8E', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.description || 'No description'}
                    </div>
                  </div>
                  {report.category && (
                    <Tag
                      style={{
                        background: `${catColor}14`,
                        color: catColor,
                        border: 'none',
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: 0.3,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {report.category}
                    </Tag>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 12, color: '#A7A9B7' }}>
                  {report.lastRunTime ? (
                    <>
                      <span>Last run {dayjs(report.lastRunTime).fromNow()}</span>
                      <span>{lastRunRows} row{lastRunRows !== 1 ? 's' : ''}</span>
                    </>
                  ) : (
                    <span>Never run</span>
                  )}
                  <span style={{ marginLeft: 'auto' }}>
                    {report.lastModificationTime
                      ? dayjs(report.lastModificationTime).fromNow()
                      : dayjs(report.creationTime).fromNow()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 4, borderTop: '1px solid #F0EDE8', paddingTop: 12 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditReport(report)}
                    style={{ color: '#7A7D8E', fontSize: 12 }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={isRunning ? <LoadingOutlined /> : <PlayCircleOutlined />}
                    onClick={() => handleRun(report)}
                    disabled={isRunning}
                    style={{ color: '#3D8B6E', fontSize: 12 }}
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewResults(report)}
                    disabled={!report.lastRunResult}
                    style={{ color: report.lastRunResult ? '#4A7FC1' : '#A7A9B7', fontSize: 12 }}
                  >
                    Results
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Popconfirm
                    title="Delete this report?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(report.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      style={{ fontSize: 12 }}
                    />
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Report Modal */}
      <Modal
        title={editingReport ? 'Edit Report' : 'New Report'}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSaveReport}
        confirmLoading={saving}
        width={640}
        okText="Save"
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name" required>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Report name"
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional description"
            />
          </Form.Item>
          <Form.Item label="Category">
            <Select
              value={editCategory}
              onChange={(val) => setEditCategory(val)}
              options={categories}
              placeholder="Select a category"
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Config JSON"
            extra="Define report parameters and query configuration"
          >
            <Input.TextArea
              value={editConfig}
              onChange={(e) => setEditConfig(e.target.value)}
              rows={6}
              style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace", fontSize: 12 }}
              placeholder='{ "query": "...", "parameters": {} }'
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Results Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#C2703E' }} />
            <span>Report Results{resultsData ? `: ${resultsData.name}` : ''}</span>
          </div>
        }
        open={resultsOpen}
        onCancel={() => setResultsOpen(false)}
        footer={null}
        width={900}
      >
        {resultsData && (
          <>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16, fontSize: 13, color: '#7A7D8E' }}>
              {resultsData.generatedAt && (
                <span>
                  Generated: {dayjs(resultsData.generatedAt).format('MMM D, YYYY HH:mm:ss')}
                </span>
              )}
              <span>{resultsData.rowCount} row{resultsData.rowCount !== 1 ? 's' : ''}</span>
            </div>

            {isResultsParseable() ? (
              <Table
                dataSource={buildResultsData()}
                columns={buildResultsColumns()}
                size="small"
                pagination={{ pageSize: 15 }}
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: '#7A7D8E' }}>
                  <CodeOutlined />
                  <span>Raw JSON output</span>
                </div>
                <pre
                  style={{
                    background: '#F7F5F2',
                    border: '1px solid #F0EDE8',
                    borderRadius: 8,
                    padding: 16,
                    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
                    fontSize: 12,
                    color: '#2D3142',
                    maxHeight: 400,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(resultsData.resultJson), null, 2);
                    } catch {
                      return resultsData.resultJson;
                    }
                  })()}
                </pre>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
