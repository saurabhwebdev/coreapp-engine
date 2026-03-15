import { useState, useEffect } from 'react';
import { Button, Space, Upload, Modal, Form, Input, message, Popconfirm, Breadcrumb, Tag } from 'antd';
import { UploadOutlined, FolderAddOutlined, DeleteOutlined, DownloadOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';
import { getFiles, uploadFile, createDirectory, deleteFile, downloadFile, type FileDescriptorDto } from '../../services/file';
import DataTable from '../../components/DataTable';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface BreadcrumbItem { id?: string; name: string; }

export default function FilesPage() {
  const [files, setFiles] = useState<FileDescriptorDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentParent, setCurrentParent] = useState<string | undefined>();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ name: 'Root' }]);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadFiles = async (parentId = currentParent, p = page) => {
    setLoading(true);
    try {
      const res = await getFiles({ parentId, skipCount: (p - 1) * pageSize, maxResultCount: pageSize });
      setFiles(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch { message.error('Failed to load files'); }
    setLoading(false);
  };

  useEffect(() => { loadFiles(); }, []);

  const navigateToFolder = (folder: FileDescriptorDto) => {
    setCurrentParent(folder.id);
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
    setPage(1);
    loadFiles(folder.id, 1);
  };

  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumb[index];
    setCurrentParent(item.id);
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    setPage(1);
    loadFiles(item.id, 1);
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file, currentParent);
      message.success('File uploaded');
      loadFiles();
    } catch { message.error('Upload failed'); }
    return false;
  };

  const handleCreateFolder = async () => {
    try {
      const values = await form.validateFields();
      await createDirectory(values.name, currentParent);
      message.success('Folder created');
      setFolderModalOpen(false);
      form.resetFields();
      loadFiles();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id);
      message.success('Deleted');
      loadFiles();
    } catch { message.error('Delete failed'); }
  };

  const handleDownload = async (file: FileDescriptorDto) => {
    try {
      const res = await downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { message.error('Download failed'); }
  };

  return (
    <div className="ce-page-enter">
      <div className="ce-stagger-1" style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={breadcrumb.map((item, index) => ({
            title: (
              <a
                onClick={() => navigateToBreadcrumb(index)}
                style={{
                  color: index === breadcrumb.length - 1 ? '#2D3142' : '#7A7D8E',
                  fontWeight: index === breadcrumb.length - 1 ? 600 : 400,
                  fontSize: 13,
                }}
              >
                {item.name}
              </a>
            ),
          }))}
        />
      </div>

      <div className="ce-stagger-2">
        <DataTable
          dataSource={files} rowKey="id" loading={loading} size="small"
          showSearch={false}
          pagination={{
            current: page, pageSize, total: totalCount,
            onChange: (p) => { setPage(p); loadFiles(currentParent, p); },
          }}
          toolbar={
            <Space size={8}>
              <Button icon={<FolderAddOutlined />} onClick={() => setFolderModalOpen(true)}>
                New Folder
              </Button>
              <Upload beforeUpload={handleUpload} showUploadList={false}>
                <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Space>
          }
          columns={[
            {
              title: 'Name', dataIndex: 'name', key: 'name',
              render: (name: string, record: FileDescriptorDto) => (
                <Space>
                  {record.isDirectory
                    ? <FolderOutlined style={{ color: '#D4973B', fontSize: 16 }} />
                    : <FileOutlined style={{ color: '#A7A9B7', fontSize: 15 }} />
                  }
                  {record.isDirectory ? (
                    <a
                      onClick={() => navigateToFolder(record)}
                      style={{ color: '#2D3142', fontWeight: 500, transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C2703E')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#2D3142')}
                    >
                      {name}
                    </a>
                  ) : (
                    <span style={{ color: '#2D3142' }}>{name}</span>
                  )}
                </Space>
              ),
            },
            {
              title: 'Size', dataIndex: 'size', key: 'size', width: 110,
              render: (v: number, r: FileDescriptorDto) => (
                <span className="ce-mono">
                  {r.isDirectory ? '-' : formatBytes(v)}
                </span>
              ),
            },
            {
              title: 'Type', dataIndex: 'mimeType', key: 'type', width: 150,
              render: (v: string, r: FileDescriptorDto) =>
                r.isDirectory
                  ? <Tag style={{ background: 'rgba(212, 151, 59, 0.1)', color: '#D4973B' }}>Folder</Tag>
                  : <Tag style={{ background: '#F0EDE8', color: '#7A7D8E' }}>{v}</Tag>,
            },
            {
              title: 'Actions', key: 'actions', width: 120,
              render: (_: unknown, record: FileDescriptorDto) => (
                <Space>
                  {!record.isDirectory && (
                    <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} />
                  )}
                  <Popconfirm title={`Delete ${record.isDirectory ? 'folder' : 'file'}?`} onConfirm={() => handleDelete(record.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <Modal title="New Folder" open={folderModalOpen} onOk={handleCreateFolder} onCancel={() => setFolderModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Folder Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
