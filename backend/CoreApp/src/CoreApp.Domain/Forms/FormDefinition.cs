using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Forms;

public class FormDefinition : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string FieldsJson { get; set; } = "[]";
    public bool IsPublished { get; set; }
    public int SubmissionCount { get; set; }

    protected FormDefinition() { }

    public FormDefinition(Guid id, string name, string? description = null, Guid? tenantId = null) : base(id)
    {
        Name = name;
        Description = description;
        TenantId = tenantId;
    }
}
