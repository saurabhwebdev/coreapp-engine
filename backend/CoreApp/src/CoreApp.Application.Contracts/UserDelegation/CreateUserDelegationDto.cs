using System;
using System.ComponentModel.DataAnnotations;

namespace CoreApp.UserDelegation;

public class CreateUserDelegationDto
{
    [Required]
    public Guid TargetUserId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
