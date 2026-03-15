using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.BackgroundJobs;

public class BackgroundJobDto : EntityDto<Guid>
{
    public string JobName { get; set; } = null!;
    public string JobArgs { get; set; } = null!;
    public int TryCount { get; set; }
    public DateTime CreationTime { get; set; }
    public DateTime? LastTryTime { get; set; }
    public DateTime NextTryTime { get; set; }
    public bool IsAbandoned { get; set; }
    public byte Priority { get; set; }
}
