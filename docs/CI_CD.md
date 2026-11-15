# CI/CD — Windows + macOS

Workflow: `.github/workflows/release-desktop.yml`

## Khi nào chạy

- Manual: GitHub → Actions → **Release Desktop** → Run workflow.
- Release: push tag `v*`.

Ví dụ:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Output

### Windows

```text
DropSave-Windows-x64-Setup.exe
```

### macOS

```text
DropSave-macOS-Apple-Silicon.dmg
DropSave-macOS-Intel.dmg
```

GitHub-hosted runner hiện có `windows-latest` x64, `macos-15` arm64 và `macos-15-intel` Intel, nên workflow build native trên đúng kiến trúc thay vì cross-compile.

## GitHub Release

Khi ref là tag `v*`, job `publish-release` tải 3 artifacts và attach chúng vào cùng GitHub Release.

## Code signing

Workflow hiện dùng ad-hoc signing (`APPLE_SIGNING_IDENTITY=-`) cho macOS để artifact test có signature cơ bản. Trước phát hành public:

- Windows: thêm certificate/code-signing secret.
- macOS: thêm Developer ID Application certificate + notarization secrets.

Ad-hoc signing không thay thế notarization.
