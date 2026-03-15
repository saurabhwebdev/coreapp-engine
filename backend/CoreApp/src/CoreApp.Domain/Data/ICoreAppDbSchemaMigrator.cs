using System.Threading.Tasks;

namespace CoreApp.Data;

public interface ICoreAppDbSchemaMigrator
{
    Task MigrateAsync();
}
