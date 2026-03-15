import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAssignableRoles,
  getUserRoles,
  type IdentityUserDto,
  type IdentityRoleDto,
} from '../../../services/identity';

export default function UsersPage() {
  const [users, setUsers] = useState<IdentityUserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IdentityUserDto | null>(null);
  const [roles, setRoles] = useState<IdentityRoleDto[]>([]);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await getUsers({ skipCount: (p - 1) * pageSize, maxResultCount: pageSize });
      setUsers(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {
      message.error('Failed to load users');
    }
    setLoading(false);
  };

  const loadRoles = async () => {
    try {
      const res = await getAssignableRoles();
      setRoles(res.data.items);
    } catch {}
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, lockoutEnabled: true, roleNames: [] });
    setModalOpen(true);
  };

  const openEdit = async (user: IdentityUserDto) => {
    setEditingUser(user);
    try {
      const rolesRes = await getUserRoles(user.id);
      form.setFieldsValue({
        ...user,
        roleNames: rolesRes.data.items.map((r) => r.name),
      });
    } catch {
      form.setFieldsValue(user);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('User updated');
      } else {
        await createUser(values);
        message.success('User created');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('User deleted');
      loadUsers();
    } catch {
      message.error('Failed to delete user');
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', marginBottom: 16,
        borderBottom: '1px solid var(--ce-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
            {totalCount} user{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            New User
          </Button>
        </div>
      </div>

      <Table
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          onChange: (p) => {
            setPage(p);
            loadUsers(p);
          },
        }}
        columns={[
          {
            title: 'Username',
            dataIndex: 'userName',
            key: 'userName',
          },
          {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
          },
          {
            title: 'Name',
            key: 'name',
            render: (_: unknown, r: IdentityUserDto) => {
              const full = `${r.name || ''} ${r.surname || ''}`.trim();
              return full || '-';
            },
          },
          {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (v: boolean) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: v ? '#3D8B6E' : '#A7A9B7',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 13, color: v ? '#3D8B6E' : '#7A7D8E', fontWeight: 500 }}>
                  {v ? 'Active' : 'Inactive'}
                </span>
              </span>
            ),
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: IdentityUserDto) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'New User'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="userName" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="name" label="First Name">
              <Input />
            </Form.Item>
            <Form.Item name="surname" label="Last Name">
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="phoneNumber" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="roleNames" label="Roles">
            <Select mode="multiple" options={roles.map((r) => ({ label: r.name, value: r.name }))} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="lockoutEnabled" label="Lockout Enabled" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
