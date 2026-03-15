using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Features;
using CoreApp.Features;

namespace CoreApp.Forms;

[Authorize]
[RequiresFeature(CoreAppFeatures.FormsModule)]
public class FormAppService : ApplicationService, IFormAppService
{
    private readonly IRepository<FormDefinition, Guid> _formRepository;
    private readonly IRepository<FormSubmission, Guid> _submissionRepository;

    public FormAppService(
        IRepository<FormDefinition, Guid> formRepository,
        IRepository<FormSubmission, Guid> submissionRepository)
    {
        _formRepository = formRepository;
        _submissionRepository = submissionRepository;
    }

    public async Task<PagedResultDto<FormDefinitionDto>> GetListAsync(GetFormListDto input)
    {
        var queryable = await _formRepository.GetQueryableAsync();

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            queryable = queryable.Where(f => f.Name.Contains(input.Filter) ||
                                             (f.Description != null && f.Description.Contains(input.Filter)));
        }

        queryable = string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderByDescending(f => f.CreationTime)
            : queryable.OrderBy(input.Sorting);

        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<FormDefinitionDto>(
            totalCount,
            items.Select(MapToDto).ToList()
        );
    }

    public async Task<FormDefinitionDto> GetAsync(Guid id)
    {
        var form = await _formRepository.GetAsync(id);
        return MapToDto(form);
    }

    public async Task<FormDefinitionDto> CreateAsync(CreateUpdateFormDto input)
    {
        var form = new FormDefinition(
            GuidGenerator.Create(),
            input.Name,
            input.Description,
            CurrentTenant.Id
        )
        {
            FieldsJson = input.FieldsJson
        };

        await _formRepository.InsertAsync(form);
        return MapToDto(form);
    }

    public async Task<FormDefinitionDto> UpdateAsync(Guid id, CreateUpdateFormDto input)
    {
        var form = await _formRepository.GetAsync(id);
        form.Name = input.Name;
        form.Description = input.Description;
        form.FieldsJson = input.FieldsJson;
        await _formRepository.UpdateAsync(form);
        return MapToDto(form);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _formRepository.DeleteAsync(id);
    }

    public async Task PublishAsync(Guid id)
    {
        var form = await _formRepository.GetAsync(id);
        form.IsPublished = true;
        await _formRepository.UpdateAsync(form);
    }

    public async Task UnpublishAsync(Guid id)
    {
        var form = await _formRepository.GetAsync(id);
        form.IsPublished = false;
        await _formRepository.UpdateAsync(form);
    }

    public async Task<PagedResultDto<FormSubmissionDto>> GetSubmissionsAsync(Guid formId, PagedResultRequestDto input)
    {
        var queryable = await _submissionRepository.GetQueryableAsync();
        var query = queryable.Where(s => s.FormId == formId)
                             .OrderByDescending(s => s.CreationTime);

        var totalCount = await AsyncExecuter.CountAsync(query);
        var items = await AsyncExecuter.ToListAsync(
            query.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<FormSubmissionDto>(
            totalCount,
            items.Select(s => new FormSubmissionDto
            {
                Id = s.Id,
                FormId = s.FormId,
                DataJson = s.DataJson,
                CreationTime = s.CreationTime,
                CreatorId = s.CreatorId
            }).ToList()
        );
    }

    public async Task<FormSubmissionDto> SubmitAsync(CreateFormSubmissionDto input)
    {
        var form = await _formRepository.GetAsync(input.FormId);

        if (!form.IsPublished)
        {
            throw new BusinessException("CoreApp:FormNotPublished")
                .WithData("FormId", input.FormId);
        }

        var submission = new FormSubmission(
            GuidGenerator.Create(),
            input.FormId,
            input.DataJson,
            CurrentTenant.Id
        );

        await _submissionRepository.InsertAsync(submission);

        form.SubmissionCount++;
        await _formRepository.UpdateAsync(form);

        return new FormSubmissionDto
        {
            Id = submission.Id,
            FormId = submission.FormId,
            DataJson = submission.DataJson,
            CreationTime = submission.CreationTime,
            CreatorId = submission.CreatorId
        };
    }

    private static FormDefinitionDto MapToDto(FormDefinition form)
    {
        return new FormDefinitionDto
        {
            Id = form.Id,
            Name = form.Name,
            Description = form.Description,
            FieldsJson = form.FieldsJson,
            IsPublished = form.IsPublished,
            SubmissionCount = form.SubmissionCount,
            CreationTime = form.CreationTime,
            CreatorId = form.CreatorId,
            LastModificationTime = form.LastModificationTime,
            LastModifierId = form.LastModifierId
        };
    }
}
