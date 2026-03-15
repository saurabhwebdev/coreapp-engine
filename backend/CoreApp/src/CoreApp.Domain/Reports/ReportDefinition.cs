using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Reports;

public class ReportDefinition : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public string? LastRunResult { get; set; }
    public DateTime? LastRunTime { get; set; }

    protected ReportDefinition() { }

    public ReportDefinition(Guid id, string name, string? description = null, Guid? tenantId = null) : base(id)
    {
        Name = name;
        Description = description;
        TenantId = tenantId;
    }
}
