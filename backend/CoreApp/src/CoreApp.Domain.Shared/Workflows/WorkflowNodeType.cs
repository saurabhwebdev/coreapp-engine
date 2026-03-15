namespace CoreApp.Workflows;

public enum WorkflowNodeType
{
    Trigger = 0,
    Condition = 1,
    Action = 2,
    Notification = 3,
    Approval = 4,
    Delay = 5,
    HttpRequest = 6,
    SetVariable = 7,
    End = 8
}
