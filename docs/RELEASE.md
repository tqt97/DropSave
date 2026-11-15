# Release guide

## Windows local release

Không cần setup toolchain thủ công. Double-click:

```text
windows/Build-DropSave.cmd
```

Hoặc khi Node/npm đã sẵn sàng:

```powershell
npm install
npm test
npm run desktop:build
```

Artifact thân thiện được copy về:

```text
release/DropSave-Setup.exe
```

Chỉ file này được đưa cho người dùng cuối.

## Windows CI release

Pipeline:

```text
checkout
→ setup Node
→ setup Rust
→ npm install
→ npm test
→ prepare sidecars
→ tauri build --bundles nsis
→ rename/copy DropSave-Setup.exe
→ upload artifact/release
```

Khi push tag `v*`, GitHub Release attach trực tiếp:

```text
DropSave-Setup.exe
```

## Windows production checklist

1. Build trên Windows CI/runner.
2. Code-sign executable và installer.
3. Test clean Windows 10/11 x64.
4. Verify install/uninstall/reinstall.
5. Verify WebView2 bootstrap behavior.
6. Verify sidecars tồn tại sau cài đặt và download hoạt động.
7. Kiểm tra SmartScreen/reputation.
8. Scan installer bằng antivirus/malware pipeline phù hợp trước release.

## macOS production

Khuyến nghị:

1. Build trên macOS runner.
2. Developer ID signing.
3. Hardened runtime.
4. Notarization với Apple.
5. Test Apple Silicon và Intel nếu hỗ trợ cả hai.
