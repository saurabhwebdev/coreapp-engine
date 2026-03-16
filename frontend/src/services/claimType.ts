import api from './api';

export interface ClaimTypeDto {
  id: string;
  name: string;
  required: boolean;
  isStatic: boolean;
  regex?: string;
  description?: string;
  valueType: string;
}

export const getClaimTypes = (params?: { skipCount?: number; maxResultCount?: number }) =>
  api.get<{ items: ClaimTypeDto[]; totalCount: number }>('/api/app/claim-type', { params });

export const createClaimType = (data: { name: string; required: boolean; regex?: string; description?: string; valueType?: string }) =>
  api.post<ClaimTypeDto>('/api/app/claim-type', data);

export const updateClaimType = (id: string, data: { name: string; required: boolean; regex?: string; description?: string }) =>
  api.put<ClaimTypeDto>(`/api/app/claim-type/${id}`, data);

export const deleteClaimType = (id: string) =>
  api.delete(`/api/app/claim-type/${id}`);
