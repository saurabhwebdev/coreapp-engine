using CoreApp.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace CoreApp.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(CoreAppEntityFrameworkCoreModule),
    typeof(CoreAppApplicationContractsModule)
)]
public class CoreAppDbMigratorModule : AbpModule
{
}
