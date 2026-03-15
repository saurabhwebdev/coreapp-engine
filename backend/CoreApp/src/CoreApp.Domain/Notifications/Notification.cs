using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Notifications;

public class Notification : CreationAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public NotificationType Type { get; set; }
    public NotificationSeverity Severity { get; set; }
    public string? Data { get; set; } // JSON payload for extra context
    public string? TargetUrl { get; set; } // URL to navigate to when clicked

    protected Notification() { }

    public Notification(Guid id, string title, string message, NotificationType type = NotificationType.InApp, NotificationSeverity severity = NotificationSeverity.Info, string? data = null, string? targetUrl = null, Guid? tenantId = null) : base(id)
    {
        Title = title;
        Message = message;
        Type = type;
        Severity = severity;
        Data = data;
        TargetUrl = targetUrl;
        TenantId = tenantId;
    }
}
