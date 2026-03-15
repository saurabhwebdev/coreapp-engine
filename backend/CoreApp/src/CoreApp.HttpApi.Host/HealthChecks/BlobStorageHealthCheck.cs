using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Volo.Abp.DependencyInjection;

namespace CoreApp.HealthChecks;

public class BlobStorageHealthCheck : IHealthCheck, ITransientDependency
{
    private readonly IHostEnvironment _environment;

    public BlobStorageHealthCheck(IHostEnvironment environment)
    {
        _environment = environment;
    }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var blobPath = Path.Combine(_environment.ContentRootPath, "blobs");
            if (!Directory.Exists(blobPath))
            {
                Directory.CreateDirectory(blobPath);
            }
            var testFile = Path.Combine(blobPath, ".health-check");
            File.WriteAllText(testFile, "ok");
            File.Delete(testFile);
            return Task.FromResult(HealthCheckResult.Healthy("Blob storage directory is writable."));
        }
        catch (Exception e)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Blob storage check failed.", e));
        }
    }
}
