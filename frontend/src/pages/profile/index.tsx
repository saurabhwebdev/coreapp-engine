import { useState, useEffect } from 'react';
import { Card, Button, Form, Input, message, Spin, Table, Modal, DatePicker, Select, Tag, Empty } from 'antd';
import { SaveOutlined, EditOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { avatarStyles, getAvatarConfig, saveAvatarConfig, generateAvatarDataUri } from '../../utils/avatar';

interface ProfileDto {
  userName: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
}

interface LinkUserDto {
  id: string;
  targetUserId: string;
  targetUserName?: string;
  targetTenantId?: string;
}

interface UserDelegationDto {
  id: string;
  sourceUserId: string;
  sourceUserName?: string;
  targetUserId: string;
  targetUserName?: string;
  startTime: string;
  endTime: string;
}

interface UserLookupDto {
  id: string;
  userName: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [profileForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  // Link Users
  const [linkedAccounts, setLinkedAccounts] = useState<LinkUserDto[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  // Delegations
  const [delegations, setDelegations] = useState<UserDelegationDto[]>([]);
  const [delegationsLoading, setDelegationsLoading] = useState(false);
  const [delegationModalOpen, setDelegationModalOpen] = useState(false);
  const [delegationCreating, setDelegationCreating] = useState(false);
  const [delegationForm] = Form.useForm();
  const [userOptions, setUserOptions] = useState<UserLookupDto[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  useEffect(() => { loadProfile(); loadLinkedAccounts(); loadDelegations(); }, []);

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

  // --- Link Users ---
  const loadLinkedAccounts = async () => {
    setLinksLoading(true);
    try {
      const res = await api.get<{ items: LinkUserDto[] }>('/api/app/link-user/my-links');
      setLinkedAccounts(res.data.items || []);
    } catch {
      // API may not be available yet — silently fail
      setLinkedAccounts([]);
    } finally {
      setLinksLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await api.delete(`/api/app/link-user/${id}`);
      message.success('Linked account removed');
      loadLinkedAccounts();
    } catch (err: any) {
      message.error(err.response?.data?.error?.message || 'Failed to remove link');
    }
  };

  // --- Delegations ---
  const loadDelegations = async () => {
    setDelegationsLoading(true);
    try {
      const res = await api.get<{ items: UserDelegationDto[] }>('/api/app/user-delegation/my-delegations');
      setDelegations(res.data.items || []);
    } catch {
      setDelegations([]);
    } finally {
      setDelegationsLoading(false);
    }
  };

  const searchUsers = async (filter: string) => {
    if (!filter || filter.length < 2) {
      setUserOptions([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      const res = await api.get<{ items: UserLookupDto[] }>('/api/identity/users', {
        params: { filter, maxResultCount: 10 },
      });
      setUserOptions(res.data.items || []);
    } catch {
      setUserOptions([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleCreateDelegation = async () => {
    try {
      const values = await delegationForm.validateFields();
      setDelegationCreating(true);
      await api.post('/api/app/user-delegation', {
        targetUserId: values.targetUserId,
        startTime: values.dateRange[0].toISOString(),
        endTime: values.dateRange[1].toISOString(),
      });
      message.success('Delegation created');
      setDelegationModalOpen(false);
      delegationForm.resetFields();
      setUserOptions([]);
      loadDelegations();
    } catch (err: any) {
      message.error(err.response?.data?.error?.message || 'Failed to create delegation');
    } finally {
      setDelegationCreating(false);
    }
  };

  const handleDeleteDelegation = async (id: string) => {
    try {
      await api.delete(`/api/app/user-delegation/${id}`);
      message.success('Delegation removed');
      loadDelegations();
    } catch (err: any) {
      message.error(err.response?.data?.error?.message || 'Failed to remove delegation');
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

  const isDelegationActive = (d: UserDelegationDto) => {
    const now = new Date();
    return new Date(d.startTime) <= now && new Date(d.endTime) >= now;
  };

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

      {/* Linked Accounts */}
      <div className="ce-stagger-4" style={{ marginTop: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ce-text)' }}>
              <LinkOutlined style={{ marginRight: 8 }} />
              Linked Accounts
            </span>
          </div>
          {linksLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : linkedAccounts.length > 0 ? (
            <Table
              dataSource={linkedAccounts}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'User',
                  dataIndex: 'targetUserName',
                  key: 'targetUserName',
                },
                {
                  title: 'Tenant',
                  dataIndex: 'targetTenantId',
                  key: 'targetTenantId',
                  render: (v: string | null) => v ? v.substring(0, 8) + '...' : <Tag>Current</Tag>,
                },
                {
                  title: '',
                  key: 'actions',
                  width: 80,
                  render: (_: any, record: LinkUserDto) => (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteLink(record.id)}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: 'var(--ce-text-muted)', fontSize: 13 }}>
                  No linked accounts. Link Users allows you to connect multiple accounts across
                  tenants so you can switch between them seamlessly. Linked accounts are typically
                  created via the account linking flow.
                </span>
              }
            />
          )}
        </Card>
      </div>

      {/* User Delegations */}
      <div className="ce-stagger-5" style={{ marginTop: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ce-text)' }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              User Delegations
            </span>
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDelegationModalOpen(true)}
            >
              New Delegation
            </Button>
          </div>
          {delegationsLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : delegations.length > 0 ? (
            <Table
              dataSource={delegations}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Delegated To',
                  dataIndex: 'targetUserName',
                  key: 'targetUserName',
                  render: (v: string) => v || '-',
                },
                {
                  title: 'From',
                  dataIndex: 'sourceUserName',
                  key: 'sourceUserName',
                  render: (v: string) => v || '-',
                },
                {
                  title: 'Start',
                  dataIndex: 'startTime',
                  key: 'startTime',
                  render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
                },
                {
                  title: 'End',
                  dataIndex: 'endTime',
                  key: 'endTime',
                  render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_: any, record: UserDelegationDto) => {
                    const now = new Date();
                    const start = new Date(record.startTime);
                    const end = new Date(record.endTime);
                    if (now < start) return <Tag color="blue">Upcoming</Tag>;
                    if (now > end) return <Tag color="default">Expired</Tag>;
                    return <Tag color="green">Active</Tag>;
                  },
                },
                {
                  title: '',
                  key: 'actions',
                  width: 80,
                  render: (_: any, record: UserDelegationDto) => (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteDelegation(record.id)}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: 'var(--ce-text-muted)', fontSize: 13 }}>
                  No delegations. User delegation allows another user to act on your behalf
                  for a specified time period.
                </span>
              }
            />
          )}
        </Card>
      </div>

      {/* Create Delegation Modal */}
      <Modal
        title="Create Delegation"
        open={delegationModalOpen}
        onCancel={() => { setDelegationModalOpen(false); delegationForm.resetFields(); setUserOptions([]); }}
        onOk={handleCreateDelegation}
        confirmLoading={delegationCreating}
        okText="Create"
        destroyOnClose
      >
        <Form form={delegationForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="targetUserId"
            label="Delegate To"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              showSearch
              placeholder="Search for a user..."
              filterOption={false}
              onSearch={searchUsers}
              loading={userSearchLoading}
              options={userOptions.map(u => ({ label: u.userName, value: u.id }))}
              notFoundContent={userSearchLoading ? <Spin size="small" /> : null}
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Delegation Period"
            rules={[{ required: true, message: 'Please select a date range' }]}
          >
            <DatePicker.RangePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
