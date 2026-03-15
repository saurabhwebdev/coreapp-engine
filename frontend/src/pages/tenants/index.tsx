import { useState, useEffect } from 'react';
import { Button, Space, Modal, Form, Input, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { getTenants, createTenant, updateTenant, deleteTenant, type TenantDto } from '../../services/tenant';
import FeaturesModal from '../../components/FeaturesModal';
import DataTable from '../../components/DataTable';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantDto | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [featuresModalOpen, setFeaturesModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantDto | null>(null);

  const loadTenants = async (p = page) => {
    setLoading(true);
    try {
      const res = await getTenants({ skipCount: (p - 1) * pageSize, maxResultCount: pageSize });
      setTenants(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch { message.error('Failed to load tenants'); }
    setLoading(false);
  };

  useEffect(() => { loadTenants(); }, []);

  const openCreate = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (tenant: TenantDto) => {
    setEditingTenant(tenant);
    form.setFieldsValue(tenant);
    setModalOpen(true);
  };

  const openFeatures = (tenant: TenantDto) => {
    setSelectedTenant(tenant);
    setFeaturesModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        await updateTenant(editingTenant.id, { name: values.name, concurrencyStamp: editingTenant.concurrencyStamp });
        message.success('Tenant updated');
      } else {
        await createTenant(values);
        message.success('Tenant created');
      }
      setModalOpen(false);
      loadTenants();
    } catch (err: any) {
      if (err.response?.data?.error?.message) message.error(err.response.data.error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTenant(id);
      message.success('Tenant deleted');
      loadTenants();
    } catch { message.error('Failed to delete tenant'); }
  };

  return (
    <div className="ce-page-enter">
      <div className="ce-stagger-2">
        <DataTable
          dataSource={tenants}
          rowKey="id"
          loading={loading}
          showSearch={false}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: (p) => { setPage(p); loadTenants(p); },
          }}
          toolbar={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New Tenant
            </Button>
          }
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            {
              title: 'Actions',
              key: 'actions',
              width: 160,
              render: (_: unknown, record: TenantDto) => (
                <Space>
                  <Tooltip title="Edit">
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  </Tooltip>
                  <Tooltip title="Features">
                    <Button size="small" icon={<AppstoreOutlined />} onClick={() => openFeatures(record)} />
                  </Tooltip>
                  <Popconfirm title="Delete this tenant?" onConfirm={() => handleDelete(record.id)}>
                    <Tooltip title="Delete">
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={editingTenant ? 'Edit Tenant' : 'New Tenant'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editingTenant && (
            <>
              <Form.Item name="adminEmailAddress" label="Admin Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="adminPassword" label="Admin Password" rules={[{ required: true, min: 6 }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {selectedTenant && (
        <FeaturesModal
          open={featuresModalOpen}
          onClose={() => { setFeaturesModalOpen(false); setSelectedTenant(null); }}
          providerName="T"
          providerKey={selectedTenant.id}
          title={`Features — ${selectedTenant.name}`}
        />
      )}
    </div>
  );
}
