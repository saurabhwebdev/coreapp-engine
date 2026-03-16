using System;

namespace CoreApp.UserDelegation;

public class UserDelegationDto
{
    public Guid Id { get; set; }
    public Guid SourceUserId { get; set; }
    public string? SourceUserName { get; set; }
    public Guid TargetUserId { get; set; }
    public string? TargetUserName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}
