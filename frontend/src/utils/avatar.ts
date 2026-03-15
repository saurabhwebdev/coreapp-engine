import { createAvatar } from '@dicebear/core';
import {
  adventurer,
  avataaars,
  bottts,
  funEmoji,
  lorelei,
  notionists,
  openPeeps,
  thumbs,
} from '@dicebear/collection';

export const avatarStyles: Record<string, { style: any; label: string }> = {
  adventurer: { style: adventurer, label: 'Adventurer' },
  avataaars: { style: avataaars, label: 'Avataaars' },
  bottts: { style: bottts, label: 'Robots' },
  funEmoji: { style: funEmoji, label: 'Emoji' },
  lorelei: { style: lorelei, label: 'Lorelei' },
  notionists: { style: notionists, label: 'Notionists' },
  openPeeps: { style: openPeeps, label: 'Peeps' },
  thumbs: { style: thumbs, label: 'Thumbs' },
};

export interface AvatarConfig {
  style: string;
  seed: string;
}

const STORAGE_KEY = 'ce-avatar';

export function getAvatarConfig(): AvatarConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* */ }
  return { style: 'avataaars', seed: 'default' };
}

export function saveAvatarConfig(config: AvatarConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('avatar-changed'));
}

export function generateAvatarDataUri(styleName: string, seed: string): string {
  const entry = avatarStyles[styleName];
  if (!entry) return '';
  const avatar = createAvatar(entry.style, { seed, size: 128 });
  return avatar.toDataUri();
}
