using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;

namespace CoreApp.HealthChecks;

public class IdentityHealthCheck : IHealthCheck, ITransientDependency
{
    private readonly IIdentityUserRepository _userRepository;

    public IdentityHealthCheck(IIdentityUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await _userRepository.GetCountAsync(cancellationToken: cancellationToken);
            return HealthCheckResult.Healthy($"Identity module operational. {count} user(s) in system.");
        }
        catch (Exception e)
        {
            return HealthCheckResult.Unhealthy("Identity module check failed.", e);
        }
    }
}
