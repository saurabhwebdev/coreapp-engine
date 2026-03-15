using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Volo.Abp.AuditLogging;
using Volo.Abp.DependencyInjection;

namespace CoreApp.HealthChecks;

public class AuditLogHealthCheck : IHealthCheck, ITransientDependency
{
    private readonly IAuditLogRepository _auditLogRepository;

    public AuditLogHealthCheck(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await _auditLogRepository.GetCountAsync(cancellationToken: cancellationToken);
            return HealthCheckResult.Healthy($"Audit logging operational. {count} log(s) recorded.");
        }
        catch (Exception e)
        {
            return HealthCheckResult.Unhealthy("Audit logging check failed.", e);
        }
    }
}
