using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.AuditLogs;

public interface IAuditLogAppService : IApplicationService
{
    Task<PagedResultDto<AuditLogDto>> GetListAsync(GetAuditLogListDto input);
    Task<AuditLogDto> GetAsync(Guid id);
}
