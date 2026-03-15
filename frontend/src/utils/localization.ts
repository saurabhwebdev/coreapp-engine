import api from '../services/api';

export interface AppLanguage {
  cultureName: string;
  uiCultureName: string;
  displayName: string;
  flagIcon?: string;
}

let cachedLanguages: AppLanguage[] = [];
let cachedCurrentCulture: string | null = null;

export async function getLanguages(): Promise<AppLanguage[]> {
  if (cachedLanguages.length > 0) return cachedLanguages;
  try {
    const res = await api.get('/api/abp/application-configuration');
    const loc = res.data?.localization || {};
    cachedLanguages = loc.languages || [];
    cachedCurrentCulture = loc.currentCulture?.name || 'en';
    return cachedLanguages;
  } catch {
    return [];
  }
}

export function getCurrentCulture(): string {
  if (cachedCurrentCulture) return cachedCurrentCulture;
  // Read from cookie
  const match = document.cookie.match(/\.AspNetCore\.Culture=c%3D([^%|;]+)/);
  return match ? decodeURIComponent(match[1]) : 'en';
}

export function switchLanguage(cultureName: string) {
  // Set ABP's culture cookie (standard pattern)
  const value = `c=${cultureName}|uic=${cultureName}`;
  document.cookie = `.AspNetCore.Culture=${encodeURIComponent(value)};path=/;max-age=${365 * 24 * 60 * 60}`;
  // Also set Accept-Language header for future API calls
  localStorage.setItem('ce-language', cultureName);
  // Reload to apply
  window.location.reload();
}

export function getSavedLanguage(): string {
  return localStorage.getItem('ce-language') || getCurrentCulture();
}
