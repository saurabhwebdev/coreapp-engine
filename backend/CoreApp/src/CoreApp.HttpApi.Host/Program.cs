using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

namespace CoreApp;

public class Program
{
    public async static Task<int> Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Async(c => c.File("Logs/logs.txt"))
            .WriteTo.Async(c => c.Console())
            .CreateBootstrapLogger();

        try
        {
            Log.Information("Starting CoreApp.HttpApi.Host.");
            var builder = WebApplication.CreateBuilder(args);

            // Trust dev HTTPS certificate for internal API calls (OpenIddict discovery, etc.)
            if (builder.Environment.IsDevelopment())
            {
                builder.Services.ConfigureAll<HttpClientFactoryOptions>(options =>
                {
                    options.HttpMessageHandlerBuilderActions.Add(b =>
                    {
                        b.PrimaryHandler = new HttpClientHandler
                        {
                            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                        };
                    });
                });
            }
            builder.Host
                .AddAppSettingsSecretsJson()
                .UseAutofac()
                .UseSerilog((context, services, loggerConfiguration) =>
                {
                    loggerConfiguration
                        .ReadFrom.Configuration(context.Configuration)
                        .ReadFrom.Services(services)
                        .WriteTo.Async(c => c.Console());
                });
            await builder.AddApplicationAsync<CoreAppHttpApiHostModule>();
            var app = builder.Build();
            await app.InitializeApplicationAsync();
            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            if (ex is HostAbortedException)
            {
                throw;
            }

            Log.Fatal(ex, "Host terminated unexpectedly!");
            return 1;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
