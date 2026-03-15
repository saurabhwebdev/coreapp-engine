using System;

namespace CoreApp.Chat;

public class ChatContactDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string? Name { get; set; }
    public int UnreadCount { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
}
