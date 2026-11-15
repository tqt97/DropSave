# Cài đặt và build DropSave

## Người dùng cuối Windows

Không cài môi trường development.

Chỉ chạy:

```text
DropSave-Setup.exe
```

Installer xử lý app, sidecars và WebView2 prerequisite trong flow cài đặt.

## Developer Windows — cách khuyến nghị

Double-click:

```text
windows/Build-DropSave.cmd
```

Automation tự kiểm tra/cài phần build còn thiếu và tạo:

```text
release/DropSave-Setup.exe
```

Không cần cài Rust/MSVC thủ công trước.

Nếu Node chưa có, script cố gắng cài Node.js LTS qua winget. Khi Microsoft C++ Build Tools cần cài, Windows có thể hiện UAC confirmation.

## Developer Windows — terminal

Nếu npm đã chạy được:

```powershell
npm install
npm run doctor
npm run desktop:build
```

`desktop:build` chạy lần lượt:

```text
bootstrap build environment
→ prepare yt-dlp/FFmpeg sidecars
→ frontend build
→ Rust/Tauri build
→ NSIS setup EXE
```

## macOS developer

V1 automation sâu hiện tập trung cho Windows release. Trên macOS cần toolchain hệ thống:

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
brew install node
npm install
npm run desktop:dev
```

## Sidecar preparation

```bash
npm run prepare:sidecars
```

Script:

1. Đọc Rust host target triple.
2. Download yt-dlp standalone binary phù hợp.
3. Trên Windows, tự tải FFmpeg Essentials, verify SHA-256 và extract `ffmpeg.exe`.
4. Đặt tên binary theo Tauri sidecar target convention.
5. Set executable permission trên Unix.

## Commands

```bash
npm run dev
npm test
npm run build
npm run doctor
npm run bootstrap
npm run prepare:sidecars
npm run desktop:dev
npm run desktop:build
```

## Người dùng Windows chỉ muốn cài app

Không clone repository và không chạy các lệnh build. Tải `DropSave-Windows-x64-Setup.exe` từ GitHub Release theo hướng dẫn trong [`DOWNLOAD_WINDOWS.md`](DOWNLOAD_WINDOWS.md).
