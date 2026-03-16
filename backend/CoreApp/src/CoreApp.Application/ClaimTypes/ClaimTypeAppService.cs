using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using CoreApp.Permissions;

namespace CoreApp.ClaimTypes;

[Authorize(CoreAppPermissions.ClaimTypes.Default)]
public class ClaimTypeAppService : ApplicationService, IClaimTypeAppService
{
    private readonly IIdentityClaimTypeRepository _claimTypeRepository;
    private readonly IdentityClaimTypeManager _claimTypeManager;

    public ClaimTypeAppService(
        IIdentityClaimTypeRepository claimTypeRepository,
        IdentityClaimTypeManager claimTypeManager)
    {
        _claimTypeRepository = claimTypeRepository;
        _claimTypeManager = claimTypeManager;
    }

    public async Task<PagedResultDto<ClaimTypeDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _claimTypeRepository.GetCountAsync();
        var claimTypes = await _claimTypeRepository.GetListAsync(
            input.Sorting ?? "name",
            input.MaxResultCount,
            input.SkipCount,
            filter: null
        );

        return new PagedResultDto<ClaimTypeDto>(
            totalCount,
            claimTypes.Select(ct => new ClaimTypeDto
            {
                Id = ct.Id,
                Name = ct.Name,
                Required = ct.Required,
                IsStatic = ct.IsStatic,
                Regex = ct.Regex,
                Description = ct.Description,
                ValueType = ct.ValueType.ToString()
            }).ToList()
        );
    }

    [Authorize(CoreAppPermissions.ClaimTypes.Create)]
    public async Task<ClaimTypeDto> CreateAsync(CreateClaimTypeDto input)
    {
        var ct = new IdentityClaimType(
            GuidGenerator.Create(),
            input.Name,
            input.Required,
            isStatic: false,
            regex: input.Regex,
            description: input.Description
        );

        await _claimTypeRepository.InsertAsync(ct);

        return new ClaimTypeDto
        {
            Id = ct.Id,
            Name = ct.Name,
            Required = ct.Required,
            IsStatic = ct.IsStatic,
            Regex = ct.Regex,
            Description = ct.Description,
            ValueType = ct.ValueType.ToString()
        };
    }

    [Authorize(CoreAppPermissions.ClaimTypes.Create)]
    public async Task<ClaimTypeDto> UpdateAsync(Guid id, UpdateClaimTypeDto input)
    {
        var ct = await _claimTypeRepository.GetAsync(id);

        ct.SetName(input.Name);
        ct.Required = input.Required;
        ct.Regex = input.Regex;
        ct.Description = input.Description;

        await _claimTypeRepository.UpdateAsync(ct);

        return new ClaimTypeDto
        {
            Id = ct.Id,
            Name = ct.Name,
            Required = ct.Required,
            IsStatic = ct.IsStatic,
            Regex = ct.Regex,
            Description = ct.Description,
            ValueType = ct.ValueType.ToString()
        };
    }

    [Authorize(CoreAppPermissions.ClaimTypes.Create)]
    public async Task DeleteAsync(Guid id)
    {
        await _claimTypeRepository.DeleteAsync(id);
    }
}
