import api from './api';
import type { PagedResult } from './identity';

export interface FormDefinitionDto {
  id: string;
  name: string;
  description?: string;
  fieldsJson: string;
  isPublished: boolean;
  submissionCount: number;
  creationTime: string;
  lastModificationTime?: string;
}

export interface FormSubmissionDto {
  id: string;
  formId: string;
  dataJson: string;
  creationTime: string;
  creatorId?: string;
}

export const getForms = (params?: { skipCount?: number; maxResultCount?: number; filter?: string }) =>
  api.get<PagedResult<FormDefinitionDto>>('/api/app/form', { params });

export const getForm = (id: string) =>
  api.get<FormDefinitionDto>(`/api/app/form/${id}`);

export const createForm = (data: { name: string; description?: string; fieldsJson: string }) =>
  api.post<FormDefinitionDto>('/api/app/form', data);

export const updateForm = (id: string, data: { name: string; description?: string; fieldsJson: string }) =>
  api.put<FormDefinitionDto>(`/api/app/form/${id}`, data);

export const deleteForm = (id: string) =>
  api.delete(`/api/app/form/${id}`);

export const publishForm = (id: string) =>
  api.post<FormDefinitionDto>(`/api/app/form/${id}/publish`);

export const unpublishForm = (id: string) =>
  api.post<FormDefinitionDto>(`/api/app/form/${id}/unpublish`);

export const getSubmissions = (formId: string, params?: { skipCount?: number; maxResultCount?: number }) =>
  api.get<PagedResult<FormSubmissionDto>>(`/api/app/form/${formId}/submissions`, { params });

export const submitForm = (formId: string, dataJson: string) =>
  api.post<FormSubmissionDto>('/api/app/form/submit', { formId, dataJson });
