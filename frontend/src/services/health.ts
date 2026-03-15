import api from './api';

export interface HealthEntry {
  data: Record<string, unknown>;
  description: string;
  duration: string;
  status: string;
  tags: string[];
}

export interface HealthReport {
  status: string;
  totalDuration: string;
  entries: Record<string, HealthEntry>;
}

export const getHealthStatus = () =>
  api.get<HealthReport>('/health-status');
