using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Reports;

public class ReportDefinitionDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public string? LastRunResult { get; set; }
    public DateTime? LastRunTime { get; set; }
}
