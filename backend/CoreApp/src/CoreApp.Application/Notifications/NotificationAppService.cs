using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using CoreApp.Permissions;
using Volo.Abp.Features;
using CoreApp.Features;

namespace CoreApp.Notifications;

[Authorize]
[RequiresFeature(CoreAppFeatures.NotificationModule)]
public class NotificationAppService : ApplicationService, INotificationAppService
{
    private readonly IRepository<Notification, Guid> _notificationRepository;
    private readonly IRepository<UserNotification, Guid> _userNotificationRepository;

    public NotificationAppService(
        IRepository<Notification, Guid> notificationRepository,
        IRepository<UserNotification, Guid> userNotificationRepository)
    {
        _notificationRepository = notificationRepository;
        _userNotificationRepository = userNotificationRepository;
    }

    public async Task<PagedResultDto<UserNotificationDto>> GetListAsync(GetNotificationListDto input)
    {
        var userId = CurrentUser.GetId();

        var queryable = await _userNotificationRepository.GetQueryableAsync();
        var notificationQueryable = await _notificationRepository.GetQueryableAsync();

        var query = from un in queryable
                    join n in notificationQueryable on un.NotificationId equals n.Id
                    where un.UserId == userId
                    select new { UserNotification = un, Notification = n };

        if (input.State.HasValue)
        {
            query = query.Where(x => x.UserNotification.State == input.State.Value);
        }

        query = query.OrderByDescending(x => x.UserNotification.CreationTime);

        var totalCount = await AsyncExecuter.CountAsync(query);
        var items = await AsyncExecuter.ToListAsync(
            query.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<UserNotificationDto>(
            totalCount,
            items.Select(x => new UserNotificationDto
            {
                Id = x.UserNotification.Id,
                NotificationId = x.UserNotification.NotificationId,
                State = x.UserNotification.State,
                ReadTime = x.UserNotification.ReadTime,
                CreationTime = x.UserNotification.CreationTime,
                Notification = new NotificationDto
                {
                    Id = x.Notification.Id,
                    Title = x.Notification.Title,
                    Message = x.Notification.Message,
                    Type = x.Notification.Type,
                    Severity = x.Notification.Severity,
                    Data = x.Notification.Data,
                    TargetUrl = x.Notification.TargetUrl,
                    CreationTime = x.Notification.CreationTime,
                    CreatorId = x.Notification.CreatorId
                }
            }).ToList()
        );
    }

    public async Task<int> GetUnreadCountAsync()
    {
        var userId = CurrentUser.GetId();
        var queryable = await _userNotificationRepository.GetQueryableAsync();
        return await AsyncExecuter.CountAsync(
            queryable.Where(x => x.UserId == userId && x.State == UserNotificationState.Unread)
        );
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        var userNotification = await _userNotificationRepository.GetAsync(id);
        if (userNotification.UserId != CurrentUser.GetId())
        {
            throw new Volo.Abp.AbpException("You can only mark your own notifications as read.");
        }
        userNotification.State = UserNotificationState.Read;
        userNotification.ReadTime = Clock.Now;
        await _userNotificationRepository.UpdateAsync(userNotification);
    }

    public async Task MarkAllAsReadAsync()
    {
        var userId = CurrentUser.GetId();
        var queryable = await _userNotificationRepository.GetQueryableAsync();
        var unread = await AsyncExecuter.ToListAsync(
            queryable.Where(x => x.UserId == userId && x.State == UserNotificationState.Unread)
        );

        foreach (var un in unread)
        {
            un.State = UserNotificationState.Read;
            un.ReadTime = Clock.Now;
        }

        await _userNotificationRepository.UpdateManyAsync(unread);
    }

    [Authorize(CoreAppPermissions.Notifications.Send)]
    public async Task<NotificationDto> SendAsync(CreateNotificationDto input)
    {
        var notification = new Notification(
            GuidGenerator.Create(),
            input.Title,
            input.Message,
            input.Type,
            input.Severity,
            input.Data,
            input.TargetUrl,
            CurrentTenant.Id
        );

        await _notificationRepository.InsertAsync(notification);

        // Create user notifications
        if (input.TargetUserIds != null && input.TargetUserIds.Any())
        {
            var userNotifications = input.TargetUserIds.Select(userId =>
                new UserNotification(GuidGenerator.Create(), userId, notification.Id, CurrentTenant.Id)
            ).ToList();
            await _userNotificationRepository.InsertManyAsync(userNotifications);
        }

        return new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            Severity = notification.Severity,
            Data = notification.Data,
            TargetUrl = notification.TargetUrl,
            CreationTime = notification.CreationTime,
            CreatorId = notification.CreatorId
        };
    }

    public async Task DeleteAsync(Guid id)
    {
        var userId = CurrentUser.GetId();
        var userNotification = await _userNotificationRepository.GetAsync(id);
        if (userNotification.UserId != userId)
        {
            throw new Volo.Abp.AbpException("You can only delete your own notifications.");
        }
        await _userNotificationRepository.DeleteAsync(id);
    }
}
