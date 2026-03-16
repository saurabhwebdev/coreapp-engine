using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.SecurityLogs;

public interface ISecurityLogAppService : IApplicationService
{
    Task<PagedResultDto<SecurityLogDto>> GetListAsync(GetSecurityLogListDto input);
}
