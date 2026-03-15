using Microsoft.Extensions.Localization;
using CoreApp.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace CoreApp;

[Dependency(ReplaceServices = true)]
public class CoreAppBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<CoreAppResource> _localizer;

    public CoreAppBrandingProvider(IStringLocalizer<CoreAppResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
