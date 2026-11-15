# DropSave — Windows Distribution

## Mục tiêu tuyệt đối

Người dùng cuối chỉ cần biết một file:

```text
DropSave-Setup.exe
```

Không yêu cầu người dùng cài hoặc biết về:

- Node.js / npm
- Rust / Cargo / rustup
- Visual Studio / Build Tools
- yt-dlp
- FFmpeg
- PowerShell command
- Terminal

## Kiến trúc phân phối

```text
MÁY BUILD
├── Node.js
├── Rust/Cargo
├── MSVC + Windows SDK
├── yt-dlp
└── FFmpeg
       ↓
   Tauri build
       ↓
DropSave-Setup.exe
       ↓
MÁY USER
├── WebView2: installer tự xử lý nếu thiếu
├── DropSave
├── yt-dlp sidecar
└── FFmpeg sidecar
```

Build dependency không được cài lên máy user.

## Một-click build trên Windows

Double-click:

```text
windows/Build-DropSave.cmd
```

Automation thực hiện:

1. Xác nhận Windows x64.
2. Nếu Node/npm thiếu: cài Node.js LTS bằng winget.
3. `npm install`.
4. `npm test` — nếu fail thì dừng, không tạo release lỗi.
5. `npm run bootstrap`:
   - cài Rust nếu thiếu;
   - refresh Cargo PATH ngay trong process hiện tại;
   - chọn `stable-msvc`;
   - add target `x86_64-pc-windows-msvc`;
   - kiểm tra Visual Studio C++ Build Tools;
   - thiếu thì tải official `vs_buildtools.exe` và cài `Microsoft.VisualStudio.Workload.VCTools`.
6. `npm run prepare:sidecars`:
   - tải yt-dlp;
   - lấy FFmpeg;
   - đặt đúng tên target triple mà Tauri yêu cầu.
7. `tauri build --bundles nsis`.
8. Copy kết quả về:

```text
release/DropSave-Setup.exe
```

9. File Explorer tự mở và select installer vừa tạo.

### Quyền Administrator

Build Tools của Microsoft có thể yêu cầu UAC. Automation tự mở elevated installer; người build chỉ cần bấm **Yes** khi Windows hỏi quyền.

Đây không phải yêu cầu của user cuối.

## npm commands

### Check-only

```powershell
npm run doctor
```

Không thay đổi máy; chỉ report môi trường.

### Auto-fix build environment

```powershell
npm run bootstrap
```

### Build installer

```powershell
npm run desktop:build
```

`desktop:build` tự bootstrap rồi mới prepare sidecars/build.

## User installation

User chỉ double-click:

```text
DropSave-Setup.exe
```

Tauri NSIS được cấu hình `currentUser`, và WebView2 dùng `embedBootstrapper`. Nếu runtime cần bổ sung, installer xử lý trong flow cài đặt.

Sau cài đặt, user mở DropSave từ Start Menu và sử dụng ngay.

## GitHub Actions

Workflow:

```text
.github/workflows/build-windows.yml
```

Manual:

```text
GitHub → Actions → Build Windows Installer → Run workflow
```

Artifact cuối:

```text
DropSave-Setup.exe
```

Release bằng tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Release chỉ attach file:

```text
DropSave-Setup.exe
```

## Production hardening trước public rộng

### Code signing

Unsigned installer có thể bị Microsoft SmartScreen cảnh báo. Production nên code-sign:

```text
DropSave executable
      ↓
code signing
      ↓
NSIS installer
      ↓
code signing
      ↓
public distribution
```

### Acceptance matrix

Test ít nhất:

- Windows 10 x64 sạch.
- Windows 11 x64 sạch.
- Máy có WebView2.
- Máy giả lập thiếu WebView2/runtime case nếu có thể.
- Username/path có Unicode.
- Downloads path bị đổi.
- Network chậm/mất mạng.
- Cancel giữa download.
- Video/audio Best/1080p/720p.


### FFmpeg sidecar acquisition

Windows builds do not require a globally installed FFmpeg. `npm run prepare:sidecars` downloads the current FFmpeg release Essentials ZIP, verifies the published SHA-256 checksum, extracts `ffmpeg.exe`, validates it with `ffmpeg -version`, and places it under the Tauri target-triple sidecar name. The archive is cached under `.cache/sidecars/` for later builds.

End users never perform this step; the resulting `DropSave-Setup.exe` already contains the required sidecars.
