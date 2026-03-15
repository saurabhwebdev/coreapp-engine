using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.FileManagement;

public class GetFileListDto : PagedAndSortedResultRequestDto
{
    public Guid? ParentId { get; set; }
    public string? Filter { get; set; }
}
