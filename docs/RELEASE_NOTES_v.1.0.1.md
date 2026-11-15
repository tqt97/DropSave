# DropSave v.1.0.1

> Reliability, compatibility và daily-use upgrade.

v.1.0.1 tập trung vào việc làm cho DropSave ổn định hơn trong các tình huống sử dụng thực tế, đặc biệt là khả năng phát video sau khi tải, retry mạng, cleanup và UX hằng ngày.

## Highlights

### Video compatibility

- Video MP4 ưu tiên **H.264/AVC + AAC/M4A**.
- Nếu nguồn không có H.264, DropSave có thể tự chuyển codec bằng FFmpeg.
- Compatibility conversion dùng H.264 + AAC + `yuv420p` + `faststart` để tăng khả năng phát trên thiết bị phổ thông.
- UI thông báo rõ khi nguồn cần post-process lâu hơn.

### Remember preferences

DropSave nhớ:

- thư mục lưu;
- Video/Audio;
- quality;
- notification preference.

### Clipboard URL detection

- Khi mở app, URL hợp lệ trong clipboard được hiển thị dưới dạng gợi ý.
- DropSave không tự paste URL nếu người dùng chưa xác nhận.

### Smarter retry

- Retry có giới hạn cho network errors.
- Retry fragment download.
- Retry extractor errors.
- Có backoff thay vì retry liên tục không kiểm soát.
- UI có phase riêng khi đang retry.

### Safer cancellation & cleanup

- Cancel được cả yt-dlp và FFmpeg compatibility conversion.
- Cleanup `.part`, `.ytdl`, `.temp` và compatibility temp file.
- Output chưa hoàn tất của phiên bị Cancel được dọn best-effort.

### Disk-space preflight

- Kiểm tra dung lượng trống trước khi download.
- Dùng estimated filesize khi metadata có sẵn.
- Có safety threshold khi không xác định được filesize.

### Better progress phases

Progress hiện phân biệt:

```text
Preparing
→ Checking disk space
→ Downloading
→ Retrying
→ FFmpeg / post-processing
→ Completed
```

### Download completion notification

- Native desktop notification khi tải hoàn tất.
- Người dùng có thể bật/tắt preference này.

### Download history

- Lịch sử download được lưu local.
- Không cần account, cloud hay backend.
- Có thể mở lại vị trí file từ history.
- Có thao tác xóa history.

### Existing-file handling

- Không ghi đè file đã tồn tại.
- DropSave tìm filename khả dụng tiếp theo, ví dụ:

```text
video.mp4
→ video-2.mp4
```

- Tên mới chỉ được áp dụng sau khi người dùng xác nhận.

## UI / UX improvements

- Quality mặc định được mô tả rõ là **Tốt nhất tương thích**.
- Giải thích rõ H.264/AAC compatibility policy.
- Hiển thị warning khi source cần codec conversion.
- History panel và notification option được tích hợp vào main flow.
- Progress status rõ hơn trong retry/post-process.

## Build & CI improvements

- Windows x64, macOS Apple Silicon và macOS Intel tiếp tục được build native.
- Master validation dùng concurrency để cancel build cũ khi có commit mới.
- README/docs-only changes không kích hoạt desktop build.
- Release workflow hỗ trợ tag, GitHub Release event và manual `release_tag`.

## Advanced features chưa bật trong v.1.0.1

Những tính năng sau vẫn nằm trong Advanced Mode roadmap:

- browser cookie import;
- login/session-assisted download;
- private/restricted content;
- playlist/batch/queue;
- concurrent downloads;
- proxy;
- custom format selector;
- custom yt-dlp arguments;
- embedded browser.

Xem [ADVANCED_MODE.md](ADVANCED_MODE.md).

## Known limitations

- Chưa có auto-update yt-dlp engine sau khi app đã cài.
- Windows installer chưa có production code signing.
- macOS public distribution chưa có Developer ID signing + notarization.
- Linux chưa nằm trong scope hiện tại.
- Compatibility conversion có thể tốn thêm CPU/thời gian nếu source chỉ có HEVC/AV1.

## Upgrade recommendation

Người dùng v.1.0.0 nên nâng lên v.1.0.1 nếu thường tải TikTok/Facebook/YouTube hoặc từng gặp video MP4 có tiếng nhưng không có hình trên Windows.

## Artifacts

```text
DropSave-Windows-x64-Setup.exe
DropSave-macOS-Apple-Silicon.dmg
DropSave-macOS-Intel.dmg
```

## Author

**TuanTQ** — [github.com/tqt97](https://github.com/tqt97)
