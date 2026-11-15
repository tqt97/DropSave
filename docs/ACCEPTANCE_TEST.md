# DropSave v1.0.0 — Acceptance Test Matrix

Không mở rộng feature trước khi các gate P0 dưới đây đạt.

## 1. Clean-machine Windows

| Case | Windows 10 x64 | Windows 11 x64 | Kết quả |
|---|---|---|---|
| Cài từ `DropSave-Windows-x64-Setup.exe` | ☐ | ☐ | ☐ |
| User không có Node/Rust/FFmpeg | ☐ | ☐ | ☐ |
| Mở app không xuất hiện terminal | ☐ | ☐ | ☐ |
| WebView2 bootstrap hoạt động khi thiếu | ☐ | ☐ | ☐ |
| Uninstall sạch | ☐ | ☐ | ☐ |

## 2. Windows display scaling

Test cửa sổ ở chiều rộng 920px và các mức DPI:

| Scaling | 1366×768 | 1920×1080 | 920px window | Kết quả |
|---|---|---|---|---|
| 100% | ☐ | ☐ | ☐ | ☐ |
| 125% | ☐ | ☐ | ☐ | ☐ |
| 150% | ☐ | ☐ | ☐ | ☐ |

Pass khi: không horizontal scroll, không text overlap, action button luôn nhìn thấy, filename/path có ellipsis đúng và dialog không tràn màn hình.

## 3. Public URL matrix

Không hard-code assumption rằng website luôn hoạt động. yt-dlp cảnh báo extractor có thể hỏng khi website thay đổi.

| Nguồn | Video public | Best MP4 | 1080/720 fallback | MP3 | Filename | Kết quả |
|---|---|---|---|---|---|---|
| YouTube | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Facebook Reel/Video | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| TikTok | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

Ghi URL test, ngày test và version yt-dlp vào release evidence; không commit URL private/restricted.

## 4. Cancel / process lifecycle

- ☐ Cancel khi đang download network.
- ☐ Cancel khi progress gần 100%.
- ☐ Cancel khi yt-dlp đang gọi FFmpeg post-process.
- ☐ Không còn process `yt-dlp`/`ffmpeg` orphan sau 10 giây.
- ☐ Partial file được xử lý có chủ đích; không giả báo thành công.
- ☐ Có thể download lại ngay sau cancel.

## 5. Installer signing

- ☐ Windows installer được code-sign.
- ☐ Publisher hiển thị đúng.
- ☐ Signature hợp lệ sau download từ GitHub Release.
- ☐ macOS Developer ID + notarization trước public distribution.

## 6. Security / dependency

- ☐ `npm audit --omit=dev` được review.
- ☐ Không chạy `npm audit fix --force` tự động.
- ☐ Dependabot PR được review trước merge.
- ☐ Cargo dependency review.
- ☐ External binaries có nguồn/version/checksum rõ ràng.

## 7. Release inputs

- yt-dlp được pin trong `scripts/toolchain-manifest.json` và verify `SHA2-256SUMS` của release.
- FFmpeg Windows dùng archive versioned + SHA-256 của provider.
- macOS bundle dùng FFmpeg từ Homebrew trên clean GitHub runner, version được log ở build output; trước public production nên thay bằng artifact versioned/signed cố định nếu cần reproducibility tuyệt đối.
