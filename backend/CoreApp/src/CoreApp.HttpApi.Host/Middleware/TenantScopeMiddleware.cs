using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Users;

namespace CoreApp.Middleware;

/// <summary>
/// Middleware that allows host admin users to view tenant data by sending
/// the __tenant header. ABP's default tenant resolver sets the tenant context,
/// but auth fails because the host admin user doesn't exist in the tenant.
///
/// This middleware runs AFTER authentication but BEFORE ABP's multi-tenancy.
/// If the user is authenticated as a host user (TenantId == null) and the
/// request has a __tenant header, we let the request through with the tenant
/// context set via ICurrentTenant.Change(), preserving the host admin's auth.
/// </summary>
public class TenantScopeMiddleware
{
    private readonly RequestDelegate _next;

    public TenantScopeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ICurrentUser currentUser,
        ICurrentTenant currentTenant)
    {
        // Only act when:
        // 1. User is authenticated
        // 2. User is a host user (no tenant)
        // 3. Request has __tenant header
        if (currentUser.IsAuthenticated &&
            currentUser.TenantId == null &&
            context.Request.Headers.TryGetValue("__tenant", out var tenantIdValue))
        {
            var tenantIdStr = tenantIdValue.ToString();
            if (!string.IsNullOrEmpty(tenantIdStr) && System.Guid.TryParse(tenantIdStr, out var tenantId))
            {
                // Switch to tenant context for this request
                // The host admin's auth stays valid, but all data queries
                // will be scoped to the specified tenant
                using (currentTenant.Change(tenantId))
                {
                    await _next(context);
                    return;
                }
            }
        }

        await _next(context);
    }
}
