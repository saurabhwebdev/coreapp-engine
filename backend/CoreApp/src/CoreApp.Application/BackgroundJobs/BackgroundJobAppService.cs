using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.Domain.Repositories;

namespace CoreApp.BackgroundJobs;

[Authorize]
public class BackgroundJobAppService : ApplicationService, IBackgroundJobAppService
{
    private readonly IRepository<BackgroundJobRecord, Guid> _repository;

    public BackgroundJobAppService(IRepository<BackgroundJobRecord, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResultDto<BackgroundJobDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await _repository.GetQueryableAsync();
        queryable = queryable.OrderByDescending(x => x.CreationTime);

        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<BackgroundJobDto>(
            totalCount,
            items.Select(j => new BackgroundJobDto
            {
                Id = j.Id,
                JobName = j.JobName,
                JobArgs = j.JobArgs,
                TryCount = j.TryCount,
                CreationTime = j.CreationTime,
                LastTryTime = j.LastTryTime,
                NextTryTime = j.NextTryTime,
                IsAbandoned = j.IsAbandoned,
                Priority = (byte)j.Priority,
            }).ToList()
        );
    }
}
