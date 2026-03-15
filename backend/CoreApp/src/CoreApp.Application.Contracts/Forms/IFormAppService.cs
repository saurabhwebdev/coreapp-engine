using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace CoreApp.Forms;

public interface IFormAppService : IApplicationService
{
    Task<PagedResultDto<FormDefinitionDto>> GetListAsync(GetFormListDto input);
    Task<FormDefinitionDto> GetAsync(Guid id);
    Task<FormDefinitionDto> CreateAsync(CreateUpdateFormDto input);
    Task<FormDefinitionDto> UpdateAsync(Guid id, CreateUpdateFormDto input);
    Task DeleteAsync(Guid id);
    Task PublishAsync(Guid id);
    Task UnpublishAsync(Guid id);
    Task<PagedResultDto<FormSubmissionDto>> GetSubmissionsAsync(Guid formId, PagedResultRequestDto input);
    Task<FormSubmissionDto> SubmitAsync(CreateFormSubmissionDto input);
}
