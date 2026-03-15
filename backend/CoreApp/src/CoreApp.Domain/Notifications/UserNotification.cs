using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Notifications;

public class UserNotification : CreationAuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid NotificationId { get; set; }
    public UserNotificationState State { get; set; }
    public DateTime? ReadTime { get; set; }

    protected UserNotification() { }

    public UserNotification(Guid id, Guid userId, Guid notificationId, Guid? tenantId = null) : base(id)
    {
        UserId = userId;
        NotificationId = notificationId;
        State = UserNotificationState.Unread;
        TenantId = tenantId;
    }
}
