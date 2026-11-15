# Dependency & Supply-chain Policy

## Nguyên tắc

- Không chạy `npm audit fix --force` tự động.
- Tách runtime dependency khỏi dev/build dependency khi đánh giá severity.
- Mọi binary bundle phải có nguồn rõ ràng và được verify trước khi đóng gói nếu provider có checksum.
- Không tải binary runtime vào máy người dùng sau khi cài nếu không có cơ chế update được ký/xác minh.

## Hiện tại

### yt-dlp

- Version pin: xem `scripts/toolchain-manifest.json`.
- Download từ immutable GitHub release tag.
- Verify SHA-256 bằng `SHA2-256SUMS` của chính release đó.

### FFmpeg Windows

- Version pin: xem `scripts/toolchain-manifest.json`.
- Archive URL versioned.
- Verify SHA-256 trước khi extract và bundle.

### FFmpeg macOS

- CI cài từ Homebrew clean runner và copy binary vào app sidecar.
- Build log ghi version thực tế.
- Đây là điểm chưa đạt reproducible tuyệt đối; nếu DropSave public rộng, nên chuyển sang binary release cố định + signature/checksum hoặc tự build/publish FFmpeg artifact nội bộ.

## CI audit

Workflow release chạy audit runtime dependency với `npm audit --omit=dev`. Audit được lưu làm evidence nhưng không tự sửa dependency. Critical/high finding phải được review trước production release.
