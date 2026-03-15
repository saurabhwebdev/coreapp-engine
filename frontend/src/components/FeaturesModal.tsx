import { useState, useEffect } from 'react';
import { Modal, Switch, Button, Spin, Collapse, message } from 'antd';
import { ReloadOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  getFeatures,
  updateFeatures,
  resetFeatures,
  type FeatureGroupDto,
  type FeatureDto,
} from '../services/features';

interface FeaturesModalProps {
  open: boolean;
  onClose: () => void;
  providerName: string;
  providerKey: string;
  title: string;
}

export default function FeaturesModal({ open, onClose, providerName, providerKey, title }: FeaturesModalProps) {
  const [groups, setGroups] = useState<FeatureGroupDto[]>([]);
  const [featureValues, setFeatureValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadFeatures = () => {
    if (!open) return;
    setLoading(true);
    getFeatures(providerName, providerKey)
      .then((res) => {
        setGroups(res.data.groups);
        const values: Record<string, string> = {};
        res.data.groups.forEach((g) =>
          g.features.forEach((f) => {
            values[f.name] = f.value;
          })
        );
        setFeatureValues(values);
      })
      .catch(() => message.error('Failed to load features'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeatures();
  }, [open, providerName, providerKey]);

  const toggleFeature = (name: string, checked: boolean) => {
    setFeatureValues((prev) => ({ ...prev, [name]: checked ? 'true' : 'false' }));
  };

  const isToggle = (f: FeatureDto) =>
    f.valueType?.name === 'ToggleStringValueType' || (f.valueType?.name === 'FreeTextStringValueType' && (f.value === 'true' || f.value === 'false'));

  const handleSave = async () => {
    setSaving(true);
    try {
      const features = Object.entries(featureValues).map(([name, value]) => ({ name, value }));
      await updateFeatures(providerName, providerKey, features);
      message.success('Features updated');
      onClose();
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
      else message.error('Failed to save features');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetFeatures(providerName, providerKey);
      message.success('Features reset to default');
      loadFeatures();
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
      else message.error('Failed to reset features');
    } finally {
      setResetting(false);
    }
  };

  const renderFeature = (f: FeatureDto) => {
    const enabled = featureValues[f.name] === 'true';
    const toggleable = isToggle(f);
    return (
      <div
        key={f.name}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: 8,
          background: enabled ? 'rgba(194, 112, 62, 0.05)' : '#FAFAF8',
          border: `1px solid ${enabled ? 'rgba(194, 112, 62, 0.2)' : '#F0EDE8'}`,
          marginBottom: 8,
          marginLeft: f.depth > 0 ? f.depth * 20 : 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color: enabled ? '#C2703E' : '#A7A9B7', fontSize: 14 }}>
              {enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            </span>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#2D3142' }}>
              {f.displayName}
            </span>
          </div>
          {f.description && (
            <div style={{ fontSize: 12, color: '#7A7D8E', marginLeft: 22 }}>
              {f.description}
            </div>
          )}
        </div>
        {toggleable && (
          <Switch
            checked={enabled}
            onChange={(checked) => toggleFeature(f.name, checked)}
            style={{ flexShrink: 0, marginLeft: 12 }}
          />
        )}
      </div>
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={640}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button danger icon={<ReloadOutlined />} loading={resetting} onClick={handleReset}>
            Reset to Default
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      }
    >
      <Spin spinning={loading}>
        {groups.length > 1 ? (
          <Collapse
            defaultActiveKey={groups.map((g) => g.name)}
            ghost
            items={groups.map((g) => ({
              key: g.name,
              label: (
                <span style={{ fontWeight: 600, fontSize: 13, color: '#2D3142' }}>
                  {g.displayName}
                </span>
              ),
              children: <div>{g.features.map(renderFeature)}</div>,
            }))}
          />
        ) : (
          <div style={{ padding: '8px 0' }}>
            {groups.flatMap((g) => g.features).map(renderFeature)}
          </div>
        )}
        {!loading && groups.length === 0 && (
          <div className="ce-empty" style={{ padding: 40 }}>
            No features available
          </div>
        )}
      </Spin>
    </Modal>
  );
}
