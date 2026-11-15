# Changelog

Tất cả thay đổi đáng chú ý của DropSave được ghi lại tại đây.

Format được tổ chức theo từng release để GitHub Release có thể giữ phần mô tả ngắn gọn, còn lịch sử kỹ thuật đầy đủ được lưu trong repository.

## [v.1.0.2] — Stability & UI Fixes

### Fixed

- Sửa layout cảnh báo codec để warning H.264 fallback nằm trên một hàng riêng, không làm lệch hai cột **Loại tải xuống / Chất lượng**.
- Sửa Windows local build lỗi `spawnSync npx.cmd EINVAL` bằng cách gọi trực tiếp Tauri CLI qua Node thay vì spawn `npx.cmd`.
- Sửa macOS DMG CI lỗi `hdiutil: Resource busy` bằng flow headless: build `.app` trước, sau đó tạo và verify DMG bằng `hdiutil`.

### Improved

- Giữ nguyên compatibility-first flow từ v.1.0.1: ưu tiên H.264/AAC và fallback convert khi source chỉ có HEVC/AV1.
- Ổn định hơn quy trình release Windows x64, macOS Apple Silicon và macOS Intel.
- UI codec warning responsive và cân đối hơn.

## [v.1.0.1] — Reliability & Compatibility

### Added

- Remember preferences: thư mục lưu, Video/Audio, quality và notification preference.
- Clipboard URL detection theo dạng gợi ý, không tự paste.
- Download history lưu local.
- Native desktop notification khi download hoàn tất.
- Disk-space preflight trước khi bắt đầu download.
- Đề xuất filename mới khi file đã tồn tại.

### Improved

- Video MP4 ưu tiên **H.264/AVC + AAC/M4A**.
- Tự chuyển HEVC/AV1 sang H.264/AAC bằng FFmpeg khi source không có H.264.
- Progress theo phase: preparing → checking disk space → downloading → retrying → post-processing → completed.
- Retry có giới hạn cho network, fragment và extractor errors.
- Friendly error mapping rõ ràng hơn.

### Fixed

- Cleanup `.part`, `.ytdl`, `.temp` và compatibility temp files khi cancel/fail.
- Cancel được cả yt-dlp và FFmpeg post-processing.
- Cleanup output chưa hoàn tất sau khi user cancel.
- Không ghi đè file đã tồn tại.

## [v.1.0.0] — Initial Release

### Added

- Desktop application cho Windows và macOS bằng Tauri 2 + React + TypeScript + Rust.
- Download media từ URL public được yt-dlp hỗ trợ.
- Hỗ trợ các nguồn phổ biến như YouTube, Facebook Video/Reel và TikTok.
- Video MP4 và Audio MP3.
- Chất lượng video: Best, tối đa 1080p, tối đa 720p.
- Metadata preview: title, thumbnail, uploader và duration.
- Auto/custom safe filename.
- Folder picker.
- Download progress, speed và ETA.
- Cancel download.
- Reveal file trong Explorer/Finder sau khi tải xong.
- Friendly error messages.
- yt-dlp và FFmpeg được bundle dưới dạng sidecar.
- Build artifacts:
  - Windows x64 NSIS installer.
  - macOS Apple Silicon DMG.
  - macOS Intel DMG.

### Initial limitations

- Chưa có browser cookies/login/private content.
- Chưa có playlist/batch/queue.
- Chưa có download history hoặc remember preferences.
- Chưa có advanced retry/cleanup policy.
- Chưa có codec compatibility conversion.
- Chưa có proxy/custom format/custom yt-dlp arguments.
- Chưa có auto-update downloader engine.
