import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  updatePermissions,
  type IdentityRoleDto,
  type PermissionGroup,
} from '../../../services/identity';

export default function RolesPage() {
  const [roles, setRoles] = useState<IdentityRoleDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IdentityRoleDto | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [grantedPermissions, setGrantedPermissions] = useState<Set<string>>(new Set());
  const [form] = Form.useForm();

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles({ maxResultCount: 100 });
      setRoles(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {
      message.error('Failed to load roles');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ isDefault: false, isPublic: true });
    setModalOpen(true);
  };

  const openEdit = (role: IdentityRoleDto) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setModalOpen(true);
  };

  const openPermissions = async (role: IdentityRoleDto) => {
    setEditingRole(role);
    try {
      const res = await getPermissions('R', role.name);
      setPermissionGroups(res.data.groups);
      const granted = new Set<string>();
      res.data.groups.forEach((g) =>
        g.permissions.forEach((p) => {
          if (p.isGranted) granted.add(p.name);
        })
      );
      setGrantedPermissions(granted);
      setPermModalOpen(true);
    } catch {
      message.error('Failed to load permissions');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await updateRole(editingRole.id, { ...values, concurrencyStamp: editingRole.concurrencyStamp });
        message.success('Role updated');
      } else {
        await createRole(values);
        message.success('Role created');
      }
      setModalOpen(false);
      loadRoles();
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
    }
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    try {
      const allPermissions: { name: string; isGranted: boolean }[] = [];
      permissionGroups.forEach((g) =>
        g.permissions.forEach((p) => {
          allPermissions.push({ name: p.name, isGranted: grantedPermissions.has(p.name) });
        })
      );
      await updatePermissions('R', editingRole.name, { permissions: allPermissions });
      message.success('Permissions updated');
      setPermModalOpen(false);
    } catch {
      message.error('Failed to update permissions');
    }
  };

  const togglePermission = (name: string) => {
    setGrantedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleGroupAll = (group: PermissionGroup) => {
    setGrantedPermissions((prev) => {
      const next = new Set(prev);
      const allGranted = group.permissions.every((p) => next.has(p.name));
      group.permissions.forEach((p) => {
        if (allGranted) next.delete(p.name);
        else next.add(p.name);
      });
      return next;
    });
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
            {totalCount} role{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Role
          </Button>
        </div>
      </div>

      <Table
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={{ total: totalCount }}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
          },
          {
            title: 'Default',
            dataIndex: 'isDefault',
            key: 'isDefault',
            render: (v: boolean) =>
              v ? (
                <Tag style={{ background: 'rgba(74, 127, 193, 0.08)', color: '#4A7FC1' }}>Default</Tag>
              ) : (
                '-'
              ),
          },
          {
            title: 'Static',
            dataIndex: 'isStatic',
            key: 'isStatic',
            render: (v: boolean) =>
              v ? (
                <Tag style={{ background: '#F0EDE8', color: '#7A7D8E' }}>Static</Tag>
              ) : (
                '-'
              ),
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: IdentityRoleDto) => (
              <Space>
                <Button
                  size="small"
                  icon={<LockOutlined />}
                  onClick={() => openPermissions(record)}
                  style={{
                    borderColor: '#E8E4DE',
                    color: '#7A7D8E',
                    fontWeight: 500,
                  }}
                >
                  Permissions
                </Button>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                {!record.isStatic && (
                  <Popconfirm
                    title="Delete this role?"
                    onConfirm={() => {
                      deleteRole(record.id).then(() => {
                        message.success('Role deleted');
                        loadRoles();
                      });
                    }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingRole ? 'Edit Role' : 'New Role'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input disabled={editingRole?.isStatic} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item name="isDefault" label="Default Role" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isPublic" label="Public" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Permissions - ${editingRole?.name}`}
        open={permModalOpen}
        onOk={handleSavePermissions}
        onCancel={() => setPermModalOpen(false)}
        width={700}
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {permissionGroups.map((group) => {
            const allGranted = group.permissions.every((p) => grantedPermissions.has(p.name));
            const someGranted =
              !allGranted && group.permissions.some((p) => grantedPermissions.has(p.name));

            return (
              <div key={group.name} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    background: '#F0EDE8',
                    borderRadius: 8,
                    padding: '10px 16px',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Checkbox
                    checked={allGranted}
                    indeterminate={someGranted}
                    onChange={() => toggleGroupAll(group)}
                    style={{ fontWeight: 600, fontSize: 13, color: '#2D3142' }}
                  >
                    {group.displayName}
                  </Checkbox>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#A7A9B7',
                      fontWeight: 500,
                    }}
                  >
                    {group.permissions.filter((p) => grantedPermissions.has(p.name)).length}/
                    {group.permissions.length}
                  </span>
                </div>
                <div style={{ padding: '4px 8px' }}>
                  {group.permissions.map((perm) => (
                    <div
                      key={perm.name}
                      style={{
                        marginLeft: perm.parentName ? 24 : 0,
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      <Checkbox
                        checked={grantedPermissions.has(perm.name)}
                        onChange={() => togglePermission(perm.name)}
                      >
                        {perm.displayName}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
