import { useState, useEffect } from 'react';
import {
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
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
  BellOutlined,
  FileOutlined,
  DashboardOutlined,
  BranchesOutlined,
  MessageOutlined,
  FormOutlined,
  BarChartOutlined,
  TranslationOutlined,
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
import { getLanguages, getCurrentCulture, switchLanguage, type AppLanguage } from '../../utils/localization';
import { colorThemes, getColorTheme, saveColorTheme, saveCustomColor, getCustomColor, getLikedColors, saveLikedColor, removeLikedColor, type LikedColor } from '../../utils/theme';
import { getBranding, saveBranding, resetBranding } from '../../utils/branding';

/* ─── Appearance Tab ─── */
function AppearanceTab() {
  const [activeTheme, setActiveTheme] = useState(getColorTheme().key);
  const [customColor, setCustomColor] = useState(getCustomColor() || '#6366F1');
  const [likedColors, setLikedColors] = useState<LikedColor[]>(getLikedColors);
  const [likeModalOpen, setLikeModalOpen] = useState(false);
  const [likeName, setLikeName] = useState('');

  const handleSelect = (key: string) => {
    setActiveTheme(key);
    saveColorTheme(key);
  };

  const handleCustomColor = (hex: string) => {
    setCustomColor(hex);
    setActiveTheme('custom');
    saveCustomColor(hex);
  };

  const handleOpenLikeModal = () => {
    const currentHex = getColorTheme().accent;
    setLikeName(currentHex);
    setLikeModalOpen(true);
  };

  const handleConfirmLike = () => {
    const currentHex = getColorTheme().accent;
    setLikedColors(saveLikedColor(currentHex, likeName.trim() || currentHex));
    setLikeModalOpen(false);
    message.success('Color saved to Liked');
  };

  const handleRemoveLiked = (hex: string) => {
    setLikedColors(removeLikedColor(hex));
  };

  const handleApplyLiked = (hex: string) => {
    setCustomColor(hex);
    setActiveTheme('custom');
    saveCustomColor(hex);
  };

  return (
    <div>
      {/* Liked Colors */}
      {likedColors.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 10 }}>
            Liked Colors
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {likedColors.map((c) => (
              <div
                key={c.hex}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px 6px 6px',
                  borderRadius: 8,
                  border: '1px solid var(--ce-border-light)',
                  background: 'var(--ce-bg-card)',
                  cursor: 'pointer',
                  transition: 'border-color 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.hex; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border-light)'; }}
              >
                <div
                  onClick={() => handleApplyLiked(c.hex)}
                  style={{ width: 22, height: 22, borderRadius: 6, background: c.hex, flexShrink: 0 }}
                  title={`Apply ${c.name}`}
                />
                <div onClick={() => handleApplyLiked(c.hex)} style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ce-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name !== c.hex ? c.name : ''}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--ce-mono)', color: 'var(--ce-text-muted)' }}>
                    {c.hex}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveLiked(c.hex); }}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 12, color: 'var(--ce-text-muted)', padding: '0 2px',
                    lineHeight: 1, opacity: 0.5,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--ce-danger)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--ce-text-muted)'; }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <button
          onClick={handleOpenLikeModal}
          style={{
            border: '1px solid var(--ce-border)', borderRadius: 6,
            background: 'var(--ce-bg-card)', cursor: 'pointer',
            fontSize: 11, fontWeight: 500, color: 'var(--ce-text-secondary)',
            padding: '4px 10px', fontFamily: 'inherit', transition: 'all 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-accent)'; e.currentTarget.style.color = 'var(--ce-accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; e.currentTarget.style.color = 'var(--ce-text-secondary)'; }}
        >
          ♥ Save
        </button>
      </div>

      {/* Save to Liked modal */}
      <Modal
        title="Save Color"
        open={likeModalOpen}
        onOk={handleConfirmLike}
        onCancel={() => setLikeModalOpen(false)}
        okText="Save"
        width={360}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: getColorTheme().accent,
          }} />
          <div style={{ fontFamily: 'var(--ce-mono)', fontSize: 13, color: 'var(--ce-text-secondary)' }}>
            {getColorTheme().accent}
          </div>
        </div>
        <Input
          value={likeName}
          onChange={(e) => setLikeName(e.target.value)}
          placeholder="Color name (e.g. Ocean Blue)"
          autoFocus
          onPressEnter={handleConfirmLike}
        />
      </Modal>
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
      <Form form={form} layout="vertical">
        {/* Server */}
        <div className="ce-settings-label">SMTP Server</div>
        <div className="ce-settings-group">
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Host</span>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpHost" noStyle rules={[{ required: true }]}>
                <Input placeholder="smtp.example.com" />
              </Form.Item>
            </div>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Port</span>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpPort" noStyle rules={[{ required: true }]}>
                <InputNumber style={{ width: 120 }} placeholder="587" min={1} max={65535} />
              </Form.Item>
            </div>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Domain</span>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpDomain" noStyle>
                <Input placeholder="example.com" />
              </Form.Item>
            </div>
          </div>
          <div className="ce-settings-row">
            <div>
              <span className="ce-settings-row-label">Enable SSL</span>
              <div className="ce-settings-row-desc">Use TLS/SSL encryption</div>
            </div>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpEnableSsl" noStyle valuePropName="checked"><Switch /></Form.Item>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="ce-settings-label">Authentication</div>
        <div className="ce-settings-group">
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Username</span>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpUserName" noStyle><Input placeholder="user@example.com" /></Form.Item>
            </div>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Password</span>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpPassword" noStyle><Input.Password placeholder="Password" /></Form.Item>
            </div>
          </div>
          <div className="ce-settings-row">
            <div>
              <span className="ce-settings-row-label">Use Default</span>
              <div className="ce-settings-row-desc">Use system default credentials</div>
            </div>
            <div className="ce-settings-row-control">
              <Form.Item name="smtpUseDefaultCredentials" noStyle valuePropName="checked"><Switch /></Form.Item>
            </div>
          </div>
        </div>

        {/* Sender */}
        <div className="ce-settings-label">Default Sender</div>
        <div className="ce-settings-group">
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">From Address</span>
            <div className="ce-settings-row-control">
              <Form.Item name="defaultFromAddress" noStyle rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="noreply@example.com" />
              </Form.Item>
            </div>
          </div>
          <div className="ce-settings-row">
            <span className="ce-settings-row-label">Display Name</span>
            <div className="ce-settings-row-control">
              <Form.Item name="defaultFromDisplayName" noStyle>
                <Input placeholder="My Application" />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="ce-settings-footer">
          <Button icon={<SendOutlined />} onClick={() => setTestModalOpen(true)}>Send Test</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </Form>

      <Modal title="Send Test Email" open={testModalOpen} onCancel={() => setTestModalOpen(false)} onOk={handleSendTest} confirmLoading={sendingTest} okText="Send">
        <Form form={testForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="senderEmailAddress" label="From" rules={[{ required: true, type: 'email' }]}><Input placeholder="noreply@example.com" /></Form.Item>
          <Form.Item name="targetEmailAddress" label="To" rules={[{ required: true, type: 'email' }]}><Input placeholder="test@example.com" /></Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}><Input placeholder="Test email" /></Form.Item>
          <Form.Item name="body" label="Body" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="Hello..." /></Form.Item>
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
      <div>
        <div className="ce-settings-label">Region</div>
        <div className="ce-settings-group">
          <div className="ce-settings-row">
            <div>
              <span className="ce-settings-row-label">Timezone</span>
              <div className="ce-settings-row-desc">Affects date/time display across the platform</div>
            </div>
            <div className="ce-settings-row-control">
              <Select
                showSearch
                style={{ width: 300 }}
                value={current || undefined}
                placeholder="Select a timezone"
                optionFilterProp="label"
                onChange={(val) => setCurrent(val)}
                options={timezones.map((tz) => ({
                  value: tz.value,
                  label: tz.name || tz.value,
                }))}
              />
            </div>
          </div>
        </div>
        <div className="ce-settings-footer">
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
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
            /* ─── Grid View — Apple minimal ─── */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 10,
            }}>
              {allFeatures.map((f) => {
                const enabled = featureValues[f.name] === 'true';
                const toggleable = isToggle(f);
                const isToggling = togglingKey === f.name;
                return (
                  <div
                    key={f.name}
                    className="ce-settings-group"
                    style={{
                      padding: 14,
                      marginBottom: 0,
                      opacity: isToggling ? 0.5 : 1,
                      transition: 'opacity 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, marginBottom: 8,
                      background: enabled ? 'var(--ce-accent-light)' : 'var(--ce-bg-inset)',
                      color: enabled ? 'var(--ce-accent)' : 'var(--ce-text-muted)',
                      transition: 'all 0.15s',
                    }}>
                      {moduleIcons[f.name] || <AppstoreOutlined />}
                    </div>
                    {/* Name */}
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--ce-text)', marginBottom: 2 }}>
                      {f.displayName}
                    </div>
                    {/* Status */}
                    <div style={{
                      fontSize: 10, fontWeight: 500, marginBottom: 10,
                      color: enabled ? 'var(--ce-success)' : 'var(--ce-text-muted)',
                    }}>
                      {enabled ? 'Active' : 'Off'}
                    </div>
                    {/* Switch */}
                    {toggleable && (
                      <Switch
                        checked={enabled}
                        loading={isToggling}
                        onChange={(checked) => toggleFeature(f.name, checked)}
                        size="small"
                      />
                    )}
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

/* ─── Language Tab ─── */
function LanguageTab() {
  const [languages, setLanguages] = useState<AppLanguage[]>([]);
  const [current, setCurrent] = useState(getCurrentCulture());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLanguages().then((langs) => {
      setLanguages(langs);
      setCurrent(getCurrentCulture());
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading}>
      <div>
        <div className="ce-settings-label">Display Language</div>
        <div className="ce-settings-group">
          <div className="ce-settings-row">
            <div>
              <span className="ce-settings-row-label">Language</span>
              <div className="ce-settings-row-desc">
                All UI labels and API responses will use the selected language
              </div>
            </div>
            <div className="ce-settings-row-control">
              <Select
                showSearch
                style={{ width: 280 }}
                value={current}
                optionFilterProp="label"
                onChange={(val) => switchLanguage(val)}
                options={languages.map((l) => ({
                  value: l.cultureName,
                  label: `${l.displayName} (${l.cultureName})`,
                }))}
              />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ce-text-muted)', marginTop: 8 }}>
          Changing the language will reload the application. ABP localizes all labels, validation messages, and permission names automatically.
        </div>
      </div>
    </Spin>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  return (
    <div className="ce-page-enter">
      <Tabs
        defaultActiveKey="appearance"
        tabPosition="left"
        style={{ minHeight: 400 }}
        tabBarStyle={{
          width: 180,
          borderRight: '1px solid var(--ce-border-light)',
          paddingRight: 0,
        }}
        items={[
          {
            key: 'appearance',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BgColorsOutlined /> Appearance</span>,
            children: <div style={{ paddingLeft: 20, paddingRight: 8 }}><AppearanceTab /></div>,
          },
          {
            key: 'branding',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><EditOutlined /> Branding</span>,
            children: <div style={{ paddingLeft: 20, paddingRight: 8 }}><BrandingTab /></div>,
          },
          {
            key: 'email',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MailOutlined /> Email</span>,
            children: <div style={{ paddingLeft: 20, paddingRight: 8 }}><EmailTab /></div>,
          },
          {
            key: 'timezone',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClockCircleOutlined /> Timezone</span>,
            children: <div style={{ paddingLeft: 20, paddingRight: 8 }}><TimezoneTab /></div>,
          },
          {
            key: 'language',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TranslationOutlined /> Language</span>,
            children: <div style={{ paddingLeft: 20, paddingRight: 8 }}><LanguageTab /></div>,
          },
          {
            key: 'modules',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AppstoreOutlined /> Modules</span>,
            children: <div style={{ paddingLeft: 20, paddingRight: 8 }}><ModulesTab /></div>,
          },
        ]}
      />
    </div>
  );
}
