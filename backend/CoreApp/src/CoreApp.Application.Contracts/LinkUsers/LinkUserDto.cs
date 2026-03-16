using System;

namespace CoreApp.LinkUsers;

public class LinkUserDto
{
    public Guid Id { get; set; }
    public Guid TargetUserId { get; set; }
    public string? TargetUserName { get; set; }
    public Guid? TargetTenantId { get; set; }
}
