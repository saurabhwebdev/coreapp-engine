using CoreApp.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace CoreApp.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class CoreAppController : AbpControllerBase
{
    protected CoreAppController()
    {
        LocalizationResource = typeof(CoreAppResource);
    }
}
