using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using CoreApp.Chat;
using CoreApp.FileManagement;
using CoreApp.Forms;
using CoreApp.Notifications;
using CoreApp.Reports;
using CoreApp.Workflows;

namespace CoreApp.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class CoreAppDbContext :
    AbpDbContext<CoreAppDbContext>,
    ITenantManagementDbContext,
    IIdentityDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<UserNotification> UserNotifications { get; set; }
    public DbSet<FileDescriptor> FileDescriptors { get; set; }
    public DbSet<WorkflowDefinition> WorkflowDefinitions { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<FormDefinition> FormDefinitions { get; set; }
    public DbSet<FormSubmission> FormSubmissions { get; set; }
    public DbSet<ReportDefinition> ReportDefinitions { get; set; }


    #region Entities from the modules

    /* Notice: We only implemented IIdentityProDbContext and ISaasDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityProDbContext and ISaasDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    // Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    public CoreAppDbContext(DbContextOptions<CoreAppDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureFeatureManagement();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureTenantManagement();
        builder.ConfigureBlobStoring();
        
        /* Configure your own tables/entities inside here */

        builder.Entity<Notification>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "Notifications", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Title).IsRequired().HasMaxLength(256);
            b.Property(x => x.Message).IsRequired().HasMaxLength(2048);
            b.Property(x => x.Data).HasMaxLength(4096);
            b.Property(x => x.TargetUrl).HasMaxLength(512);
            b.HasIndex(x => x.CreationTime);
        });

        builder.Entity<UserNotification>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "UserNotifications", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.HasIndex(x => new { x.UserId, x.State });
            b.HasIndex(x => x.NotificationId);
        });

        builder.Entity<FileDescriptor>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "FileDescriptors", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.MimeType).IsRequired().HasMaxLength(128);
            b.Property(x => x.BlobName).HasMaxLength(512);
            b.HasIndex(x => x.ParentId);
        });

        builder.Entity<WorkflowDefinition>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "WorkflowDefinitions", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.Description).HasMaxLength(2048);
            b.Property(x => x.TriggerType).HasMaxLength(128);
            b.Property(x => x.NodesJson).HasColumnType("nvarchar(max)");
            b.Property(x => x.EdgesJson).HasColumnType("nvarchar(max)");
            b.HasIndex(x => x.Status);
            b.HasIndex(x => x.Name);
        });

        builder.Entity<ChatMessage>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "ChatMessages", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Message).IsRequired().HasMaxLength(4096);
            b.HasIndex(x => new { x.SenderId, x.ReceiverId });
            b.HasIndex(x => x.ReceiverId);
            b.HasIndex(x => x.CreationTime);
        });

        builder.Entity<FormDefinition>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "FormDefinitions", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.Description).HasMaxLength(2048);
            b.Property(x => x.FieldsJson).HasColumnType("nvarchar(max)");
            b.HasIndex(x => x.Name);
            b.HasIndex(x => x.IsPublished);
        });

        builder.Entity<FormSubmission>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "FormSubmissions", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.DataJson).HasColumnType("nvarchar(max)");
            b.HasIndex(x => x.FormId);
            b.HasIndex(x => x.CreationTime);
        });

        builder.Entity<ReportDefinition>(b =>
        {
            b.ToTable(CoreAppConsts.DbTablePrefix + "ReportDefinitions", CoreAppConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.Description).HasMaxLength(2048);
            b.Property(x => x.Category).HasMaxLength(128);
            b.Property(x => x.ConfigJson).HasColumnType("nvarchar(max)");
            b.Property(x => x.LastRunResult).HasColumnType("nvarchar(max)");
            b.HasIndex(x => x.Name);
            b.HasIndex(x => x.Category);
        });
    }
}
