using System;

namespace CoreApp.Reports;

public class RunReportResultDto
{
    public Guid ReportId { get; set; }
    public string Name { get; set; } = null!;
    public DateTime GeneratedAt { get; set; }
    public string ResultJson { get; set; } = "{}";
    public int RowCount { get; set; }
}
