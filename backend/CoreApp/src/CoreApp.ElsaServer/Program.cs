using Elsa.EntityFrameworkCore.Extensions;
using Elsa.EntityFrameworkCore.Modules.Management;
using Elsa.EntityFrameworkCore.Modules.Runtime;
using Elsa.Extensions;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Server=localhost;Database=CoreApp;User Id=sa;Password=Admin@1234;TrustServerCertificate=true";

builder.Services.AddElsa(elsa =>
{
    elsa.UseWorkflowManagement(management =>
    {
        management.UseEntityFrameworkCore(ef =>
        {
            ef.UseSqlServer(connectionString);
            ef.RunMigrations = true;
        });
    });
    elsa.UseWorkflowRuntime(runtime =>
    {
        runtime.UseEntityFrameworkCore(ef =>
        {
            ef.UseSqlServer(connectionString);
            ef.RunMigrations = true;
        });
    });
    elsa.UseIdentity(identity =>
    {
        identity.TokenOptions = options => options.SigningKey = "sufficiently-large-secret-signing-key-for-jwt-tokens-1234567890";
        identity.UseAdminUserProvider();
    });
    elsa.UseDefaultAuthentication(auth => auth.UseAdminApiKey());
    elsa.UseWorkflowsApi();
    elsa.UseRealTimeWorkflows();
    elsa.UseHttp(http => http.ConfigureHttpOptions = options =>
    {
        options.BaseUrl = new Uri(builder.Configuration["Elsa:Http:BaseUrl"] ?? "http://localhost:14000");
    });
    elsa.UseScheduling();
    elsa.AddActivitiesFrom<Program>();
    elsa.AddWorkflowsFrom<Program>();
});

builder.Services.AddCors(cors => cors
    .AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithExposedHeaders("x-elsa-workflow-instance-id")));

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseCors();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseWorkflowsApi();
app.UseWorkflows();
app.UseWorkflowsSignalRHubs();
app.MapHealthChecks("/health");
app.MapGet("/", () => Results.Ok(new { name = "CoreEngine Elsa Workflow Server", version = "3.5.3", status = "running" }));

app.Run();
