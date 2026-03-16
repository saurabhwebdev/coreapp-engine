using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.OrganizationUnits;

public interface IOrganizationUnitAppService : IApplicationService
{
    Task<ListResultDto<OrganizationUnitDto>> GetListAsync();
    Task<OrganizationUnitDto> GetAsync(Guid id);
    Task<OrganizationUnitDto> CreateAsync(CreateOrganizationUnitDto input);
    Task<OrganizationUnitDto> UpdateAsync(Guid id, UpdateOrganizationUnitDto input);
    Task DeleteAsync(Guid id);
    Task<PagedResultDto<OrganizationUnitMemberDto>> GetMembersAsync(Guid id, PagedResultRequestDto input);
    Task AddMemberAsync(Guid id, Guid userId);
    Task RemoveMemberAsync(Guid id, Guid userId);
    Task<ListResultDto<OrganizationUnitRoleDto>> GetRolesAsync(Guid id);
    Task AddRoleAsync(Guid id, Guid roleId);
    Task RemoveRoleAsync(Guid id, Guid roleId);
}
