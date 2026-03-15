using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.TenantManagement;

namespace CoreApp.HealthChecks;

public class TenantHealthCheck : IHealthCheck, ITransientDependency
{
    private readonly ITenantRepository _tenantRepository;

    public TenantHealthCheck(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await _tenantRepository.GetCountAsync(cancellationToken: cancellationToken);
            return HealthCheckResult.Healthy($"Tenant management operational. {count} tenant(s) registered.");
        }
        catch (Exception e)
        {
            return HealthCheckResult.Unhealthy("Tenant management check failed.", e);
        }
    }
}
