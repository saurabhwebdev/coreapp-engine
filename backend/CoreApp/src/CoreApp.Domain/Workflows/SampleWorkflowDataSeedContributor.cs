using System;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace CoreApp.Workflows;

public class SampleWorkflowDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<WorkflowDefinition, Guid> _repository;
    private readonly IGuidGenerator _guidGenerator;

    public SampleWorkflowDataSeedContributor(
        IRepository<WorkflowDefinition, Guid> repository,
        IGuidGenerator guidGenerator)
    {
        _repository = repository;
        _guidGenerator = guidGenerator;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        // Only seed if no workflows exist
        if (await _repository.GetCountAsync() > 0)
            return;

        var workflow = new WorkflowDefinition(
            _guidGenerator.Create(),
            "New User Welcome Flow",
            "Automatically sends a welcome notification when a new user is created. This is a sample workflow to help you get started."
        )
        {
            Status = WorkflowStatus.Draft,
            TriggerType = "entity.created",
            Version = 1,
            NodesJson = """
            [
                {"id":"trigger-1","type":"trigger","position":{"x":80,"y":120},"data":{"label":"Trigger","triggerEvent":"entity.created"}},
                {"id":"delay-1","type":"delay","position":{"x":360,"y":120},"data":{"label":"Delay","duration":"5","unit":"minutes"}},
                {"id":"notification-1","type":"notification","position":{"x":640,"y":60},"data":{"label":"Notification","channel":"inApp","template":"Welcome to the platform!","recipients":"newUser"}},
                {"id":"notification-2","type":"notification","position":{"x":640,"y":240},"data":{"label":"Notification","channel":"email","template":"Welcome email sent to new user","recipients":"admin"}},
                {"id":"end-1","type":"end","position":{"x":920,"y":150},"data":{"label":"End"}}
            ]
            """,
            EdgesJson = """
            [
                {"id":"e-trigger-delay","source":"trigger-1","target":"delay-1","type":"smoothstep"},
                {"id":"e-delay-notif1","source":"delay-1","target":"notification-1","type":"smoothstep"},
                {"id":"e-delay-notif2","source":"delay-1","target":"notification-2","type":"smoothstep"},
                {"id":"e-notif1-end","source":"notification-1","target":"end-1","type":"smoothstep"},
                {"id":"e-notif2-end","source":"notification-2","target":"end-1","type":"smoothstep"}
            ]
            """,
        };

        await _repository.InsertAsync(workflow);
    }
}
