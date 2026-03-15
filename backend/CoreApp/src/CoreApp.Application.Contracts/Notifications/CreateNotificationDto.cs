using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CoreApp.Notifications;

public class CreateNotificationDto
{
    [Required]
    [StringLength(256)]
    public string Title { get; set; } = null!;

    [Required]
    [StringLength(2048)]
    public string Message { get; set; } = null!;

    public NotificationType Type { get; set; } = NotificationType.InApp;
    public NotificationSeverity Severity { get; set; } = NotificationSeverity.Info;
    public string? Data { get; set; }
    public string? TargetUrl { get; set; }
    public List<Guid>? TargetUserIds { get; set; } // null = all users
}
