using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Content;

namespace CoreApp.FileManagement;

[RemoteService(Name = "CoreApp")]
[Area("app")]
[Route("api/app/files")]
public class FileController : AbpControllerBase
{
    private readonly IFileAppService _fileAppService;

    public FileController(IFileAppService fileAppService)
    {
        _fileAppService = fileAppService;
    }

    [HttpGet]
    public Task<PagedResultDto<FileDescriptorDto>> GetListAsync([FromQuery] GetFileListDto input)
    {
        return _fileAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public Task<FileDescriptorDto> GetAsync(Guid id)
    {
        return _fileAppService.GetAsync(id);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadAsync(Guid id)
    {
        var content = await _fileAppService.DownloadAsync(id);
        return File(content.GetStream(), content.ContentType ?? "application/octet-stream", content.FileName);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<FileDescriptorDto> UploadAsync(IFormFile file, [FromQuery] Guid? parentId = null)
    {
        if (file == null || file.Length == 0)
        {
            throw new AbpException("File is required.");
        }

        var remoteStreamContent = new RemoteStreamContent(file.OpenReadStream(), file.FileName, file.ContentType);
        return await _fileAppService.UploadAsync(file.FileName, remoteStreamContent, parentId);
    }

    [HttpPost("directory")]
    public Task<FileDescriptorDto> CreateDirectoryAsync(CreateDirectoryDto input)
    {
        return _fileAppService.CreateDirectoryAsync(input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(Guid id)
    {
        return _fileAppService.DeleteAsync(id);
    }

    [HttpPut("{id}/move")]
    public Task<FileDescriptorDto> MoveAsync(Guid id, [FromQuery] Guid? newParentId)
    {
        return _fileAppService.MoveAsync(id, newParentId);
    }
}
