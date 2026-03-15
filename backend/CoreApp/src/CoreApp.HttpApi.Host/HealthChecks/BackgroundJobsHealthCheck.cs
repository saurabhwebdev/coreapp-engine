using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace CoreApp.HealthChecks;

public class BackgroundJobsHealthCheck : IHealthCheck, ITransientDependency
{
    private readonly IRepository<BackgroundJobRecord, Guid> _jobRepository;

    public BackgroundJobsHealthCheck(IRepository<BackgroundJobRecord, Guid> jobRepository)
    {
        _jobRepository = jobRepository;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var queryable = await _jobRepository.GetQueryableAsync();
            return HealthCheckResult.Healthy("Background jobs system is accessible.");
        }
        catch (Exception e)
        {
            return HealthCheckResult.Unhealthy("Background jobs check failed.", e);
        }
    }
}
