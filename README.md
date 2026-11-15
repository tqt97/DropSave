# DropSave

**Version:** v1.0.0  
**Author:** TuanTQ  
**GitHub:** /tqt97

DropSave là desktop app Windows/macOS giúp người dùng tải media qua giao diện đơn giản, không cần Terminal. V1 dùng **Tauri + React + TypeScript + yt-dlp + FFmpeg**.

> Chỉ tải nội dung mà bạn có quyền truy cập và lưu trữ. Người dùng chịu trách nhiệm tuân thủ điều khoản của nền tảng và pháp luật áp dụng.

## Trải nghiệm mục tiêu

### Người dùng cuối Windows

Chỉ nhận **một file duy nhất**:

```text
DropSave-Setup.exe
```

Flow:

```text
Double-click DropSave-Setup.exe
        ↓
NSIS kiểm tra/cài WebView2 khi cần
        ↓
Cài DropSave + yt-dlp + FFmpeg
        ↓
Mở DropSave
        ↓
Paste URL → Download
```

Người dùng cuối **không cần** Node.js, npm, Rust, Cargo, Visual Studio Build Tools, yt-dlp hay FFmpeg.

## Tính năng V1

- Paste URL và kiểm tra URL cơ bản.
- Đọc metadata bằng yt-dlp: title, thumbnail, uploader, duration.
- Preview trước khi tải.
- Tải video MP4 hoặc audio MP3.
- Chọn Best / tối đa 1080p / tối đa 720p.
- Tên file tự động hoặc custom.
- Chuẩn hóa tên file an toàn Windows/macOS, có xử lý Windows reserved names.
- Mặc định lưu vào Downloads; có thể chọn thư mục khác bằng native dialog.
- Progress bar, speed, ETA.
- Cancel tiến trình tải.
- Mở Explorer/Finder và reveal đúng tệp sau khi tải xong.
- Map lỗi kỹ thuật thành thông báo dễ hiểu.
- yt-dlp và FFmpeg được bundle dạng Tauri sidecar khi build.

## Windows — build tự động

### Cách đơn giản nhất

Double-click:

```text
windows/Build-DropSave.cmd
```

Script tự động:

1. Kiểm tra Windows x64.
2. Kiểm tra Node.js/npm; thiếu thì cài Node.js LTS bằng winget.
3. Chạy `npm install`.
4. Chạy unit test.
5. Bootstrap Rust/Cargo.
6. Ép Rust MSVC toolchain phù hợp.
7. Kiểm tra Visual Studio C++ Build Tools; thiếu thì tải official bootstrapper và cài workload C++.
8. Tải yt-dlp sidecar.
9. Chuẩn bị FFmpeg sidecar.
10. Build Tauri NSIS installer.
11. Copy artifact cuối về:

```text
release/DropSave-Setup.exe
```

Windows có thể hiện **một UAC confirmation** khi cần cài Microsoft C++ Build Tools. Đây là build dependency và chỉ xảy ra trên máy build, không xảy ra trên máy người dùng cuối.

### Build từ terminal

Nếu Node/npm đã có:

```powershell
npm install
npm run desktop:build
```

`desktop:build` tự chạy bootstrap trước khi build.

Kiểm tra môi trường mà không sửa gì:

```powershell
npm run doctor
```

Chỉ bootstrap/cài phần thiếu:

```powershell
npm run bootstrap
```

## GitHub Actions

`.github/workflows/build-windows.yml` build trên Windows runner và chỉ phát hành artifact cuối:

```text
DropSave-Setup.exe
```

Khi push tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Release sẽ nhận trực tiếp `DropSave-Setup.exe`.

## Cấu trúc automation

```text
scripts/
├── build-env.mjs
├── check-build-environment.mjs
├── bootstrap-build-environment.mjs
└── prepare-sidecars.mjs

windows/
├── Build-DropSave.cmd
└── build-dropsave.ps1
```

Build machine:

```text
Build-DropSave.cmd
  ↓
Node/npm
  ↓
Rust/Cargo + MSVC
  ↓
Visual C++ Build Tools
  ↓
yt-dlp + FFmpeg
  ↓
Tauri / NSIS
  ↓
release/DropSave-Setup.exe
```

End-user machine:

```text
DropSave-Setup.exe
  ↓
WebView2 if needed
  ↓
DropSave + bundled sidecars
```

## Tài liệu

- `docs/INSTALLATION.md`
- `docs/USER_GUIDE.md`
- `docs/ARCHITECTURE.md`
- `docs/TESTING.md`
- `docs/RELEASE.md`
- `docs/TROUBLESHOOTING.md`
- `docs/WINDOWS_DISTRIBUTION.md`
- `docs/UI_UX_REVIEW.md`
- `docs/ROADMAP.md`

## Nguyên tắc bảo mật V1

- Không chạy command shell tùy ý do người dùng nhập.
- Chỉ cấp quyền spawn/execute cho sidecar đã khai báo.
- URL được truyền thành argument, không ghép thành shell string.
- Không lưu cookie, password hoặc token.
- Không cài toolchain development trên máy người dùng cuối.
- CSP được giới hạn cho UI desktop.

## Known limitations V1

- Chỉ nhắm tới URL public; chưa hỗ trợ browser cookies/login.
- Chưa có playlist/batch download.
- Chưa có download history.
- Chưa có auto-update riêng cho yt-dlp sau khi app đã cài.
- Chưa ký Windows installer trong source mẫu; SmartScreen có thể cảnh báo publisher chưa xác minh.

## DropSave làm được gì?

DropSave v1.0.0 tập trung vào trải nghiệm tải media public đơn giản, không yêu cầu người dùng biết command line:

- Nguồn phổ biến: YouTube, Facebook Video/Reel, TikTok và các extractor khác mà yt-dlp có thể xử lý.
- Video: MP4, chất lượng tốt nhất / tối đa 1080p / tối đa 720p.
- Audio: MP3.
- Preview metadata trước khi tải.
- Tên file tự động hoặc tùy chỉnh, slug an toàn Windows/macOS.
- Không ghi đè file đã tồn tại.
- Chọn thư mục lưu, progress, cancel và mở vị trí tệp sau khi hoàn tất.

> Compatibility với website nguồn không phải cam kết cố định: website có thể thay đổi và làm extractor tạm thời hỏng. Release production phải chạy URL acceptance matrix.

## Download cho người dùng

- Windows: xem [`docs/DOWNLOAD_WINDOWS.md`](docs/DOWNLOAD_WINDOWS.md).
- CI/CD Windows + macOS: xem [`docs/CI_CD.md`](docs/CI_CD.md).
- Platform support: xem [`docs/PLATFORM_SUPPORT.md`](docs/PLATFORM_SUPPORT.md).

GitHub: https://github.com/tqt97

## Release gates trước khi mở rộng feature

Xem [`docs/ACCEPTANCE_TEST.md`](docs/ACCEPTANCE_TEST.md). Các gate P0 gồm clean-machine Windows 10/11, scaling 100/125/150%, public URL matrix, cancel lifecycle, signing, dependency audit và supply-chain verification.
