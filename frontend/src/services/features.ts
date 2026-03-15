import api from './api';

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

export const getFeatures = (providerName: string, providerKey: string) =>
  api.get<{ groups: FeatureGroupDto[] }>('/api/feature-management/features', {
    params: { providerName, providerKey },
  });

export const updateFeatures = (providerName: string, providerKey: string, features: { name: string; value: string }[]) =>
  api.put('/api/feature-management/features', { features }, {
    params: { providerName, providerKey },
  });

export const resetFeatures = (providerName: string, providerKey: string) =>
  api.delete('/api/feature-management/features', {
    params: { providerName, providerKey },
  });
