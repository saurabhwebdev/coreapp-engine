using System;
using System.ComponentModel.DataAnnotations;

namespace CoreApp.FileManagement;

public class CreateDirectoryDto
{
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = null!;
    public Guid? ParentId { get; set; }
}
