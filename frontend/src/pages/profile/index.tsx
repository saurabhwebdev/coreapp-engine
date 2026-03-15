import { useState, useEffect } from 'react';
import { Card, Button, Form, Input, message, Spin } from 'antd';
import { SaveOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { avatarStyles, getAvatarConfig, saveAvatarConfig, generateAvatarDataUri } from '../../utils/avatar';

interface ProfileDto {
  userName: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [profileForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get<ProfileDto>('/api/account/my-profile');
      setProfile(res.data);
      profileForm.setFieldsValue(res.data);
    } catch {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSaving(true);
      await api.put('/api/account/my-profile', values);
      message.success('Profile updated');
      setEditing(false);
      loadProfile();
    } catch (err: any) {
      message.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      setChangingPwd(true);
      await api.post('/api/account/my-profile/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password changed successfully');
      pwdForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  // Avatar
  const [avatarConfig, setAvatarConfig] = useState(getAvatarConfig);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const handleAvatarStyleChange = (style: string) => {
    const newConfig = { ...avatarConfig, style };
    setAvatarConfig(newConfig);
    saveAvatarConfig(newConfig);
  };

  const handleRandomizeSeed = () => {
    const newConfig = { ...avatarConfig, seed: Math.random().toString(36).substring(2, 10) };
    setAvatarConfig(newConfig);
    saveAvatarConfig(newConfig);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  const currentAvatarUri = generateAvatarDataUri(avatarConfig.style, avatarConfig.seed);

  const infoRows = [
    { label: 'Username', key: 'userName' },
    { label: 'Email', key: 'email' },
    { label: 'First Name', key: 'name' },
    { label: 'Last Name', key: 'surname' },
    { label: 'Phone', key: 'phoneNumber' },
  ];

  return (
    <div className="ce-page-enter">
      {/* Avatar */}
      <div className="ce-stagger-1" style={{ marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              onClick={() => setAvatarPickerOpen(!avatarPickerOpen)}
              style={{
                width: 72, height: 72, borderRadius: 16, overflow: 'hidden',
                border: '2px solid var(--ce-border-light)', cursor: 'pointer',
                transition: 'border-color 0.15s', flexShrink: 0,
                background: 'var(--ce-bg-inset)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border-light)'; }}
            >
              {currentAvatarUri && <img src={currentAvatarUri} alt="Avatar" style={{ width: '100%', height: '100%' }} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ce-text)', marginBottom: 2 }}>
                {profile?.name || profile?.userName || 'User'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ce-text-muted)', marginBottom: 8 }}>
                Click avatar to customize
              </div>
              <Button size="small" icon={<ReloadOutlined />} onClick={handleRandomizeSeed}>
                Randomize
              </Button>
            </div>
          </div>
          {avatarPickerOpen && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ce-border-light)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ce-text-muted)', marginBottom: 10 }}>
                Choose style
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(avatarStyles).map(([key, { label }]) => {
                  const uri = generateAvatarDataUri(key, avatarConfig.seed);
                  const isSelected = avatarConfig.style === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleAvatarStyleChange(key)}
                      style={{
                        width: 64, textAlign: 'center', cursor: 'pointer',
                        opacity: isSelected ? 1 : 0.6,
                        transition: 'opacity 0.12s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.opacity = '0.6'; }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
                        border: isSelected ? '2px solid var(--ce-accent)' : '2px solid var(--ce-border-light)',
                        margin: '0 auto 4px', background: 'var(--ce-bg-inset)',
                        transition: 'border-color 0.12s',
                      }}>
                        {uri && <img src={uri} alt={label} style={{ width: '100%', height: '100%' }} />}
                      </div>
                      <div style={{ fontSize: 10, color: isSelected ? 'var(--ce-accent)' : 'var(--ce-text-muted)', fontWeight: isSelected ? 600 : 400 }}>
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Profile Info */}
      <div className="ce-stagger-2">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ce-text)' }}>
              Account Information
            </span>
            {!editing ? (
              <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="small" onClick={() => { setEditing(false); profileForm.setFieldsValue(profile); }}>Cancel</Button>
                <Button size="small" type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveProfile}>Save</Button>
              </div>
            )}
          </div>

          {!editing ? (
            <div>
              {infoRows.map((row, i) => (
                <div
                  key={row.key}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: i < infoRows.length - 1 ? '1px solid var(--ce-border-light)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ce-text-muted)' }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ce-text)' }}>
                    {(profile as any)?.[row.key] || '-'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Form form={profileForm} layout="vertical">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item name="userName" label="Username" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="name" label="First Name">
                  <Input />
                </Form.Item>
                <Form.Item name="surname" label="Last Name">
                  <Input />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Phone">
                  <Input />
                </Form.Item>
              </div>
            </Form>
          )}
        </Card>
      </div>

      {/* Change Password */}
      <div className="ce-stagger-3" style={{ marginTop: 20 }}>
        <Card>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ce-text)' }}>
              Change Password
            </span>
          </div>
          <Form form={pwdForm} layout="vertical" style={{ maxWidth: 420 }}>
            <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['newPassword']}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Button type="primary" loading={changingPwd} onClick={handleChangePassword}>
              Change Password
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
