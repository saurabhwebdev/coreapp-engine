using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Workflows;

public class WorkflowDefinition : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public WorkflowStatus Status { get; set; }
    public string? TriggerType { get; set; }
    public string NodesJson { get; set; } = "[]";
    public string EdgesJson { get; set; } = "[]";
    public int Version { get; set; } = 1;

    protected WorkflowDefinition() { }

    public WorkflowDefinition(Guid id, string name, string? description = null, Guid? tenantId = null) : base(id)
    {
        Name = name;
        Description = description;
        Status = WorkflowStatus.Draft;
        TenantId = tenantId;
    }
}
