# Platform Support

## End user

| Platform | Artifact | Runtime cần cài thủ công |
|---|---|---|
| Windows 10/11 x64 | `DropSave-Windows-x64-Setup.exe` | Không |
| macOS Apple Silicon | `DropSave-macOS-Apple-Silicon.dmg` | Không |
| macOS Intel | `DropSave-macOS-Intel.dmg` | Không |

`yt-dlp` và FFmpeg được bundle cùng application.

## Build machine

Windows build sử dụng MSVC/Rust. macOS build sử dụng Xcode Command Line Tools/Rust. GitHub Actions setup phần toolchain và chạy build native trên từng OS.

## Media sources

DropSave tập trung vào URL public. UI nêu YouTube, Facebook và TikTok như các nguồn phổ biến. Engine yt-dlp hỗ trợ nhiều extractor khác, nhưng upstream cũng lưu ý rằng website thay đổi có thể làm extractor tạm thời hỏng; do đó compatibility phải được kiểm thử theo release thay vì xem danh sách hỗ trợ là SLA.
