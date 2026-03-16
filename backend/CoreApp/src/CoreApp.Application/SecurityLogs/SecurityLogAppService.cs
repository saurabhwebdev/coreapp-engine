using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using CoreApp.Permissions;

namespace CoreApp.SecurityLogs;

[Authorize(CoreAppPermissions.AuditLog.Default)]
public class SecurityLogAppService : ApplicationService, ISecurityLogAppService
{
    private readonly IIdentitySecurityLogRepository _securityLogRepository;

    public SecurityLogAppService(IIdentitySecurityLogRepository securityLogRepository)
    {
        _securityLogRepository = securityLogRepository;
    }

    public async Task<PagedResultDto<SecurityLogDto>> GetListAsync(GetSecurityLogListDto input)
    {
        var totalCount = await _securityLogRepository.GetCountAsync(
            startTime: input.StartTime,
            endTime: input.EndTime,
            userName: input.UserName,
            action: input.Action,
            identity: input.Identity
        );

        var logs = await _securityLogRepository.GetListAsync(
            sorting: input.Sorting ?? "creationTime desc",
            maxResultCount: input.MaxResultCount,
            skipCount: input.SkipCount,
            startTime: input.StartTime,
            endTime: input.EndTime,
            userName: input.UserName,
            action: input.Action,
            identity: input.Identity
        );

        return new PagedResultDto<SecurityLogDto>(
            totalCount,
            logs.Select(log => new SecurityLogDto
            {
                Id = log.Id,
                ApplicationName = log.ApplicationName,
                Identity = log.Identity,
                Action = log.Action,
                UserId = log.UserId,
                UserName = log.UserName,
                TenantName = log.TenantName,
                ClientIpAddress = log.ClientIpAddress,
                BrowserInfo = log.BrowserInfo,
                CreationTime = log.CreationTime
            }).ToList()
        );
    }
}
