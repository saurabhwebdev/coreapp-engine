using Volo.Abp.Application.Dtos;

namespace CoreApp.Workflows;

public class GetWorkflowListDto : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
    public WorkflowStatus? Status { get; set; }
}
