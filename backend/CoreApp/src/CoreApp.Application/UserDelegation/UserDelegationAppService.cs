using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace CoreApp.UserDelegation;

[Authorize]
public class UserDelegationAppService : CoreAppAppService, IUserDelegationAppService
{
    private readonly IRepository<IdentityUserDelegation, Guid> _delegationRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public UserDelegationAppService(
        IRepository<IdentityUserDelegation, Guid> delegationRepository,
        IRepository<IdentityUser, Guid> userRepository)
    {
        _delegationRepository = delegationRepository;
        _userRepository = userRepository;
    }

    public async Task<ListResultDto<UserDelegationDto>> GetMyDelegationsAsync()
    {
        var currentUserId = CurrentUser.Id!.Value;

        var queryable = await _delegationRepository.GetQueryableAsync();
        var delegations = await AsyncExecuter.ToListAsync(
            queryable.Where(x =>
                x.SourceUserId == currentUserId ||
                x.TargetUserId == currentUserId)
        );

        var result = new List<UserDelegationDto>();
        foreach (var d in delegations)
        {
            var sourceUser = await _userRepository.FindAsync(d.SourceUserId);
            var targetUser = await _userRepository.FindAsync(d.TargetUserId);

            result.Add(new UserDelegationDto
            {
                Id = d.Id,
                SourceUserId = d.SourceUserId,
                SourceUserName = sourceUser?.UserName,
                TargetUserId = d.TargetUserId,
                TargetUserName = targetUser?.UserName,
                StartTime = d.StartTime,
                EndTime = d.EndTime,
            });
        }

        return new ListResultDto<UserDelegationDto>(result);
    }

    public async Task<UserDelegationDto> CreateAsync(CreateUserDelegationDto input)
    {
        var currentUserId = CurrentUser.Id!.Value;

        if (input.TargetUserId == currentUserId)
        {
            throw new UserFriendlyException("You cannot delegate to yourself.");
        }

        if (input.EndTime <= input.StartTime)
        {
            throw new UserFriendlyException("End time must be after start time.");
        }

        // Verify target user exists
        var targetUser = await _userRepository.FindAsync(input.TargetUserId);
        if (targetUser == null)
        {
            throw new UserFriendlyException("Target user not found.");
        }

        var delegation = new IdentityUserDelegation(
            GuidGenerator.Create(),
            sourceUserId: currentUserId,
            targetUserId: input.TargetUserId,
            startTime: input.StartTime,
            endTime: input.EndTime,
            tenantId: CurrentTenant.Id
        );

        await _delegationRepository.InsertAsync(delegation);

        var sourceUser = await _userRepository.FindAsync(currentUserId);

        return new UserDelegationDto
        {
            Id = delegation.Id,
            SourceUserId = delegation.SourceUserId,
            SourceUserName = sourceUser?.UserName,
            TargetUserId = delegation.TargetUserId,
            TargetUserName = targetUser.UserName,
            StartTime = delegation.StartTime,
            EndTime = delegation.EndTime,
        };
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = CurrentUser.Id!.Value;
        var delegation = await _delegationRepository.GetAsync(id);

        if (delegation.SourceUserId != currentUserId)
        {
            throw new UserFriendlyException("You can only delete delegations you created.");
        }

        await _delegationRepository.DeleteAsync(id);
    }
}
