import { useState, useEffect } from 'react';
import { Button, Space, Modal, Form, Input, Select, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '../../../components/DataTable';
import {
  getClaimTypes,
  createClaimType,
  updateClaimType,
  deleteClaimType,
  type ClaimTypeDto,
} from '../../../services/claimType';

const VALUE_TYPE_OPTIONS = [
  { label: 'String', value: 'String' },
  { label: 'Int', value: 'Int' },
  { label: 'Boolean', value: 'Boolean' },
  { label: 'DateTime', value: 'DateTime' },
];

export default function ClaimTypesPage() {
  const [claimTypes, setClaimTypes] = useState<ClaimTypeDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ClaimTypeDto | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  const loadData = async (currentPage = page, currentPageSize = pageSize) => {
    setLoading(true);
    try {
      const res = await getClaimTypes({
        skipCount: (currentPage - 1) * currentPageSize,
        maxResultCount: currentPageSize,
      });
      setClaimTypes(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {
      message.error('Failed to load claim types');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ required: false, valueType: 'String' });
    setModalOpen(true);
  };

  const openEdit = (item: ClaimTypeDto) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      required: item.required,
      regex: item.regex,
      description: item.description,
      valueType: item.valueType,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingItem) {
        await updateClaimType(editingItem.id, {
          name: values.name,
          required: values.required ?? false,
          regex: values.regex || undefined,
          description: values.description || undefined,
        });
        message.success('Claim type updated');
      } else {
        await createClaimType({
          name: values.name,
          required: values.required ?? false,
          regex: values.regex || undefined,
          description: values.description || undefined,
          valueType: values.valueType,
        });
        message.success('Claim type created');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClaimType(id);
      message.success('Claim type deleted');
      loadData();
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        message.error(err.response.data.error.message);
      } else {
        message.error('Failed to delete claim type');
      }
    }
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    loadData(newPage, newPageSize);
  };

  return (
    <div>
      <DataTable
        dataSource={claimTypes}
        rowKey="id"
        loading={loading}
        searchFields={['name', 'description']}
        searchPlaceholder="Search claim types..."
        showPagination={false}
        toolbar={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Claim Type
          </Button>
        }
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          onChange: handlePageChange,
          size: 'small',
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => (
            <span style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>
              {total} record{total !== 1 ? 's' : ''}
            </span>
          ),
        }}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
          },
          {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
            width: 100,
            render: (v: boolean) =>
              v ? (
                <Tag style={{ background: 'rgba(74, 127, 193, 0.08)', color: '#4A7FC1' }}>Yes</Tag>
              ) : (
                <Tag style={{ background: '#F0EDE8', color: '#7A7D8E' }}>No</Tag>
              ),
          },
          {
            title: 'Static',
            dataIndex: 'isStatic',
            key: 'isStatic',
            width: 100,
            render: (v: boolean) =>
              v ? (
                <Tag style={{ background: '#F0EDE8', color: '#7A7D8E' }}>Yes</Tag>
              ) : (
                <Tag style={{ background: 'rgba(74, 127, 193, 0.08)', color: '#4A7FC1' }}>No</Tag>
              ),
          },
          {
            title: 'Value Type',
            dataIndex: 'valueType',
            key: 'valueType',
            width: 120,
            render: (v: string) => (
              <span style={{ color: '#7A7D8E', fontWeight: 500 }}>{v || '-'}</span>
            ),
          },
          {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (v: string) => (
              <span style={{ color: '#7A7D8E' }}>{v || '-'}</span>
            ),
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: ClaimTypeDto) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                {!record.isStatic ? (
                  <Popconfirm
                    title="Delete this claim type?"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ) : (
                  <Button size="small" danger icon={<DeleteOutlined />} disabled />
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingItem ? 'Edit Claim Type' : 'New Claim Type'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter claim type name" />
          </Form.Item>
          <Form.Item
            name="valueType"
            label="Value Type"
            rules={[{ required: true, message: 'Please select a value type' }]}
          >
            <Select
              options={VALUE_TYPE_OPTIONS}
              placeholder="Select value type"
              disabled={!!editingItem}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Enter description" />
          </Form.Item>
          <Form.Item name="regex" label="Regex">
            <Input placeholder="Validation regex (optional)" />
          </Form.Item>
          <Form.Item name="required" label="Required" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
