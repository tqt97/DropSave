import { useCallback, useState } from 'react';
import type { DownloadOptions, DownloadProgress, DownloadState, FriendlyError, VideoMetadata } from '../domain/types';
import { cancelDownload, downloadMedia, inspectVideo, revealDownloadedFile } from '../services/downloader';

export const useDownloader = () => {
  const [state, setState] = useState<DownloadState>('idle');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>({ percent: 0, statusText: '' });
  const [error, setError] = useState<FriendlyError | null>(null);
  const [completedDownload, setCompletedDownload] = useState<DownloadOptions | null>(null);

  const inspect = useCallback(async (url: string) => {
    setState('inspecting');
    setError(null);
    setMetadata(null);
    setCompletedDownload(null);
    try {
      const result = await inspectVideo(url);
      setMetadata(result);
      setState('ready');
      return result;
    } catch (caught) {
      setError(caught as FriendlyError);
      setState('error');
      return null;
    }
  }, []);

  const download = useCallback(async (options: DownloadOptions) => {
    setState('downloading');
    setError(null);
    setCompletedDownload(null);
    setProgress({ percent: 0, statusText: 'Đang chuẩn bị…' });
    try {
      await downloadMedia(options, setProgress);
      setCompletedDownload(options);
      setState('completed');
    } catch (caught) {
      const maybeError = caught as FriendlyError;
      if (maybeError?.title) setError(maybeError);
      else setError({ title: 'Đã dừng tải', message: 'Tiến trình tải đã được dừng.' });
      setState('error');
    }
  }, []);

  const revealCompleted = useCallback(async () => {
    if (!completedDownload) return;
    try {
      await revealDownloadedFile(completedDownload);
    } catch (caught) {
      setError({
        title: 'Không thể mở vị trí tệp',
        message: 'DropSave không thể mở Explorer/Finder tại tệp vừa tải.',
        suggestion: 'Tệp vẫn đã được lưu. Hãy mở thư mục tải xuống thủ công.',
        technical: String(caught)
      });
    }
  }, [completedDownload]);

  const cancel = useCallback(async () => {
    await cancelDownload();
    setProgress({ percent: 0, statusText: 'Đã hủy' });
    setState(metadata ? 'ready' : 'idle');
  }, [metadata]);

  const resetError = useCallback(() => setError(null), []);

  return { state, metadata, progress, error, completedDownload, inspect, download, cancel, revealCompleted, resetError };
};
