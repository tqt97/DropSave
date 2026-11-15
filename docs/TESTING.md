# Test strategy

## Automated tests hiện có

```bash
npm test
```

Bao phủ V1 domain rule quan trọng:

- Vietnamese filename slug.
- Unsafe character removal.
- Windows reserved device names.
- fallback filename.
- URL protocol validation.

## Bắt buộc trước release

```bash
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## Manual acceptance matrix

| Case | macOS | Windows | Expected |
|---|---|---|---|
| Public Facebook Reel | ☐ | ☐ | metadata + MP4 |
| Public YouTube video | ☐ | ☐ | metadata + MP4 |
| Audio mode | ☐ | ☐ | MP3 |
| Best quality | ☐ | ☐ | success |
| 1080p | ☐ | ☐ | <=1080p |
| 720p | ☐ | ☐ | <=720p |
| Vietnamese custom name | ☐ | ☐ | safe slug |
| `CON` filename | ☐ | ☐ | `con-file` |
| Cancel at 10–50% | ☐ | ☐ | process killed |
| Open destination | ☐ | ☐ | native file manager |
| Invalid URL | ☐ | ☐ | friendly validation |
| Private video | ☐ | ☐ | friendly auth/access error |
| Offline network | ☐ | ☐ | friendly network error |

## Release gate

Không phát hành nếu:

- Có TypeScript error.
- Unit test fail.
- Tauri `cargo check` fail.
- Sidecar không chạy trên một trong hai OS mục tiêu.
- Cancel để lại orphan yt-dlp process.
- App yêu cầu user tự cài yt-dlp hoặc FFmpeg.
