using Volo.Abp.Application.Dtos;

namespace CoreApp.Reports;

public class GetReportListDto : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
    public string? Category { get; set; }
}
