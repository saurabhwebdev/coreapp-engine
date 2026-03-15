using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.AuditLogging;
using CoreApp.Permissions;
using Volo.Abp.Features;
using CoreApp.Features;

namespace CoreApp.AuditLogs;

[Authorize(CoreAppPermissions.AuditLog.Default)]
[RequiresFeature(CoreAppFeatures.AuditLogModule)]
public class AuditLogAppService : ApplicationService, IAuditLogAppService
{
    private readonly IAuditLogRepository _auditLogRepository;

    public AuditLogAppService(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<PagedResultDto<AuditLogDto>> GetListAsync(GetAuditLogListDto input)
    {
        var totalCount = await _auditLogRepository.GetCountAsync(
            startTime: input.StartTime,
            endTime: input.EndTime,
            httpMethod: input.HttpMethod,
            url: input.Url,
            userName: input.UserName,
            httpStatusCode: input.MinHttpStatusCode.HasValue ? (System.Net.HttpStatusCode)input.MinHttpStatusCode.Value : null,
            hasException: input.HasException
        );

        var auditLogs = await _auditLogRepository.GetListAsync(
            sorting: input.Sorting ?? "executionTime desc",
            maxResultCount: input.MaxResultCount,
            skipCount: input.SkipCount,
            startTime: input.StartTime,
            endTime: input.EndTime,
            httpMethod: input.HttpMethod,
            url: input.Url,
            userName: input.UserName,
            httpStatusCode: input.MinHttpStatusCode.HasValue ? (System.Net.HttpStatusCode)input.MinHttpStatusCode.Value : null,
            hasException: input.HasException
        );

        return new PagedResultDto<AuditLogDto>(
            totalCount,
            auditLogs.Select(log => MapToDto(log)).ToList()
        );
    }

    public async Task<AuditLogDto> GetAsync(Guid id)
    {
        var auditLog = await _auditLogRepository.GetAsync(id);
        return MapToDto(auditLog);
    }

    private static AuditLogDto MapToDto(AuditLog auditLog)
    {
        return new AuditLogDto
        {
            Id = auditLog.Id,
            ApplicationName = auditLog.ApplicationName,
            UserId = auditLog.UserId,
            UserName = auditLog.UserName,
            TenantId = auditLog.TenantId,
            TenantName = auditLog.TenantName,
            HttpMethod = auditLog.HttpMethod,
            Url = auditLog.Url,
            HttpStatusCode = auditLog.HttpStatusCode,
            BrowserInfo = auditLog.BrowserInfo,
            ClientIpAddress = auditLog.ClientIpAddress,
            ExecutionTime = auditLog.ExecutionTime,
            ExecutionDuration = auditLog.ExecutionDuration,
            Exceptions = auditLog.Exceptions,
            Actions = auditLog.Actions?.Select(a => new AuditLogActionDto
            {
                ServiceName = a.ServiceName,
                MethodName = a.MethodName,
                Parameters = a.Parameters,
                ExecutionTime = a.ExecutionTime,
                ExecutionDuration = a.ExecutionDuration
            }).ToList() ?? new(),
            EntityChanges = auditLog.EntityChanges?.Select(e => new EntityChangeDto
            {
                EntityId = e.EntityId != null ? Guid.TryParse(e.EntityId, out var eid) ? eid : null : null,
                EntityTypeFullName = e.EntityTypeFullName,
                ChangeType = e.ChangeType.ToString(),
                ChangeTime = e.ChangeTime
            }).ToList() ?? new()
        };
    }
}
