import type { DownloadMode, VideoQuality } from '../domain/types';

export interface DownloadPreferences {
  outputDirectory?: string;
  mode: DownloadMode;
  quality: VideoQuality;
  notifyOnComplete: boolean;
}

const KEY = 'dropsave.preferences.v1';

const defaults: DownloadPreferences = {
  mode: 'video',
  quality: 'best',
  notifyOnComplete: true
};

export const loadPreferences = (): DownloadPreferences => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<DownloadPreferences>) };
  } catch {
    return defaults;
  }
};

export const savePreferences = (preferences: DownloadPreferences): void => {
  localStorage.setItem(KEY, JSON.stringify(preferences));
};
