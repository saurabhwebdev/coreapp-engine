using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Features;
using Volo.Abp.Identity;
using Volo.Abp.TenantManagement;
using CoreApp.Features;

namespace CoreApp.Reports;

[Authorize]
[RequiresFeature(CoreAppFeatures.ReportsModule)]
public class ReportAppService : ApplicationService, IReportAppService
{
    private readonly IRepository<ReportDefinition, Guid> _reportRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;
    private readonly ITenantRepository _tenantRepository;

    public ReportAppService(
        IRepository<ReportDefinition, Guid> reportRepository,
        IRepository<IdentityUser, Guid> userRepository,
        ITenantRepository tenantRepository)
    {
        _reportRepository = reportRepository;
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
    }

    public async Task<PagedResultDto<ReportDefinitionDto>> GetListAsync(GetReportListDto input)
    {
        var queryable = await _reportRepository.GetQueryableAsync();

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            queryable = queryable.Where(r => r.Name.Contains(input.Filter) ||
                                             (r.Description != null && r.Description.Contains(input.Filter)));
        }

        if (!string.IsNullOrWhiteSpace(input.Category))
        {
            queryable = queryable.Where(r => r.Category == input.Category);
        }

        queryable = string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderByDescending(r => r.CreationTime)
            : queryable.OrderBy(input.Sorting);

        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<ReportDefinitionDto>(
            totalCount,
            items.Select(MapToDto).ToList()
        );
    }

    public async Task<ReportDefinitionDto> GetAsync(Guid id)
    {
        var report = await _reportRepository.GetAsync(id);
        return MapToDto(report);
    }

    public async Task<ReportDefinitionDto> CreateAsync(CreateUpdateReportDto input)
    {
        var report = new ReportDefinition(
            GuidGenerator.Create(),
            input.Name,
            input.Description,
            CurrentTenant.Id
        )
        {
            Category = input.Category,
            ConfigJson = input.ConfigJson
        };

        await _reportRepository.InsertAsync(report);
        return MapToDto(report);
    }

    public async Task<ReportDefinitionDto> UpdateAsync(Guid id, CreateUpdateReportDto input)
    {
        var report = await _reportRepository.GetAsync(id);
        report.Name = input.Name;
        report.Description = input.Description;
        report.Category = input.Category;
        report.ConfigJson = input.ConfigJson;
        await _reportRepository.UpdateAsync(report);
        return MapToDto(report);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _reportRepository.DeleteAsync(id);
    }

    public async Task<RunReportResultDto> RunAsync(Guid id)
    {
        var report = await _reportRepository.GetAsync(id);

        // Generate mock report using system stats
        var userQueryable = await _userRepository.GetQueryableAsync();
        var userCount = await AsyncExecuter.CountAsync(userQueryable);

        var tenantCount = await _tenantRepository.GetCountAsync();

        var reportQueryable = await _reportRepository.GetQueryableAsync();
        var reportCount = await AsyncExecuter.CountAsync(reportQueryable);

        var resultData = new
        {
            generatedAt = Clock.Now,
            reportName = report.Name,
            stats = new
            {
                totalUsers = userCount,
                totalTenants = (int)tenantCount,
                totalReports = reportCount
            },
            rows = new[]
            {
                new { metric = "Total Users", value = userCount },
                new { metric = "Total Tenants", value = (int)tenantCount },
                new { metric = "Total Reports", value = reportCount }
            }
        };

        var resultJson = JsonSerializer.Serialize(resultData);

        report.LastRunResult = resultJson;
        report.LastRunTime = Clock.Now;
        await _reportRepository.UpdateAsync(report);

        return new RunReportResultDto
        {
            ReportId = report.Id,
            Name = report.Name,
            GeneratedAt = Clock.Now,
            ResultJson = resultJson,
            RowCount = 3
        };
    }

    private static ReportDefinitionDto MapToDto(ReportDefinition report)
    {
        return new ReportDefinitionDto
        {
            Id = report.Id,
            Name = report.Name,
            Description = report.Description,
            Category = report.Category,
            ConfigJson = report.ConfigJson,
            LastRunResult = report.LastRunResult,
            LastRunTime = report.LastRunTime,
            CreationTime = report.CreationTime,
            CreatorId = report.CreatorId,
            LastModificationTime = report.LastModificationTime,
            LastModifierId = report.LastModifierId
        };
    }
}
