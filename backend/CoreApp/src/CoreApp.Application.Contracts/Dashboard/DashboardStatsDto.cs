using System;
using System.Collections.Generic;

namespace CoreApp.Dashboard;

public class DashboardStatsDto
{
    public int UserCount { get; set; }
    public int TenantCount { get; set; }
    public int RoleCount { get; set; }
    public int UnreadNotificationCount { get; set; }
    public int TotalFileCount { get; set; }
    public long TotalFileSize { get; set; }
    public List<RecentAuditLogDto> RecentAuditLogs { get; set; } = new();
}

public class RecentAuditLogDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; }
    public string? HttpMethod { get; set; }
    public string? Url { get; set; }
    public int? HttpStatusCode { get; set; }
    public DateTime ExecutionTime { get; set; }
    public int ExecutionDuration { get; set; }
}
