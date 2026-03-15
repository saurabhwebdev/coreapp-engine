import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Popconfirm, Spin, message, Input } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getWorkflows,
  createWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  duplicateWorkflow,
  type WorkflowDefinitionDto,
} from '../../services/workflow';
import EmptyState from '../../components/EmptyState';

dayjs.extend(relativeTime);

const statusConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Draft', color: '#7A7D8E' },
  1: { label: 'Active', color: '#3D8B6E' },
  2: { label: 'Inactive', color: '#D4973B' },
  3: { label: 'Archived', color: '#C54B4B' },
};

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await getWorkflows({ maxResultCount: 100 });
      setWorkflows(res.data.items);
    } catch {
      message.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const defaultNodes = JSON.stringify([
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: { label: 'Trigger', triggerEvent: 'manual' },
        },
      ]);
      const res = await createWorkflow({
        name: 'Untitled Workflow',
        description: '',
        nodesJson: defaultNodes,
        edgesJson: '[]',
      });
      navigate(`/workflows/${res.data.id}`);
    } catch {
      message.error('Failed to create workflow');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkflow(id);
      message.success('Workflow deleted');
      loadWorkflows();
    } catch {
      message.error('Failed to delete workflow');
    }
  };

  const handleToggleActive = async (wf: WorkflowDefinitionDto) => {
    try {
      if (wf.status === 1) {
        await deactivateWorkflow(wf.id);
        message.success('Workflow deactivated');
      } else {
        await activateWorkflow(wf.id);
        message.success('Workflow activated');
      }
      loadWorkflows();
    } catch {
      message.error('Failed to update workflow status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateWorkflow(id);
      message.success('Workflow duplicated');
      loadWorkflows();
    } catch {
      message.error('Failed to duplicate workflow');
    }
  };

  const filtered = workflows.filter(
    (wf) =>
      !filter ||
      wf.name.toLowerCase().includes(filter.toLowerCase()) ||
      wf.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', marginBottom: 16,
        borderBottom: '1px solid var(--ce-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Workflow
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Search workflows..."
          prefix={<SearchOutlined style={{ color: '#7A7D8E' }} />}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ maxWidth: 360 }}
          allowClear
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No workflows yet" description="Create your first visual automation workflow." actionLabel="New Workflow" onAction={handleCreate} />
      ) : (
        <div
          className="ce-stagger-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((wf) => {
            const status = statusConfig[wf.status] || statusConfig[0];
            return (
              <div
                key={wf.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F0EDE8',
                  borderRadius: 10,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 49, 66, 0.06), 0 1px 4px rgba(45, 49, 66, 0.03)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => navigate(`/workflows/${wf.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3142', letterSpacing: -0.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wf.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#7A7D8E', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wf.description || 'No description'}
                    </div>
                  </div>
                  <Tag
                    style={{
                      background: `${status.color}14`,
                      color: status.color,
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {status.label}
                  </Tag>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span className="ce-mono" style={{ fontSize: 11 }}>
                    v{wf.version}
                  </span>
                  <span style={{ fontSize: 12, color: '#A7A9B7' }}>
                    {wf.lastModificationTime
                      ? dayjs(wf.lastModificationTime).fromNow()
                      : dayjs(wf.creationTime).fromNow()}
                  </span>
                </div>

                <div
                  style={{ display: 'flex', gap: 4, borderTop: '1px solid #F0EDE8', paddingTop: 12 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/workflows/${wf.id}`)}
                    style={{ color: '#7A7D8E', fontSize: 12 }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleDuplicate(wf.id)}
                    style={{ color: '#7A7D8E', fontSize: 12 }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={wf.status === 1 ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => handleToggleActive(wf)}
                    style={{ color: wf.status === 1 ? '#D4973B' : '#3D8B6E', fontSize: 12 }}
                  >
                    {wf.status === 1 ? 'Deactivate' : 'Activate'}
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Popconfirm
                    title="Delete this workflow?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(wf.id)}
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
    </div>
  );
}
