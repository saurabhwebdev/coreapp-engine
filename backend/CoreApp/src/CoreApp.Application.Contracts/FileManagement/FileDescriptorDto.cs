using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.FileManagement;

public class FileDescriptorDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; } = null!;
    public string MimeType { get; set; } = null!;
    public long Size { get; set; }
    public Guid? ParentId { get; set; }
    public bool IsDirectory { get; set; }
}
