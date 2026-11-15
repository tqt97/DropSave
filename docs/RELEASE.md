# DropSave Release Guide

Current application version: **1.0.1**

Release tag convention đang sử dụng:

```text
v.1.0.1
```

## Release artifacts

Một release hoàn chỉnh gồm:

```text
DropSave-Windows-x64-Setup.exe
DropSave-macOS-Apple-Silicon.dmg
DropSave-macOS-Intel.dmg
```

## Windows local release

Double-click:

```text
windows/Build-DropSave.cmd
```

Hoặc:

```powershell
npm install
npm test
npm run desktop:build
```

Local Windows artifact:

```text
release/DropSave-Setup.exe
```

## GitHub Actions release

Workflow:

```text
.github/workflows/release-desktop.yml
```

CI build native trên:

- Windows x64
- macOS Apple Silicon
- macOS Intel

### Cách khuyên dùng — push tag

```bash
git checkout master
git pull origin master
git tag v.1.0.1
git push origin v.1.0.1
```

Workflow sẽ build 3 platform và attach artifact vào GitHub Release.

### Release đã tồn tại

Nếu GitHub Release đã được tạo thủ công trước:

1. Vào **Actions → Release Desktop → Run workflow**.
2. Chọn branch `master`.
3. Nhập `release_tag = v.1.0.1`.
4. Chạy workflow.

Job `Publish GitHub Release` sẽ attach đủ 3 artifact vào release tương ứng.

## v.1.0.1 release checklist

1. Version đồng bộ ở `package.json`, `tauri.conf.json`, `Cargo.toml` và UI.
2. `npm test` pass.
3. TypeScript/Vite build pass.
4. Windows x64 build pass.
5. macOS Apple Silicon build pass.
6. macOS Intel build pass.
7. Test URL public YouTube / Facebook / TikTok.
8. Test H.264-compatible download.
9. Test source HEVC/AV1 và compatibility conversion sang H.264/AAC.
10. Test Cancel khi yt-dlp đang chạy.
11. Test Cancel khi FFmpeg đang post-process.
12. Kiểm tra cleanup partial/temp output.
13. Kiểm tra disk-space preflight.
14. Kiểm tra notification và history.
15. Kiểm tra file trùng tên và suggested filename.

## Production distribution gates

Trước khi quảng bá rộng:

- Windows code signing.
- SmartScreen/reputation validation.
- macOS Developer ID signing.
- macOS notarization.
- Dependency/security review.
- Sidecar checksum/reproducibility review.

Release notes hiện tại: [RELEASE_NOTES_v.1.0.1.md](RELEASE_NOTES_v.1.0.1.md).
