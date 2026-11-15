# DropSave — Development Roadmap

> Current release line: **v.1.0.1** — reliability & compatibility upgrade.

## Milestone A — Core usability & compatibility

### Đã triển khai

- URL validation + metadata/thumbnail preview.
- Video / Audio.
- Best / 1080p / 720p.
- Video MP4, audio MP3.
- **Ưu tiên H.264/AVC + AAC/M4A** để tăng khả năng phát trên Windows/macOS và thiết bị phổ thông.
- Auto/custom safe filename.
- Chặn overwrite và đề xuất filename mới khi trùng.
- Remember folder / Video-Audio / quality / notification preference.
- Clipboard URL detection theo dạng gợi ý, không tự dán âm thầm.
- Progress phase rõ: prepare → disk check → download → retry → post-process → complete.
- Retry có giới hạn cho network / fragment / extractor errors.
- Cleanup partial files khi cancel/fail.
- Disk-space preflight trước download.
- Desktop notification khi tải xong.
- Download history local.
- Reveal file sau download.
- Friendly error mapping.
- yt-dlp + FFmpeg sidecar.
- Windows/macOS CI build.

## Milestone B — Production stabilization

Cần hoàn thiện trước khi mở rộng feature lớn:

1. Clean-machine acceptance test Windows 10 + Windows 11.
2. Kiểm tra 100% / 125% / 150% display scaling.
3. Test Facebook / YouTube / TikTok public URL matrix.
4. Test cancel ở download và FFmpeg post-process.
5. Test TikTok/nguồn chỉ có HEVC/AV1 để verify automatic H.264/AAC compatibility conversion.
6. Windows code signing.
7. macOS Developer ID signing + notarization.
8. Dependency security audit có kiểm soát.
9. Reproducible sidecar verification cho cả Windows/macOS.
10. Auto-update yt-dlp engine có checksum/signature verification.

## Milestone C — Advanced Mode

Các tính năng có privacy/security/complexity cao được tách khỏi core UI.

Xem [ADVANCED_MODE.md](ADVANCED_MODE.md).

### Authenticated sources

- Browser cookie import theo opt-in.
- Login/session-assisted download.
- Private/restricted content khi user có quyền truy cập.
- Embedded browser chỉ xem xét khi browser-cookie flow không đủ.

### Queue / playlist

- Playlist lớn.
- Queue management.
- Per-item retry/cancel.
- Concurrency scheduler.
- Tối đa 10 download đồng thời chỉ khi người dùng chủ động chọn.
- Giới hạn riêng FFmpeg post-process concurrency.

### Network / power user

- Proxy.
- Format selector như `137+140`.
- Custom yt-dlp arguments có validation/deny-list.
- Subtitle / thumbnail / metadata options.

## Milestone D — Maintenance & updater

- yt-dlp engine health check.
- Verified engine update độc lập với app release.
- Application auto-update.
- Release notes + rollback strategy.
- Telemetry chỉ nếu có privacy model rõ ràng và opt-in; mặc định không cần.

## Product rule

DropSave không đặt mục tiêu trở thành một UI phơi toàn bộ option của yt-dlp.

Core flow vẫn là:

```text
Paste URL
→ Preview
→ Video/Audio
→ Compatible output
→ Download
```

Advanced Mode phải được thiết kế sao cho không làm luồng mặc định phức tạp hơn.
