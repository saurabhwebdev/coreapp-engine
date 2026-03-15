using System.ComponentModel.DataAnnotations;

namespace CoreApp.Reports;

public class CreateUpdateReportDto
{
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }
    public string? Category { get; set; }
    public string ConfigJson { get; set; } = "{}";
}
