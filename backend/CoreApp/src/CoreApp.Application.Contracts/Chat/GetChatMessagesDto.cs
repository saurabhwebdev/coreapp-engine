using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Chat;

public class GetChatMessagesDto : PagedResultRequestDto
{
    public Guid ContactId { get; set; }
}
