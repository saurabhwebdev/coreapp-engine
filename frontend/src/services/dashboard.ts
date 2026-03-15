import api from './api';

export interface DashboardStatsDto {
  userCount: number;
  tenantCount: number;
  roleCount: number;
  unreadNotificationCount: number;
  totalFileCount: number;
  totalFileSize: number;
  recentAuditLogs: RecentAuditLogDto[];
}

export interface RecentAuditLogDto {
  id: string;
  userName?: string;
  httpMethod?: string;
  url?: string;
  httpStatusCode?: number;
  executionTime: string;
  executionDuration: number;
}

export const getDashboardStats = () =>
  api.get<DashboardStatsDto>('/api/app/dashboard/stats');
