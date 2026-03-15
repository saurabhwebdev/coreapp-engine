using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Chat;

public class ChatMessageDto : CreationAuditedEntityDto<Guid>
{
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public string SenderName { get; set; } = null!;
    public string Message { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime? ReadTime { get; set; }
}
