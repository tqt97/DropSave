import { useEffect, useMemo, useState } from 'react';
import { downloadDir } from '@tauri-apps/api/path';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { open } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import {
  CheckCircle2,
  ClipboardPaste,
  Download,
  FolderOpen,
  Info,
  Link2,
  Music2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Video,
  X
} from 'lucide-react';
import { DownloadHistory } from './components/DownloadHistory';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProgressPanel } from './components/ProgressPanel';
import { VideoPreview } from './components/VideoPreview';
import type { DownloadMode, VideoQuality } from './domain/types';
import { filenameFromTitle, slugifyFilename } from './domain/filename';
import { validateMediaUrl } from './domain/url';
import { useDownloader } from './hooks/useDownloader';
import { revealDownloadedFile } from './services/downloader';
import type { DownloadHistoryItem } from './services/history';
import { loadPreferences, savePreferences } from './services/preferences';

const APP_VERSION = 'v1.0.0';
const initialPreferences = loadPreferences();

function AppContent() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<DownloadMode>(initialPreferences.mode);
  const [quality, setQuality] = useState<VideoQuality>(initialPreferences.quality);
  const [filename, setFilename] = useState('');
  const [autoName, setAutoName] = useState(true);
  const [showFilenameInfo, setShowFilenameInfo] = useState(false);
  const [folder, setFolder] = useState(initialPreferences.outputDirectory ?? '');
  const [notifyOnComplete, setNotifyOnComplete] = useState(initialPreferences.notifyOnComplete);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const [clipboardCandidate, setClipboardCandidate] = useState<string | null>(null);

  const {
    state,
    metadata,
    progress,
    error,
    history,
    inspect,
    download,
    cancel,
    clearHistory,
    revealCompleted,
    resetError
  } = useDownloader();

  const busy = state === 'inspecting' || state === 'downloading';
  const canDownload = Boolean(metadata && folder && filename && state !== 'downloading');
  const extension = mode === 'audio' ? 'mp3' : 'mp4';

  useEffect(() => {
    if (!folder) void downloadDir().then(setFolder).catch(() => undefined);
  }, [folder]);

  useEffect(() => {
    savePreferences({ outputDirectory: folder || undefined, mode, quality, notifyOnComplete });
  }, [folder, mode, quality, notifyOnComplete]);

  useEffect(() => {
    void readText()
      .then((text) => {
        const candidate = text.trim();
        if (candidate && validateMediaUrl(candidate).valid) setClipboardCandidate(candidate);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (metadata && autoName) setFilename(filenameFromTitle(metadata.title));
  }, [metadata, autoName]);

  const modeDescription = useMemo(
    () => mode === 'audio' ? 'MP3 chất lượng cao' : 'MP4 · ưu tiên H.264 + AAC để dễ phát trên nhiều thiết bị',
    [mode]
  );

  const handleInspect = async () => {
    resetError();
    const validation = validateMediaUrl(url);
    if (!validation.valid) {
      setUrlMessage(validation.message ?? 'Liên kết chưa hợp lệ.');
      return;
    }
    setUrlMessage(null);
    setClipboardCandidate(null);
    await inspect(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await readText();
      setUrl(text.trim());
      setClipboardCandidate(null);
      setUrlMessage(null);
    } catch {
      setUrlMessage('Không thể đọc clipboard. Hãy dán liên kết bằng Ctrl/Cmd + V.');
    }
  };

  const handleUseClipboard = () => {
    if (!clipboardCandidate) return;
    setUrl(clipboardCandidate);
    setClipboardCandidate(null);
    setUrlMessage(null);
  };

  const handleSelectFolder = async () => {
    const selected = await open({ directory: true, multiple: false, title: 'Chọn thư mục lưu media' });
    if (typeof selected === 'string') setFolder(selected);
  };

  const handleFilenameChange = (value: string) => {
    setAutoName(false);
    setFilename(slugifyFilename(value, 'video'));
  };

  const handleAutoNameChange = (enabled: boolean) => {
    setAutoName(enabled);
    if (enabled && metadata) setFilename(filenameFromTitle(metadata.title));
  };

  const handleDownload = async () => {
    if (!metadata || !folder) return;
    await download({
      url: metadata.webpageUrl,
      mode,
      quality,
      outputDirectory: folder,
      filename: slugifyFilename(filename),
      estimatedBytes: metadata.estimatedBytes,
      forceCompatibilityTranscode: mode === 'video' && metadata.compatibleVideoAvailable === false
    }, notifyOnComplete);
  };

  const handleUseSuggestedFilename = () => {
    if (!error?.suggestedFilename) return;
    setAutoName(false);
    setFilename(error.suggestedFilename);
    resetError();
  };

  const handleRevealHistory = async (item: DownloadHistoryItem) => {
    const suffix = item.mode === 'audio' ? '.mp3' : '.mp4';
    const baseFilename = item.filename.endsWith(suffix)
      ? item.filename.slice(0, -suffix.length)
      : item.filename;

    try {
      await revealDownloadedFile({
        outputDirectory: item.outputDirectory,
        filename: baseFilename,
        mode: item.mode
      });
    } catch {
      setUrlMessage('Tệp trong lịch sử có thể đã bị di chuyển hoặc xóa.');
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">D</div>
        <div className="brand-copy">
          <strong>DropSave <span className="version-badge">{APP_VERSION}</span></strong>
          <span>Desktop media downloader</span>
        </div>
        <div className="privacy-pill"><ShieldCheck size={15} /> <span>Chạy trên máy của bạn</span></div>
      </header>

      <div className="hero-grid">
        <section className="intro-panel">
          <span className="eyebrow"><Sparkles size={14} /> Tải video, không cần dòng lệnh</span>
          <h1>Dán liên kết.<br />Chọn cách lưu.<br /><em>Xong.</em></h1>
          <p>DropSave ưu tiên định dạng tương thích, xử lý tên file, retry và công cụ tải ở phía sau để bạn tập trung vào nội dung cần lưu.</p>

          <section className="capability-card" aria-label="DropSave có thể làm gì">
            <div className="capability-head">
              <strong>DropSave có thể làm gì?</strong>
              <span>URL công khai</span>
            </div>
            <div className="capability-list">
              <div><Video size={15} /><span><strong>YouTube, Facebook, TikTok</strong><small>Và nhiều website khác được yt-dlp hỗ trợ.</small></span></div>
              <div><Download size={15} /><span><strong>Video MP4 tương thích</strong><small>Ưu tiên H.264/AAC; fallback khi nguồn không có.</small></span></div>
              <div><Music2 size={15} /><span><strong>Audio MP3</strong><small>Tách audio và xử lý bằng FFmpeg.</small></span></div>
              <div><ShieldCheck size={15} /><span><strong>Tải an toàn hơn</strong><small>Retry, không ghi đè, cleanup file tạm và kiểm tra dung lượng.</small></span></div>
            </div>
          </section>
        </section>

        <section className="workspace-card" aria-label="Khu vực tải media">
          {clipboardCandidate && !url && (
            <div className="clipboard-suggestion">
              <div>
                <ClipboardPaste size={17} />
                <span><strong>Phát hiện liên kết trong clipboard</strong><small>{clipboardCandidate}</small></span>
              </div>
              <div>
                <button type="button" onClick={handleUseClipboard}>Dán</button>
                <button className="icon-button" type="button" onClick={() => setClipboardCandidate(null)} aria-label="Bỏ qua"><X size={15} /></button>
              </div>
            </div>
          )}

          <div className="field-group">
            <label htmlFor="video-url">Liên kết video</label>
            <div className={`url-field ${urlMessage ? 'has-error' : ''}`}>
              <Link2 size={18} />
              <input
                id="video-url"
                value={url}
                onChange={(event) => { setUrl(event.target.value); setUrlMessage(null); }}
                onKeyDown={(event) => { if (event.key === 'Enter' && !busy) void handleInspect(); }}
                placeholder="https://www.tiktok.com/@user/video/..."
                disabled={busy}
                autoFocus
              />
              <button type="button" onClick={handlePaste} disabled={busy} aria-label="Dán liên kết từ clipboard" title="Dán từ clipboard"><ClipboardPaste size={18} /></button>
            </div>
            {urlMessage && <p className="field-error">{urlMessage}</p>}
          </div>

          <button className="inspect-button" type="button" onClick={handleInspect} disabled={busy || !url.trim()}>
            {state === 'inspecting' ? <><span className="spinner" /> Đang đọc thông tin…</> : 'Kiểm tra video'}
          </button>

          {metadata && <VideoPreview metadata={metadata} />}

          {metadata && (
            <div className="settings-grid">
              <div className="field-group">
                <label>Loại tải xuống</label>
                <div className="segmented-control">
                  <button className={mode === 'video' ? 'active' : ''} onClick={() => setMode('video')} type="button"><Video size={17} /> Video</button>
                  <button className={mode === 'audio' ? 'active' : ''} onClick={() => setMode('audio')} type="button"><Music2 size={17} /> Audio</button>
                </div>
                <small>{modeDescription}</small>
              </div>

              <div className="field-group">
                <label htmlFor="quality">Chất lượng</label>
                <select id="quality" value={quality} onChange={(event) => setQuality(event.target.value as VideoQuality)} disabled={mode === 'audio'}>
                  <option value="best">Tốt nhất tương thích</option>
                  <option value="1080">Tối đa 1080p</option>
                  <option value="720">Tối đa 720p</option>
                </select>
                <small>{mode === 'audio' ? 'Không áp dụng cho audio' : 'Ưu tiên H.264/AAC. Nếu nguồn không có H.264, DropSave sẽ tự chuyển đổi sau khi tải.'}</small>
                {mode === 'video' && metadata.compatibleVideoAvailable === false && (
                  <div className="compatibility-warning">
                    Nguồn này không cung cấp H.264. Thời gian hoàn tất sẽ lâu hơn vì DropSave cần chuyển codec bằng FFmpeg.
                  </div>
                )}
              </div>

              <div className="field-group full-span filename-group">
                <div className="label-row">
                  <div className="label-with-info">
                    <label htmlFor="filename">Tên file</label>
                    <button className={`info-button ${showFilenameInfo ? 'active' : ''}`} type="button" aria-label="Giải thích chế độ đặt tên file" aria-expanded={showFilenameInfo} onClick={() => setShowFilenameInfo((current) => !current)}>
                      <Info size={15} />
                    </button>
                  </div>
                  <label className="toggle-label">
                    <input type="checkbox" checked={autoName} onChange={(event) => handleAutoNameChange(event.target.checked)} />
                    Tự động
                  </label>
                </div>

                {showFilenameInfo && (
                  <div className="filename-info" role="note">
                    <div><CheckCircle2 size={15} /><span><strong>Tự động:</strong> lấy tiêu đề video và tạo tên an toàn.</span></div>
                    <div><CheckCircle2 size={15} /><span><strong>Tùy chỉnh:</strong> bỏ chọn “Tự động” để nhập tên riêng.</span></div>
                    <div><CheckCircle2 size={15} /><span><strong>Không ghi đè:</strong> nếu file tồn tại, DropSave sẽ đề xuất một tên mới để bạn xác nhận.</span></div>
                  </div>
                )}

                <div className={`filename-input ${autoName ? 'is-auto' : ''}`}>
                  <input id="filename" className="text-input" value={filename} onChange={(event) => handleFilenameChange(event.target.value)} disabled={autoName} spellCheck={false} />
                  <span className="extension-badge">.{extension}</span>
                </div>
              </div>

              <div className="field-group full-span">
                <label>Thư mục lưu</label>
                <button className="folder-picker" type="button" onClick={handleSelectFolder}>
                  <FolderOpen size={18} />
                  <span>{folder || 'Chọn thư mục lưu…'}</span>
                  <strong>Chọn</strong>
                </button>
              </div>

              <label className="preference-row full-span">
                <input type="checkbox" checked={notifyOnComplete} onChange={(event) => setNotifyOnComplete(event.target.checked)} />
                <span><strong>Thông báo khi tải xong</strong><small>DropSave sẽ dùng notification của hệ điều hành nếu bạn cấp quyền.</small></span>
              </label>
            </div>
          )}

          {error && (
            <section className="error-card" role="alert">
              <strong>{error.title}</strong>
              <p>{error.message}</p>
              {error.suggestion && <small>{error.suggestion}</small>}
              {error.suggestedFilename && (
                <button className="error-action" type="button" onClick={handleUseSuggestedFilename}>
                  Dùng tên {error.suggestedFilename}.{extension}
                </button>
              )}
            </section>
          )}

          {(state === 'downloading' || state === 'completed') && (
            <ProgressPanel progress={progress} completed={state === 'completed'} onCancel={cancel} />
          )}

          {metadata && state !== 'downloading' && (
            <div className="action-row">
              <button className="download-button" type="button" onClick={handleDownload} disabled={!canDownload}>
                <Download size={19} /> Tải xuống
              </button>
              {state === 'completed' && (
                <button className="secondary-button" type="button" onClick={() => void revealCompleted()}><FolderOpen size={18} /> Mở vị trí tệp</button>
              )}
              {state === 'error' && !error?.suggestedFilename && (
                <button className="secondary-button" type="button" onClick={handleInspect}><RotateCcw size={18} /> Thử lại</button>
              )}
            </div>
          )}

          <DownloadHistory items={history} onReveal={(item) => void handleRevealHistory(item)} onClear={clearHistory} />
        </section>
      </div>

      <footer className="app-footer">
        <span>DropSave {APP_VERSION}</span><span className="footer-dot">•</span><span>TuanTQ</span><span className="footer-dot">•</span>
        <button className="footer-link" type="button" onClick={() => void openUrl('https://github.com/tqt97')}>GitHub /tqt97</button>
        <span className="footer-dot">•</span><span>Chỉ tải nội dung bạn có quyền truy cập và lưu trữ.</span>
      </footer>
    </main>
  );
}

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}
