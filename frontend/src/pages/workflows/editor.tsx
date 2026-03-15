import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Tag, message, Spin, Select, Form, Modal, Steps } from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getWorkflow, updateWorkflow, type WorkflowDefinitionDto } from '../../services/workflow';

// ─── Node Type Definitions ───

interface NodeTypeConfig {
  type: string;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const nodeTypeConfigs: NodeTypeConfig[] = [
  { type: 'trigger', label: 'Trigger', description: 'When something happens', color: '#30D158', icon: <ThunderboltOutlined /> },
  { type: 'condition', label: 'Condition', description: 'If/else branching', color: '#007AFF', icon: <QuestionCircleOutlined /> },
  { type: 'action', label: 'Action', description: 'Do something', color: '#C2703E', icon: <ApiOutlined /> },
  { type: 'notification', label: 'Notification', description: 'Send alert', color: '#FF9F0A', icon: <BellOutlined /> },
  { type: 'approval', label: 'Approval', description: 'Wait for approval', color: '#AF52DE', icon: <CheckCircleOutlined /> },
  { type: 'delay', label: 'Delay', description: 'Wait for time', color: '#8E8E93', icon: <ClockCircleOutlined /> },
  { type: 'end', label: 'End', description: 'Stop workflow', color: '#1D1D1F', icon: <StopOutlined /> },
];

const statusConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Draft', color: '#8E8E93' },
  1: { label: 'Active', color: '#30D158' },
  2: { label: 'Inactive', color: '#FF9F0A' },
  3: { label: 'Archived', color: '#FF3B30' },
};

// ─── Custom Node Components ───

function BaseNode({ data, selected, color, icon, label, hasInput, hasOutput }: {
  data: Record<string, any>;
  selected: boolean;
  color: string;
  icon: React.ReactNode;
  label: string;
  hasInput?: boolean;
  hasOutput?: boolean;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: selected ? `1.5px solid ${color}` : '1px solid #E5E5EA',
        borderLeft: `4px solid ${color}`,
        boxShadow: selected
          ? `0 0 0 3px ${color}1A, 0 4px 16px rgba(0, 0, 0, 0.08)`
          : '0 1px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        minWidth: 200,
        overflow: 'visible',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: 10,
            height: 10,
            background: '#FFFFFF',
            border: `2px solid ${color}`,
            borderRadius: '50%',
            top: -5,
          }}
        />
      )}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ color, fontSize: 13 }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: '#8E8E93' }}>
            {label}
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>
          {data.label || label}
        </div>
      </div>
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            width: 10,
            height: 10,
            background: color,
            border: '2px solid #FFFFFF',
            borderRadius: '50%',
            bottom: -5,
          }}
        />
      )}
    </div>
  );
}

function TriggerNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#30D158" icon={<ThunderboltOutlined />} label="Trigger" hasOutput />;
}

function ConditionNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  const color = '#007AFF';
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 8,
        border: selected ? `1.5px solid ${color}` : '1px solid #E5E5EA',
        borderLeft: `4px solid ${color}`,
        boxShadow: selected
          ? `0 0 0 3px ${color}1A, 0 4px 16px rgba(0, 0, 0, 0.08)`
          : '0 1px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        minWidth: 200,
        overflow: 'visible',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#FFFFFF', border: `2px solid ${color}`, borderRadius: '50%', top: -5 }} />
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ color, fontSize: 13 }}><QuestionCircleOutlined /></span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: '#8E8E93' }}>Condition</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>{data.label || 'Condition'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" style={{ width: 10, height: 10, background: '#30D158', border: '2px solid #FFFFFF', borderRadius: '50%', bottom: -5, left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ width: 10, height: 10, background: '#FF3B30', border: '2px solid #FFFFFF', borderRadius: '50%', bottom: -5, left: '70%' }} />
    </div>
  );
}

function ActionNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#C2703E" icon={<ApiOutlined />} label="Action" hasInput hasOutput />;
}

function NotificationNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#FF9F0A" icon={<BellOutlined />} label="Notification" hasInput hasOutput />;
}

function ApprovalNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#AF52DE" icon={<CheckCircleOutlined />} label="Approval" hasInput hasOutput />;
}

function DelayNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#8E8E93" icon={<ClockCircleOutlined />} label="Delay" hasInput hasOutput />;
}

function EndNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#1D1D1F" icon={<StopOutlined />} label="End" hasInput />;
}

// ─── Right Config Panel ───

function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
  onDelete,
}: {
  node: Node;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const nodeData = node.data as Record<string, any>;
  const nodeType = node.type || 'action';
  const config = nodeTypeConfigs.find((c) => c.type === nodeType);

  return (
    <div
      style={{
        width: 280,
        background: '#FFFFFF',
        borderLeft: '1px solid #E5E5EA',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #F2F2F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${config?.color}14`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: config?.color, fontSize: 14 }}>{config?.icon}</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1D1D1F' }}>
            Configure {config?.label}
          </span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined style={{ fontSize: 12 }} />}
          onClick={onClose}
          style={{ color: '#8E8E93', width: 28, height: 28 }}
        />
      </div>

      {/* Panel Body */}
      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
        {/* Help text */}
        <div style={{
          fontSize: 12, color: '#8E8E93', lineHeight: 1.5, marginBottom: 14,
          padding: '10px 12px', background: '#F5F5F7', borderRadius: 8,
        }}>
          {nodeType === 'trigger' && '⚡ Define what event starts this workflow. Choose when this automation should run.'}
          {nodeType === 'condition' && '🔀 Add logic branching. The workflow will follow different paths based on this condition.'}
          {nodeType === 'action' && '⚙️ Perform an operation like creating data, calling an API, or updating a record.'}
          {nodeType === 'notification' && '🔔 Send a notification via in-app alerts, email, or both to specified recipients.'}
          {nodeType === 'approval' && '✋ Pause the workflow and wait for someone to approve before continuing.'}
          {nodeType === 'delay' && '⏱️ Pause the workflow for a specified amount of time before continuing.'}
          {nodeType === 'end' && '🏁 This marks the end of the workflow. No further actions will be taken.'}
        </div>

        <Form layout="vertical" size="small">
          <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Label</span>}>
            <Input
              value={(nodeData.label as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...nodeData, label: e.target.value })}
            />
          </Form.Item>

          {nodeType === 'trigger' && (
            <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Trigger Event</span>}>
              <Select
                value={(nodeData.triggerEvent as string) || 'manual'}
                onChange={(val) => onUpdate(node.id, { ...nodeData, triggerEvent: val })}
                options={[
                  { label: 'Entity Created', value: 'entity.created' },
                  { label: 'Entity Updated', value: 'entity.updated' },
                  { label: 'Entity Deleted', value: 'entity.deleted' },
                  { label: 'Manual', value: 'manual' },
                  { label: 'Scheduled', value: 'scheduled' },
                  { label: 'Webhook', value: 'webhook' },
                ]}
              />
            </Form.Item>
          )}

          {nodeType === 'condition' && (
            <>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Field</span>}>
                <Input
                  value={(nodeData.field as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, field: e.target.value })}
                  placeholder="e.g., status"
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Operator</span>}>
                <Select
                  value={(nodeData.operator as string) || 'equals'}
                  onChange={(val) => onUpdate(node.id, { ...nodeData, operator: val })}
                  options={[
                    { label: 'Equals', value: 'equals' },
                    { label: 'Not Equals', value: 'notEquals' },
                    { label: 'Contains', value: 'contains' },
                    { label: 'Greater Than', value: 'greaterThan' },
                    { label: 'Less Than', value: 'lessThan' },
                  ]}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Value</span>}>
                <Input
                  value={(nodeData.value as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, value: e.target.value })}
                />
              </Form.Item>
            </>
          )}

          {nodeType === 'action' && (
            <>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Action Type</span>}>
                <Select
                  value={(nodeData.actionType as string) || 'createEntity'}
                  onChange={(val) => onUpdate(node.id, { ...nodeData, actionType: val })}
                  options={[
                    { label: 'Create Entity', value: 'createEntity' },
                    { label: 'Update Entity', value: 'updateEntity' },
                    { label: 'Call API', value: 'callApi' },
                    { label: 'Set Variable', value: 'setVariable' },
                  ]}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Config (JSON)</span>}>
                <Input.TextArea
                  value={(nodeData.config as string) || '{}'}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, config: e.target.value })}
                  rows={4}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                />
              </Form.Item>
            </>
          )}

          {nodeType === 'notification' && (
            <>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Channel</span>}>
                <Select
                  value={(nodeData.channel as string) || 'inApp'}
                  onChange={(val) => onUpdate(node.id, { ...nodeData, channel: val })}
                  options={[
                    { label: 'In-App', value: 'inApp' },
                    { label: 'Email', value: 'email' },
                    { label: 'Both', value: 'both' },
                  ]}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Template</span>}>
                <Input
                  value={(nodeData.template as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, template: e.target.value })}
                  placeholder="e.g., Welcome to the platform!"
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Recipients</span>}>
                <Input
                  value={(nodeData.recipients as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, recipients: e.target.value })}
                  placeholder="e.g., admin, newUser"
                />
              </Form.Item>
            </>
          )}

          {nodeType === 'approval' && (
            <>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Approver Role</span>}>
                <Input
                  value={(nodeData.approverRole as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, approverRole: e.target.value })}
                  placeholder="e.g., Manager"
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Timeout (hours)</span>}>
                <Input
                  type="number"
                  value={(nodeData.timeout as string) || '24'}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, timeout: e.target.value })}
                />
              </Form.Item>
            </>
          )}

          {nodeType === 'delay' && (
            <>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Duration</span>}>
                <Input
                  type="number"
                  value={(nodeData.duration as string) || '1'}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, duration: e.target.value })}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93' }}>Unit</span>}>
                <Select
                  value={(nodeData.unit as string) || 'hours'}
                  onChange={(val) => onUpdate(node.id, { ...nodeData, unit: val })}
                  options={[
                    { label: 'Minutes', value: 'minutes' },
                    { label: 'Hours', value: 'hours' },
                    { label: 'Days', value: 'days' },
                  ]}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </div>

      {/* Delete Button */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #F2F2F7' }}>
        <Button
          danger
          block
          icon={<DeleteOutlined />}
          onClick={() => onDelete(node.id)}
          style={{ borderRadius: 6 }}
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
}

// ─── Main Editor Component ───

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [workflow, setWorkflow] = useState<WorkflowDefinitionDto | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      condition: ConditionNode,
      action: ActionNode,
      notification: NotificationNode,
      approval: ApprovalNode,
      delay: DelayNode,
      end: EndNode,
    }),
    []
  );

  useEffect(() => {
    if (id) loadWorkflow(id);
  }, [id]);

  // Track unsaved changes
  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      markDirty();
    },
    [onNodesChange, markDirty]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      markDirty();
    },
    [onEdgesChange, markDirty]
  );

  const loadWorkflow = async (wfId: string) => {
    setLoading(true);
    try {
      const res = await getWorkflow(wfId);
      setWorkflow(res.data);
      setWorkflowName(res.data.name);
      const parsedNodes = JSON.parse(res.data.nodesJson || '[]');
      const parsedEdges = JSON.parse(res.data.edgesJson || '[]');
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setHasUnsavedChanges(false);
    } catch {
      message.error('Failed to load workflow');
      navigate('/workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !workflow) return;
    setSaving(true);
    try {
      const res = await updateWorkflow(id, {
        name: workflowName,
        description: workflow.description,
        triggerType: workflow.triggerType,
        nodesJson: JSON.stringify(nodes),
        edgesJson: JSON.stringify(edges),
      });
      setWorkflow(res.data);
      setHasUnsavedChanges(false);
      message.success('Workflow saved');
    } catch {
      message.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep', animated: workflow?.status === 1 }, eds));
      markDirty();
    },
    [setEdges, workflow?.status, markDirty]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeDataUpdate = useCallback(
    (nodeId: string, newData: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
      );
      setSelectedNode((prev) => (prev && prev.id === nodeId ? { ...prev, data: newData } : prev));
      markDirty();
    },
    [setNodes, markDirty]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode(null);
      markDirty();
    },
    [setNodes, setEdges, markDirty]
  );

  // ─── Test Workflow ───
  const [testOpen, setTestOpen] = useState(false);
  const [testStep, setTestStep] = useState(0);
  const [testRunning, setTestRunning] = useState(false);

  const getExecutionPath = useCallback((): { id: string; type: string; label: string; data: Record<string, any> }[] => {
    // Walk the graph from trigger nodes following edges
    const path: typeof nodes = [];
    const visited = new Set<string>();
    const triggerNodes = nodes.filter((n) => n.type === 'trigger');
    const queue = triggerNodes.length > 0 ? [triggerNodes[0]] : (nodes.length > 0 ? [nodes[0]] : []);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      path.push(current);
      // Find outgoing edges
      const outEdges = edges.filter((e) => e.source === current.id);
      for (const edge of outEdges) {
        const target = nodes.find((n) => n.id === edge.target);
        if (target && !visited.has(target.id)) queue.push(target);
      }
    }
    return path.map((n) => ({
      id: n.id,
      type: n.type || 'unknown',
      label: String(n.data?.label || n.type || 'Node'),
      data: (n.data || {}) as Record<string, any>,
    }));
  }, [nodes, edges]);

  const handleTestWorkflow = () => {
    if (nodes.length === 0) {
      message.warning('Add some nodes before testing');
      return;
    }
    setTestStep(0);
    setTestRunning(false);
    setTestOpen(true);
  };

  const runTest = async () => {
    const path = getExecutionPath();
    if (path.length === 0) return;
    setTestRunning(true);
    setTestStep(0);
    for (let i = 0; i < path.length; i++) {
      setTestStep(i);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    }
    setTestStep(path.length);
    setTestRunning(false);
    message.success('Test completed successfully!');
  };

  // ─── Drag and Drop ───

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type');
      if (!type) return;

      const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!wrapperBounds) return;

      const position = {
        x: event.clientX - wrapperBounds.left - 90,
        y: event.clientY - wrapperBounds.top - 30,
      };

      const config = nodeTypeConfigs.find((c) => c.type === type);
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: config?.label || type },
      };

      setNodes((nds) => [...nds, newNode]);
      markDirty();
    },
    [setNodes, markDirty]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  const status = statusConfig[workflow?.status ?? 0] || statusConfig[0];

  // Save status indicator
  const renderSaveStatus = () => {
    if (saving) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8E8E93' }}>
          <LoadingOutlined style={{ fontSize: 12 }} />
          Saving...
        </span>
      );
    }
    if (hasUnsavedChanges) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#FF9F0A' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9F0A', display: 'inline-block' }} />
          Unsaved changes
        </span>
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#30D158' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', display: 'inline-block' }} />
        Saved
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', margin: -28, marginTop: -28 }}>
      {/* ─── Top Header Bar ─── */}
      <div
        style={{
          height: 52,
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E5EA',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        {/* Left: Back + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/workflows')}
            style={{ color: '#8E8E93', width: 32, height: 32 }}
          />
          <Input
            value={workflowName}
            onChange={(e) => { setWorkflowName(e.target.value); markDirty(); }}
            variant="borderless"
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: '#1D1D1F',
              maxWidth: 280,
              padding: '4px 8px',
            }}
          />
        </div>

        {/* Center: Status */}
        <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <Tag
            style={{
              background: `${status.color}14`,
              color: status.color,
              border: 'none',
              fontWeight: 600,
              fontSize: 11,
              borderRadius: 4,
              padding: '2px 10px',
            }}
          >
            {status.label}
          </Tag>
        </div>

        {/* Right: Test + Save status + Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
          {renderSaveStatus()}
          <Button
            icon={<PlayCircleOutlined />}
            onClick={handleTestWorkflow}
            disabled={nodes.length === 0}
            style={{ borderRadius: 6, fontWeight: 500, color: '#30D158', borderColor: '#30D158' }}
          >
            Test
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Save
          </Button>
        </div>
      </div>

      {/* ─── Body: Toolbar + Canvas + Config ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ─── Left Toolbar (220px) ─── */}
        <div
          style={{
            width: 220,
            background: '#FAFAFA',
            borderRight: '1px solid #E5E5EA',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '14px 14px 8px',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#8E8E93',
            }}
          >
            Components
          </div>
          <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nodeTypeConfigs.map((cfg) => (
              <div
                key={cfg.type}
                draggable
                onDragStart={(e) => onDragStart(e, cfg.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: '#FFFFFF',
                  border: '1px solid #E5E5EA',
                  cursor: 'grab',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = cfg.color;
                  e.currentTarget.style.boxShadow = `0 2px 8px ${cfg.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5EA';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: `${cfg.color}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: cfg.color, fontSize: 15 }}>{cfg.icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1F', lineHeight: '16px' }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#8E8E93', lineHeight: '14px' }}>
                    {cfg.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Canvas ─── */}
        <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: workflow?.status === 1,
              style: { stroke: '#007AFF', strokeWidth: 1.5 },
            }}
            fitView
            proOptions={{ hideAttribution: true }}
            style={{ background: '#FBFBFD' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#D1D1D6" />
            <Controls
              style={{
                borderRadius: 8,
                border: '1px solid #E5E5EA',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
              }}
            />
            <MiniMap
              style={{
                borderRadius: 8,
                border: '1px solid #E5E5EA',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
              }}
              maskColor="rgba(251, 251, 253, 0.75)"
              nodeColor={(node) => {
                const cfg = nodeTypeConfigs.find((c) => c.type === node.type);
                return cfg?.color || '#8E8E93';
              }}
            />
          </ReactFlow>

          {/* Empty Canvas Onboarding */}
          {nodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 40px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #E5E5EA',
                  maxWidth: 340,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>
                  {String.fromCodePoint(0x1F680)}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F', marginBottom: 6 }}>
                  Start Building
                </div>
                <div style={{ fontSize: 13, color: '#8E8E93', lineHeight: '20px' }}>
                  Drag a node from the left panel onto the canvas to begin.
                </div>
                <div style={{ fontSize: 12, color: '#AEAEB2', lineHeight: '18px', marginTop: 8 }}>
                  Start with a Trigger to define when this workflow runs.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Config Panel ─── */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleNodeDataUpdate}
            onClose={() => setSelectedNode(null)}
            onDelete={handleDeleteNode}
          />
        )}
      </div>

      {/* ─── Test Workflow Modal ─── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlayCircleOutlined style={{ color: '#30D158' }} />
            <span>Test Workflow</span>
          </div>
        }
        open={testOpen}
        onCancel={() => { setTestOpen(false); setTestRunning(false); }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--ce-text-muted)', alignSelf: 'center' }}>
              {testStep >= getExecutionPath().length && !testRunning ? 'All steps completed' : testRunning ? 'Running...' : 'Ready to test'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => { setTestOpen(false); setTestRunning(false); }}>Close</Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={runTest}
                loading={testRunning}
                disabled={testRunning}
                style={{ background: '#30D158', borderColor: '#30D158' }}
              >
                {testStep >= getExecutionPath().length && !testRunning ? 'Run Again' : 'Run Test'}
              </Button>
            </div>
          </div>
        }
        width={520}
      >
        {(() => {
          const path = getExecutionPath();
          if (path.length === 0) return <div style={{ textAlign: 'center', padding: 20, color: 'var(--ce-text-muted)' }}>No nodes to test</div>;
          return (
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: 12, color: 'var(--ce-text-muted)', marginBottom: 16 }}>
                Simulating execution through {path.length} node{path.length !== 1 ? 's' : ''}:
              </div>
              <Steps
                direction="vertical"
                size="small"
                current={testStep}
                items={path.map((node, i) => {
                  const cfg = nodeTypeConfigs.find((c) => c.type === node.type);
                  const isDone = testStep > i;
                  const isCurrent = testStep === i && testRunning;

                  // Build description from node data
                  let desc = cfg?.description || '';
                  if (node.type === 'trigger' && node.data.triggerEvent) desc = `Event: ${node.data.triggerEvent}`;
                  if (node.type === 'delay' && node.data.duration) desc = `Wait ${node.data.duration} ${node.data.unit || 'minutes'}`;
                  if (node.type === 'notification' && node.data.channel) desc = `Send ${node.data.channel} notification`;
                  if (node.type === 'condition' && node.data.field) desc = `Check: ${node.data.field} ${node.data.operator || '='} ${node.data.value || '?'}`;
                  if (node.type === 'action' && node.data.actionType) desc = `Action: ${node.data.actionType}`;
                  if (node.type === 'approval' && node.data.approverRole) desc = `Approval by: ${node.data.approverRole}`;

                  return {
                    title: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 5,
                          background: `${cfg?.color || '#8E8E93'}14`,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: cfg?.color || '#8E8E93',
                        }}>
                          {cfg?.icon}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{node.label}</span>
                      </span>
                    ),
                    description: (
                      <span style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>
                        {desc}
                        {isDone && !isCurrent && (
                          <span style={{ marginLeft: 8, color: '#30D158', fontWeight: 500 }}>
                            <CheckCircleFilled /> Done
                          </span>
                        )}
                        {isCurrent && (
                          <span style={{ marginLeft: 8, color: '#007AFF', fontWeight: 500 }}>
                            <LoadingOutlined /> Running...
                          </span>
                        )}
                      </span>
                    ),
                    status: isDone ? 'finish' as const : isCurrent ? 'process' as const : 'wait' as const,
                  };
                })}
              />
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
