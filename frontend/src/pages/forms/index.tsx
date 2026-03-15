import { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Popconfirm,
  Spin,
  message,
  Input,
  Modal,
  Form,
  Select,
  Switch,
  Table,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FormOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getForms,
  createForm,
  updateForm,
  deleteForm,
  publishForm,
  unpublishForm,
  getSubmissions,
  type FormDefinitionDto,
  type FormSubmissionDto,
} from '../../services/forms';

dayjs.extend(relativeTime);

interface FieldDef {
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'date';
  required: boolean;
  options?: string;
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];

function parseFields(fieldsJson: string): FieldDef[] {
  try {
    return JSON.parse(fieldsJson);
  } catch {
    return [];
  }
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormDefinitionDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFields, setEditFields] = useState<FieldDef[]>([]);
  const [saving, setSaving] = useState(false);

  // Submissions modal
  const [subsOpen, setSubsOpen] = useState(false);
  const [subsForm, setSubsForm] = useState<FormDefinitionDto | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmissionDto[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const res = await getForms({ maxResultCount: 100 });
      setForms(res.data.items);
    } catch {
      message.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleNewForm = () => {
    setEditingForm(null);
    setEditName('');
    setEditDescription('');
    setEditFields([{ label: '', type: 'text', required: false }]);
    setEditOpen(true);
  };

  const handleEditForm = (form: FormDefinitionDto) => {
    setEditingForm(form);
    setEditName(form.name);
    setEditDescription(form.description || '');
    setEditFields(parseFields(form.fieldsJson));
    setEditOpen(true);
  };

  const handleSaveForm = async () => {
    if (!editName.trim()) {
      message.warning('Please enter a form name');
      return;
    }
    const validFields = editFields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      message.warning('Please add at least one field with a label');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        fieldsJson: JSON.stringify(validFields),
      };
      if (editingForm) {
        await updateForm(editingForm.id, data);
        message.success('Form updated');
      } else {
        await createForm(data);
        message.success('Form created');
      }
      setEditOpen(false);
      loadForms();
    } catch {
      message.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteForm(id);
      message.success('Form deleted');
      loadForms();
    } catch {
      message.error('Failed to delete form');
    }
  };

  const handleTogglePublish = async (form: FormDefinitionDto) => {
    try {
      if (form.isPublished) {
        await unpublishForm(form.id);
        message.success('Form unpublished');
      } else {
        await publishForm(form.id);
        message.success('Form published');
      }
      loadForms();
    } catch {
      message.error('Failed to update form status');
    }
  };

  const handleViewSubmissions = async (form: FormDefinitionDto) => {
    setSubsForm(form);
    setSubsOpen(true);
    setSubsLoading(true);
    try {
      const res = await getSubmissions(form.id, { maxResultCount: 100 });
      setSubmissions(res.data.items);
    } catch {
      message.error('Failed to load submissions');
    } finally {
      setSubsLoading(false);
    }
  };

  // Field editor helpers
  const addField = () => {
    setEditFields([...editFields, { label: '', type: 'text', required: false }]);
  };

  const removeField = (index: number) => {
    setEditFields(editFields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FieldDef>) => {
    setEditFields(editFields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= editFields.length) return;
    const updated = [...editFields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setEditFields(updated);
  };

  // Build dynamic submission table columns
  const buildSubColumns = () => {
    if (!subsForm) return [];
    const fields = parseFields(subsForm.fieldsJson);
    const cols = fields.map((f) => ({
      title: f.label,
      dataIndex: f.label,
      key: f.label,
      ellipsis: true,
      render: (val: unknown) => {
        if (val === undefined || val === null) return '-';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        return String(val);
      },
    }));
    cols.unshift({
      title: 'Submitted',
      dataIndex: '_creationTime',
      key: '_creationTime',
      ellipsis: true,
      render: (val: unknown) => (val ? dayjs(val as string).format('MMM D, YYYY HH:mm') : '-'),
    });
    return cols;
  };

  const buildSubData = () => {
    return submissions.map((sub, idx) => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(sub.dataJson);
      } catch {
        /* empty */
      }
      return { key: sub.id || idx, _creationTime: sub.creationTime, ...data };
    });
  };

  const filtered = forms.filter(
    (f) =>
      !filter ||
      f.name.toLowerCase().includes(filter.toLowerCase()) ||
      f.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="ce-page-enter">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', marginBottom: 16,
        borderBottom: '1px solid var(--ce-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
            {filtered.length} form{filtered.length !== 1 ? 's' : ''}
          </span>
          <Input
            placeholder="Search forms..."
            prefix={<SearchOutlined style={{ color: '#7A7D8E' }} />}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: 360 }}
            allowClear
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewForm}>
            New Form
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="ce-empty">
          <div className="ce-empty-icon">
            <FormOutlined />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#2D3142' }}>
            No forms yet
          </div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>
            Create your first dynamic form to start collecting data.
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewForm}>
            New Form
          </Button>
        </div>
      ) : (
        <div
          className="ce-stagger-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((form) => {
            const fields = parseFields(form.fieldsJson);
            return (
              <div
                key={form.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F0EDE8',
                  borderRadius: 10,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 49, 66, 0.06), 0 1px 4px rgba(45, 49, 66, 0.03)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(45, 49, 66, 0.04), 0 1px 2px rgba(45, 49, 66, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3142', letterSpacing: -0.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#7A7D8E', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.description || 'No description'}
                    </div>
                  </div>
                  <Tag
                    style={{
                      background: form.isPublished ? 'rgba(61, 139, 110, 0.1)' : 'rgba(122, 125, 142, 0.1)',
                      color: form.isPublished ? '#3D8B6E' : '#7A7D8E',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {form.isPublished ? 'Published' : 'Draft'}
                  </Tag>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 12, color: '#A7A9B7' }}>
                  <span>{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
                  <span>{form.submissionCount} submission{form.submissionCount !== 1 ? 's' : ''}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {form.lastModificationTime
                      ? dayjs(form.lastModificationTime).fromNow()
                      : dayjs(form.creationTime).fromNow()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 4, borderTop: '1px solid #F0EDE8', paddingTop: 12 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditForm(form)}
                    style={{ color: '#7A7D8E', fontSize: 12 }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewSubmissions(form)}
                    style={{ color: '#7A7D8E', fontSize: 12 }}
                  >
                    Submissions
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={form.isPublished ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                    onClick={() => handleTogglePublish(form)}
                    style={{ color: form.isPublished ? '#D4973B' : '#3D8B6E', fontSize: 12 }}
                  >
                    {form.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Popconfirm
                    title="Delete this form?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(form.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      style={{ fontSize: 12 }}
                    />
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Form Modal */}
      <Modal
        title={editingForm ? 'Edit Form' : 'New Form'}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSaveForm}
        confirmLoading={saving}
        width={800}
        okText="Save"
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item label="Name" style={{ flex: 1 }} required>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Form name"
              />
            </Form.Item>
            <Form.Item label="Description" style={{ flex: 2 }}>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
              />
            </Form.Item>
          </div>
        </Form>

        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#2D3142', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Fields
          </span>
          <Button size="small" icon={<PlusOutlined />} onClick={addField}>
            Add Field
          </Button>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {editFields.map((field, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '10px 12px',
                marginBottom: 8,
                background: '#F7F5F2',
                borderRadius: 8,
                border: '1px solid #F0EDE8',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => moveField(index, -1)}
                  style={{ padding: '0 4px', height: 20, fontSize: 10 }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === editFields.length - 1}
                  onClick={() => moveField(index, 1)}
                  style={{ padding: '0 4px', height: 20, fontSize: 10 }}
                />
              </div>
              <Input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Field label"
                style={{ flex: 2 }}
                size="small"
              />
              <Select
                value={field.type}
                onChange={(val) => updateField(index, { type: val })}
                options={fieldTypes}
                style={{ width: 120 }}
                size="small"
              />
              {field.type === 'select' && (
                <Input
                  value={field.options || ''}
                  onChange={(e) => updateField(index, { options: e.target.value })}
                  placeholder="opt1, opt2, opt3"
                  style={{ flex: 2 }}
                  size="small"
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: '#7A7D8E' }}>Req</span>
                <Switch
                  size="small"
                  checked={field.required}
                  onChange={(val) => updateField(index, { required: val })}
                />
              </div>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => removeField(index)}
                style={{ flexShrink: 0 }}
              />
            </div>
          ))}
          {editFields.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#A7A9B7', fontSize: 13 }}>
              No fields added yet. Click "Add Field" to begin.
            </div>
          )}
        </div>
      </Modal>

      {/* View Submissions Modal */}
      <Modal
        title={subsForm ? `Submissions: ${subsForm.name}` : 'Submissions'}
        open={subsOpen}
        onCancel={() => setSubsOpen(false)}
        footer={null}
        width={900}
      >
        {subsLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#A7A9B7', fontSize: 13 }}>
            No submissions yet.
          </div>
        ) : (
          <Table
            dataSource={buildSubData()}
            columns={buildSubColumns()}
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Modal>
    </div>
  );
}
