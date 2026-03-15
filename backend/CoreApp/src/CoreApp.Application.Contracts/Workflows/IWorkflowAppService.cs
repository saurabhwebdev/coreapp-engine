using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.Workflows;

public interface IWorkflowAppService : IApplicationService
{
    Task<PagedResultDto<WorkflowDefinitionDto>> GetListAsync(GetWorkflowListDto input);
    Task<WorkflowDefinitionDto> GetAsync(Guid id);
    Task<WorkflowDefinitionDto> CreateAsync(CreateUpdateWorkflowDto input);
    Task<WorkflowDefinitionDto> UpdateAsync(Guid id, CreateUpdateWorkflowDto input);
    Task DeleteAsync(Guid id);
    Task<WorkflowDefinitionDto> ActivateAsync(Guid id);
    Task<WorkflowDefinitionDto> DeactivateAsync(Guid id);
    Task<WorkflowDefinitionDto> DuplicateAsync(Guid id);
}
