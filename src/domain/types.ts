export type DownloadMode = 'video' | 'audio';
export type VideoQuality = 'best' | '1080' | '720';
export type DownloadState = 'idle' | 'inspecting' | 'ready' | 'downloading' | 'completed' | 'error';

export interface VideoMetadata {
  title: string;
  uploader?: string;
  thumbnail?: string;
  duration?: number;
  webpageUrl: string;
  extractor?: string;
}

export interface DownloadOptions {
  url: string;
  mode: DownloadMode;
  quality: VideoQuality;
  outputDirectory: string;
  filename: string;
}

export interface DownloadProgress {
  percent: number;
  downloaded?: string;
  total?: string;
  speed?: string;
  eta?: string;
  statusText: string;
}

export interface FriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  technical?: string;
}
