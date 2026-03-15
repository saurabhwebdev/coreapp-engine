export interface ColorTheme {
  key: string;
  name: string;
  accent: string;
  accentHover: string;
  accentDark: string;
  accentDarkHover: string;
}

export const colorThemes: ColorTheme[] = [
  { key: 'copper', name: 'Copper', accent: '#C2703E', accentHover: '#B5642F', accentDark: '#E08A4A', accentDarkHover: '#F09A5A' },
  { key: 'ocean', name: 'Ocean', accent: '#0077B6', accentHover: '#006AA3', accentDark: '#4DA8DA', accentDarkHover: '#6BBDE8' },
  { key: 'forest', name: 'Forest', accent: '#2D6A4F', accentHover: '#245A42', accentDark: '#52B788', accentDarkHover: '#6BC99A' },
  { key: 'midnight', name: 'Midnight', accent: '#4361EE', accentHover: '#3651D4', accentDark: '#6B82F5', accentDarkHover: '#8599FF' },
  { key: 'berry', name: 'Berry', accent: '#9B2335', accentHover: '#871D2D', accentDark: '#E05A6D', accentDarkHover: '#F0707F' },
  { key: 'slate', name: 'Slate', accent: '#475569', accentHover: '#3D4A5C', accentDark: '#94A3B8', accentDarkHover: '#B0BEC5' },
  { key: 'violet', name: 'Violet', accent: '#7C3AED', accentHover: '#6D28D9', accentDark: '#A78BFA', accentDarkHover: '#C4B5FD' },
  { key: 'teal', name: 'Teal', accent: '#0D9488', accentHover: '#0B8276', accentDark: '#2DD4BF', accentDarkHover: '#5EEAD4' },
];

const STORAGE_KEY = 'ce-color-theme';
const CUSTOM_KEY = 'ce-custom-color';

// Derive hover/dark variants from a single hex color
function deriveTheme(hex: string): ColorTheme {
  return {
    key: 'custom',
    name: 'Custom',
    accent: hex,
    accentHover: darken(hex, 15),
    accentDark: lighten(hex, 25),
    accentDarkHover: lighten(hex, 35),
  };
}

export function getColorTheme(): ColorTheme {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    if (key === 'custom') {
      const customHex = localStorage.getItem(CUSTOM_KEY);
      if (customHex) return deriveTheme(customHex);
    }
    if (key) {
      const found = colorThemes.find((t) => t.key === key);
      if (found) return found;
    }
  } catch { /* */ }
  return colorThemes[0];
}

export function saveColorTheme(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
  applyColorThemeCss();
  window.dispatchEvent(new CustomEvent('theme-changed'));
}

export function saveCustomColor(hex: string) {
  localStorage.setItem(STORAGE_KEY, 'custom');
  localStorage.setItem(CUSTOM_KEY, hex);
  applyColorThemeCss();
  window.dispatchEvent(new CustomEvent('theme-changed'));
}

export function getCustomColor(): string | null {
  return localStorage.getItem(CUSTOM_KEY);
}

export function applyColorThemeCss() {
  const theme = getColorTheme();
  const root = document.documentElement;
  root.style.setProperty('--ce-accent', theme.accent);
  root.style.setProperty('--ce-accent-hover', theme.accentHover);
  root.style.setProperty('--ce-accent-light', hexToRgba(theme.accent, 0.07));
  root.style.setProperty('--ce-accent-border', hexToRgba(theme.accent, 0.2));
  root.style.setProperty('--ce-bg-sidebar-active', hexToRgba(theme.accent, 0.1));
}

export function getAntTokensForTheme(isDark: boolean): { colorPrimary: string } {
  const theme = getColorTheme();
  return { colorPrimary: isDark ? theme.accentDark : theme.accent };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, percent: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(2.55 * percent));
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(2.55 * percent));
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(2.55 * percent));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lighten(hex: string, percent: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(2.55 * percent));
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(2.55 * percent));
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(2.55 * percent));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
