using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.Notifications;

public interface INotificationAppService : IApplicationService
{
    Task<PagedResultDto<UserNotificationDto>> GetListAsync(GetNotificationListDto input);
    Task<int> GetUnreadCountAsync();
    Task MarkAsReadAsync(Guid id);
    Task MarkAllAsReadAsync();
    Task<NotificationDto> SendAsync(CreateNotificationDto input);
    Task DeleteAsync(Guid id);
}
