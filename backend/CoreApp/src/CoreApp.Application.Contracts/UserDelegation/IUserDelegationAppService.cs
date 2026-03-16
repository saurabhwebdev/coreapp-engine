using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.UserDelegation;

public interface IUserDelegationAppService : IApplicationService
{
    Task<ListResultDto<UserDelegationDto>> GetMyDelegationsAsync();
    Task<UserDelegationDto> CreateAsync(CreateUserDelegationDto input);
    Task DeleteAsync(Guid id);
}
