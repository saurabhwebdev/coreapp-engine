using System;
using Volo.Abp.Application.Dtos;

namespace CoreApp.Forms;

public class FormSubmissionDto : CreationAuditedEntityDto<Guid>
{
    public Guid FormId { get; set; }
    public string DataJson { get; set; } = "{}";
}
