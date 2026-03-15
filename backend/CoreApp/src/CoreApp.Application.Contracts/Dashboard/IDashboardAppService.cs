using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace CoreApp.Dashboard;

public interface IDashboardAppService : IApplicationService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
