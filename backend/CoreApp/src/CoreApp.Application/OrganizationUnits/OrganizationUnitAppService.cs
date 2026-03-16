using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using CoreApp.Permissions;

namespace CoreApp.OrganizationUnits;

[Authorize(CoreAppPermissions.OrganizationUnits.Default)]
public class OrganizationUnitAppService : ApplicationService, IOrganizationUnitAppService
{
    private readonly OrganizationUnitManager _orgUnitManager;
    private readonly IOrganizationUnitRepository _orgUnitRepository;
    private readonly IdentityUserManager _userManager;
    private readonly IIdentityUserRepository _userRepository;
    private readonly IIdentityRoleRepository _roleRepository;

    public OrganizationUnitAppService(
        OrganizationUnitManager orgUnitManager,
        IOrganizationUnitRepository orgUnitRepository,
        IdentityUserManager userManager,
        IIdentityUserRepository userRepository,
        IIdentityRoleRepository roleRepository)
    {
        _orgUnitManager = orgUnitManager;
        _orgUnitRepository = orgUnitRepository;
        _userManager = userManager;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
    }

    public async Task<ListResultDto<OrganizationUnitDto>> GetListAsync()
    {
        var ous = await _orgUnitRepository.GetListAsync(includeDetails: true);
        var dtos = new List<OrganizationUnitDto>();

        foreach (var ou in ous.OrderBy(x => x.Code))
        {
            var memberCount = await _orgUnitRepository.GetMembersCountAsync(ou);
            var roleCount = await _orgUnitRepository.GetRolesCountAsync(ou);
            dtos.Add(new OrganizationUnitDto
            {
                Id = ou.Id,
                ParentId = ou.ParentId,
                Code = ou.Code,
                DisplayName = ou.DisplayName,
                MemberCount = memberCount,
                RoleCount = roleCount,
                CreationTime = ou.CreationTime
            });
        }

        return new ListResultDto<OrganizationUnitDto>(dtos);
    }

    public async Task<OrganizationUnitDto> GetAsync(Guid id)
    {
        var ou = await _orgUnitRepository.GetAsync(id);
        var memberCount = await _orgUnitRepository.GetMembersCountAsync(ou);
        var roleCount = await _orgUnitRepository.GetRolesCountAsync(ou);

        return new OrganizationUnitDto
        {
            Id = ou.Id,
            ParentId = ou.ParentId,
            Code = ou.Code,
            DisplayName = ou.DisplayName,
            MemberCount = memberCount,
            RoleCount = roleCount,
            CreationTime = ou.CreationTime
        };
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageOU)]
    public async Task<OrganizationUnitDto> CreateAsync(CreateOrganizationUnitDto input)
    {
        var ou = new OrganizationUnit(GuidGenerator.Create(), input.DisplayName, input.ParentId, CurrentTenant.Id);
        await _orgUnitManager.CreateAsync(ou);
        await CurrentUnitOfWork!.SaveChangesAsync();

        return new OrganizationUnitDto
        {
            Id = ou.Id,
            ParentId = ou.ParentId,
            Code = ou.Code,
            DisplayName = ou.DisplayName,
            CreationTime = ou.CreationTime
        };
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageOU)]
    public async Task<OrganizationUnitDto> UpdateAsync(Guid id, UpdateOrganizationUnitDto input)
    {
        var ou = await _orgUnitRepository.GetAsync(id);
        ou.DisplayName = input.DisplayName;
        await _orgUnitManager.UpdateAsync(ou);

        return new OrganizationUnitDto
        {
            Id = ou.Id,
            ParentId = ou.ParentId,
            Code = ou.Code,
            DisplayName = ou.DisplayName,
            CreationTime = ou.CreationTime
        };
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageOU)]
    public async Task DeleteAsync(Guid id)
    {
        await _orgUnitManager.DeleteAsync(id);
    }

    public async Task<PagedResultDto<OrganizationUnitMemberDto>> GetMembersAsync(Guid id, PagedResultRequestDto input)
    {
        var ou = await _orgUnitRepository.GetAsync(id);
        var totalCount = await _orgUnitRepository.GetMembersCountAsync(ou);
        var members = await _orgUnitRepository.GetMembersAsync(ou, maxResultCount: input.MaxResultCount, skipCount: input.SkipCount);

        return new PagedResultDto<OrganizationUnitMemberDto>(
            totalCount,
            members.Select(u => new OrganizationUnitMemberDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                Name = u.Name,
                Surname = u.Surname
            }).ToList()
        );
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageMembers)]
    public async Task AddMemberAsync(Guid id, Guid userId)
    {
        var user = await _userManager.GetByIdAsync(userId);
        user.AddOrganizationUnit(id);
        await _userManager.UpdateAsync(user);
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageMembers)]
    public async Task RemoveMemberAsync(Guid id, Guid userId)
    {
        var user = await _userManager.GetByIdAsync(userId);
        user.RemoveOrganizationUnit(id);
        await _userManager.UpdateAsync(user);
    }

    public async Task<ListResultDto<OrganizationUnitRoleDto>> GetRolesAsync(Guid id)
    {
        var ou = await _orgUnitRepository.GetAsync(id);
        var roles = await _orgUnitRepository.GetRolesAsync(ou);

        return new ListResultDto<OrganizationUnitRoleDto>(
            roles.Select(r => new OrganizationUnitRoleDto
            {
                Id = r.Id,
                Name = r.Name
            }).ToList()
        );
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageRoles)]
    public async Task AddRoleAsync(Guid id, Guid roleId)
    {
        await _orgUnitManager.AddRoleToOrganizationUnitAsync(roleId, id);
    }

    [Authorize(CoreAppPermissions.OrganizationUnits.ManageRoles)]
    public async Task RemoveRoleAsync(Guid id, Guid roleId)
    {
        await _orgUnitManager.RemoveRoleFromOrganizationUnitAsync(roleId, id);
    }
}
