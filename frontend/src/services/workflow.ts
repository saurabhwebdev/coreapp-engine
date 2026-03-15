import api from './api';
import type { PagedResult } from './identity';

export interface WorkflowDefinitionDto {
  id: string;
  name: string;
  description?: string;
  status: number; // 0=Draft, 1=Active, 2=Inactive, 3=Archived
  triggerType?: string;
  nodesJson: string;
  edgesJson: string;
  version: number;
  creationTime: string;
  lastModificationTime?: string;
}

export interface CreateUpdateWorkflowDto {
  name: string;
  description?: string;
  triggerType?: string;
  nodesJson: string;
  edgesJson: string;
}

export const getWorkflows = (params?: { skipCount?: number; maxResultCount?: number; filter?: string; status?: number }) =>
  api.get<PagedResult<WorkflowDefinitionDto>>('/api/app/workflow', { params });

export const getWorkflow = (id: string) =>
  api.get<WorkflowDefinitionDto>(`/api/app/workflow/${id}`);

export const createWorkflow = (data: CreateUpdateWorkflowDto) =>
  api.post<WorkflowDefinitionDto>('/api/app/workflow', data);

export const updateWorkflow = (id: string, data: CreateUpdateWorkflowDto) =>
  api.put<WorkflowDefinitionDto>(`/api/app/workflow/${id}`, data);

export const deleteWorkflow = (id: string) =>
  api.delete(`/api/app/workflow/${id}`);

export const activateWorkflow = (id: string) =>
  api.post<WorkflowDefinitionDto>(`/api/app/workflow/${id}/activate`);

export const deactivateWorkflow = (id: string) =>
  api.post<WorkflowDefinitionDto>(`/api/app/workflow/${id}/deactivate`);

export const duplicateWorkflow = (id: string) =>
  api.post<WorkflowDefinitionDto>(`/api/app/workflow/${id}/duplicate`);
