using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.AuditLogs;

public class GetAuditLogListDto : PagedAndSortedResultRequestDto
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? HttpMethod { get; set; }
    public string? Url { get; set; }
    public string? UserName { get; set; }
    public int? MinHttpStatusCode { get; set; }
    public int? MaxHttpStatusCode { get; set; }
    public bool? HasException { get; set; }
}
