# DropSave

<p align="center">
  <strong>Desktop media downloader đơn giản cho Windows và macOS.</strong><br />
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
  <a href="docs/ROADMAP.md">Roadmap</a>
  ·
  <a href="https://github.com/tqt97">TuanTQ</a>
</p>

---

## DropSave là gì?

**DropSave** là ứng dụng desktop giúp tải media từ các URL công khai bằng giao diện trực quan, không cần sử dụng command line.

Ứng dụng được xây dựng với:

- **Tauri 2 + Rust** cho desktop shell và native operations.
- **React + TypeScript** cho giao diện.
- **yt-dlp** làm download engine.
- **FFmpeg** cho merge, remux và xử lý audio/video.

yt-dlp và FFmpeg được đóng gói cùng ứng dụng, vì vậy người dùng cuối không cần tự cài các công cụ này.

> DropSave chỉ dành cho nội dung mà bạn có quyền truy cập và lưu trữ. Người dùng chịu trách nhiệm tuân thủ điều khoản của nền tảng và pháp luật áp dụng.

## DropSave có thể làm gì?

### Nguồn phổ biến

DropSave có thể xử lý nhiều URL công khai mà yt-dlp hỗ trợ, bao gồm:

- YouTube
- Facebook Video / Reel
- TikTok
- Và nhiều website khác có extractor tương thích trong yt-dlp

Khả năng tương thích có thể thay đổi khi website nguồn thay đổi. DropSave không cam kết mọi URL từ một nền tảng luôn tải được ở mọi thời điểm.

### Chế độ tải

| Chế độ | Tuỳ chọn |
| --- | --- |
| Video | MP4 |
| Chất lượng video | Best, tối đa 1080p, tối đa 720p |
| Audio | MP3 |
| Tên file | Tự động từ tiêu đề hoặc nhập thủ công |
| Thư mục lưu | Downloads mặc định hoặc thư mục do người dùng chọn |

Ngoài ra:

- Preview title, thumbnail, uploader và duration.
- Hiển thị progress, tốc độ tải và ETA.
- Cancel download đang chạy.
- Không tự ghi đè file đã tồn tại.
- Chuẩn hoá filename an toàn cho Windows/macOS.
- Mở Explorer/Finder và reveal đúng file sau khi tải xong.
- Hiển thị lỗi kỹ thuật bằng thông báo dễ hiểu hơn.

## Download

### Windows

Tải file:

    DropSave-Windows-x64-Setup.exe

Sau đó double-click installer và sử dụng DropSave như một ứng dụng Windows bình thường.

**Không cần cài:** Node.js, Rust, Visual Studio, yt-dlp hoặc FFmpeg.

### macOS — Apple Silicon

Dành cho Mac dùng Apple Silicon như M1, M2, M3, M4 và các thế hệ tương thích:

    DropSave-macOS-Apple-Silicon.dmg

### macOS — Intel

Dành cho Mac Intel:

    DropSave-macOS-Intel.dmg

### Tải bản mới nhất

**[→ Download DropSave từ GitHub Releases](https://github.com/tqt97/DropSave/releases/latest)**

Hướng dẫn Windows chi tiết: [docs/DOWNLOAD_WINDOWS.md](docs/DOWNLOAD_WINDOWS.md).

## Cách sử dụng

1. Mở DropSave.
2. Dán URL media.
3. Chờ DropSave đọc metadata.
4. Chọn **Video** hoặc **Audio**.
5. Chọn chất lượng nếu tải video.
6. Giữ tên file tự động hoặc chuyển sang tên tuỳ chỉnh.
7. Chọn thư mục lưu nếu cần.
8. Bấm **Tải xuống**.
9. Khi hoàn tất, mở vị trí file trong Explorer/Finder nếu muốn.

Nếu file cùng tên đã tồn tại, DropSave sẽ dừng trước khi ghi file và yêu cầu đổi tên hoặc chọn thư mục khác.

## Trải nghiệm mục tiêu

    Paste URL
       ↓
    Preview
       ↓
    Choose Video / Audio
       ↓
    Download
       ↓
    Open file location

Các option kỹ thuật của yt-dlp/FFmpeg được ẩn khỏi người dùng phổ thông thay vì đưa toàn bộ command-line options lên giao diện.

## Platform support

| Platform | Architecture | Package | Trạng thái |
| --- | --- | --- | --- |
| Windows 10/11 | x64 | NSIS .exe | Supported |
| macOS | Apple Silicon | .dmg | Supported |
| macOS | Intel x64 | .dmg | Supported |
| Linux | — | — | Chưa nằm trong scope v1.0.0 |

Chi tiết: [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md).

## Build từ source

### Requirements cho developer

Máy build cần các dependency phát triển tương ứng với platform:

- Node.js 22
- npm
- Rust / Cargo
- Toolchain native của platform
- Các dependency mà Tauri yêu cầu

Đây là **build-time dependencies**. Người dùng cài app không cần chúng.

### Windows

Cách đơn giản nhất:

    windows/Build-DropSave.cmd

Script sẽ tự kiểm tra/bootstrap phần lớn môi trường build còn thiếu và tạo NSIS installer.

Hoặc:

    npm install
    npm run desktop:build

Kiểm tra môi trường:

    npm run doctor

### Development

    npm install
    npm run desktop:dev

### Test

    npm test

## CI/CD

Workflow chính:

    .github/workflows/release-desktop.yml

GitHub Actions build native trên:

- Windows x64
- macOS Apple Silicon
- macOS Intel

Mỗi push vào **master** chạy validation build.

Release có thể được tạo bằng:

- push tag bắt đầu bằng **v**;
- publish GitHub Release;
- hoặc chạy workflow thủ công với **release_tag**.

Pipeline:

    Source / Tag
        ↓
    Windows x64 ───────────→ .exe
    macOS Apple Silicon ───→ .dmg
    macOS Intel ────────────→ .dmg
        ↓
    GitHub Release

Xem [docs/CI_CD.md](docs/CI_CD.md) và [docs/RELEASE.md](docs/RELEASE.md).

## Kiến trúc

    React + TypeScript
           ↓
       Tauri IPC
           ↓
    Rust desktop layer
           ↓
      yt-dlp + FFmpeg
        sidecars
           ↓
    Local filesystem

Các thao tác nhạy cảm với filesystem/process được giữ ở native layer thay vì giao trực tiếp cho UI.

Chi tiết: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Security & supply chain

DropSave áp dụng các nguyên tắc:

- Không chạy shell command tuỳ ý từ input của người dùng.
- URL được truyền dưới dạng argument thay vì ghép thành shell string.
- Không lưu password, cookie hoặc access token trong v1.
- Không ghi đè file hiện có.
- yt-dlp được pin theo release và verify checksum khi chuẩn bị sidecar.
- FFmpeg Windows dùng versioned artifact và SHA-256 verification.
- Dependency audit được thực hiện có kiểm soát.
- Không chạy npm audit fix --force tự động.
- Dependabot theo dõi npm, Cargo và GitHub Actions.

Chi tiết: [docs/SECURITY.md](docs/SECURITY.md).

## Release quality gates

Trước khi mở rộng feature lớn, project ưu tiên:

- Clean-machine test trên Windows 10 và Windows 11.
- Display scaling 100% / 125% / 150%.
- Public URL matrix cho YouTube / Facebook / TikTok.
- Cancel lifecycle trong download và FFmpeg post-process.
- Windows code signing.
- macOS signing + notarization cho public distribution.
- Dependency security audit.
- Reproducible sidecar build.
- Cleanup partial downloads.
- Disk-space preflight.
- Retry transient network errors.

Checklist đầy đủ: [docs/ACCEPTANCE_TEST.md](docs/ACCEPTANCE_TEST.md).

## Known limitations

v1.0.0 tập trung vào public media và trải nghiệm đơn giản:

- Chưa hỗ trợ login/private content bằng browser session.
- Chưa có playlist/batch download.
- Chưa có download history.
- Chưa có queue nhiều download.
- Chưa có auto-update download engine sau khi app đã được cài.
- Windows installer chưa có production code signing.
- macOS public release chưa có Developer ID notarization.

Các giới hạn này được giữ có chủ đích để ưu tiên reliability của luồng tải cơ bản trước khi mở rộng.

## Documentation

| Tài liệu | Nội dung |
| --- | --- |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | Hướng dẫn sử dụng |
| [DOWNLOAD_WINDOWS.md](docs/DOWNLOAD_WINDOWS.md) | Hướng dẫn tải/cài Windows |
| [INSTALLATION.md](docs/INSTALLATION.md) | Setup và cài đặt |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc hệ thống |
| [CI_CD.md](docs/CI_CD.md) | Build/release automation |
| [RELEASE.md](docs/RELEASE.md) | Quy trình release |
| [SECURITY.md](docs/SECURITY.md) | Security & supply chain |
| [TESTING.md](docs/TESTING.md) | Test strategy |
| [ACCEPTANCE_TEST.md](docs/ACCEPTANCE_TEST.md) | Release acceptance matrix |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Xử lý lỗi |
| [PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md) | Platform matrix |
| [ROADMAP.md](docs/ROADMAP.md) | Hướng phát triển |
| [UI_UX_REVIEW.md](docs/UI_UX_REVIEW.md) | UI/UX review |

## Roadmap

Thứ tự ưu tiên:

    Reliability
       ↓
    Updater / recovery
       ↓
    History & preferences
       ↓
    Queue / batch / playlist
       ↓
    Authenticated content

DropSave không đặt mục tiêu trở thành giao diện chứa toàn bộ option của yt-dlp. Product direction là giữ use case phổ biến đơn giản, còn tính năng nâng cao chỉ được bổ sung khi không làm giảm trải nghiệm chính.

Xem [docs/ROADMAP.md](docs/ROADMAP.md).

## Author

**TuanTQ**

GitHub: **[@tqt97](https://github.com/tqt97)**

Contributions, bug reports và đề xuất cải tiến đều được chào đón thông qua GitHub Issues / Pull Requests.

---

<p align="center">
  <strong>DropSave v1.0.0</strong><br />
  Paste. Choose. Save.
</p>
