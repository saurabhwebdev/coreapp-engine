using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Notifications;

public class NotificationDto : CreationAuditedEntityDto<Guid>
{
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public NotificationType Type { get; set; }
    public NotificationSeverity Severity { get; set; }
    public string? Data { get; set; }
    public string? TargetUrl { get; set; }
}
