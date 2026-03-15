using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Features;
using Volo.Abp.Identity;
using Volo.Abp.Users;
using CoreApp.Features;

namespace CoreApp.Chat;

[Authorize]
[RequiresFeature(CoreAppFeatures.ChatModule)]
public class ChatAppService : ApplicationService, IChatAppService
{
    private readonly IRepository<ChatMessage, Guid> _chatMessageRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public ChatAppService(
        IRepository<ChatMessage, Guid> chatMessageRepository,
        IRepository<IdentityUser, Guid> userRepository)
    {
        _chatMessageRepository = chatMessageRepository;
        _userRepository = userRepository;
    }

    public async Task<PagedResultDto<ChatMessageDto>> GetMessagesAsync(GetChatMessagesDto input)
    {
        var currentUserId = CurrentUser.GetId();

        var queryable = await _chatMessageRepository.GetQueryableAsync();
        var userQueryable = await _userRepository.GetQueryableAsync();

        var query = from m in queryable
                    join u in userQueryable on m.SenderId equals u.Id
                    where (m.SenderId == currentUserId && m.ReceiverId == input.ContactId)
                       || (m.SenderId == input.ContactId && m.ReceiverId == currentUserId)
                    orderby m.CreationTime descending
                    select new ChatMessageDto
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        ReceiverId = m.ReceiverId,
                        SenderName = u.UserName ?? u.Name ?? "Unknown",
                        Message = m.Message,
                        IsRead = m.IsRead,
                        ReadTime = m.ReadTime,
                        CreationTime = m.CreationTime,
                        CreatorId = m.CreatorId
                    };

        var totalCount = await AsyncExecuter.CountAsync(query);
        var items = await AsyncExecuter.ToListAsync(
            query.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<ChatMessageDto>(totalCount, items);
    }

    public async Task<ChatMessageDto> SendMessageAsync(SendMessageDto input)
    {
        var currentUserId = CurrentUser.GetId();

        var message = new ChatMessage(
            GuidGenerator.Create(),
            currentUserId,
            input.ReceiverId,
            input.Message,
            CurrentTenant.Id
        );

        await _chatMessageRepository.InsertAsync(message);

        return new ChatMessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId,
            SenderName = CurrentUser.UserName ?? CurrentUser.Name ?? "Unknown",
            Message = message.Message,
            IsRead = false,
            CreationTime = message.CreationTime,
            CreatorId = message.CreatorId
        };
    }

    public async Task MarkAsReadAsync(Guid contactId)
    {
        var currentUserId = CurrentUser.GetId();

        var queryable = await _chatMessageRepository.GetQueryableAsync();
        var unread = await AsyncExecuter.ToListAsync(
            queryable.Where(m => m.SenderId == contactId && m.ReceiverId == currentUserId && !m.IsRead)
        );

        foreach (var msg in unread)
        {
            msg.IsRead = true;
            msg.ReadTime = Clock.Now;
        }

        await _chatMessageRepository.UpdateManyAsync(unread);
    }

    public async Task<List<ChatContactDto>> GetContactsAsync()
    {
        var currentUserId = CurrentUser.GetId();

        var queryable = await _chatMessageRepository.GetQueryableAsync();
        var userQueryable = await _userRepository.GetQueryableAsync();

        // Get distinct contact IDs (users the current user has chatted with)
        var sentToIds = await AsyncExecuter.ToListAsync(
            queryable.Where(m => m.SenderId == currentUserId).Select(m => m.ReceiverId).Distinct()
        );
        var receivedFromIds = await AsyncExecuter.ToListAsync(
            queryable.Where(m => m.ReceiverId == currentUserId).Select(m => m.SenderId).Distinct()
        );

        var contactIds = sentToIds.Union(receivedFromIds).Distinct().ToList();

        var contacts = new List<ChatContactDto>();

        foreach (var contactId in contactIds)
        {
            var user = await AsyncExecuter.FirstOrDefaultAsync(
                userQueryable.Where(u => u.Id == contactId)
            );
            if (user == null) continue;

            var unreadCount = await AsyncExecuter.CountAsync(
                queryable.Where(m => m.SenderId == contactId && m.ReceiverId == currentUserId && !m.IsRead)
            );

            var lastMessage = await AsyncExecuter.FirstOrDefaultAsync(
                queryable
                    .Where(m => (m.SenderId == currentUserId && m.ReceiverId == contactId)
                             || (m.SenderId == contactId && m.ReceiverId == currentUserId))
                    .OrderByDescending(m => m.CreationTime)
            );

            contacts.Add(new ChatContactDto
            {
                UserId = contactId,
                UserName = user.UserName ?? "Unknown",
                Name = user.Name,
                UnreadCount = unreadCount,
                LastMessage = lastMessage?.Message,
                LastMessageTime = lastMessage?.CreationTime
            });
        }

        return contacts.OrderByDescending(c => c.LastMessageTime).ToList();
    }
}
