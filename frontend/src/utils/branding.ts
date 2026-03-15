export interface BrandingConfig {
  appName: string;
  tagline: string;
  logoText: string;
  logoUrl?: string; // base64 data URI or URL
  faviconUrl?: string;
}

const STORAGE_KEY = 'ce-branding';

const defaults: BrandingConfig = {
  appName: 'CoreEngine',
  tagline: 'Enterprise Platform',
  logoText: 'CE',
};

export function getBranding(): BrandingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch { /* */ }
  return defaults;
}

export function saveBranding(config: Partial<BrandingConfig>) {
  const current = getBranding();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('branding-changed'));

  // Update favicon if provided
  if (updated.faviconUrl) {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (link) link.href = updated.faviconUrl;
  }
}

export function resetBranding() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('branding-changed'));
}
