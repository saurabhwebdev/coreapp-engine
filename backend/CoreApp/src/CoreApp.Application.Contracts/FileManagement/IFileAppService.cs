using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;

namespace CoreApp.FileManagement;

public interface IFileAppService : IApplicationService
{
    Task<PagedResultDto<FileDescriptorDto>> GetListAsync(GetFileListDto input);
    Task<FileDescriptorDto> GetAsync(Guid id);
    Task<IRemoteStreamContent> DownloadAsync(Guid id);
    Task<FileDescriptorDto> UploadAsync(string name, IRemoteStreamContent file, Guid? parentId = null);
    Task<FileDescriptorDto> CreateDirectoryAsync(CreateDirectoryDto input);
    Task DeleteAsync(Guid id);
    Task<FileDescriptorDto> MoveAsync(Guid id, Guid? newParentId);
}
