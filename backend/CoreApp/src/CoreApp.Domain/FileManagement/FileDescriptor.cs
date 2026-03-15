using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.FileManagement;

public class FileDescriptor : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = null!;
    public string MimeType { get; set; } = null!;
    public long Size { get; set; }
    public string BlobName { get; set; } = null!;
    public Guid? ParentId { get; set; } // for folder hierarchy
    public bool IsDirectory { get; set; }

    protected FileDescriptor() { }

    public FileDescriptor(Guid id, string name, string mimeType, long size, string blobName, bool isDirectory = false, Guid? parentId = null, Guid? tenantId = null) : base(id)
    {
        Name = name;
        MimeType = mimeType;
        Size = size;
        BlobName = blobName;
        IsDirectory = isDirectory;
        ParentId = parentId;
        TenantId = tenantId;
    }
}
