using CoreApp.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Permissions;

public class CoreAppPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var coreAppGroup = context.AddGroup(CoreAppPermissions.GroupName);

        var notificationsPermission = coreAppGroup.AddPermission(CoreAppPermissions.Notifications.Default, L("Permission:Notifications"));
        notificationsPermission.AddChild(CoreAppPermissions.Notifications.Send, L("Permission:Notifications.Send"));

        var fileManagementPermission = coreAppGroup.AddPermission(CoreAppPermissions.FileManagement.Default, L("Permission:FileManagement"));
        fileManagementPermission.AddChild(CoreAppPermissions.FileManagement.Create, L("Permission:FileManagement.Create"));
        fileManagementPermission.AddChild(CoreAppPermissions.FileManagement.Delete, L("Permission:FileManagement.Delete"));

        coreAppGroup.AddPermission(CoreAppPermissions.Dashboard.Default, L("Permission:Dashboard"));
        coreAppGroup.AddPermission(CoreAppPermissions.AuditLog.Default, L("Permission:AuditLog"), multiTenancySide: MultiTenancySides.Host);

        var workflowPermission = coreAppGroup.AddPermission(CoreAppPermissions.Workflows.Default, L("Permission:Workflows"));
        workflowPermission.AddChild(CoreAppPermissions.Workflows.Create, L("Permission:Workflows.Create"));
        workflowPermission.AddChild(CoreAppPermissions.Workflows.Edit, L("Permission:Workflows.Edit"));
        workflowPermission.AddChild(CoreAppPermissions.Workflows.Delete, L("Permission:Workflows.Delete"));

        var ouPermission = coreAppGroup.AddPermission(CoreAppPermissions.OrganizationUnits.Default, L("Permission:OrganizationUnits"));
        ouPermission.AddChild(CoreAppPermissions.OrganizationUnits.ManageOU, L("Permission:OrganizationUnits.ManageOU"));
        ouPermission.AddChild(CoreAppPermissions.OrganizationUnits.ManageMembers, L("Permission:OrganizationUnits.ManageMembers"));
        ouPermission.AddChild(CoreAppPermissions.OrganizationUnits.ManageRoles, L("Permission:OrganizationUnits.ManageRoles"));

        var claimTypePermission = coreAppGroup.AddPermission(CoreAppPermissions.ClaimTypes.Default, L("Permission:ClaimTypes"));
        claimTypePermission.AddChild(CoreAppPermissions.ClaimTypes.Create, L("Permission:ClaimTypes.Create"));
        claimTypePermission.AddChild(CoreAppPermissions.ClaimTypes.Edit, L("Permission:ClaimTypes.Edit"));
        claimTypePermission.AddChild(CoreAppPermissions.ClaimTypes.Delete, L("Permission:ClaimTypes.Delete"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<CoreAppResource>(name);
    }
}
