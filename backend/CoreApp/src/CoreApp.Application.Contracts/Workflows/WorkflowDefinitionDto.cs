using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Workflows;

public class WorkflowDefinitionDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public WorkflowStatus Status { get; set; }
    public string? TriggerType { get; set; }
    public string NodesJson { get; set; } = "[]";
    public string EdgesJson { get; set; } = "[]";
    public int Version { get; set; }
}
