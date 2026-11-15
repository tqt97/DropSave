# DropSave

<p align="center">
  <strong>Cross-platform desktop media downloader cho Windows và macOS.</strong><br />
  Dán liên kết → chọn cách lưu → tải xuống. Không cần Terminal, yt-dlp hay FFmpeg riêng.
</p>

<p align="center">
  <a href="https://github.com/tqt97/DropSave/releases/latest"><img alt="Latest Release" src="https://img.shields.io/github/v/release/tqt97/DropSave?display_name=tag"></a>
  <img alt="Windows" src="https://img.shields.io/badge/Windows-10%20%2F%2011-0078D4?logo=windows11&logoColor=white">
  <img alt="macOS" src="https://img.shields.io/badge/macOS-Intel%20%2F%20Apple%20Silicon-000000?logo=apple&logoColor=white">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111">
</p>

<p align="center">
  <a href="https://github.com/tqt97/DropSave/releases/latest"><strong>Download</strong></a>
  ·
  <a href="docs/USER_GUIDE.md">Hướng dẫn sử dụng</a>
  ·
  <a href="docs/RELEASE_NOTES_v.1.0.1.md">v.1.0.1 Release Notes</a>
  ·
  <a href="docs/ROADMAP.md">Roadmap</a>
  ·
  <a href="https://github.com/tqt97">TuanTQ</a>
</p>

---

## DropSave là gì?

**DropSave** là ứng dụng desktop giúp tải media từ các URL công khai bằng giao diện trực quan, không cần sử dụng command line.

Stack chính:

- **Tauri 2 + Rust** cho desktop shell và native operations.
- **React 19 + TypeScript** cho giao diện.
- **yt-dlp** làm download engine.
- **FFmpeg** cho merge, remux, audio extraction và codec conversion.

yt-dlp và FFmpeg được bundle cùng ứng dụng. Người dùng cuối không cần tự cài Node.js, Rust, yt-dlp hay FFmpeg.

> DropSave chỉ dành cho nội dung mà bạn có quyền truy cập và lưu trữ. Người dùng chịu trách nhiệm tuân thủ điều khoản của nền tảng và pháp luật áp dụng.

## Tính năng hiện tại — v.1.0.1

### Nguồn phổ biến

DropSave có thể xử lý nhiều URL công khai mà yt-dlp hỗ trợ, bao gồm:

- YouTube
- Facebook Video / Reel
- TikTok
- Và nhiều website khác có extractor tương thích trong yt-dlp

Khả năng tương thích có thể thay đổi khi website nguồn thay đổi.

### Video / Audio

| Chế độ | Tuỳ chọn |
| --- | --- |
| Video | MP4 |
| Chất lượng | Tốt nhất tương thích, tối đa 1080p, tối đa 720p |
| Audio | MP3 |
| Tên file | Tự động từ title hoặc nhập thủ công |
| Thư mục lưu | Downloads mặc định hoặc thư mục được chọn |

### Compatibility-first output

Video mặc định ưu tiên:

```text
MP4
→ H.264 / AVC
+ AAC / M4A
```

Nếu nguồn không có H.264, DropSave có thể dùng FFmpeg chuyển codec sau khi tải để tăng khả năng phát trên Windows/macOS.

Trong phase này UI sẽ thông báo rõ rằng ứng dụng đang chuyển đổi codec và thời gian hoàn tất có thể lâu hơn.

## Reliability & daily UX

v.1.0.1 tập trung mạnh vào reliability và các case sử dụng hằng ngày:

- Nhớ **thư mục lưu**, **Video/Audio**, **quality** và tùy chọn notification.
- Phát hiện URL hợp lệ trong clipboard theo dạng **gợi ý**, không tự dán âm thầm.
- Retry có giới hạn cho lỗi network, fragment và extractor tạm thời.
- Cleanup file `.part`, `.ytdl`, `.temp`, file convert tạm và output chưa hoàn tất khi Cancel.
- Kiểm tra dung lượng ổ đĩa trước khi bắt đầu download.
- Progress theo phase: chuẩn bị → kiểm tra dung lượng → download → retry → FFmpeg → hoàn tất.
- Native notification khi download hoàn tất.
- Download history lưu local, không cần backend/cloud.
- Không ghi đè file cùng tên; DropSave đề xuất filename mới để người dùng xác nhận.
- Mở Explorer/Finder và reveal đúng file sau khi hoàn tất.
- Friendly error mapping cho lỗi login, unsupported URL, format, network và unavailable content.

## Download

### Windows x64

```text
DropSave-Windows-x64-Setup.exe
```

### macOS Apple Silicon

```text
DropSave-macOS-Apple-Silicon.dmg
```

### macOS Intel

```text
DropSave-macOS-Intel.dmg
```

**[→ Download bản mới nhất từ GitHub Releases](https://github.com/tqt97/DropSave/releases/latest)**

Hướng dẫn Windows: [docs/DOWNLOAD_WINDOWS.md](docs/DOWNLOAD_WINDOWS.md).

## Cách sử dụng

1. Mở DropSave.
2. Dán URL hoặc dùng gợi ý URL từ clipboard.
3. Chờ DropSave đọc metadata.
4. Chọn **Video** hoặc **Audio**.
5. Chọn quality nếu tải video.
6. Giữ tên file tự động hoặc nhập tên riêng.
7. Chọn thư mục lưu nếu cần.
8. Bấm **Tải xuống**.
9. Theo dõi phase download/post-process.
10. Khi hoàn tất, mở vị trí file trong Explorer/Finder nếu muốn.

## Platform support

| Platform | Architecture | Package | Trạng thái |
| --- | --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` | Supported |
| macOS | Apple Silicon | `.dmg` | Supported |
| macOS | Intel x64 | `.dmg` | Supported |
| Linux | — | — | Chưa nằm trong scope v.1.0.1 |

Chi tiết: [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md).

## Build từ source

### Developer requirements

- Node.js 22
- npm
- Rust / Cargo
- Native toolchain tương ứng với platform
- Các dependency Tauri yêu cầu

### Windows

```text
windows/Build-DropSave.cmd
```

Hoặc:

```powershell
npm install
npm run desktop:build
```

Kiểm tra môi trường:

```powershell
npm run doctor
```

### Development

```bash
npm install
npm run desktop:dev
```

### Test

```bash
npm test
```

## CI/CD

Workflow chính:

```text
.github/workflows/release-desktop.yml
```

GitHub Actions build native trên:

- Windows x64
- macOS Apple Silicon
- macOS Intel

Pipeline release:

```text
Source / Tag
    ↓
Windows x64 ───────────→ .exe
macOS Apple Silicon ───→ .dmg
macOS Intel ────────────→ .dmg
    ↓
GitHub Release
```

Workflow hỗ trợ:

- push tag `v*`;
- publish GitHub Release;
- manual workflow với `release_tag`;
- push `master` để validation build.

Build `master` cũ sẽ bị cancel khi commit mới tới để tránh queue CI dư thừa.

Xem [docs/CI_CD.md](docs/CI_CD.md) và [docs/RELEASE.md](docs/RELEASE.md).

## Kiến trúc

```text
React + TypeScript
       ↓
    Tauri IPC
       ↓
Rust desktop layer
       ↓
┌───────────────┬───────────────┐
│    yt-dlp     │    FFmpeg     │
│   sidecar     │    sidecar    │
└───────────────┴───────────────┘
       ↓
Local filesystem
```

Filesystem/process-sensitive operations được giữ ở native layer thay vì để UI thao tác trực tiếp.

Chi tiết: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Security & supply chain

- Không chạy shell command tùy ý từ input người dùng.
- URL được truyền dưới dạng argument thay vì ghép shell string.
- Không lưu password, cookie hoặc access token trong core mode.
- Không ghi đè file hiện có.
- yt-dlp được pin theo release và verify checksum khi chuẩn bị sidecar.
- FFmpeg Windows dùng versioned artifact và SHA-256 verification.
- Dependency audit được thực hiện có kiểm soát.
- Không tự chạy `npm audit fix --force`.
- Dependabot theo dõi npm, Cargo và GitHub Actions.

Chi tiết: [docs/SECURITY.md](docs/SECURITY.md).

## Advanced Mode

Các tính năng có privacy/security/complexity cao **chưa nằm trong core UI v.1.0.1**:

- Browser cookie import
- Login/session-assisted download
- Private/restricted content
- Playlist / batch / queue
- Concurrency scheduler
- Proxy
- Format selector như `137+140`
- Custom yt-dlp arguments
- Embedded browser

Thiết kế và safety plan: [docs/ADVANCED_MODE.md](docs/ADVANCED_MODE.md).

## Known limitations — v.1.0.1

- Chưa hỗ trợ browser cookies/login/private content trong core mode.
- Chưa có playlist/batch/queue nhiều download.
- Chưa có proxy/custom format/custom yt-dlp arguments trong UI.
- Chưa có auto-update yt-dlp engine sau khi app đã cài.
- Windows installer chưa có production code signing.
- macOS public distribution chưa có Developer ID signing + notarization.
- Linux chưa nằm trong scope hiện tại.

## Release quality gates

Trước khi mở rộng feature lớn, project tiếp tục ưu tiên:

- Clean-machine Windows 10/11.
- Display scaling 100% / 125% / 150%.
- Public URL matrix YouTube / Facebook / TikTok.
- Cancel lifecycle cả yt-dlp và FFmpeg.
- Case HEVC/AV1 → H.264/AAC compatibility conversion.
- Windows code signing.
- macOS signing + notarization.
- Reproducible sidecar verification.
- Verified downloader-engine update.

Checklist: [docs/ACCEPTANCE_TEST.md](docs/ACCEPTANCE_TEST.md).

## Documentation

| Tài liệu | Nội dung |
| --- | --- |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | Hướng dẫn sử dụng |
| [DOWNLOAD_WINDOWS.md](docs/DOWNLOAD_WINDOWS.md) | Tải/cài Windows |
| [INSTALLATION.md](docs/INSTALLATION.md) | Setup và cài đặt |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc hệ thống |
| [CI_CD.md](docs/CI_CD.md) | Build/release automation |
| [RELEASE.md](docs/RELEASE.md) | Quy trình release |
| [RELEASE_NOTES_v.1.0.1.md](docs/RELEASE_NOTES_v.1.0.1.md) | Release notes v.1.0.1 |
| [SECURITY.md](docs/SECURITY.md) | Security & supply chain |
| [TESTING.md](docs/TESTING.md) | Test strategy |
| [ACCEPTANCE_TEST.md](docs/ACCEPTANCE_TEST.md) | Acceptance matrix |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Xử lý lỗi |
| [PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md) | Platform matrix |
| [ROADMAP.md](docs/ROADMAP.md) | Hướng phát triển |
| [ADVANCED_MODE.md](docs/ADVANCED_MODE.md) | Advanced Mode design |
| [UI_UX_REVIEW.md](docs/UI_UX_REVIEW.md) | UI/UX review |

## Author

**TuanTQ**

GitHub: **[@tqt97](https://github.com/tqt97)**

Contributions, bug reports và đề xuất cải tiến được chào đón qua GitHub Issues / Pull Requests.

---

<p align="center">
  <strong>DropSave v.1.0.1</strong><br />
  Paste. Choose. Save.
</p>
