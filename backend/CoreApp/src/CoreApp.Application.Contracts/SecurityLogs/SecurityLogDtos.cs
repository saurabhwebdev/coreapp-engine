using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.SecurityLogs;

public class SecurityLogDto : EntityDto<Guid>
{
    public string? ApplicationName { get; set; }
    public string? Identity { get; set; }
    public string? Action { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? TenantName { get; set; }
    public string? ClientIpAddress { get; set; }
    public string? BrowserInfo { get; set; }
    public DateTime CreationTime { get; set; }
}

public class GetSecurityLogListDto : PagedAndSortedResultRequestDto
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? UserName { get; set; }
    public string? Action { get; set; }
    public string? Identity { get; set; }
}
