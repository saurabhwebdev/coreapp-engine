using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace CoreApp.OrganizationUnits;

public class OrganizationUnitDto : EntityDto<Guid>
{
    public Guid? ParentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public int RoleCount { get; set; }
    public DateTime CreationTime { get; set; }
}

public class CreateOrganizationUnitDto
{
    [Required]
    [MaxLength(128)]
    public string DisplayName { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
}

public class UpdateOrganizationUnitDto
{
    [Required]
    [MaxLength(128)]
    public string DisplayName { get; set; } = string.Empty;
}

public class OrganizationUnitMemberDto : EntityDto<Guid>
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Surname { get; set; }
}

public class OrganizationUnitRoleDto : EntityDto<Guid>
{
    public string Name { get; set; } = string.Empty;
}
