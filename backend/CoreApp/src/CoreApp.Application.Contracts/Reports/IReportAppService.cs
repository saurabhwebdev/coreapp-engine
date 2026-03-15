using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.Reports;

public interface IReportAppService : IApplicationService
{
    Task<PagedResultDto<ReportDefinitionDto>> GetListAsync(GetReportListDto input);
    Task<ReportDefinitionDto> GetAsync(Guid id);
    Task<ReportDefinitionDto> CreateAsync(CreateUpdateReportDto input);
    Task<ReportDefinitionDto> UpdateAsync(Guid id, CreateUpdateReportDto input);
    Task DeleteAsync(Guid id);
    Task<RunReportResultDto> RunAsync(Guid id);
}
