using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace CoreApp.ClaimTypes;

public class ClaimTypeDto : EntityDto<Guid>
{
    public string Name { get; set; } = string.Empty;
    public bool Required { get; set; }
    public bool IsStatic { get; set; }
    public string? Regex { get; set; }
    public string? Description { get; set; }
    public string ValueType { get; set; } = "String";
}

public class CreateClaimTypeDto
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;
    public bool Required { get; set; }
    public string? Regex { get; set; }
    public string? Description { get; set; }
    public string ValueType { get; set; } = "String";
}

public class UpdateClaimTypeDto
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;
    public bool Required { get; set; }
    public string? Regex { get; set; }
    public string? Description { get; set; }
}
