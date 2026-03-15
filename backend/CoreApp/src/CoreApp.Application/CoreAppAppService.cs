using CoreApp.Localization;
using Volo.Abp.Application.Services;

namespace CoreApp;

/* Inherit your application services from this class.
 */
public abstract class CoreAppAppService : ApplicationService
{
    protected CoreAppAppService()
    {
        LocalizationResource = typeof(CoreAppResource);
    }
}
