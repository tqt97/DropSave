# Troubleshooting

## `rustc ENOENT`

Không cần cài Rust thủ công trên Windows nữa. Chạy:

```powershell
npm run bootstrap
```

hoặc double-click:

```text
windows/Build-DropSave.cmd
```

Bootstrap tự cài Rust và refresh Cargo PATH cho process build hiện tại.

## C++ linker / Windows SDK error

Chạy lại:

```powershell
npm run bootstrap
```

Bootstrap kiểm tra Visual Studio C++ Build Tools bằng `vswhere`. Nếu thiếu, nó tải Microsoft Build Tools bootstrapper và cài workload `Microsoft.VisualStudio.Workload.VCTools` với recommended components.

Có thể xuất hiện UAC confirmation; bấm **Yes** để tiếp tục.

## `npm` hoặc Node không tồn tại

Nếu dùng `windows/Build-DropSave.cmd`, script tự cài Node.js LTS qua winget khi có thể.

Nếu winget cũng không tồn tại, Windows cần Microsoft App Installer trước khi script có thể auto-install Node.

## `prepare-sidecars` download fail

Sidecar preparation is automatic. On Windows it downloads:

- `yt-dlp.exe` from the official yt-dlp GitHub release.
- FFmpeg release Essentials ZIP from gyan.dev.

The FFmpeg archive is cached under `.cache/sidecars/` and its SHA-256 is verified before extraction.

If a network/proxy/firewall interruption occurs:

```powershell
npm run prepare:sidecars
```

The script cleans incomplete `.download` files automatically. If the cached FFmpeg archive is corrupted, its SHA-256 will fail and the archive is removed instead of being bundled.

## `ffmpeg-static executable not found` on Windows

This error applied to an older V1 sidecar script. The Windows build no longer depends on `ffmpeg-static` being successfully populated by its npm post-install step.

Update to the current `scripts/prepare-sidecars.mjs` and run:

```powershell
npm run desktop:build
```

The current Windows flow downloads, verifies, extracts and bundles `ffmpeg.exe` automatically.

## FFmpeg merge fail at runtime

Rebuild the sidecars:

```powershell
npm run prepare:sidecars
npm run desktop:build
```

During sidecar preparation the script runs `ffmpeg.exe -version`. A bad executable therefore stops the build before an installer is produced.

## Build thành công nhưng không thấy installer

Kiểm tra:

```text
release/DropSave-Setup.exe
```

Nếu build trực tiếp bằng Tauri, artifact gốc nằm dưới một trong các folder:

```text
src-tauri/target/release/bundle/nsis/
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
```

## User thấy WebView2 prompt/download

Đây là prerequisite runtime của Tauri trên Windows. NSIS installer đã cấu hình WebView2 bootstrapper và tự xử lý trong quá trình cài.

## Private/login-only video

Đây là limitation V1. Không import cookie/password vào source code.

## SmartScreen cảnh báo Unknown publisher

Installer source hiện chưa code-sign. Production public release nên ký executable và installer bằng Windows code-signing certificate.

## `TS5096: allowImportingTsExtensions`

Nếu build dừng ở `tsconfig.node.json` với lỗi TS5096, cấu hình Node/Vite phải bật `noEmit: true` khi dùng `allowImportingTsExtensions`. Bản hiện tại đã cấu hình sẵn:

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

Không cần sửa thủ công trên máy build.

## npm báo install script của `esbuild` bị chặn

`esbuild` cần postinstall để chuẩn bị native binary dùng bởi Vite. Project chỉ approve đúng version `esbuild` đã review trong `package.json#allowScripts`; không bật chế độ cho phép mọi install script. `ffmpeg-static` đã được loại khỏi dependency Windows vì DropSave tự tải và verify FFmpeg sidecar.

## Windows build fails because `src-tauri/icons/icon.ico` is missing

**Symptom**

```text
src-tauri/icons/icon.ico not found; required for generating a Windows Resource file during tauri-build
```

**Cause**

Tauri needs a Windows `.ico` file when creating the executable resource. Older DropSave source packages did not include the generated icon set.

**Automatic recovery**

Current builds run:

```text
npm run prepare:assets
```

before sidecar preparation and Tauri compilation. The project tracks `src-tauri/icons/icon-512.png` as the source asset. If generated icons are missing, Tauri CLI regenerates the desktop icon set automatically.

No manual icon conversion is required.

## App mở kèm cửa sổ Terminal/Console trên Windows

Release build phải có dòng sau ở đầu `src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
```

Dòng này chỉ ẩn console ở release build. Khi chạy `tauri dev` từ Terminal, Terminal của developer vẫn tồn tại như bình thường.

`yt-dlp`/FFmpeg được chạy qua Tauri shell sidecar. Trên Windows, Tauri shell tạo child process với chế độ không mở console riêng.

## Nút “Mở vị trí tệp” không hoạt động

V1 hiện reveal file từ Rust backend bằng `tauri-plugin-opener`, thay vì gọi `openPath(folder)` trực tiếp từ frontend.

Nếu file đã bị di chuyển/xóa sau khi tải, DropSave sẽ báo lỗi và không cố mở một path không còn tồn tại.

## Tệp đã tồn tại

DropSave không ghi đè file hiện có. Nếu cùng `folder + filename + extension` đã tồn tại, app dừng trước khi chạy yt-dlp và yêu cầu đổi tên hoặc đổi thư mục.
