# DropSave — UI/UX Review

## Mục tiêu

DropSave là desktop utility cho người dùng không kỹ thuật. UI phải ưu tiên ba yếu tố: hiểu ngay, ít quyết định, lỗi có thể tự khắc phục.

## Nâng cấp đã áp dụng

### 1. Typography an toàn trên Windows/macOS

- Loại bỏ phụ thuộc trực tiếp vào `Avenir Next` vì không có mặc định trên Windows.
- Dùng system font stack có hỗ trợ tiếng Việt tốt:
  - `system-ui`
  - `-apple-system`
  - `Segoe UI`
  - `Noto Sans`
  - fallback sans-serif
- Giữ `font-synthesis: none` và antialiasing để tránh chữ đậm/nghiêng giả.

### 2. Responsive cho màn hình trung gian ~920px

Trước đây layout chỉ chuyển một cột ở 840px, khiến vùng 850–980px khá chật.

Chiến lược mới:

- `> 980px`: hero 2 cột.
- `621–980px`: hero 1 cột, workspace tối đa 760px.
- `421–620px`: settings chuyển 1 cột, action full-width.
- `<= 420px`: preview chuyển dọc, header/footer được thu gọn.

Window minimum width giảm xuống 640px để app vẫn sử dụng được trên cửa sổ nhỏ.

### 3. Tên file

- Có nút `i` giải thích rõ:
  - Tự động: lấy title từ video và slug hóa.
  - Tùy chỉnh: user tự đặt tên nhưng DropSave vẫn slug hóa.
  - Không ghi đè: nếu file tồn tại thì dừng và báo rõ.
- Extension được tách khỏi input:
  - Video: `.mp4`
  - Audio: `.mp3`
- User không cần tự nhập extension.

### 4. Trạng thái lỗi file tồn tại

Download được preflight ở native backend trước khi chạy `yt-dlp`.

Nếu file tồn tại:

> Tệp đã tồn tại
>
> Đã có tệp “example.mp4” trong thư mục đã chọn. DropSave không ghi đè tệp hiện có.

User được hướng dẫn đổi tên hoặc đổi thư mục.

### 5. Open location

Sau khi tải thành công, nút `Mở vị trí tệp` dùng API reveal của hệ điều hành để:

- Windows: mở Explorer và chọn file.
- macOS: mở Finder và chọn file.

Cách này rõ ràng hơn việc chỉ mở thư mục.

### 6. Native app behavior

Release Windows dùng `windows_subsystem = "windows"`, vì vậy khi user mở DropSave đã cài đặt sẽ chỉ có cửa sổ app, không có console/terminal đi kèm.

Tauri Shell cũng chạy sidecar với `CREATE_NO_WINDOW` trên Windows, nên yt-dlp/FFmpeg không cần cửa sổ console riêng.

## Các nâng cấp UI/UX tiếp theo nên ưu tiên

### P0 — Reliability UX

- Hiển thị file size dự kiến nếu metadata đủ dữ liệu.
- Phân biệt rõ các phase: chuẩn bị → tải → merge → hoàn tất.
- Toast nhỏ khi copy/paste/chọn folder thành công.
- Nút `Tải video khác` sau khi hoàn tất để reset form có chủ đích.
- Disable thay đổi mode/quality/name trong lúc tải.

### P1 — User convenience

- Ghi nhớ folder download gần nhất.
- Ghi nhớ mode/quality gần nhất.
- Auto-detect URL từ clipboard khi mở app nhưng không tự tải.
- Download history cục bộ với `Mở file`, `Mở vị trí`, `Tải lại`.

### P2 — Accessibility

- Full keyboard navigation.
- Focus ring rõ ràng.
- `aria-live` cho progress/error.
- Respect `prefers-reduced-motion`.
- Kiểm tra contrast ở 100%, 125%, 150% Windows scaling.

### P3 — Visual polish

- Logo/icon đồng bộ với installer và title bar.
- Empty state khi chưa có URL.
- Success state có file name + size + vị trí lưu.
- Optional light theme chỉ khi có nhu cầu thực tế; không nên ưu tiên trước reliability.

## Capability discovery

UI v1.0.0 có block nhỏ “DropSave có thể làm gì?” để user thấy ngay:

- YouTube / Facebook / TikTok public URL là các nguồn phổ biến.
- MP4 Best / ≤1080p / ≤720p.
- MP3 audio.
- Safe filename + no overwrite.

Block này phải ngắn, không biến intro thành documentation panel. Không hiển thị danh sách hàng nghìn extractor của yt-dlp.

## DPI / scaling acceptance

CSS responsive không đồng nghĩa đã pass Windows DPI. Release phải test thực tế 100%, 125%, 150% với 1366×768, 1920×1080 và cửa sổ khoảng 920px. Pass khi không horizontal scroll, không clipping và CTA vẫn truy cập được.
