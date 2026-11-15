# Kiến trúc DropSave V1

## Mục tiêu

V1 tối ưu cho ba yếu tố: UX đơn giản, isolation phần download engine và khả năng mở rộng mà không đẩy business rule vào React component.

```text
┌──────────────────────────────┐
│ Presentation — React         │
│ URL / preview / settings     │
│ progress / error UX          │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Application Hook             │
│ useDownloader                │
│ state + orchestration        │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Domain                       │
│ URL policy / filename policy │
│ typed contracts              │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Infrastructure Adapter       │
│ downloader.ts                │
│ yt-dlp + progress protocol   │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Tauri scoped sidecars        │
│ yt-dlp + ffmpeg              │
└──────────────────────────────┘
```

## Tại sao không viết downloader riêng

Nguồn media thay đổi thường xuyên. V1 coi yt-dlp là một engine infrastructure, còn DropSave tập trung vào UX, policy, portability, error handling và lifecycle.

## Download lifecycle

```text
idle
  ↓
inspecting ──error
  ↓
ready
  ↓
downloading ──cancel→ ready
  │
  ├──error
  ↓
completed
```

## Metadata

`yt-dlp --dump-single-json` cung cấp metadata. UI chỉ nhận contract tối thiểu `VideoMetadata`, không truyền toàn bộ payload của yt-dlp vào component.

## Progress protocol

Download command dùng `--newline` và `--progress-template` với prefix riêng:

```text
__DROPSAVE_PROGRESS__<percent>|<downloaded>|<total>|<speed>|<eta>
```

Adapter parse protocol thành `DownloadProgress`. UI không parse stdout trực tiếp.

## Filename policy

- Unicode NFD normalization.
- Xóa combining accents.
- `đ/Đ` → `d/D`.
- lowercase.
- loại ký tự filesystem nguy hiểm.
- gom separator thành `-`.
- tối đa 120 ký tự cho basename.
- bảo vệ Windows device names.

## Security boundary

Tauri capability chỉ allow sidecars khai báo trước. URL đi vào argument array thay vì shell interpolation. V1 không đọc browser cookie hoặc credential.

## Mở rộng sau V1

Các feature có thể thêm mà không thay domain cốt lõi:

- Download queue.
- Browser cookies.
- Playlist/batch.
- History.
- Auto-update yt-dlp.
- Subtitle/thumbnail.
- Per-source capability policy.
