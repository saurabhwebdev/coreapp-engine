using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.OpenIddict.Applications;

namespace CoreApp.HealthChecks;

public class OpenIddictHealthCheck : IHealthCheck, ITransientDependency
{
    private readonly IOpenIddictApplicationRepository _applicationRepository;

    public OpenIddictHealthCheck(IOpenIddictApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var apps = await _applicationRepository.GetListAsync(sorting: "Id", maxResultCount: 1, skipCount: 0, cancellationToken: cancellationToken);
            return HealthCheckResult.Healthy($"OpenIddict is operational. {(apps.Count > 0 ? "Applications registered." : "No applications found.")}");
        }
        catch (Exception e)
        {
            return HealthCheckResult.Unhealthy("OpenIddict check failed.", e);
        }
    }
}
