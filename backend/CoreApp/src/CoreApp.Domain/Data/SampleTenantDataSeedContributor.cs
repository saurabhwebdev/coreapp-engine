using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.TenantManagement;

namespace CoreApp.Data;

public class SampleTenantDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly ITenantManager _tenantManager;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentTenant _currentTenant;
    private readonly IdentityUserManager _userManager;
    private readonly IdentityRoleManager _roleManager;
    private readonly IGuidGenerator _guidGenerator;
    private readonly ILogger<SampleTenantDataSeedContributor> _logger;

    public SampleTenantDataSeedContributor(
        ITenantManager tenantManager,
        ITenantRepository tenantRepository,
        ICurrentTenant currentTenant,
        IdentityUserManager userManager,
        IdentityRoleManager roleManager,
        IGuidGenerator guidGenerator,
        ILogger<SampleTenantDataSeedContributor> logger)
    {
        _tenantManager = tenantManager;
        _tenantRepository = tenantRepository;
        _currentTenant = currentTenant;
        _userManager = userManager;
        _roleManager = roleManager;
        _guidGenerator = guidGenerator;
        _logger = logger;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        // Only seed if no tenants exist
        var tenantCount = await _tenantRepository.GetCountAsync();
        if (tenantCount > 0)
        {
            return;
        }

        _logger.LogInformation("Seeding sample tenant: Acme Corp");

        // Create tenant
        var tenant = await _tenantManager.CreateAsync("Acme Corp");
        await _tenantRepository.InsertAsync(tenant);

        // Switch to tenant context to create users inside it
        using (_currentTenant.Change(tenant.Id))
        {
            // Create admin role inside tenant
            var adminRole = await _roleManager.FindByNameAsync("admin");
            if (adminRole == null)
            {
                adminRole = new IdentityRole(_guidGenerator.Create(), "admin", tenant.Id);
                await _roleManager.CreateAsync(adminRole);
            }

            // Create tenant admin user
            var adminUser = new IdentityUser(
                _guidGenerator.Create(),
                "acme.admin",
                "admin@acme.com",
                tenant.Id
            );
            adminUser.Name = "Acme";
            adminUser.Surname = "Admin";
            await _userManager.CreateAsync(adminUser, "123456aA!");
            await _userManager.AddToRoleAsync(adminUser, "admin");

            // Create regular users
            var user1 = new IdentityUser(
                _guidGenerator.Create(),
                "john.doe",
                "john@acme.com",
                tenant.Id
            );
            user1.Name = "John";
            user1.Surname = "Doe";
            await _userManager.CreateAsync(user1, "123456aA!");

            var user2 = new IdentityUser(
                _guidGenerator.Create(),
                "jane.smith",
                "jane@acme.com",
                tenant.Id
            );
            user2.Name = "Jane";
            user2.Surname = "Smith";
            await _userManager.CreateAsync(user2, "123456aA!");

            var user3 = new IdentityUser(
                _guidGenerator.Create(),
                "bob.wilson",
                "bob@acme.com",
                tenant.Id
            );
            user3.Name = "Bob";
            user3.Surname = "Wilson";
            await _userManager.CreateAsync(user3, "123456aA!");

            _logger.LogInformation("Seeded Acme Corp with 4 users: acme.admin, john.doe, jane.smith, bob.wilson");
        }
    }
}
