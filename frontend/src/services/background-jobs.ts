import api from './api';
import type { PagedResult } from './identity';

export interface BackgroundJobDto {
  id: string;
  jobName: string;
  jobArgs: string;
  tryCount: number;
  creationTime: string;
  lastTryTime?: string;
  nextTryTime: string;
  isAbandoned: boolean;
  priority: number;
}

export const getBackgroundJobs = (params?: { skipCount?: number; maxResultCount?: number }) =>
  api.get<PagedResult<BackgroundJobDto>>('/api/app/background-job', { params });
