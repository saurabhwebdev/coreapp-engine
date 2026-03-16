using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.LinkUsers;

public interface ILinkUserAppService : IApplicationService
{
    Task<ListResultDto<LinkUserDto>> GetMyLinksAsync();
    Task DeleteAsync(Guid id);
}
