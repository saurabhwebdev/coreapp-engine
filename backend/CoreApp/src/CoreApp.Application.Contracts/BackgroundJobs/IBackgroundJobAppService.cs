using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.BackgroundJobs;

public interface IBackgroundJobAppService : IApplicationService
{
    Task<PagedResultDto<BackgroundJobDto>> GetListAsync(PagedAndSortedResultRequestDto input);
}
