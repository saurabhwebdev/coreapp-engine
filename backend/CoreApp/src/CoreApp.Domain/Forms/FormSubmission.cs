using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace CoreApp.Forms;

public class FormSubmission : CreationAuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid FormId { get; set; }
    public string DataJson { get; set; } = "{}";

    protected FormSubmission() { }

    public FormSubmission(Guid id, Guid formId, string dataJson, Guid? tenantId = null) : base(id)
    {
        FormId = formId;
        DataJson = dataJson;
        TenantId = tenantId;
    }
}
