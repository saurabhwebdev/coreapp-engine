import api from './api';

export interface SecurityLogDto {
  id: string;
  applicationName?: string;
  identity?: string;
  action?: string;
  userId?: string;
  userName?: string;
  tenantName?: string;
  clientIpAddress?: string;
  browserInfo?: string;
  creationTime: string;
}

export interface GetSecurityLogListDto {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  startTime?: string;
  endTime?: string;
  userName?: string;
  action?: string;
  identity?: string;
}

export const getSecurityLogs = (params?: GetSecurityLogListDto) =>
  api.get<{ items: SecurityLogDto[]; totalCount: number }>('/api/app/security-log', { params });
