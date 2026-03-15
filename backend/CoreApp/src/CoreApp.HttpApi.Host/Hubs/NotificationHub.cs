using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CoreApp.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Add user to their own group for targeted notifications
        if (Context.UserIdentifier != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, Context.UserIdentifier);
        }
        await base.OnConnectedAsync();
    }
}
