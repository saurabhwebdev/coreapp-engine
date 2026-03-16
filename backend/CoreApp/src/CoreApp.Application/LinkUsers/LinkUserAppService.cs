using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace CoreApp.LinkUsers;

[Authorize]
public class LinkUserAppService : CoreAppAppService, ILinkUserAppService
{
    private readonly IRepository<IdentityLinkUser, Guid> _linkUserRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public LinkUserAppService(
        IRepository<IdentityLinkUser, Guid> linkUserRepository,
        IRepository<IdentityUser, Guid> userRepository)
    {
        _linkUserRepository = linkUserRepository;
        _userRepository = userRepository;
    }

    public async Task<ListResultDto<LinkUserDto>> GetMyLinksAsync()
    {
        var currentUserId = CurrentUser.Id!.Value;
        var currentTenantId = CurrentTenant.Id;

        var queryable = await _linkUserRepository.GetQueryableAsync();
        var links = await AsyncExecuter.ToListAsync(
            queryable.Where(x =>
                (x.SourceUserId == currentUserId) ||
                (x.TargetUserId == currentUserId))
        );

        var result = new List<LinkUserDto>();
        foreach (var link in links)
        {
            // Determine the "other" user in the link
            var targetUserId = link.SourceUserId == currentUserId
                ? link.TargetUserId
                : link.SourceUserId;
            var targetTenantId = link.SourceUserId == currentUserId
                ? link.TargetTenantId
                : link.SourceTenantId;

            string? targetUserName = null;
            try
            {
                // Only look up the user if they're in the same tenant
                if (targetTenantId == currentTenantId)
                {
                    var user = await _userRepository.FindAsync(targetUserId);
                    targetUserName = user?.UserName;
                }
            }
            catch
            {
                // User might be in a different tenant
            }

            result.Add(new LinkUserDto
            {
                Id = link.Id,
                TargetUserId = targetUserId,
                TargetUserName = targetUserName ?? $"User ({targetUserId.ToString()[..8]}...)",
                TargetTenantId = targetTenantId,
            });
        }

        return new ListResultDto<LinkUserDto>(result);
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = CurrentUser.Id!.Value;
        var link = await _linkUserRepository.GetAsync(id);

        // Only allow deleting links that belong to the current user
        if (link.SourceUserId != currentUserId && link.TargetUserId != currentUserId)
        {
            throw new Volo.Abp.UserFriendlyException("You can only delete your own linked accounts.");
        }

        await _linkUserRepository.DeleteAsync(id);
    }
}
