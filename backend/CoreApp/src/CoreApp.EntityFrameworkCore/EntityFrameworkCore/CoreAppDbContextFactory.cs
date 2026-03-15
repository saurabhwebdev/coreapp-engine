using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CoreApp.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class CoreAppDbContextFactory : IDesignTimeDbContextFactory<CoreAppDbContext>
{
    public CoreAppDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        CoreAppEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<CoreAppDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));
        
        return new CoreAppDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../CoreApp.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables();

        return builder.Build();
    }
}
