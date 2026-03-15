using Volo.Abp.Application.Dtos;

namespace CoreApp.Notifications;

public class GetNotificationListDto : PagedAndSortedResultRequestDto
{
    public UserNotificationState? State { get; set; }
}
