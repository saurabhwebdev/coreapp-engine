import api from './api';
import type { PagedResult } from './identity';

export interface TenantDto {
  id: string;
  name: string;
  concurrencyStamp?: string;
}

export interface CreateUpdateTenantDto {
  name: string;
  adminEmailAddress?: string;
  adminPassword?: string;
}

export const getTenants = (params?: { skipCount?: number; maxResultCount?: number; filter?: string }) =>
  api.get<PagedResult<TenantDto>>('/api/multi-tenancy/tenants', { params });

export const getTenant = (id: string) =>
  api.get<TenantDto>(`/api/multi-tenancy/tenants/${id}`);

export const createTenant = (data: CreateUpdateTenantDto) =>
  api.post<TenantDto>('/api/multi-tenancy/tenants', data);

export const updateTenant = (id: string, data: { name: string; concurrencyStamp?: string }) =>
  api.put<TenantDto>(`/api/multi-tenancy/tenants/${id}`, data);

export const deleteTenant = (id: string) =>
  api.delete(`/api/multi-tenancy/tenants/${id}`);
