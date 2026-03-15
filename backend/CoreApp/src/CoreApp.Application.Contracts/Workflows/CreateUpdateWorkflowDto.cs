using System.ComponentModel.DataAnnotations;

namespace CoreApp.Workflows;

public class CreateUpdateWorkflowDto
{
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = null!;

    [StringLength(2048)]
    public string? Description { get; set; }

    public string? TriggerType { get; set; }
    public string NodesJson { get; set; } = "[]";
    public string EdgesJson { get; set; } = "[]";
}
