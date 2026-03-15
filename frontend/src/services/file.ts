import api from './api';
import type { PagedResult } from './identity';

export interface FileDescriptorDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  parentId?: string;
  isDirectory: boolean;
  creationTime: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export const getFiles = (params?: { skipCount?: number; maxResultCount?: number; parentId?: string; filter?: string }) =>
  api.get<PagedResult<FileDescriptorDto>>('/api/app/files', { params });

export const getFile = (id: string) =>
  api.get<FileDescriptorDto>(`/api/app/files/${id}`);

export const uploadFile = (file: File, parentId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<FileDescriptorDto>('/api/app/files/upload', formData, {
    params: parentId ? { parentId } : undefined,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createDirectory = (name: string, parentId?: string) =>
  api.post<FileDescriptorDto>('/api/app/files/directory', { name, parentId });

export const deleteFile = (id: string) =>
  api.delete(`/api/app/files/${id}`);

export const moveFile = (id: string, newParentId?: string) =>
  api.put<FileDescriptorDto>(`/api/app/files/${id}/move`, null, {
    params: newParentId ? { newParentId } : undefined,
  });

export const downloadFile = (id: string) =>
  api.get(`/api/app/files/${id}/download`, { responseType: 'blob' });
