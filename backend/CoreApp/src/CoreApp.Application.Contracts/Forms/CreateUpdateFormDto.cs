using System.ComponentModel.DataAnnotations;

namespace CoreApp.Forms;

public class CreateUpdateFormDto
{
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = null!;

    [StringLength(2048)]
    public string? Description { get; set; }

    public string FieldsJson { get; set; } = "[]";
}
