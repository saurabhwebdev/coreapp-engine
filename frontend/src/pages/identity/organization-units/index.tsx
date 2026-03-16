import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tree,
  Table,
  Tabs,
  Tag,
  Badge,
  message,
  Popconfirm,
  Spin,
  TreeSelect,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  DragOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  getOrganizationUnits,
  createOrganizationUnit,
  updateOrganizationUnit,
  deleteOrganizationUnit,
  getMembers,
  addMember,
  removeMember,
  getRoles as getOuRoles,
  addRole,
  removeRole,
  type OrganizationUnitDto,
  type OrganizationUnitMemberDto,
  type OrganizationUnitRoleDto,
} from '../../../services/organizationUnit';
import { getUsers, getRoles } from '../../../services/identity';
import type { IdentityUserDto, IdentityRoleDto } from '../../../services/identity';
import type { DataNode } from 'antd/es/tree';

export default function OrganizationUnitsPage() {
  // Tree state
  const [units, setUnits] = useState<OrganizationUnitDto[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnitDto | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Members state
  const [members, setMembers] = useState<OrganizationUnitMemberDto[]>([]);
  const [membersTotalCount, setMembersTotalCount] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const membersPageSize = 10;

  // Roles state
  const [ouRoles, setOuRoles] = useState<OrganizationUnitRoleDto[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Create/Edit OU modal
  const [ouModalOpen, setOuModalOpen] = useState(false);
  const [ouModalMode, setOuModalMode] = useState<'create' | 'edit' | 'createChild'>('create');
  const [ouForm] = Form.useForm();

  // Move OU modal
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveParentId, setMoveParentId] = useState<string | null>(null);

  // Add member modal
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<IdentityUserDto[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchFilter, setUserSearchFilter] = useState('');

  // Add role modal
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [allRoles, setAllRoles] = useState<IdentityRoleDto[]>([]);
  const [allRolesLoading, setAllRolesLoading] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState('members');

  // ─── Load helpers ───────────────────────────────────────────────────

  const loadUnits = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await getOrganizationUnits();
      setUnits(res.data.items);
    } catch {
      message.error('Failed to load organization units');
    }
    setTreeLoading(false);
  }, []);

  const loadMembers = useCallback(
    async (unitId: string, page = 1) => {
      setMembersLoading(true);
      try {
        const res = await getMembers(unitId, {
          skipCount: (page - 1) * membersPageSize,
          maxResultCount: membersPageSize,
        });
        setMembers(res.data.items);
        setMembersTotalCount(res.data.totalCount);
      } catch {
        message.error('Failed to load members');
      }
      setMembersLoading(false);
    },
    [membersPageSize],
  );

  const loadOuRoles = useCallback(async (unitId: string) => {
    setRolesLoading(true);
    try {
      const res = await getOuRoles(unitId);
      setOuRoles(res.data.items);
    } catch {
      message.error('Failed to load roles');
    }
    setRolesLoading(false);
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  useEffect(() => {
    if (selectedUnit) {
      setMembersPage(1);
      loadMembers(selectedUnit.id, 1);
      loadOuRoles(selectedUnit.id);
    } else {
      setMembers([]);
      setMembersTotalCount(0);
      setOuRoles([]);
    }
  }, [selectedUnit, loadMembers, loadOuRoles]);

  // ─── Build tree data ────────────────────────────────────────────────

  const treeData = useMemo(() => {
    const map = new Map<string | null, OrganizationUnitDto[]>();
    units.forEach((u) => {
      const parentKey = u.parentId ?? '__root__';
      if (!map.has(parentKey)) map.set(parentKey, []);
      map.get(parentKey)!.push(u);
    });

    const buildChildren = (parentId: string | null): DataNode[] => {
      const children = map.get(parentId ?? '__root__') || [];
      return children.map((u) => ({
        key: u.id,
        title: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{u.displayName}</span>
            {u.memberCount > 0 && (
              <Badge
                count={u.memberCount}
                size="small"
                style={{
                  backgroundColor: 'rgba(74, 127, 193, 0.12)',
                  color: '#4A7FC1',
                  fontWeight: 600,
                  fontSize: 10,
                  boxShadow: 'none',
                }}
              />
            )}
          </span>
        ),
        children: buildChildren(u.id),
      }));
    };

    return buildChildren(null);
  }, [units]);

  // Tree data for move modal (excluding selected unit and its descendants)
  const moveTreeData = useMemo(() => {
    if (!selectedUnit) return [];

    const descendantIds = new Set<string>();
    const collectDescendants = (parentId: string) => {
      descendantIds.add(parentId);
      units.filter((u) => u.parentId === parentId).forEach((u) => collectDescendants(u.id));
    };
    collectDescendants(selectedUnit.id);

    const buildChildren = (parentId: string | null): any[] => {
      return units
        .filter((u) => u.parentId === parentId && !descendantIds.has(u.id))
        .map((u) => ({
          value: u.id,
          title: u.displayName,
          children: buildChildren(u.id),
        }));
    };

    return [
      {
        value: '__root__',
        title: '(Root)',
        children: buildChildren(null),
      },
    ];
  }, [units, selectedUnit]);

  // ─── Tree selection ─────────────────────────────────────────────────

  const handleSelectNode = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const unit = units.find((u) => u.id === selectedKeys[0]);
      setSelectedUnit(unit || null);
    } else {
      setSelectedUnit(null);
    }
  };

  // ─── OU CRUD ────────────────────────────────────────────────────────

  const openCreateRoot = () => {
    setOuModalMode('create');
    ouForm.resetFields();
    setOuModalOpen(true);
  };

  const openCreateChild = () => {
    if (!selectedUnit) return;
    setOuModalMode('createChild');
    ouForm.resetFields();
    setOuModalOpen(true);
  };

  const openEdit = () => {
    if (!selectedUnit) return;
    setOuModalMode('edit');
    ouForm.setFieldsValue({ displayName: selectedUnit.displayName });
    setOuModalOpen(true);
  };

  const handleSaveOu = async () => {
    try {
      const values = await ouForm.validateFields();
      if (ouModalMode === 'edit' && selectedUnit) {
        await updateOrganizationUnit(selectedUnit.id, { displayName: values.displayName });
        message.success('Organization unit updated');
      } else {
        const parentId = ouModalMode === 'createChild' ? selectedUnit?.id : null;
        await createOrganizationUnit({ displayName: values.displayName, parentId });
        message.success('Organization unit created');
      }
      setOuModalOpen(false);
      await loadUnits();
      // Re-select updated unit
      if (ouModalMode === 'edit' && selectedUnit) {
        const res = await getOrganizationUnits();
        const updated = res.data.items.find((u) => u.id === selectedUnit.id);
        if (updated) setSelectedUnit(updated);
      }
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      }
    }
  };

  const handleDeleteOu = async () => {
    if (!selectedUnit) return;
    try {
      await deleteOrganizationUnit(selectedUnit.id);
      message.success('Organization unit deleted');
      setSelectedUnit(null);
      loadUnits();
    } catch {
      message.error('Failed to delete organization unit');
    }
  };

  // ─── Move OU ────────────────────────────────────────────────────────

  const openMove = () => {
    if (!selectedUnit) return;
    setMoveParentId(selectedUnit.parentId ?? '__root__');
    setMoveModalOpen(true);
  };

  const handleMove = async () => {
    if (!selectedUnit) return;
    try {
      // Delete and recreate under new parent to simulate move
      // Since there's no dedicated move API, we warn the user
      const newParentId = moveParentId === '__root__' ? null : moveParentId;
      if (newParentId === selectedUnit.parentId) {
        setMoveModalOpen(false);
        return;
      }
      // Use delete + recreate with same name under new parent
      const displayName = selectedUnit.displayName;
      await deleteOrganizationUnit(selectedUnit.id);
      const res = await createOrganizationUnit({ displayName, parentId: newParentId });
      message.success('Organization unit moved');
      setMoveModalOpen(false);
      await loadUnits();
      // Select the newly created unit
      const newUnits = await getOrganizationUnits();
      const newUnit = newUnits.data.items.find((u) => u.id === res.data.id);
      setSelectedUnit(newUnit || null);
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      } else {
        message.error('Failed to move organization unit');
      }
    }
  };

  // ─── Members ────────────────────────────────────────────────────────

  const openAddMember = async () => {
    setAddMemberModalOpen(true);
    setSelectedUserIds([]);
    setUserSearchFilter('');
    setAllUsersLoading(true);
    try {
      const res = await getUsers({ maxResultCount: 100 });
      setAllUsers(res.data.items);
    } catch {
      message.error('Failed to load users');
    }
    setAllUsersLoading(false);
  };

  const handleAddMembers = async () => {
    if (!selectedUnit || selectedUserIds.length === 0) return;
    try {
      for (const userId of selectedUserIds) {
        await addMember(selectedUnit.id, userId);
      }
      message.success(`${selectedUserIds.length} member(s) added`);
      setAddMemberModalOpen(false);
      loadMembers(selectedUnit.id, membersPage);
      loadUnits(); // refresh member count
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      } else {
        message.error('Failed to add members');
      }
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedUnit) return;
    try {
      await removeMember(selectedUnit.id, userId);
      message.success('Member removed');
      loadMembers(selectedUnit.id, membersPage);
      loadUnits();
    } catch {
      message.error('Failed to remove member');
    }
  };

  // ─── Roles ──────────────────────────────────────────────────────────

  const openAddRole = async () => {
    setAddRoleModalOpen(true);
    setSelectedRoleIds([]);
    setAllRolesLoading(true);
    try {
      const res = await getRoles({ maxResultCount: 100 });
      setAllRoles(res.data.items);
    } catch {
      message.error('Failed to load roles');
    }
    setAllRolesLoading(false);
  };

  const handleAddRoles = async () => {
    if (!selectedUnit || selectedRoleIds.length === 0) return;
    try {
      for (const roleId of selectedRoleIds) {
        await addRole(selectedUnit.id, roleId);
      }
      message.success(`${selectedRoleIds.length} role(s) added`);
      setAddRoleModalOpen(false);
      loadOuRoles(selectedUnit.id);
      loadUnits();
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      } else {
        message.error('Failed to add roles');
      }
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUnit) return;
    try {
      await removeRole(selectedUnit.id, roleId);
      message.success('Role removed');
      loadOuRoles(selectedUnit.id);
      loadUnits();
    } catch {
      message.error('Failed to remove role');
    }
  };

  // ─── Filtered users for add member modal ───────────────────────────

  const existingMemberIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);
  const filteredUsers = useMemo(() => {
    let list = allUsers.filter((u) => !existingMemberIds.has(u.id));
    if (userSearchFilter.trim()) {
      const q = userSearchFilter.toLowerCase();
      list = list.filter(
        (u) =>
          u.userName.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.surname && u.surname.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [allUsers, existingMemberIds, userSearchFilter]);

  // Filtered roles for add role modal
  const existingRoleIds = useMemo(() => new Set(ouRoles.map((r) => r.id)), [ouRoles]);
  const filteredRoles = useMemo(
    () => allRoles.filter((r) => !existingRoleIds.has(r.id)),
    [allRoles, existingRoleIds],
  );

  // ─── Check if selected unit has children ────────────────────────────

  const selectedHasChildren = useMemo(
    () => selectedUnit && units.some((u) => u.parentId === selectedUnit.id),
    [selectedUnit, units],
  );

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 200px)' }}>
      {/* LEFT PANEL — Tree */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          background: 'var(--ce-bg-card)',
          border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Tree toolbar */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--ce-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--ce-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ApartmentOutlined style={{ fontSize: 15, color: 'var(--ce-text-muted)' }} />
            Organization Tree
          </span>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateRoot}>
            Add Root
          </Button>
        </div>

        {/* Tree content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          {treeLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="small" />
            </div>
          ) : treeData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: 'var(--ce-text-muted)', fontSize: 12 }}>
                  No organization units yet
                </span>
              }
            />
          ) : (
            <Tree
              treeData={treeData}
              selectedKeys={selectedUnit ? [selectedUnit.id] : []}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              onSelect={handleSelectNode}
              blockNode
              showLine={{ showLeafIcon: false }}
              style={{ background: 'transparent' }}
            />
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Details */}
      <div
        style={{
          flex: 1,
          background: 'var(--ce-bg-card)',
          border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {selectedUnit ? (
          <>
            {/* Details header / toolbar */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--ce-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TeamOutlined style={{ fontSize: 16, color: '#4A7FC1' }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ce-text)' }}>
                  {selectedUnit.displayName}
                </span>
                <Tag
                  style={{
                    background: 'rgba(74, 127, 193, 0.08)',
                    color: '#4A7FC1',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {selectedUnit.memberCount} member{selectedUnit.memberCount !== 1 ? 's' : ''}
                </Tag>
              </div>
              <Space size={6}>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={openCreateChild}
                  style={{ borderColor: '#E8E4DE', color: '#7A7D8E', fontWeight: 500 }}
                >
                  Add Child
                </Button>
                <Button size="small" icon={<EditOutlined />} onClick={openEdit} />
                <Button size="small" icon={<DragOutlined />} onClick={openMove} title="Move" />
                <Popconfirm
                  title={
                    selectedHasChildren
                      ? 'This unit has children. Deleting it will also remove all child units. Continue?'
                      : 'Delete this organization unit?'
                  }
                  onConfirm={handleDeleteOu}
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </div>

            {/* Tabs */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'members',
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <UserOutlined />
                        Members
                        <Badge
                          count={membersTotalCount}
                          size="small"
                          style={{
                            backgroundColor: '#F0EDE8',
                            color: '#7A7D8E',
                            fontWeight: 600,
                            fontSize: 10,
                            boxShadow: 'none',
                          }}
                        />
                      </span>
                    ),
                    children: (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: 12,
                          }}
                        >
                          <Button
                            type="primary"
                            size="small"
                            icon={<UserAddOutlined />}
                            onClick={openAddMember}
                          >
                            Add Member
                          </Button>
                        </div>
                        <Table
                          dataSource={members}
                          rowKey="id"
                          loading={membersLoading}
                          size="middle"
                          pagination={{
                            current: membersPage,
                            pageSize: membersPageSize,
                            total: membersTotalCount,
                            size: 'small',
                            showTotal: (total) => (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: 'var(--ce-text-muted)',
                                }}
                              >
                                {total} record{total !== 1 ? 's' : ''}
                              </span>
                            ),
                            onChange: (p) => {
                              setMembersPage(p);
                              if (selectedUnit) loadMembers(selectedUnit.id, p);
                            },
                          }}
                          columns={[
                            {
                              title: 'Username',
                              dataIndex: 'userName',
                              key: 'userName',
                              render: (v: string) => (
                                <span style={{ fontWeight: 600 }}>{v}</span>
                              ),
                            },
                            {
                              title: 'Email',
                              dataIndex: 'email',
                              key: 'email',
                            },
                            {
                              title: 'Name',
                              key: 'name',
                              render: (_: unknown, r: OrganizationUnitMemberDto) => {
                                const full = `${r.name || ''} ${r.surname || ''}`.trim();
                                return full || '-';
                              },
                            },
                            {
                              title: 'Actions',
                              key: 'actions',
                              width: 80,
                              render: (_: unknown, record: OrganizationUnitMemberDto) => (
                                <Popconfirm
                                  title="Remove this member?"
                                  onConfirm={() => handleRemoveMember(record.id)}
                                >
                                  <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              ),
                            },
                          ]}
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'roles',
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <SafetyOutlined />
                        Roles
                        <Badge
                          count={ouRoles.length}
                          size="small"
                          style={{
                            backgroundColor: '#F0EDE8',
                            color: '#7A7D8E',
                            fontWeight: 600,
                            fontSize: 10,
                            boxShadow: 'none',
                          }}
                        />
                      </span>
                    ),
                    children: (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: 12,
                          }}
                        >
                          <Button
                            type="primary"
                            size="small"
                            icon={<SafetyOutlined />}
                            onClick={openAddRole}
                          >
                            Add Role
                          </Button>
                        </div>
                        <Table
                          dataSource={ouRoles}
                          rowKey="id"
                          loading={rolesLoading}
                          size="middle"
                          pagination={false}
                          columns={[
                            {
                              title: 'Role Name',
                              dataIndex: 'name',
                              key: 'name',
                              render: (v: string) => (
                                <span style={{ fontWeight: 600 }}>{v}</span>
                              ),
                            },
                            {
                              title: 'Actions',
                              key: 'actions',
                              width: 80,
                              render: (_: unknown, record: OrganizationUnitRoleDto) => (
                                <Popconfirm
                                  title="Remove this role?"
                                  onConfirm={() => handleRemoveRole(record.id)}
                                >
                                  <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              ),
                            },
                          ]}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <ApartmentOutlined
              style={{ fontSize: 48, color: 'var(--ce-text-muted)', opacity: 0.3 }}
            />
            <span style={{ fontSize: 14, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
              Select an organization unit from the tree
            </span>
          </div>
        )}
      </div>

      {/* ── Create / Edit OU Modal ── */}
      <Modal
        title={
          ouModalMode === 'edit'
            ? 'Edit Organization Unit'
            : ouModalMode === 'createChild'
              ? `Add Child Under "${selectedUnit?.displayName}"`
              : 'New Organization Unit'
        }
        open={ouModalOpen}
        onOk={handleSaveOu}
        onCancel={() => setOuModalOpen(false)}
        destroyOnClose
      >
        <Form form={ouForm} layout="vertical" preserve={false}>
          <Form.Item
            name="displayName"
            label="Display Name"
            rules={[{ required: true, message: 'Please enter a display name' }]}
          >
            <Input placeholder="e.g. Engineering, HR, Finance" autoFocus />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Move OU Modal ── */}
      <Modal
        title={`Move "${selectedUnit?.displayName}"`}
        open={moveModalOpen}
        onOk={handleMove}
        onCancel={() => setMoveModalOpen(false)}
        okText="Move"
        destroyOnClose
      >
        <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--ce-text-muted)' }}>
          Select a new parent for this organization unit. Note: moving will recreate the unit under
          the new parent. Members and roles will need to be reassigned.
        </div>
        <TreeSelect
          style={{ width: '100%' }}
          treeData={moveTreeData}
          value={moveParentId}
          onChange={setMoveParentId}
          treeDefaultExpandAll
          placeholder="Select new parent..."
        />
      </Modal>

      {/* ── Add Member Modal ── */}
      <Modal
        title={`Add Members to "${selectedUnit?.displayName}"`}
        open={addMemberModalOpen}
        onOk={handleAddMembers}
        onCancel={() => setAddMemberModalOpen(false)}
        okText={`Add ${selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}`}
        okButtonProps={{ disabled: selectedUserIds.length === 0 }}
        width={600}
        destroyOnClose
      >
        <Input
          placeholder="Search users..."
          value={userSearchFilter}
          onChange={(e) => setUserSearchFilter(e.target.value)}
          allowClear
          style={{ marginBottom: 12 }}
        />
        <Table
          dataSource={filteredUsers}
          rowKey="id"
          loading={allUsersLoading}
          size="small"
          pagination={{ pageSize: 5, size: 'small' }}
          rowSelection={{
            selectedRowKeys: selectedUserIds,
            onChange: (keys) => setSelectedUserIds(keys as string[]),
          }}
          columns={[
            {
              title: 'Username',
              dataIndex: 'userName',
              key: 'userName',
              render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
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
          ]}
        />
      </Modal>

      {/* ── Add Role Modal ── */}
      <Modal
        title={`Add Roles to "${selectedUnit?.displayName}"`}
        open={addRoleModalOpen}
        onOk={handleAddRoles}
        onCancel={() => setAddRoleModalOpen(false)}
        okText={`Add ${selectedRoleIds.length > 0 ? `(${selectedRoleIds.length})` : ''}`}
        okButtonProps={{ disabled: selectedRoleIds.length === 0 }}
        width={500}
        destroyOnClose
      >
        <Table
          dataSource={filteredRoles}
          rowKey="id"
          loading={allRolesLoading}
          size="small"
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedRoleIds,
            onChange: (keys) => setSelectedRoleIds(keys as string[]),
          }}
          columns={[
            {
              title: 'Role Name',
              dataIndex: 'name',
              key: 'name',
              render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
            },
          ]}
        />
      </Modal>
    </div>
  );
}
