using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.AuditLogging;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.TenantManagement;
using CoreApp.Notifications;
using CoreApp.FileManagement;
using CoreApp.Permissions;
using Volo.Abp.Features;
using CoreApp.Features;

namespace CoreApp.Dashboard;

[RequiresFeature(CoreAppFeatures.DashboardModule)]
[Authorize(CoreAppPermissions.Dashboard.Default)]
public class DashboardAppService : ApplicationService, IDashboardAppService
{
    private readonly IRepository<IdentityUser, Guid> _userRepository;
    private readonly IRepository<IdentityRole, Guid> _roleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IRepository<UserNotification, Guid> _userNotificationRepository;
    private readonly IRepository<FileDescriptor, Guid> _fileRepository;

    public DashboardAppService(
        IRepository<IdentityUser, Guid> userRepository,
        IRepository<IdentityRole, Guid> roleRepository,
        ITenantRepository tenantRepository,
        IAuditLogRepository auditLogRepository,
        IRepository<UserNotification, Guid> userNotificationRepository,
        IRepository<FileDescriptor, Guid> fileRepository)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _tenantRepository = tenantRepository;
        _auditLogRepository = auditLogRepository;
        _userNotificationRepository = userNotificationRepository;
        _fileRepository = fileRepository;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var stats = new DashboardStatsDto
        {
            UserCount = await AsyncExecuter.CountAsync(await _userRepository.GetQueryableAsync()),
            RoleCount = await AsyncExecuter.CountAsync(await _roleRepository.GetQueryableAsync()),
            TenantCount = (int)await _tenantRepository.GetCountAsync()
        };

        // Unread notifications for current user
        if (CurrentUser.Id.HasValue)
        {
            var notificationQueryable = await _userNotificationRepository.GetQueryableAsync();
            stats.UnreadNotificationCount = await AsyncExecuter.CountAsync(
                notificationQueryable.Where(x => x.UserId == CurrentUser.Id.Value && x.State == UserNotificationState.Unread)
            );
        }

        // File stats
        var fileQueryable = await _fileRepository.GetQueryableAsync();
        stats.TotalFileCount = await AsyncExecuter.CountAsync(fileQueryable.Where(x => !x.IsDirectory));
        stats.TotalFileSize = await AsyncExecuter.SumAsync(fileQueryable.Where(x => !x.IsDirectory), x => x.Size);

        // Recent audit logs
        var auditLogs = await _auditLogRepository.GetListAsync(
            sorting: "executionTime desc",
            maxResultCount: 10
        );

        stats.RecentAuditLogs = auditLogs.Select(log => new RecentAuditLogDto
        {
            Id = log.Id,
            UserName = log.UserName,
            HttpMethod = log.HttpMethod,
            Url = log.Url,
            HttpStatusCode = log.HttpStatusCode,
            ExecutionTime = log.ExecutionTime,
            ExecutionDuration = log.ExecutionDuration
        }).ToList();

        return stats;
    }
}
