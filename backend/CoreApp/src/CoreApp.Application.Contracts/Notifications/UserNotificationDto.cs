using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Notifications;

public class UserNotificationDto : CreationAuditedEntityDto<Guid>
{
    public Guid NotificationId { get; set; }
    public UserNotificationState State { get; set; }
    public DateTime? ReadTime { get; set; }
    public NotificationDto Notification { get; set; } = null!;
}
