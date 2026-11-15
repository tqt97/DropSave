# DropSave — Development Roadmap

> Product version hiện giữ nguyên **v1.0.0** trong quá trình hoàn thiện V1.

## Milestone A — V1 Production Stabilization

Mục tiêu: một người dùng phổ thông có thể cài, tải video và xử lý lỗi phổ biến mà không cần Terminal.

### Đã có

- URL validation.
- Metadata + thumbnail preview.
- Video / Audio.
- Best / 1080p / 720p.
- MP4 mặc định cho video, MP3 cho audio.
- Auto/custom safe filename.
- Chặn overwrite file tồn tại.
- Folder picker.
- Progress + cancel.
- Reveal file sau download.
- Friendly errors.
- yt-dlp + FFmpeg sidecar.
- Windows installer tự xử lý WebView2.
- Windows app không mở console ở release.
- Automated Windows build bootstrap.

### Cần hoàn thiện trước khi mở rộng feature

1. Clean-machine acceptance test Windows 10 + Windows 11.
2. Kiểm tra 100% / 125% / 150% display scaling.
3. Test Facebook / YouTube / TikTok public URL matrix.
4. Kiểm tra cancel ở phase download và FFmpeg post-process.
5. Code signing Windows installer.
6. Dependency security audit có kiểm soát; không dùng `npm audit fix --force` mù quáng.
7. Pin/checksum yt-dlp và FFmpeg release rõ ràng hơn cho reproducible build.

## Milestone B — Reliability & Maintenance

Ưu tiên cao nhất sau V1 ổn định.

- Auto-update **yt-dlp engine** độc lập với app release.
- Kiểm tra engine version + health check.
- Retry có backoff cho lỗi network tạm thời.
- Download history local.
- Persist user settings: folder, quality, mode.
- Cleanup partial files khi cancel/fail.
- Detect disk space trước download lớn.
- Better post-processing progress cho FFmpeg.

Lý do: website thay đổi thường xuyên; engine update và khả năng recovery có giá trị hơn việc thêm nhiều website-specific UI.

## Milestone C — Authentication-sensitive Sources

- Browser session/cookie integration theo opt-in.
- Không lưu cookie thô lâu dài nếu không cần.
- Giải thích rõ quyền truy cập và privacy.
- Private/age/region restricted content handling.

Đây là feature có security/privacy cost cao nên không đưa vào ngay sau V1 nếu public download vẫn là use case chính.

## Milestone D — Power User

- Batch URL.
- Download queue.
- Concurrency limit.
- Playlist selector.
- Subtitle download.
- Thumbnail save.
- Per-item retry/cancel.

## Milestone E — Distribution

- macOS `.dmg` production build.
- Apple Developer ID signing + notarization.
- Windows code signing.
- Auto-update application.
- Release notes + rollback strategy.

## Không nên ưu tiên sớm

- Account/cloud backend.
- Đồng bộ đa thiết bị.
- Theme system phức tạp.
- Plugin architecture.
- Tự reverse-engineer Facebook/YouTube thay cho yt-dlp.

Những phần này tăng maintenance nhưng chưa giải quyết vấn đề cốt lõi của người dùng.

## Release-readiness gate trước feature mới

Không thêm playlist/batch/authentication trước khi hoàn thành `ACCEPTANCE_TEST.md`:

1. Clean-machine Windows 10 + 11.
2. Scaling 100% / 125% / 150%, đặc biệt cửa sổ ~920px.
3. YouTube / Facebook / TikTok public URL matrix.
4. Cancel trong download và FFmpeg post-process; không để orphan process.
5. Windows code signing; macOS Developer ID + notarization trước public distribution.
6. Runtime dependency audit có review, không `npm audit fix --force` tự động.
7. Pin + checksum/signature cho external binaries ở mức phù hợp production.

### Sau gate này

- P1: downloader engine update có xác minh, retry/transient error policy, cleanup partial files, disk-space preflight.
- P1: download history và remember user preferences.
- P2: clipboard URL detection, keyboard shortcuts, queue/batch.
- P3: authenticated/restricted content sau security/privacy review.
