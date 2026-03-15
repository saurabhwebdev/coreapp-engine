using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.Chat;

public interface IChatAppService : IApplicationService
{
    Task<PagedResultDto<ChatMessageDto>> GetMessagesAsync(GetChatMessagesDto input);
    Task<ChatMessageDto> SendMessageAsync(SendMessageDto input);
    Task MarkAsReadAsync(Guid contactId);
    Task<List<ChatContactDto>> GetContactsAsync();
}
