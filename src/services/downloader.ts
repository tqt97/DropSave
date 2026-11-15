import { invoke } from '@tauri-apps/api/core';
import { Command, type Child } from '@tauri-apps/plugin-shell';
import type { DownloadOptions, DownloadProgress, FriendlyError, VideoMetadata } from '../domain/types';
import { mapDownloaderError } from './error-mapper';

const YT_DLP = 'binaries/yt-dlp';
const FFMPEG = 'binaries/ffmpeg';
const PROGRESS_PREFIX = '__DROPSAVE_PROGRESS__';
const RETRY_MAX = 3;
const UNKNOWN_SIZE_MIN_FREE_BYTES = 256 * 1024 * 1024;

let activeChild: Child | null = null;
let activeOptions: DownloadOptions | null = null;
let cancelRequested = false;

const cleanJson = (stdout: string): string => {
  const firstBrace = stdout.indexOf('{');
  const lastBrace = stdout.lastIndexOf('}');
  return firstBrace >= 0 && lastBrace >= firstBrace ? stdout.slice(firstBrace, lastBrace + 1) : stdout;
};

const numberOrUndefined = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;

const hasH264Format = (formats: unknown): boolean | undefined => {
  if (!Array.isArray(formats)) return undefined;
  return formats.some((format) => {
    if (!format || typeof format !== 'object') return false;
    const codec = String((format as Record<string, unknown>).vcodec ?? '').toLowerCase();
    return codec.startsWith('avc1') || codec.startsWith('h264');
  });
};

export const inspectVideo = async (url: string): Promise<VideoMetadata> => {
  const command = Command.sidecar(YT_DLP, [
    '--no-playlist',
    '--dump-single-json',
    '--no-warnings',
    '--retries', String(RETRY_MAX),
    '--fragment-retries', String(RETRY_MAX),
    '--extractor-retries', String(RETRY_MAX),
    '--retry-sleep', 'exp=1:8',
    '--retry-sleep', 'fragment:exp=1:8',
    '--retry-sleep', 'extractor:exp=1:8',
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
    extractor: info.extractor_key ? String(info.extractor_key) : undefined,
    estimatedBytes: numberOrUndefined(info.filesize_approx) ?? numberOrUndefined(info.filesize),
    compatibleVideoAvailable: hasH264Format(info.formats)
  };
};

const qualitySelector = (quality: DownloadOptions['quality']): string => {
  const height = quality === '1080' ? '1080' : quality === '720' ? '720' : null;
  if (!height) {
    return 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b';
  }

  return [
    `bv*[ext=mp4][height<=?${height}]+ba[ext=m4a]`,
    `b[ext=mp4][height<=?${height}]`,
    `bv*[height<=?${height}]+ba`,
    `b[height<=?${height}]`
  ].join('/');
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
    phase: percent >= 100 ? 'postprocessing' : 'downloading',
    statusText: percent >= 100 ? 'Đang xử lý tệp…' : 'Đang tải dữ liệu…'
  };
};

const fileExistsError = async (
  options: DownloadOptions,
  extension: string
): Promise<FriendlyError> => {
  const suggestedFilename = await invoke<string>('suggest_output_filename', {
    outputDirectory: options.outputDirectory,
    filename: options.filename,
    extension
  });

  return {
    title: 'Tệp đã tồn tại',
    message: `Đã có tệp “${options.filename}.${extension}” trong thư mục đã chọn. DropSave sẽ không ghi đè.`,
    suggestion: `Bạn có thể dùng tên “${suggestedFilename}.${extension}” hoặc chọn thư mục khác.`,
    code: 'file_exists',
    suggestedFilename
  };
};

const diskSpaceError = (available: number, required: number): FriendlyError => ({
  title: 'Không đủ dung lượng trống',
  message: 'Ổ đĩa hiện không còn đủ dung lượng an toàn để bắt đầu tải.',
  suggestion: `Cần khoảng ${Math.ceil(required / 1024 / 1024)} MB, hiện còn khoảng ${Math.floor(available / 1024 / 1024)} MB.`,
  code: 'disk_space'
});

const preflightDiskSpace = async (options: DownloadOptions): Promise<void> => {
  const available = await invoke<number>('available_space', {
    outputDirectory: options.outputDirectory
  });
  const required = options.estimatedBytes
    ? Math.max(Math.ceil(options.estimatedBytes * 1.15), UNKNOWN_SIZE_MIN_FREE_BYTES)
    : UNKNOWN_SIZE_MIN_FREE_BYTES;

  if (available < required) throw diskSpaceError(available, required);
};

const cleanupPartialFiles = async (options: DownloadOptions | null): Promise<void> => {
  if (!options) return;
  try {
    await invoke<number>('cleanup_partial_files', {
      outputDirectory: options.outputDirectory,
      filename: options.filename
    });
  } catch {
    // Cleanup is best-effort and must not hide the original error.
  }
};

const isPostProcessLine = (line: string): boolean =>
  /\[(Merger|ExtractAudio|VideoConvertor|VideoRemuxer|FFmpeg|Fixup)/i.test(line)
  || /post-?process|merging formats|converting video/i.test(line);

const isRetryLine = (line: string): boolean =>
  /retrying|retry attempt|unable to download.*retry/i.test(line);

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
  if (exists) throw await fileExistsError(options, extension);

  onProgress({ percent: 0, phase: 'checking-space', statusText: 'Đang kiểm tra dung lượng…' });
  await preflightDiskSpace(options);

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
    '--continue',
    '--part',
    '--newline',
    '--ffmpeg-location', ffmpegPath,
    '--retries', String(RETRY_MAX),
    '--fragment-retries', String(RETRY_MAX),
    '--extractor-retries', String(RETRY_MAX),
    '--retry-sleep', 'exp=1:8',
    '--retry-sleep', 'fragment:exp=1:8',
    '--retry-sleep', 'extractor:exp=1:8',
    '--progress-template',
    `download:${PROGRESS_PREFIX}%(progress._percent_str)s|%(progress._downloaded_bytes_str)s|%(progress._total_bytes_str)s|%(progress._speed_str)s|%(progress._eta_str)s`,
    '-o', outputTemplate
  ];

  if (options.mode === 'audio') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    args.push(
      '-f', qualitySelector(options.quality),
      '--format-sort', '+codec:avc:m4a',
      '--merge-output-format', 'mp4',
      '--remux-video', 'mp4'
    );
  }
  args.push(options.url);

  const command = Command.sidecar(YT_DLP, args);
  let stderr = '';
  let currentPercent = 0;

  const handleLogLine = (line: string) => {
    const trimmed = line.trim();
    const parsed = parseProgressLine(trimmed);
    if (parsed) {
      currentPercent = parsed.percent;
      onProgress(parsed);
      return;
    }
    if (isRetryLine(trimmed)) {
      onProgress({
        percent: currentPercent,
        phase: 'retrying',
        retryMax: RETRY_MAX,
        statusText: 'Kết nối gián đoạn, DropSave đang thử lại…'
      });
      return;
    }
    if (isPostProcessLine(trimmed)) {
      onProgress({
        percent: Math.max(currentPercent, 99),
        phase: 'postprocessing',
        statusText: 'Đang ghép/chuyển đổi để tệp dễ phát hơn…'
      });
    }
  };

  command.stdout.on('data', handleLogLine);
  command.stderr.on('data', (line) => {
    stderr += `${line}\n`;
    handleLogLine(line);
  });

  activeOptions = options;
  cancelRequested = false;
  onProgress({ percent: 0, phase: 'preparing', statusText: 'Đang chuẩn bị trình tải…' });
  activeChild = await command.spawn();

  try {
    await new Promise<void>((resolve, reject) => {
      command.on('close', (data) => {
        activeChild = null;
        if (data.code === 0) {
          onProgress({ percent: 100, phase: 'completed', statusText: 'Hoàn tất' });
          resolve();
          return;
        }

        if (cancelRequested) {
          reject({
            title: 'Đã hủy tải',
            message: 'Tiến trình tải đã được dừng và DropSave đang dọn tệp tạm.',
            code: 'cancelled'
          } satisfies FriendlyError);
          return;
        }
        reject(mapDownloaderError(stderr || `Process exited with code ${data.code}`));
      });
      command.on('error', (error) => {
        activeChild = null;
        reject(mapDownloaderError(String(error)));
      });
    });
  } catch (error) {
    await cleanupPartialFiles(options);
    throw error;
  } finally {
    activeOptions = null;
  }

  if (options.mode === 'video' && options.forceCompatibilityTranscode) {
    await transcodeForCompatibility(options, finalPath, onProgress);
    onProgress({ percent: 100, phase: 'completed', statusText: 'Hoàn tất · H.264/AAC' });
  }

  return finalPath;
};

const transcodeForCompatibility = async (
  options: DownloadOptions,
  finalPath: string,
  onProgress: (progress: DownloadProgress) => void
): Promise<void> => {
  const tempPath = await invoke<string>('compatibility_temp_path', {
    outputDirectory: options.outputDirectory,
    filename: options.filename
  });

  onProgress({
    percent: 99,
    phase: 'postprocessing',
    statusText: 'Nguồn không có H.264. Đang chuyển sang H.264/AAC để tăng tương thích…'
  });

  const command = Command.sidecar(FFMPEG, [
    '-y',
    '-i', finalPath,
    '-map', '0:v:0',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    tempPath
  ]);

  const output = await command.execute();
  if (output.code !== 0) {
    throw {
      title: 'Không thể chuyển đổi codec',
      message: 'Video đã tải nhưng bước chuyển sang H.264/AAC không hoàn tất.',
      suggestion: 'File nguồn có thể vẫn phát được bằng VLC. Hãy thử lại hoặc mở issue kèm URL public để kiểm tra.',
      technical: output.stderr || output.stdout,
      code: 'generic'
    } satisfies FriendlyError;
  }

  await invoke('replace_with_compatible_file', {
    outputDirectory: options.outputDirectory,
    filename: options.filename
  });
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

  cancelRequested = true;
  const options = activeOptions;
  await child.kill();
  activeChild = null;
  await cleanupPartialFiles(options);
};
