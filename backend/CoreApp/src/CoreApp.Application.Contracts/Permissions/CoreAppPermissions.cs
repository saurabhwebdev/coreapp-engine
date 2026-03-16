namespace CoreApp.Permissions;

public static class CoreAppPermissions
{
    public const string GroupName = "CoreApp";

    public static class Notifications
    {
        public const string Default = GroupName + ".Notifications";
        public const string Send = Default + ".Send";
    }

    public static class FileManagement
    {
        public const string Default = GroupName + ".FileManagement";
        public const string Create = Default + ".Create";
        public const string Delete = Default + ".Delete";
    }

    public static class Dashboard
    {
        public const string Default = GroupName + ".Dashboard";
    }

    public static class AuditLog
    {
        public const string Default = GroupName + ".AuditLog";
    }

    public static class Workflows
    {
        public const string Default = GroupName + ".Workflows";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class OrganizationUnits
    {
        public const string Default = GroupName + ".OrganizationUnits";
        public const string ManageOU = Default + ".ManageOU";
        public const string ManageMembers = Default + ".ManageMembers";
        public const string ManageRoles = Default + ".ManageRoles";
    }

    public static class ClaimTypes
    {
        public const string Default = GroupName + ".ClaimTypes";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
}
