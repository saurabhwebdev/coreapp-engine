import api from './api';
import type { PagedResult } from './identity';

export interface AuditLogDto {
  id: string;
  applicationName?: string;
  userId?: string;
  userName?: string;
  tenantId?: string;
  tenantName?: string;
  httpMethod?: string;
  url?: string;
  httpStatusCode?: number;
  browserInfo?: string;
  clientIpAddress?: string;
  executionTime: string;
  executionDuration: number;
  exceptions?: string;
  actions: AuditLogActionDto[];
  entityChanges: EntityChangeDto[];
}

export interface AuditLogActionDto {
  serviceName?: string;
  methodName?: string;
  parameters?: string;
  executionTime: string;
  executionDuration: number;
}

export interface EntityChangeDto {
  entityId?: string;
  entityTypeFullName?: string;
  changeType: string;
  changeTime: string;
}

export const getAuditLogs = (params?: {
  skipCount?: number;
  maxResultCount?: number;
  startTime?: string;
  endTime?: string;
  httpMethod?: string;
  url?: string;
  userName?: string;
  hasException?: boolean;
  sorting?: string;
}) => api.get<PagedResult<AuditLogDto>>('/api/app/audit-log', { params });

export const getAuditLog = (id: string) =>
  api.get<AuditLogDto>(`/api/app/audit-log/${id}`);
