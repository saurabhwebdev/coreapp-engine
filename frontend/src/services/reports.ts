import api from './api';
import type { PagedResult } from './identity';

export interface ReportDefinitionDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  configJson: string;
  lastRunResult?: string;
  lastRunTime?: string;
  creationTime: string;
  lastModificationTime?: string;
}

export interface RunReportResultDto {
  reportId: string;
  name: string;
  generatedAt: string;
  resultJson: string;
  rowCount: number;
}

export const getReports = (params?: { skipCount?: number; maxResultCount?: number; filter?: string; category?: string }) =>
  api.get<PagedResult<ReportDefinitionDto>>('/api/app/report', { params });

export const getReport = (id: string) =>
  api.get<ReportDefinitionDto>(`/api/app/report/${id}`);

export const createReport = (data: { name: string; description?: string; category?: string; configJson: string }) =>
  api.post<ReportDefinitionDto>('/api/app/report', data);

export const updateReport = (id: string, data: { name: string; description?: string; category?: string; configJson: string }) =>
  api.put<ReportDefinitionDto>(`/api/app/report/${id}`, data);

export const deleteReport = (id: string) =>
  api.delete(`/api/app/report/${id}`);

export const runReport = (id: string) =>
  api.post<RunReportResultDto>(`/api/app/report/${id}/run`);
