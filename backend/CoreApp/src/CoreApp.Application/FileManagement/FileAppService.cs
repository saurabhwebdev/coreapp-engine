using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.BlobStoring;
using Volo.Abp.Content;
using Volo.Abp.Domain.Repositories;
using CoreApp.Permissions;
using Volo.Abp.Features;
using CoreApp.Features;

namespace CoreApp.FileManagement;

[RequiresFeature(CoreAppFeatures.FileManagementModule)]
[Authorize(CoreAppPermissions.FileManagement.Default)]
public class FileAppService : ApplicationService, IFileAppService
{
    private readonly IRepository<FileDescriptor, Guid> _fileRepository;
    private readonly IBlobContainer _blobContainer;

    public FileAppService(
        IRepository<FileDescriptor, Guid> fileRepository,
        IBlobContainer blobContainer)
    {
        _fileRepository = fileRepository;
        _blobContainer = blobContainer;
    }

    public async Task<PagedResultDto<FileDescriptorDto>> GetListAsync(GetFileListDto input)
    {
        var queryable = await _fileRepository.GetQueryableAsync();

        queryable = queryable.Where(x => x.ParentId == input.ParentId);

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            queryable = queryable.Where(x => x.Name.Contains(input.Filter));
        }

        // Directories first, then by name
        queryable = queryable.OrderByDescending(x => x.IsDirectory).ThenBy(x => x.Name);

        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        return new PagedResultDto<FileDescriptorDto>(
            totalCount,
            items.Select(MapToDto).ToList()
        );
    }

    public async Task<FileDescriptorDto> GetAsync(Guid id)
    {
        var file = await _fileRepository.GetAsync(id);
        return MapToDto(file);
    }

    public async Task<IRemoteStreamContent> DownloadAsync(Guid id)
    {
        var file = await _fileRepository.GetAsync(id);
        if (file.IsDirectory)
        {
            throw new AbpException("Cannot download a directory.");
        }

        var stream = await _blobContainer.GetAsync(file.BlobName);
        return new RemoteStreamContent(stream, file.Name, file.MimeType);
    }

    [Authorize(CoreAppPermissions.FileManagement.Create)]
    public async Task<FileDescriptorDto> UploadAsync(string name, IRemoteStreamContent file, Guid? parentId = null)
    {
        if (parentId.HasValue)
        {
            var parent = await _fileRepository.GetAsync(parentId.Value);
            if (!parent.IsDirectory)
            {
                throw new AbpException("Parent must be a directory.");
            }
        }

        var blobName = $"{GuidGenerator.Create():N}_{name}";

        await _blobContainer.SaveAsync(blobName, file.GetStream());

        var fileDescriptor = new FileDescriptor(
            GuidGenerator.Create(),
            name,
            file.ContentType ?? "application/octet-stream",
            file.GetStream().Length,
            blobName,
            isDirectory: false,
            parentId: parentId,
            tenantId: CurrentTenant.Id
        );

        await _fileRepository.InsertAsync(fileDescriptor);
        return MapToDto(fileDescriptor);
    }

    [Authorize(CoreAppPermissions.FileManagement.Create)]
    public async Task<FileDescriptorDto> CreateDirectoryAsync(CreateDirectoryDto input)
    {
        if (input.ParentId.HasValue)
        {
            var parent = await _fileRepository.GetAsync(input.ParentId.Value);
            if (!parent.IsDirectory)
            {
                throw new AbpException("Parent must be a directory.");
            }
        }

        var directory = new FileDescriptor(
            GuidGenerator.Create(),
            input.Name,
            "directory",
            0,
            string.Empty,
            isDirectory: true,
            parentId: input.ParentId,
            tenantId: CurrentTenant.Id
        );

        await _fileRepository.InsertAsync(directory);
        return MapToDto(directory);
    }

    [Authorize(CoreAppPermissions.FileManagement.Delete)]
    public async Task DeleteAsync(Guid id)
    {
        var file = await _fileRepository.GetAsync(id);

        if (file.IsDirectory)
        {
            // Delete all children recursively
            var children = await AsyncExecuter.ToListAsync(
                (await _fileRepository.GetQueryableAsync()).Where(x => x.ParentId == id)
            );
            foreach (var child in children)
            {
                await DeleteAsync(child.Id);
            }
        }
        else if (!string.IsNullOrEmpty(file.BlobName))
        {
            await _blobContainer.DeleteAsync(file.BlobName);
        }

        await _fileRepository.DeleteAsync(id);
    }

    public async Task<FileDescriptorDto> MoveAsync(Guid id, Guid? newParentId)
    {
        var file = await _fileRepository.GetAsync(id);

        if (newParentId.HasValue)
        {
            var parent = await _fileRepository.GetAsync(newParentId.Value);
            if (!parent.IsDirectory)
            {
                throw new AbpException("Target must be a directory.");
            }
        }

        file.ParentId = newParentId;
        await _fileRepository.UpdateAsync(file);
        return MapToDto(file);
    }

    private static FileDescriptorDto MapToDto(FileDescriptor file)
    {
        return new FileDescriptorDto
        {
            Id = file.Id,
            Name = file.Name,
            MimeType = file.MimeType,
            Size = file.Size,
            ParentId = file.ParentId,
            IsDirectory = file.IsDirectory,
            CreationTime = file.CreationTime,
            CreatorId = file.CreatorId,
            LastModificationTime = file.LastModificationTime,
            LastModifierId = file.LastModifierId
        };
    }
}
