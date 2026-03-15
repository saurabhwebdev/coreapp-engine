import api from './api';

export interface IdentityUserDto {
  id: string;
  userName: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  creationTime: string;
  roleNames?: string[];
}

export interface CreateUpdateUserDto {
  userName: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  password?: string;
  roleNames?: string[];
}

export interface IdentityRoleDto {
  id: string;
  name: string;
  isDefault: boolean;
  isStatic: boolean;
  isPublic: boolean;
  concurrencyStamp?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

// Users
export const getUsers = (params?: { skipCount?: number; maxResultCount?: number; filter?: string }) =>
  api.get<PagedResult<IdentityUserDto>>('/api/identity/users', { params });

export const getUser = (id: string) =>
  api.get<IdentityUserDto>(`/api/identity/users/${id}`);

export const createUser = (data: CreateUpdateUserDto) =>
  api.post<IdentityUserDto>('/api/identity/users', data);

export const updateUser = (id: string, data: CreateUpdateUserDto) =>
  api.put<IdentityUserDto>(`/api/identity/users/${id}`, data);

export const deleteUser = (id: string) =>
  api.delete(`/api/identity/users/${id}`);

export const getUserRoles = (id: string) =>
  api.get<{ items: IdentityRoleDto[] }>(`/api/identity/users/${id}/roles`);

export const getAssignableRoles = () =>
  api.get<{ items: IdentityRoleDto[] }>('/api/identity/users/assignable-roles');

// Roles
export const getRoles = (params?: { skipCount?: number; maxResultCount?: number; filter?: string }) =>
  api.get<PagedResult<IdentityRoleDto>>('/api/identity/roles', { params });

export const getRole = (id: string) =>
  api.get<IdentityRoleDto>(`/api/identity/roles/${id}`);

export const createRole = (data: { name: string; isDefault: boolean; isPublic: boolean }) =>
  api.post<IdentityRoleDto>('/api/identity/roles', data);

export const updateRole = (id: string, data: { name: string; isDefault: boolean; isPublic: boolean; concurrencyStamp?: string }) =>
  api.put<IdentityRoleDto>(`/api/identity/roles/${id}`, data);

export const deleteRole = (id: string) =>
  api.delete(`/api/identity/roles/${id}`);

// Permissions
export interface PermissionGrantInfo {
  name: string;
  displayName: string;
  parentName?: string;
  isGranted: boolean;
  allowedProviders: string[];
}

export interface PermissionGroup {
  name: string;
  displayName: string;
  permissions: PermissionGrantInfo[];
}

export const getPermissions = (providerName: string, providerKey: string) =>
  api.get<{ groups: PermissionGroup[] }>('/api/permission-management/permissions', {
    params: { providerName, providerKey },
  });

export const updatePermissions = (providerName: string, providerKey: string, permissions: { permissions: { name: string; isGranted: boolean }[] }) =>
  api.put('/api/permission-management/permissions', permissions, {
    params: { providerName, providerKey },
  });
