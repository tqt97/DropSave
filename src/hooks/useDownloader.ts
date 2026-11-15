import { useCallback, useState } from 'react';
import type { DownloadOptions, DownloadProgress, DownloadState, FriendlyError, VideoMetadata } from '../domain/types';
import { cancelDownload, downloadMedia, inspectVideo, revealDownloadedFile } from '../services/downloader';
import { addHistoryItem, clearHistory as clearStoredHistory, loadHistory, type DownloadHistoryItem } from '../services/history';
import { notifyDownloadComplete } from '../services/notifications';

export const useDownloader = () => {
  const [state, setState] = useState<DownloadState>('idle');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>({ percent: 0, phase: 'preparing', statusText: '' });
  const [error, setError] = useState<FriendlyError | null>(null);
  const [completedDownload, setCompletedDownload] = useState<DownloadOptions | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => loadHistory());

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

  const download = useCallback(async (options: DownloadOptions, notifyOnComplete = true) => {
    setState('downloading');
    setError(null);
    setCompletedDownload(null);
    setProgress({ percent: 0, phase: 'preparing', statusText: 'Đang chuẩn bị…' });

    try {
      await downloadMedia(options, setProgress);
      setCompletedDownload(options);
      setState('completed');

      const extension = options.mode === 'audio' ? 'mp3' : 'mp4';
      const nextHistory = addHistoryItem({
        title: metadata?.title ?? options.filename,
        filename: `${options.filename}.${extension}`,
        outputDirectory: options.outputDirectory,
        mode: options.mode,
        url: options.url
      });
      setHistory(nextHistory);

      if (notifyOnComplete) {
        await notifyDownloadComplete(`${options.filename}.${extension}`);
      }
    } catch (caught) {
      const maybeError = caught as FriendlyError;
      if (maybeError?.code === 'cancelled') {
        setError(null);
        setProgress({ percent: 0, phase: 'preparing', statusText: 'Đã hủy và dọn tệp tạm' });
        setState(metadata ? 'ready' : 'idle');
        return;
      }

      setError(
        maybeError?.title
          ? maybeError
          : { title: 'Không thể hoàn tất', message: 'Tiến trình tải đã dừng ngoài dự kiến.', code: 'generic' }
      );
      setState('error');
    }
  }, [metadata]);

  const revealCompleted = useCallback(async () => {
    if (!completedDownload) return;
    try {
      await revealDownloadedFile(completedDownload);
    } catch (caught) {
      setError({
        title: 'Không thể mở vị trí tệp',
        message: 'DropSave không thể mở Explorer/Finder tại tệp vừa tải.',
        suggestion: 'Tệp vẫn đã được lưu. Hãy mở thư mục tải xuống thủ công.',
        technical: String(caught),
        code: 'generic'
      });
    }
  }, [completedDownload]);

  const cancel = useCallback(async () => {
    await cancelDownload();
  }, []);

  const clearHistory = useCallback(() => {
    setHistory(clearStoredHistory());
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return {
    state,
    metadata,
    progress,
    error,
    history,
    completedDownload,
    inspect,
    download,
    cancel,
    clearHistory,
    revealCompleted,
    resetError
  };
};
