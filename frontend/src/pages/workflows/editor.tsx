import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Tag, message, Spin, Select, Form } from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  BranchesOutlined,
  ApiOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  QuestionCircleOutlined,
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
  color: string;
  icon: React.ReactNode;
}

const nodeTypeConfigs: NodeTypeConfig[] = [
  { type: 'trigger', label: 'Trigger', color: '#3D8B6E', icon: <ThunderboltOutlined /> },
  { type: 'condition', label: 'Condition', color: '#4A7FC1', icon: <QuestionCircleOutlined /> },
  { type: 'action', label: 'Action', color: '#C2703E', icon: <ApiOutlined /> },
  { type: 'notification', label: 'Notification', color: '#D4973B', icon: <BellOutlined /> },
  { type: 'approval', label: 'Approval', color: '#7B61FF', icon: <CheckCircleOutlined /> },
  { type: 'delay', label: 'Delay', color: '#7A7D8E', icon: <ClockCircleOutlined /> },
  { type: 'end', label: 'End', color: '#2D3142', icon: <StopOutlined /> },
];

const statusConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Draft', color: '#7A7D8E' },
  1: { label: 'Active', color: '#3D8B6E' },
  2: { label: 'Inactive', color: '#D4973B' },
  3: { label: 'Archived', color: '#C54B4B' },
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
        borderRadius: 10,
        border: selected ? `2px solid #C2703E` : '1px solid #E8E4DE',
        boxShadow: selected
          ? '0 0 0 3px rgba(194, 112, 62, 0.15), 0 4px 12px rgba(45, 49, 66, 0.08)'
          : '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)',
        minWidth: 180,
        overflow: 'hidden',
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
            background: '#E8E4DE',
            border: '2px solid #FFFFFF',
            top: -5,
          }}
        />
      )}
      <div
        style={{
          height: 4,
          background: color,
          borderRadius: '10px 10px 0 0',
        }}
      />
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color, fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color }}>
            {label}
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3142' }}>
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
            bottom: -5,
          }}
        />
      )}
    </div>
  );
}

function TriggerNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#3D8B6E" icon={<ThunderboltOutlined />} label="Trigger" hasOutput />;
}

function ConditionNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 10,
        border: selected ? `2px solid #C2703E` : '1px solid #E8E4DE',
        boxShadow: selected
          ? '0 0 0 3px rgba(194, 112, 62, 0.15), 0 4px 12px rgba(45, 49, 66, 0.08)'
          : '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)',
        minWidth: 180,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: '#E8E4DE', border: '2px solid #FFFFFF', top: -5 }} />
      <div style={{ height: 4, background: '#4A7FC1', borderRadius: '10px 10px 0 0' }} />
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: '#4A7FC1', fontSize: 14 }}><QuestionCircleOutlined /></span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#4A7FC1' }}>Condition</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3142' }}>{data.label || 'Condition'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" style={{ width: 10, height: 10, background: '#3D8B6E', border: '2px solid #FFFFFF', bottom: -5, left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ width: 10, height: 10, background: '#C54B4B', border: '2px solid #FFFFFF', bottom: -5, left: '70%' }} />
    </div>
  );
}

function ActionNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#C2703E" icon={<ApiOutlined />} label="Action" hasInput hasOutput />;
}

function NotificationNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#D4973B" icon={<BellOutlined />} label="Notification" hasInput hasOutput />;
}

function ApprovalNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#7B61FF" icon={<CheckCircleOutlined />} label="Approval" hasInput hasOutput />;
}

function DelayNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#7A7D8E" icon={<ClockCircleOutlined />} label="Delay" hasInput hasOutput />;
}

function EndNode({ data, selected }: { data: Record<string, any>; selected?: boolean }) {
  return <BaseNode data={data} selected={!!selected} color="#2D3142" icon={<StopOutlined />} label="End" hasInput />;
}

// ─── Side Panel for Node Config ───

function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
}: {
  node: Node;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const nodeData = node.data as Record<string, any>;
  const nodeType = node.type || 'action';
  const config = nodeTypeConfigs.find((c) => c.type === nodeType);

  return (
    <div
      style={{
        width: 300,
        background: '#FFFFFF',
        borderLeft: '1px solid #E8E4DE',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F0EDE8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: config?.color, fontSize: 16 }}>{config?.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#2D3142' }}>
            {config?.label} Config
          </span>
        </div>
        <Button type="text" size="small" onClick={onClose}>
          Close
        </Button>
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <Form layout="vertical" size="small">
          <Form.Item label="Label">
            <Input
              value={(nodeData.label as string) || ''}
              onChange={(e) => onUpdate(node.id, { ...nodeData, label: e.target.value })}
            />
          </Form.Item>

          {nodeType === 'trigger' && (
            <Form.Item label="Trigger Event">
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
              <Form.Item label="Field">
                <Input
                  value={(nodeData.field as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, field: e.target.value })}
                  placeholder="e.g., status"
                />
              </Form.Item>
              <Form.Item label="Operator">
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
              <Form.Item label="Value">
                <Input
                  value={(nodeData.value as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, value: e.target.value })}
                />
              </Form.Item>
            </>
          )}

          {nodeType === 'action' && (
            <>
              <Form.Item label="Action Type">
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
              <Form.Item label="Config (JSON)">
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
              <Form.Item label="Channel">
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
              <Form.Item label="Template">
                <Input
                  value={(nodeData.template as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, template: e.target.value })}
                  placeholder="Template name"
                />
              </Form.Item>
              <Form.Item label="Recipients">
                <Input
                  value={(nodeData.recipients as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, recipients: e.target.value })}
                  placeholder="Comma-separated"
                />
              </Form.Item>
            </>
          )}

          {nodeType === 'approval' && (
            <>
              <Form.Item label="Approver Role">
                <Input
                  value={(nodeData.approverRole as string) || ''}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, approverRole: e.target.value })}
                  placeholder="e.g., Manager"
                />
              </Form.Item>
              <Form.Item label="Timeout (hours)">
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
              <Form.Item label="Duration">
                <Input
                  type="number"
                  value={(nodeData.duration as string) || '1'}
                  onChange={(e) => onUpdate(node.id, { ...nodeData, duration: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Unit">
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
    },
    [setEdges, workflow?.status]
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
    },
    [setNodes]
  );

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
    },
    [setNodes]
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', margin: -28, marginTop: -28 }}>
      {/* ─── Header Bar ─── */}
      <div
        style={{
          height: 56,
          background: '#FFFFFF',
          borderBottom: '1px solid #E8E4DE',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/workflows')}
          style={{ color: '#7A7D8E' }}
        />
        <div style={{ width: 1, height: 24, background: '#E8E4DE' }} />
        <BranchesOutlined style={{ fontSize: 18, color: '#C2703E' }} />
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          variant="borderless"
          style={{ fontWeight: 700, fontSize: 16, color: '#2D3142', maxWidth: 300, padding: '4px 8px' }}
        />
        <Tag
          style={{
            background: `${status.color}14`,
            color: status.color,
            border: 'none',
            fontWeight: 600,
            fontSize: 11,
          }}
        >
          {status.label}
        </Tag>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          Save
        </Button>
      </div>

      {/* ─── Body ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ─── Left Toolbar ─── */}
        <div
          style={{
            width: 64,
            background: '#FAFAF8',
            borderRight: '1px solid #E8E4DE',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 0',
            gap: 4,
            flexShrink: 0,
          }}
        >
          {nodeTypeConfigs.map((cfg) => (
            <div
              key={cfg.type}
              draggable
              onDragStart={(e) => onDragStart(e, cfg.type)}
              title={cfg.label}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                background: '#FFFFFF',
                border: '1px solid #E8E4DE',
                transition: 'all 0.15s ease',
                gap: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cfg.color;
                e.currentTarget.style.boxShadow = `0 2px 8px ${cfg.color}20`;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E8E4DE';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ color: cfg.color, fontSize: 16 }}>{cfg.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#7A7D8E', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {cfg.label.slice(0, 4)}
              </span>
            </div>
          ))}
        </div>

        {/* ─── Canvas ─── */}
        <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: workflow?.status === 1,
              style: { stroke: '#C2703E', strokeWidth: 2 },
            }}
            fitView
            proOptions={{ hideAttribution: true }}
            style={{ background: '#FFFFFF' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E8E4DE" />
            <Controls
              style={{
                borderRadius: 10,
                border: '1px solid #E8E4DE',
                boxShadow: '0 1px 3px rgba(45, 49, 66, 0.04)',
                overflow: 'hidden',
              }}
            />
            <MiniMap
              style={{
                borderRadius: 10,
                border: '1px solid #E8E4DE',
                boxShadow: '0 1px 3px rgba(45, 49, 66, 0.04)',
                overflow: 'hidden',
              }}
              maskColor="rgba(247, 245, 242, 0.7)"
              nodeColor={(node) => {
                const cfg = nodeTypeConfigs.find((c) => c.type === node.type);
                return cfg?.color || '#7A7D8E';
              }}
            />
          </ReactFlow>
        </div>

        {/* ─── Right Config Panel ─── */}
        {selectedNode && selectedNode.type !== 'end' && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleNodeDataUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
