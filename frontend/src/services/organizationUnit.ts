import api from './api';

export interface OrganizationUnitDto {
  id: string;
  parentId: string | null;
  code: string;
  displayName: string;
  memberCount: number;
  roleCount: number;
  creationTime: string;
}

export interface OrganizationUnitMemberDto {
  id: string;
  userName: string;
  email: string;
  name?: string;
  surname?: string;
}

export interface OrganizationUnitRoleDto {
  id: string;
  name: string;
}

export const getOrganizationUnits = () =>
  api.get<{ items: OrganizationUnitDto[] }>('/api/app/organization-unit');

export const getOrganizationUnit = (id: string) =>
  api.get<OrganizationUnitDto>(`/api/app/organization-unit/${id}`);

export const createOrganizationUnit = (data: { displayName: string; parentId?: string | null }) =>
  api.post<OrganizationUnitDto>('/api/app/organization-unit', data);

export const updateOrganizationUnit = (id: string, data: { displayName: string }) =>
  api.put<OrganizationUnitDto>(`/api/app/organization-unit/${id}`, data);

export const deleteOrganizationUnit = (id: string) =>
  api.delete(`/api/app/organization-unit/${id}`);

export const getMembers = (id: string, params?: { skipCount?: number; maxResultCount?: number }) =>
  api.get<{ items: OrganizationUnitMemberDto[]; totalCount: number }>(`/api/app/organization-unit/${id}/members`, { params });

export const addMember = (id: string, userId: string) =>
  api.post(`/api/app/organization-unit/${id}/member/${userId}`);

export const removeMember = (id: string, userId: string) =>
  api.delete(`/api/app/organization-unit/${id}/member/${userId}`);

export const getRoles = (id: string) =>
  api.get<{ items: OrganizationUnitRoleDto[] }>(`/api/app/organization-unit/${id}/roles`);

export const addRole = (id: string, roleId: string) =>
  api.post(`/api/app/organization-unit/${id}/role/${roleId}`);

export const removeRole = (id: string, roleId: string) =>
  api.delete(`/api/app/organization-unit/${id}/role/${roleId}`);
