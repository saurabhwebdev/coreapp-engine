using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace CoreApp.Data;

/* This is used if database provider does't define
 * ICoreAppDbSchemaMigrator implementation.
 */
public class NullCoreAppDbSchemaMigrator : ICoreAppDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
