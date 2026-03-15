using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Features;
using CoreApp.Features;

namespace CoreApp.Workflows;

[Authorize]
[RequiresFeature(CoreAppFeatures.WorkflowModule)]
public class WorkflowAppService : ApplicationService, IWorkflowAppService
{
    private readonly IRepository<WorkflowDefinition, Guid> _repository;

    public WorkflowAppService(IRepository<WorkflowDefinition, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResultDto<WorkflowDefinitionDto>> GetListAsync(GetWorkflowListDto input)
    {
        var queryable = await _repository.GetQueryableAsync();

        if (!string.IsNullOrWhiteSpace(input.Filter))
            queryable = queryable.Where(x => x.Name.Contains(input.Filter));

        if (input.Status.HasValue)
            queryable = queryable.Where(x => x.Status == input.Status.Value);

        queryable = queryable.OrderByDescending(x => x.LastModificationTime ?? x.CreationTime);

        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<WorkflowDefinitionDto>(totalCount, items.Select(MapToDto).ToList());
    }

    public async Task<WorkflowDefinitionDto> GetAsync(Guid id)
    {
        var entity = await _repository.GetAsync(id);
        return MapToDto(entity);
    }

    public async Task<WorkflowDefinitionDto> CreateAsync(CreateUpdateWorkflowDto input)
    {
        var entity = new WorkflowDefinition(GuidGenerator.Create(), input.Name, input.Description, CurrentTenant.Id)
        {
            TriggerType = input.TriggerType,
            NodesJson = input.NodesJson,
            EdgesJson = input.EdgesJson,
        };
        await _repository.InsertAsync(entity);
        return MapToDto(entity);
    }

    public async Task<WorkflowDefinitionDto> UpdateAsync(Guid id, CreateUpdateWorkflowDto input)
    {
        var entity = await _repository.GetAsync(id);
        entity.Name = input.Name;
        entity.Description = input.Description;
        entity.TriggerType = input.TriggerType;
        entity.NodesJson = input.NodesJson;
        entity.EdgesJson = input.EdgesJson;
        entity.Version++;
        await _repository.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }

    public async Task<WorkflowDefinitionDto> ActivateAsync(Guid id)
    {
        var entity = await _repository.GetAsync(id);
        entity.Status = WorkflowStatus.Active;
        await _repository.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task<WorkflowDefinitionDto> DeactivateAsync(Guid id)
    {
        var entity = await _repository.GetAsync(id);
        entity.Status = WorkflowStatus.Inactive;
        await _repository.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task<WorkflowDefinitionDto> DuplicateAsync(Guid id)
    {
        var source = await _repository.GetAsync(id);
        var copy = new WorkflowDefinition(GuidGenerator.Create(), source.Name + " (Copy)", source.Description, CurrentTenant.Id)
        {
            TriggerType = source.TriggerType,
            NodesJson = source.NodesJson,
            EdgesJson = source.EdgesJson,
        };
        await _repository.InsertAsync(copy);
        return MapToDto(copy);
    }

    private static WorkflowDefinitionDto MapToDto(WorkflowDefinition entity)
    {
        return new WorkflowDefinitionDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Status = entity.Status,
            TriggerType = entity.TriggerType,
            NodesJson = entity.NodesJson,
            EdgesJson = entity.EdgesJson,
            Version = entity.Version,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId,
        };
    }
}
