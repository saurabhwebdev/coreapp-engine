using Volo.Abp.Settings;

namespace CoreApp.Settings;

public class CoreAppSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(CoreAppSettings.MySetting1));
    }
}
