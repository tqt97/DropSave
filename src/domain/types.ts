export type DownloadMode = 'video' | 'audio';
export type VideoQuality = 'best' | '1080' | '720';
export type DownloadState = 'idle' | 'inspecting' | 'ready' | 'downloading' | 'completed' | 'error';
export type DownloadPhase = 'preparing' | 'checking-space' | 'downloading' | 'postprocessing' | 'retrying' | 'completed';

export interface VideoMetadata {
  title: string;
  uploader?: string;
  thumbnail?: string;
  duration?: number;
  webpageUrl: string;
  extractor?: string;
  estimatedBytes?: number;
}

export interface DownloadOptions {
  url: string;
  mode: DownloadMode;
  quality: VideoQuality;
  outputDirectory: string;
  filename: string;
  estimatedBytes?: number;
}

export interface DownloadProgress {
  percent: number;
  downloaded?: string;
  total?: string;
  speed?: string;
  eta?: string;
  statusText: string;
  phase?: DownloadPhase;
  retryAttempt?: number;
  retryMax?: number;
}

export interface FriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  technical?: string;
  code?: 'file_exists' | 'disk_space' | 'network' | 'cancelled' | 'generic';
}
