using System;
using System.ComponentModel.DataAnnotations;

namespace CoreApp.Chat;

public class SendMessageDto
{
    [Required]
    public Guid ReceiverId { get; set; }
    [Required]
    [StringLength(4096)]
    public string Message { get; set; } = null!;
}
