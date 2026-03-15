using CoreApp.Localization;
using Volo.Abp.Features;
using Volo.Abp.Localization;
using Volo.Abp.Validation.StringValues;

namespace CoreApp.Features;

public class CoreAppFeatureDefinitionProvider : FeatureDefinitionProvider
{
    public override void Define(IFeatureDefinitionContext context)
    {
        var group = context.AddGroup(CoreAppFeatures.GroupName, L("Feature:CoreApp"));

        group.AddFeature(
            CoreAppFeatures.NotificationModule,
            defaultValue: "true",
            displayName: L("Feature:NotificationModule"),
            description: L("Feature:NotificationModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.FileManagementModule,
            defaultValue: "true",
            displayName: L("Feature:FileManagementModule"),
            description: L("Feature:FileManagementModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.AuditLogModule,
            defaultValue: "true",
            displayName: L("Feature:AuditLogModule"),
            description: L("Feature:AuditLogModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.DashboardModule,
            defaultValue: "true",
            displayName: L("Feature:DashboardModule"),
            description: L("Feature:DashboardModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.WorkflowModule,
            defaultValue: "false",
            displayName: L("Feature:WorkflowModule"),
            description: L("Feature:WorkflowModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.ChatModule,
            defaultValue: "false",
            displayName: L("Feature:ChatModule"),
            description: L("Feature:ChatModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.FormsModule,
            defaultValue: "false",
            displayName: L("Feature:FormsModule"),
            description: L("Feature:FormsModule.Description"),
            valueType: new ToggleStringValueType()
        );

        group.AddFeature(
            CoreAppFeatures.ReportsModule,
            defaultValue: "false",
            displayName: L("Feature:ReportsModule"),
            description: L("Feature:ReportsModule.Description"),
            valueType: new ToggleStringValueType()
        );
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<CoreAppResource>(name);
    }
}
