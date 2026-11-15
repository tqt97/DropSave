import { invoke } from '@tauri-apps/api/core';
import { Command, type Child } from '@tauri-apps/plugin-shell';
import type { DownloadOptions, DownloadProgress, FriendlyError, VideoMetadata } from '../domain/types';
import { mapDownloaderError } from './error-mapper';

const YT_DLP = 'binaries/yt-dlp';
const PROGRESS_PREFIX = '__DROPSAVE_PROGRESS__';

let activeChild: Child | null = null;

const cleanJson = (stdout: string): string => {
  const firstBrace = stdout.indexOf('{');
  const lastBrace = stdout.lastIndexOf('}');
  return firstBrace >= 0 && lastBrace >= firstBrace ? stdout.slice(firstBrace, lastBrace + 1) : stdout;
};

export const inspectVideo = async (url: string): Promise<VideoMetadata> => {
  const command = Command.sidecar(YT_DLP, [
    '--no-playlist',
    '--dump-single-json',
    '--no-warnings',
    url
  ]);
  const output = await command.execute();

  if (output.code !== 0) throw mapDownloaderError(output.stderr || output.stdout);

  const info = JSON.parse(cleanJson(output.stdout)) as Record<string, unknown>;
  return {
    title: String(info.title ?? 'Untitled video'),
    uploader: info.uploader ? String(info.uploader) : undefined,
    thumbnail: info.thumbnail ? String(info.thumbnail) : undefined,
    duration: typeof info.duration === 'number' ? info.duration : undefined,
    webpageUrl: String(info.webpage_url ?? url),
    extractor: info.extractor_key ? String(info.extractor_key) : undefined
  };
};

const qualitySelector = (quality: DownloadOptions['quality']): string => {
  if (quality === '1080') return 'bv*[height<=1080]+ba/b[height<=1080]';
  if (quality === '720') return 'bv*[height<=720]+ba/b[height<=720]';
  return 'bv*+ba/b';
};

const outputExtension = (mode: DownloadOptions['mode']): 'mp4' | 'mp3' => mode === 'audio' ? 'mp3' : 'mp4';

const parseProgressLine = (line: string): DownloadProgress | null => {
  if (!line.startsWith(PROGRESS_PREFIX)) return null;
  const payload = line.slice(PROGRESS_PREFIX.length);
  const [percentRaw, downloaded, total, speed, eta] = payload.split('|');
  const percent = Math.max(0, Math.min(100, Number.parseFloat(percentRaw) || 0));
  return {
    percent,
    downloaded: downloaded || undefined,
    total: total || undefined,
    speed: speed || undefined,
    eta: eta || undefined,
    statusText: percent >= 100 ? 'Đang hoàn tất tệp…' : 'Đang tải…'
  };
};

const fileExistsError = (filename: string, extension: string): FriendlyError => ({
  title: 'Tệp đã tồn tại',
  message: `Đã có tệp “${filename}.${extension}” trong thư mục đã chọn. DropSave không ghi đè tệp hiện có.`,
  suggestion: 'Hãy đổi tên file hoặc chọn một thư mục lưu khác rồi tải lại.'
});

export const downloadMedia = async (
  options: DownloadOptions,
  onProgress: (progress: DownloadProgress) => void
): Promise<string> => {
  if (activeChild) throw new Error('Một tiến trình tải khác đang hoạt động.');

  const extension = outputExtension(options.mode);
  const exists = await invoke<boolean>('output_file_exists', {
    outputDirectory: options.outputDirectory,
    filename: options.filename,
    extension
  });
  if (exists) throw fileExistsError(options.filename, extension);

  const finalPath = await invoke<string>('output_file_path', {
    outputDirectory: options.outputDirectory,
    filename: options.filename,
    extension
  });
  const outputTemplate = `${options.outputDirectory}/${options.filename}.%(ext)s`;
  const ffmpegPath = await invoke<string>('ffmpeg_path');
  const args = [
    '--no-playlist',
    '--no-overwrites',
    '--newline',
    '--no-warnings',
    '--ffmpeg-location', ffmpegPath,
    '--progress-template',
    `download:${PROGRESS_PREFIX}%(progress._percent_str)s|%(progress._downloaded_bytes_str)s|%(progress._total_bytes_str)s|%(progress._speed_str)s|%(progress._eta_str)s`,
    '-o', outputTemplate
  ];

  if (options.mode === 'audio') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    args.push('-f', qualitySelector(options.quality), '--merge-output-format', 'mp4', '--remux-video', 'mp4');
  }
  args.push(options.url);

  const command = Command.sidecar(YT_DLP, args);
  let stderr = '';

  command.stdout.on('data', (line) => {
    const progress = parseProgressLine(line.trim());
    if (progress) onProgress(progress);
  });
  command.stderr.on('data', (line) => { stderr += `${line}\n`; });

  activeChild = await command.spawn();

  await new Promise<void>((resolve, reject) => {
    command.on('close', (data) => {
      activeChild = null;
      if (data.code === 0) {
        onProgress({ percent: 100, statusText: 'Hoàn tất' });
        resolve();
      } else {
        reject(mapDownloaderError(stderr || `Process exited with code ${data.code}`));
      }
    });
    command.on('error', (error) => {
      activeChild = null;
      reject(mapDownloaderError(String(error)));
    });
  });

  return finalPath;
};

export const revealDownloadedFile = async (options: Pick<DownloadOptions, 'outputDirectory' | 'filename' | 'mode'>): Promise<void> => {
  await invoke('reveal_output_file', {
    outputDirectory: options.outputDirectory,
    filename: options.filename,
    extension: outputExtension(options.mode)
  });
};

export const cancelDownload = async (): Promise<void> => {
  const child = activeChild;
  if (!child) return;
  await child.kill();
  activeChild = null;
};
