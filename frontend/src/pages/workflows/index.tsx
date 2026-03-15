import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popconfirm, Spin, Input, message, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  const getNodeCount = (wf: WorkflowDefinitionDto): number | null => {
    try {
      if (wf.nodesJson) {
        const nodes = JSON.parse(wf.nodesJson);
        return Array.isArray(nodes) ? nodes.length : null;
      }
    } catch { /* ignore */ }
    return null;
  };

  return (
    <div>
      {/* Toolbar — DataTable pattern: count left, search + action right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            fontSize: 12,
            color: 'var(--ce-text-muted)',
            fontWeight: 500,
            fontFamily: 'var(--ce-font)',
          }}>
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Input
            placeholder="Search workflows..."
            prefix={<SearchOutlined style={{ color: 'var(--ce-text-muted)', fontSize: 13 }} />}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <div style={{
            display: 'inline-flex', borderRadius: 'var(--ce-radius-sm, 5px)',
            border: '1px solid var(--ce-border, #D2D2D7)', overflow: 'hidden',
          }}>
            {([
              { key: 'list' as const, icon: <UnorderedListOutlined /> },
              { key: 'grid' as const, icon: <AppstoreOutlined /> },
            ]).map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 28, border: 'none', cursor: 'pointer',
                  background: viewMode === v.key ? 'var(--ce-accent, #C2703E)' : 'var(--ce-bg-card, #fff)',
                  color: viewMode === v.key ? '#fff' : 'var(--ce-text-muted, #AEAEB2)',
                  fontSize: 13, transition: 'all 0.12s', fontFamily: 'inherit',
                }}
              >
                {v.icon}
              </button>
            ))}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Workflow
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No workflows yet"
          description="Create your first automation to streamline your processes."
          actionLabel="Create Workflow"
          onAction={handleCreate}
        />
      ) : (
        viewMode === 'list' ? (
        /* ─── List View ─── */
        <div style={{
          border: '1px solid var(--ce-border-light, #E8E8ED)',
          borderRadius: 'var(--ce-radius, 8px)',
          overflow: 'hidden',
        }}>
          {filtered.map((wf, idx) => {
            const status = statusConfig[wf.status] || statusConfig[0];
            const nodeCount = getNodeCount(wf);
            const isActive = wf.status === 1;
            return (
              <div
                key={wf.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  background: 'var(--ce-bg-card, #fff)',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--ce-border-light, #E8E8ED)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.08s',
                  borderLeft: `3px solid ${isActive ? '#30D158' : '#8E8E93'}`,
                }}
                onClick={() => navigate(`/workflows/${wf.id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset, #F5F5F7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ce-bg-card, #fff)'; }}
              >
                {/* Status dot */}
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: status.color, flexShrink: 0,
                }} />
                {/* Name + desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ce-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wf.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ce-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wf.description || 'No description'}
                  </div>
                </div>
                {/* Status label */}
                <span style={{ fontSize: 11, fontWeight: 600, color: status.color, textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 0 }}>
                  {status.label}
                </span>
                {/* Node count */}
                {nodeCount !== null && (
                  <span style={{ fontSize: 11, color: 'var(--ce-text-muted)', flexShrink: 0, fontFamily: 'var(--ce-mono)' }}>
                    {nodeCount} nodes
                  </span>
                )}
                {/* Version */}
                <span style={{ fontSize: 11, color: 'var(--ce-text-muted)', fontFamily: 'var(--ce-mono)', flexShrink: 0 }}>
                  v{wf.version}
                </span>
                {/* Last edited */}
                <span style={{ fontSize: 11, color: 'var(--ce-text-muted)', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                  {wf.lastModificationTime ? dayjs(wf.lastModificationTime).fromNow() : dayjs(wf.creationTime).fromNow()}
                </span>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Duplicate"><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(wf.id)} style={{ color: 'var(--ce-text-muted)' }} /></Tooltip>
                  <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                    <Button type="text" size="small" icon={isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={() => handleToggleActive(wf)} style={{ color: isActive ? '#FF9F0A' : '#30D158' }} />
                  </Tooltip>
                  <Popconfirm title="Delete?" onConfirm={() => handleDelete(wf.id)} okButtonProps={{ danger: true }}>
                    <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
        /* ─── Grid View ─── */
        <div
          className="ce-stagger-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((wf) => {
            const status = statusConfig[wf.status] || statusConfig[0];
            const nodeCount = getNodeCount(wf);
            const isActive = wf.status === 1;
            const borderLeftColor = isActive ? '#3D8B6E' : '#7A7D8E';

            return (
              <div
                key={wf.id}
                style={{
                  background: 'var(--ce-bg-card, #FFFFFF)',
                  border: '1px solid var(--ce-border, #E8E5E0)',
                  borderLeft: `2px solid ${borderLeftColor}`,
                  borderRadius: 8,
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                  fontFamily: 'var(--ce-font)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ce-border-hover, #C8C5BF)';
                  e.currentTarget.style.borderLeftColor = borderLeftColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ce-border, #E8E5E0)';
                  e.currentTarget.style.borderLeftColor = borderLeftColor;
                }}
                onClick={() => navigate(`/workflows/${wf.id}`)}
              >
                {/* Card body */}
                <div style={{ padding: '16px 18px 12px' }}>
                  {/* Top row: status dot + label | version badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: status.color,
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: status.color,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--ce-text-muted)',
                      background: 'var(--ce-bg-inset, #F5F3EF)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontFamily: 'var(--ce-font-mono, monospace)',
                    }}>
                      v{wf.version}
                    </span>
                  </div>

                  {/* Middle: name + description */}
                  <div style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--ce-text)',
                    letterSpacing: -0.2,
                    marginBottom: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}>
                    {wf.name}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--ce-text-muted)',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 12,
                  }}>
                    {wf.description || 'No description'}
                  </div>

                  {/* Bottom row: last edited + node count */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--ce-text-muted)',
                  }}>
                    <span>
                      Last edited{' '}
                      {wf.lastModificationTime
                        ? dayjs(wf.lastModificationTime).fromNow()
                        : dayjs(wf.creationTime).fromNow()}
                    </span>
                    {nodeCount !== null && (
                      <span>
                        {nodeCount} node{nodeCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderTop: '1px solid var(--ce-border, #E8E5E0)',
                    padding: '6px 10px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/workflows/${wf.id}`)}
                      style={{ color: 'var(--ce-text-muted)', fontSize: 13 }}
                    />
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleDuplicate(wf.id)}
                      style={{ color: 'var(--ce-text-muted)', fontSize: 13 }}
                    />
                  </Tooltip>
                  <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                    <Button
                      type="text"
                      size="small"
                      icon={isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => handleToggleActive(wf)}
                      style={{ color: isActive ? '#D4973B' : '#3D8B6E', fontSize: 13 }}
                    />
                  </Tooltip>
                  <div style={{ flex: 1 }} />
                  <Popconfirm
                    title="Delete this workflow?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(wf.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        style={{ fontSize: 13 }}
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}
    </div>
  );
}
