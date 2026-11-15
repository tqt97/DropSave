import type { DownloadMode } from '../domain/types';

export interface DownloadHistoryItem {
  id: string;
  title: string;
  filename: string;
  outputDirectory: string;
  mode: DownloadMode;
  url: string;
  completedAt: string;
}

const KEY = 'dropsave.history.v1';
const LIMIT = 20;

export const loadHistory = (): DownloadHistoryItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DownloadHistoryItem[];
    return Array.isArray(parsed) ? parsed.slice(0, LIMIT) : [];
  } catch {
    return [];
  }
};

export const addHistoryItem = (item: Omit<DownloadHistoryItem, 'id' | 'completedAt'>): DownloadHistoryItem[] => {
  const nextItem: DownloadHistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString()
  };
  const next = [nextItem, ...loadHistory()].slice(0, LIMIT);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
};

export const clearHistory = (): DownloadHistoryItem[] => {
  localStorage.removeItem(KEY);
  return [];
};
