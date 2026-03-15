import { useState, useEffect } from 'react';
import {
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  Card,
  Modal,
  message,
  Spin,
  Upload,
} from 'antd';
import {
  MailOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SendOutlined,
  SaveOutlined,
  LockOutlined,
  GlobalOutlined,
  BellOutlined,
  FileOutlined,
  DashboardOutlined,
  BranchesOutlined,
  MessageOutlined,
  FormOutlined,
  BarChartOutlined,
  BgColorsOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  getTimezoneSettings,
  updateTimezoneSettings,
  getTimezones,
  type EmailSettingsDto,
  type NameValue,
} from '../../services/settings';
import {
  getFeatures,
  updateFeatures,
  type FeatureGroupDto,
  type FeatureDto,
} from '../../services/features';
import EmptyState from '../../components/EmptyState';
import { colorThemes, getColorTheme, saveColorTheme, saveCustomColor, getCustomColor } from '../../utils/theme';
import { getBranding, saveBranding, resetBranding } from '../../utils/branding';

/* ─── Appearance Tab ─── */
function AppearanceTab() {
  const [activeTheme, setActiveTheme] = useState(getColorTheme().key);
  const [customColor, setCustomColor] = useState(getCustomColor() || '#6366F1');

  const handleSelect = (key: string) => {
    setActiveTheme(key);
    saveColorTheme(key);
  };

  const handleCustomColor = (hex: string) => {
    setCustomColor(hex);
    setActiveTheme('custom');
    saveCustomColor(hex);
  };

  return (
    <div>
      {/* Presets — full-width grid */}
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 12 }}>
        Theme Presets
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 10,
        marginBottom: 28,
      }}>
        {colorThemes.map((theme) => {
          const isActive = activeTheme === theme.key;
          return (
            <div
              key={theme.key}
              onClick={() => handleSelect(theme.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--ce-radius)',
                border: isActive ? `2px solid ${theme.accent}` : '1px solid var(--ce-border-light)',
                cursor: 'pointer',
                background: 'var(--ce-bg-card)',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--ce-border)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = isActive ? theme.accent : 'var(--ce-border-light)'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: theme.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: 'var(--ce-text)' }}>
                  {theme.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ce-text-muted)', fontFamily: 'var(--ce-mono)' }}>
                  {theme.accent}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom color — full width section */}
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 12 }}>
        Custom Color
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        borderRadius: 'var(--ce-radius)',
        border: activeTheme === 'custom' ? `2px solid ${customColor}` : '1px solid var(--ce-border-light)',
        background: 'var(--ce-bg-card)',
      }}>
        <input
          type="color"
          value={customColor}
          onChange={(e) => handleCustomColor(e.target.value)}
          style={{
            width: 36, height: 36, border: 'none', padding: 0, cursor: 'pointer',
            borderRadius: 8, overflow: 'hidden', background: 'transparent',
          }}
        />
        <Input
          value={customColor}
          onChange={(e) => {
            const v = e.target.value;
            setCustomColor(v);
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) handleCustomColor(v);
          }}
          style={{ width: 130, fontFamily: 'var(--ce-mono)', fontSize: 12 }}
          placeholder="#6366F1"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ce-text)' }}>
            {activeTheme === 'custom' ? 'Custom theme active' : 'Pick any color'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ce-text-muted)' }}>
            Use the color picker or enter a hex code
          </div>
        </div>
        {activeTheme === 'custom' && (
          <div style={{
            width: 48, height: 24, borderRadius: 12,
            background: customColor, opacity: 0.8,
          }} />
        )}
      </div>
    </div>
  );
}

/* ─── Branding Tab ─── */
function BrandingTab() {
  const [config, setConfig] = useState(getBranding);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    saveBranding(config);
    setTimeout(() => {
      setSaving(false);
      message.success('Branding updated');
    }, 300);
  };

  const handleReset = () => {
    resetBranding();
    setConfig(getBranding());
    message.success('Branding reset to defaults');
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setConfig((prev) => ({ ...prev, logoUrl: dataUri }));
    };
    reader.readAsDataURL(file);
    return false; // prevent default upload
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left: Form */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 14 }}>
            Brand Identity
          </div>
          <Form layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16 }}>
              <Form.Item label="App Name" style={{ marginBottom: 16 }}>
                <Input
                  value={config.appName}
                  onChange={(e) => setConfig((p) => ({ ...p, appName: e.target.value }))}
                  placeholder="CoreEngine"
                />
              </Form.Item>
              <Form.Item label="Logo Text" style={{ marginBottom: 16 }}>
                <Input
                  value={config.logoText}
                  onChange={(e) => setConfig((p) => ({ ...p, logoText: e.target.value.slice(0, 3) }))}
                  placeholder="CE"
                  maxLength={3}
                />
              </Form.Item>
            </div>
            <Form.Item label="Tagline" style={{ marginBottom: 16 }}>
              <Input
                value={config.tagline}
                onChange={(e) => setConfig((p) => ({ ...p, tagline: e.target.value }))}
                placeholder="Enterprise Platform"
              />
            </Form.Item>
            <Form.Item label="Logo Image (optional)" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {config.logoUrl ? (
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                    border: '1px solid var(--ce-border-light)', background: 'var(--ce-bg-inset)',
                  }}>
                    <img src={config.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    border: '1px dashed var(--ce-border)', background: 'var(--ce-bg-inset)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--ce-text-muted)', fontSize: 11,
                  }}>
                    None
                  </div>
                )}
                <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
                  <Button size="small" icon={<UploadOutlined />}>Upload</Button>
                </Upload>
                {config.logoUrl && (
                  <Button size="small" danger onClick={() => setConfig((p) => ({ ...p, logoUrl: undefined }))}>
                    Remove
                  </Button>
                )}
              </div>
            </Form.Item>
            <Form.Item label="Favicon URL (optional)" style={{ marginBottom: 16 }}>
              <Input
                value={config.faviconUrl || ''}
                onChange={(e) => setConfig((p) => ({ ...p, faviconUrl: e.target.value || undefined }))}
                placeholder="https://example.com/favicon.ico"
              />
            </Form.Item>
          </Form>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Branding
            </Button>
            <Button onClick={handleReset}>Reset to Defaults</Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div style={{
          padding: 20, borderRadius: 'var(--ce-radius)',
          border: '1px solid var(--ce-border-light)', background: 'var(--ce-bg-inset)',
          position: 'sticky', top: 80,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 16 }}>
            Live Preview
          </div>
          {/* Sidebar preview */}
          <div style={{ background: '#1D1D1F', borderRadius: 'var(--ce-radius-sm)', padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 8 }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--ce-accent), var(--ce-accent-hover))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 800,
                }}>
                  {config.logoText}
                </div>
              )}
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{config.appName}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>{config.tagline}</div>
              </div>
            </div>
            {/* Fake nav items */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Dashboard', 'Users', 'Settings'].map((item, i) => (
                <div key={item} style={{
                  padding: '6px 10px', borderRadius: 6, fontSize: 12,
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: i === 0 ? 'rgba(var(--ce-accent), 0.1)' : 'transparent',
                  fontWeight: i === 0 ? 600 : 400,
                  borderLeft: i === 0 ? '2px solid var(--ce-accent)' : '2px solid transparent',
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Header preview */}
          <div style={{
            background: 'var(--ce-bg-card)', border: '1px solid var(--ce-border-light)',
            borderRadius: 'var(--ce-radius-sm)', padding: '8px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>Overview</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'linear-gradient(135deg, var(--ce-accent), var(--ce-accent-hover))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 700,
              }}>
                {config.logoText.charAt(0)}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ce-text-secondary)' }}>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Email Tab ─── */
function EmailTab() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testForm] = Form.useForm();
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEmailSettings()
      .then((res) => form.setFieldsValue(res.data))
      .catch(() => message.error('Failed to load email settings'))
      .finally(() => setLoading(false));
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updateEmailSettings(values as EmailSettingsDto);
      message.success('Email settings saved');
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    try {
      const values = await testForm.validateFields();
      setSendingTest(true);
      await sendTestEmail(values);
      message.success('Test email sent');
      setTestModalOpen(false);
      testForm.resetFields();
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card>
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="smtpHost" label="SMTP Host" rules={[{ required: true }]}>
              <Input prefix={<GlobalOutlined style={{ color: '#A7A9B7' }} />} placeholder="smtp.example.com" />
            </Form.Item>
            <Form.Item name="smtpPort" label="SMTP Port" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} placeholder="587" min={1} max={65535} />
            </Form.Item>
            <Form.Item name="smtpUserName" label="Username">
              <Input placeholder="user@example.com" />
            </Form.Item>
            <Form.Item name="smtpPassword" label="Password">
              <Input.Password prefix={<LockOutlined style={{ color: '#A7A9B7' }} />} placeholder="Password" />
            </Form.Item>
            <Form.Item name="smtpDomain" label="Domain">
              <Input placeholder="example.com" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', paddingTop: 8 }}>
              <Form.Item name="smtpEnableSsl" label="Enable SSL" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
              <Form.Item name="smtpUseDefaultCredentials" label="Default Credentials" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
            </div>
            <Form.Item name="defaultFromAddress" label="Default From Address" rules={[{ required: true, type: 'email' }]}>
              <Input prefix={<MailOutlined style={{ color: '#A7A9B7' }} />} placeholder="noreply@example.com" />
            </Form.Item>
            <Form.Item name="defaultFromDisplayName" label="Default From Name">
              <Input placeholder="My Application" />
            </Form.Item>
          </div>
        </Form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Button icon={<SendOutlined />} onClick={() => setTestModalOpen(true)}>
            Send Test Email
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Modal
        title="Send Test Email"
        open={testModalOpen}
        onCancel={() => setTestModalOpen(false)}
        onOk={handleSendTest}
        confirmLoading={sendingTest}
        okText="Send"
      >
        <Form form={testForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="senderEmailAddress" label="Sender Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="noreply@example.com" />
          </Form.Item>
          <Form.Item name="targetEmailAddress" label="Target Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="test@example.com" />
          </Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input placeholder="Test email subject" />
          </Form.Item>
          <Form.Item name="body" label="Body" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Test email body" />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}

/* ─── Timezone Tab ─── */
function TimezoneTab() {
  const [timezones, setTimezones] = useState<NameValue[]>([]);
  const [current, setCurrent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTimezones(), getTimezoneSettings()])
      .then(([tzRes, curRes]) => {
        setTimezones(tzRes.data);
        setCurrent(curRes.data);
      })
      .catch(() => message.error('Failed to load timezone settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTimezoneSettings(current);
      message.success('Timezone saved');
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
      else message.error('Failed to save timezone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card>
        <div style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7D8E' }}>
              Timezone
            </span>
          </div>
          <Select
            showSearch
            style={{ width: '100%' }}
            value={current || undefined}
            placeholder="Select a timezone"
            optionFilterProp="label"
            onChange={(val) => setCurrent(val)}
            options={timezones.map((tz) => ({
              value: tz.value,
              label: tz.name || tz.value,
            }))}
          />
          <div style={{ marginTop: 24 }}>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </Spin>
  );
}

/* ─── Modules (Features) Tab ─── */
function ModulesTab() {
  const [groups, setGroups] = useState<FeatureGroupDto[]>([]);
  const [featureValues, setFeatureValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const loadFeatures = () => {
    setLoading(true);
    getFeatures('T', '')
      .then((res) => {
        setGroups(res.data.groups);
        const values: Record<string, string> = {};
        res.data.groups.forEach((g) =>
          g.features.forEach((f) => { values[f.name] = f.value; })
        );
        setFeatureValues(values);
      })
      .catch(() => message.error('Failed to load modules'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFeatures(); }, []);

  const toggleFeature = async (name: string, checked: boolean) => {
    const newValue = checked ? 'true' : 'false';
    setTogglingKey(name);
    setFeatureValues((prev) => ({ ...prev, [name]: newValue }));
    try {
      const allFeatures = Object.entries({ ...featureValues, [name]: newValue }).map(([n, v]) => ({ name: n, value: v }));
      await updateFeatures('T', '', allFeatures);
      message.success(`${checked ? 'Enabled' : 'Disabled'} successfully`);
      loadFeatures();
      window.dispatchEvent(new CustomEvent('features-changed'));
    } catch {
      setFeatureValues((prev) => ({ ...prev, [name]: checked ? 'false' : 'true' }));
      message.error('Failed to update module');
    } finally {
      setTogglingKey(null);
    }
  };

  const isToggle = (f: FeatureDto) =>
    f.valueType?.name === 'ToggleStringValueType' || (f.valueType?.name === 'FreeTextStringValueType' && (f.value === 'true' || f.value === 'false'));

  const moduleIcons: Record<string, React.ReactNode> = {
    'CoreApp.NotificationModule': <BellOutlined />,
    'CoreApp.FileManagementModule': <FileOutlined />,
    'CoreApp.AuditLogModule': <LockOutlined />,
    'CoreApp.DashboardModule': <DashboardOutlined />,
    'CoreApp.WorkflowModule': <BranchesOutlined />,
    'CoreApp.ChatModule': <MessageOutlined />,
    'CoreApp.FormsModule': <FormOutlined />,
    'CoreApp.ReportsModule': <BarChartOutlined />,
  };

  const allFeatures = groups.flatMap((g) => g.features);
  const activeCount = allFeatures.filter((f) => featureValues[f.name] === 'true').length;

  return (
    <Spin spinning={loading}>
      {allFeatures.length > 0 ? (
        <>
          {/* Toolbar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16, paddingBottom: 12,
            borderBottom: '1px solid var(--ce-border-light)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>
              {activeCount} of {allFeatures.length} modules active
            </span>
            <div style={{
              display: 'inline-flex', borderRadius: 'var(--ce-radius-sm)',
              border: '1px solid var(--ce-border)', overflow: 'hidden',
            }}>
              {([
                { key: 'list', icon: <UnorderedListOutlined /> },
                { key: 'grid', icon: <AppstoreOutlined /> },
              ] as const).map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 28, border: 'none', cursor: 'pointer',
                    background: viewMode === v.key ? 'var(--ce-accent)' : 'var(--ce-bg-card)',
                    color: viewMode === v.key ? '#fff' : 'var(--ce-text-muted)',
                    fontSize: 13, transition: 'all 0.12s',
                    fontFamily: 'inherit',
                  }}
                >
                  {v.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ─── List View ─── */}
          {viewMode === 'list' ? (
            <div style={{
              border: '1px solid var(--ce-border-light)',
              borderRadius: 'var(--ce-radius)',
              overflow: 'hidden',
            }}>
              {allFeatures.map((f, idx) => {
                const enabled = featureValues[f.name] === 'true';
                const toggleable = isToggle(f);
                const isToggling = togglingKey === f.name;
                return (
                  <div
                    key={f.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px',
                      background: 'var(--ce-bg-card)',
                      borderBottom: idx < allFeatures.length - 1 ? '1px solid var(--ce-border-light)' : 'none',
                      opacity: isToggling ? 0.6 : 1,
                      transition: 'opacity 0.15s, background 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ce-bg-card)'; }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14,
                      background: enabled ? 'var(--ce-accent-light)' : 'var(--ce-bg-inset)',
                      color: enabled ? 'var(--ce-accent)' : 'var(--ce-text-muted)',
                      transition: 'all 0.2s',
                    }}>
                      {moduleIcons[f.name] || <AppstoreOutlined />}
                    </div>

                    {/* Name + desc */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 13, color: 'var(--ce-text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {f.displayName}
                      </div>
                      {f.description && (
                        <div style={{
                          fontSize: 12, color: 'var(--ce-text-muted)', marginTop: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {f.description}
                        </div>
                      )}
                    </div>

                    {/* Status dot + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, minWidth: 70 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: enabled ? 'var(--ce-success)' : 'var(--ce-text-muted)',
                        transition: 'background 0.2s',
                      }} />
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        color: enabled ? 'var(--ce-success)' : 'var(--ce-text-muted)',
                        transition: 'color 0.2s',
                      }}>
                        {enabled ? 'Active' : 'Off'}
                      </span>
                    </div>

                    {/* Toggle */}
                    {toggleable && (
                      <Switch
                        checked={enabled}
                        loading={isToggling}
                        onChange={(checked) => toggleFeature(f.name, checked)}
                        size="small"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── Grid View ─── */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 12,
            }}>
              {allFeatures.map((f) => {
                const enabled = featureValues[f.name] === 'true';
                const toggleable = isToggle(f);
                const isToggling = togglingKey === f.name;
                return (
                  <div
                    key={f.name}
                    style={{
                      background: 'var(--ce-bg-card)',
                      border: '1px solid var(--ce-border-light)',
                      borderRadius: 'var(--ce-radius)',
                      padding: 16,
                      opacity: isToggling ? 0.6 : 1,
                      transition: 'opacity 0.15s, border-color 0.12s',
                      borderTop: `2px solid ${enabled ? 'var(--ce-accent)' : 'var(--ce-border-light)'}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ce-border-light)';
                      e.currentTarget.style.borderTopColor = enabled ? 'var(--ce-accent)' : 'var(--ce-border-light)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, marginBottom: 10,
                          background: enabled ? 'var(--ce-accent-light)' : 'var(--ce-bg-inset)',
                          color: enabled ? 'var(--ce-accent)' : 'var(--ce-text-muted)',
                          transition: 'all 0.2s',
                        }}>
                          {moduleIcons[f.name] || <AppstoreOutlined />}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ce-text)', marginBottom: 3 }}>
                          {f.displayName}
                        </div>
                        {f.description && (
                          <div style={{ fontSize: 12, color: 'var(--ce-text-muted)', lineHeight: 1.4 }}>
                            {f.description}
                          </div>
                        )}
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: enabled ? 'var(--ce-success)' : 'var(--ce-text-muted)',
                            transition: 'background 0.2s',
                          }} />
                          <span style={{
                            fontSize: 11, fontWeight: 500,
                            color: enabled ? 'var(--ce-success)' : 'var(--ce-text-muted)',
                          }}>
                            {enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      {toggleable && (
                        <Switch
                          checked={enabled}
                          loading={isToggling}
                          onChange={(checked) => toggleFeature(f.name, checked)}
                          size="small"
                          style={{ marginLeft: 12, flexShrink: 0 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        !loading && (
          <EmptyState title="No modules configured" description="Feature flags will appear here once configured." compact />
        )
      )}
    </Spin>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  return (
    <div className="ce-page-enter">
      <div className="ce-stagger-2">
        <Tabs
          defaultActiveKey="appearance"
          items={[
            {
              key: 'appearance',
              label: <span><BgColorsOutlined style={{ marginRight: 6 }} />Appearance</span>,
              children: <AppearanceTab />,
            },
            {
              key: 'branding',
              label: <span><EditOutlined style={{ marginRight: 6 }} />Branding</span>,
              children: <BrandingTab />,
            },
            {
              key: 'email',
              label: (
                <span><MailOutlined style={{ marginRight: 6 }} />Email</span>
              ),
              children: <EmailTab />,
            },
            {
              key: 'timezone',
              label: (
                <span><ClockCircleOutlined style={{ marginRight: 6 }} />Timezone</span>
              ),
              children: <TimezoneTab />,
            },
            {
              key: 'modules',
              label: (
                <span><AppstoreOutlined style={{ marginRight: 6 }} />Modules</span>
              ),
              children: <ModulesTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}
