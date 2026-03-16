import axios from 'axios';
import { User } from 'oidc-client-ts';
import { env } from '../utils/env';

export interface FeatureDto {
  name: string;
  displayName: string;
  value: string;
  provider: { name: string; key: string } | null;
  description: string;
  valueType: { name: string; properties: Record<string, unknown>; validator: unknown } | null;
  depth: number;
  parentName: string | null;
}

export interface FeatureGroupDto {
  name: string;
  displayName: string;
  features: FeatureDto[];
}

// Feature management MUST always run in host context (no __tenant header)
// because ABP's FeatureManagement permissions are host-only.
// We use a separate axios instance that never sends __tenant.
const hostApi = axios.create({ baseURL: env.apiBaseUrl });

hostApi.interceptors.request.use((config) => {
  const storageKey = `oidc.user:${env.authAuthority}:${env.authClientId}`;
  const userData = localStorage.getItem(storageKey);
  if (userData) {
    const user = User.fromStorageString(userData);
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }
  // Intentionally NO __tenant header
  return config;
});

export const getFeatures = (providerName: string, providerKey: string) =>
  hostApi.get<{ groups: FeatureGroupDto[] }>('/api/feature-management/features', {
    params: { providerName, providerKey },
  });

export const updateFeatures = (providerName: string, providerKey: string, features: { name: string; value: string }[]) =>
  hostApi.put('/api/feature-management/features', { features }, {
    params: { providerName, providerKey },
  });

export const resetFeatures = (providerName: string, providerKey: string) =>
  hostApi.delete('/api/feature-management/features', {
    params: { providerName, providerKey },
  });
