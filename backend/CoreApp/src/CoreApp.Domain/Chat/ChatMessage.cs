using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Chat;

public class ChatMessage : CreationAuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Message { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime? ReadTime { get; set; }

    protected ChatMessage() { }

    public ChatMessage(Guid id, Guid senderId, Guid receiverId, string message, Guid? tenantId = null) : base(id)
    {
        SenderId = senderId;
        ReceiverId = receiverId;
        Message = message;
        TenantId = tenantId;
    }
}
