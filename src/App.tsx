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
  Video
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProgressPanel } from './components/ProgressPanel';
import { VideoPreview } from './components/VideoPreview';
import type { DownloadMode, VideoQuality } from './domain/types';
import { filenameFromTitle, slugifyFilename } from './domain/filename';
import { validateMediaUrl } from './domain/url';
import { useDownloader } from './hooks/useDownloader';

const APP_VERSION = 'v1.0.0';

function AppContent() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<DownloadMode>('video');
  const [quality, setQuality] = useState<VideoQuality>('best');
  const [filename, setFilename] = useState('');
  const [autoName, setAutoName] = useState(true);
  const [showFilenameInfo, setShowFilenameInfo] = useState(false);
  const [folder, setFolder] = useState('');
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const { state, metadata, progress, error, inspect, download, cancel, revealCompleted, resetError } = useDownloader();

  const busy = state === 'inspecting' || state === 'downloading';
  const canDownload = Boolean(metadata && folder && filename && state !== 'downloading');
  const extension = mode === 'audio' ? 'mp3' : 'mp4';

  useEffect(() => {
    void downloadDir().then(setFolder).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (metadata && autoName) setFilename(filenameFromTitle(metadata.title));
  }, [metadata, autoName]);

  const modeDescription = useMemo(() => mode === 'audio' ? 'MP3 chất lượng cao' : 'MP4 tương thích rộng', [mode]);

  const handleInspect = async () => {
    resetError();
    const validation = validateMediaUrl(url);
    if (!validation.valid) {
      setUrlMessage(validation.message ?? 'Liên kết chưa hợp lệ.');
      return;
    }
    setUrlMessage(null);
    await inspect(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await readText();
      setUrl(text.trim());
      setUrlMessage(null);
    } catch {
      setUrlMessage('Không thể đọc clipboard. Hãy dán liên kết bằng Ctrl/Cmd + V.');
    }
  };

  const handleSelectFolder = async () => {
    const selected = await open({ directory: true, multiple: false, title: 'Chọn thư mục lưu video' });
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
      filename: slugifyFilename(filename)
    });
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
          <p>DropSave xử lý tên file, định dạng và công cụ tải ở phía sau để bạn chỉ tập trung vào nội dung cần lưu.</p>

          <section className="capability-card" aria-label="DropSave có thể làm gì">
            <div className="capability-head">
              <strong>DropSave có thể làm gì?</strong>
              <span>URL công khai</span>
            </div>
            <div className="capability-list">
              <div><Video size={15} /><span><strong>YouTube, Facebook, TikTok</strong><small>Và nhiều website khác được yt-dlp hỗ trợ.</small></span></div>
              <div><Download size={15} /><span><strong>Video MP4</strong><small>Best, tối đa 1080p hoặc tối đa 720p.</small></span></div>
              <div><Music2 size={15} /><span><strong>Audio MP3</strong><small>Tách audio và xử lý bằng FFmpeg.</small></span></div>
              <div><ShieldCheck size={15} /><span><strong>Lưu an toàn</strong><small>Slug filename, không ghi đè và chọn thư mục lưu.</small></span></div>
            </div>
            <p className="capability-note">Khả năng tải có thể thay đổi khi website nguồn thay đổi. DropSave ưu tiên URL công khai mà bạn có quyền truy cập và lưu trữ.</p>
          </section>
        </section>

        <section className="workspace-card" aria-label="Khu vực tải video">
          <div className="field-group">
            <label htmlFor="video-url">Liên kết video</label>
            <div className={`url-field ${urlMessage ? 'has-error' : ''}`}>
              <Link2 size={18} />
              <input
                id="video-url"
                value={url}
                onChange={(event) => { setUrl(event.target.value); setUrlMessage(null); }}
                onKeyDown={(event) => { if (event.key === 'Enter' && !busy) void handleInspect(); }}
                placeholder="https://www.facebook.com/reel/..."
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
                  <option value="best">Tốt nhất</option>
                  <option value="1080">Tối đa 1080p</option>
                  <option value="720">Tối đa 720p</option>
                </select>
                <small>{mode === 'audio' ? 'Không áp dụng cho audio' : 'Tự fallback nếu nguồn thiếu định dạng'}</small>
              </div>

              <div className="field-group full-span filename-group">
                <div className="label-row">
                  <div className="label-with-info">
                    <label htmlFor="filename">Tên file</label>
                    <button
                      className={`info-button ${showFilenameInfo ? 'active' : ''}`}
                      type="button"
                      aria-label="Giải thích chế độ đặt tên file"
                      aria-expanded={showFilenameInfo}
                      onClick={() => setShowFilenameInfo((current) => !current)}
                    >
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
                    <div><CheckCircle2 size={15} /><span><strong>Tự động:</strong> lấy tiêu đề video, chuyển thành tên an toàn và khóa ô nhập.</span></div>
                    <div><CheckCircle2 size={15} /><span><strong>Tùy chỉnh:</strong> bỏ chọn “Tự động”, nhập tên bạn muốn; DropSave vẫn chuẩn hóa thành slug an toàn.</span></div>
                    <div><CheckCircle2 size={15} /><span><strong>Không ghi đè:</strong> nếu <code>{filename || 'ten-file'}.{extension}</code> đã tồn tại, DropSave sẽ báo lỗi và yêu cầu đổi tên.</span></div>
                  </div>
                )}

                <div className={`filename-input ${autoName ? 'is-auto' : ''}`}>
                  <input
                    id="filename"
                    className="text-input"
                    value={filename}
                    onChange={(event) => handleFilenameChange(event.target.value)}
                    disabled={autoName}
                    spellCheck={false}
                  />
                  <span className="extension-badge">.{extension}</span>
                </div>
                <small>{autoName ? 'Tên được tạo từ tiêu đề video.' : 'Tên tùy chỉnh được chuẩn hóa để an toàn trên Windows và macOS.'}</small>
              </div>

              <div className="field-group full-span">
                <label>Thư mục lưu</label>
                <button className="folder-picker" type="button" onClick={handleSelectFolder}>
                  <FolderOpen size={18} />
                  <span>{folder || 'Chọn thư mục lưu…'}</span>
                  <strong>Chọn</strong>
                </button>
              </div>
            </div>
          )}

          {error && (
            <section className="error-card" role="alert">
              <strong>{error.title}</strong>
              <p>{error.message}</p>
              {error.suggestion && <small>{error.suggestion}</small>}
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
              {state === 'error' && (
                <button className="secondary-button" type="button" onClick={handleInspect}><RotateCcw size={18} /> Thử lại</button>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="app-footer">
        <span>DropSave {APP_VERSION}</span>
        <span className="footer-dot">•</span>
        <span>TuanTQ</span>
        <span className="footer-dot">•</span>
        <button className="footer-link" type="button" onClick={() => void openUrl('https://github.com/tqt97')}>GitHub /tqt97</button>
        <span className="footer-dot">•</span>
        <span>Chỉ tải nội dung bạn có quyền truy cập và lưu trữ.</span>
      </footer>
    </main>
  );
}

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}
