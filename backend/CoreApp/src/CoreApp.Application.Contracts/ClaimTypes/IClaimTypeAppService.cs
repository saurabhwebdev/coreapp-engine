using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.ClaimTypes;

public interface IClaimTypeAppService : IApplicationService
{
    Task<PagedResultDto<ClaimTypeDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    Task<ClaimTypeDto> CreateAsync(CreateClaimTypeDto input);
    Task<ClaimTypeDto> UpdateAsync(Guid id, UpdateClaimTypeDto input);
    Task DeleteAsync(Guid id);
}
