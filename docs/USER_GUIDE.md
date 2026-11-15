# Hướng dẫn sử dụng DropSave V1

## Quy trình cơ bản

1. Mở video trên Facebook/YouTube/TikTok hoặc nguồn được yt-dlp hỗ trợ.
2. Copy liên kết video.
3. Mở DropSave.
4. Dán URL hoặc bấm biểu tượng clipboard.
5. Bấm **Kiểm tra video**.
6. Xác nhận thumbnail và title.
7. Chọn **Video** hoặc **Audio**.
8. Nếu tải video, chọn **Tốt nhất**, **1080p** hoặc **720p**.
9. Giữ tên tự động hoặc tắt **Tự động** rồi nhập tên riêng.
10. Chọn thư mục lưu.
11. Bấm **Tải xuống**.
12. Có thể bấm nút X trong tiến trình để hủy.
13. Khi hoàn tất, bấm **Mở thư mục**.

## Quy tắc tên file

Ví dụ:

```text
Hướng dẫn Laravel: Queue & Job #01 😍
```

được chuyển thành:

```text
huong-dan-laravel-queue-job-01.mp4
```

App loại bỏ dấu tiếng Việt, ký tự không an toàn và các Windows reserved names như `CON`, `NUL`, `COM1`.

## Chất lượng

- **Tốt nhất**: ưu tiên video/audio tốt nhất mà nguồn cho phép.
- **1080p**: không vượt quá 1080p.
- **720p**: không vượt quá 720p.
- **Audio**: xuất MP3, quality cao.

## Lỗi thường gặp

### Video cần đăng nhập

V1 không đọc cookie trình duyệt. Hãy thử URL public.

### Không có chất lượng đã chọn

Chọn **Tốt nhất** rồi thử lại.

### Video private/unavailable

Kiểm tra URL trong trình duyệt. Nếu trình duyệt cũng không xem được thì DropSave không thể tải.

### Mạng bị gián đoạn

Kiểm tra Internet và thử lại.

## Tên file trong V1

- Mặc định DropSave lấy tiêu đề video và tự tạo tên file an toàn.
- Bỏ chọn **Tự động** nếu muốn đặt tên riêng.
- Video luôn hiển thị đuôi `.mp4`; Audio hiển thị `.mp3`.
- Nếu file cùng tên đã tồn tại trong thư mục đích, DropSave không ghi đè và sẽ yêu cầu đổi tên hoặc thư mục.

## Sau khi tải xong

Chọn **Mở vị trí tệp** để mở Explorer/Finder và chọn đúng file vừa tải.

## App hỗ trợ gì?

DropSave tập trung vào URL công khai, với YouTube, Facebook và TikTok là các nguồn phổ biến để kiểm thử release. User có thể tải MP4 (Best / tối đa 1080p / tối đa 720p) hoặc MP3, đặt tên tự động/tùy chỉnh và chọn thư mục lưu.

Engine yt-dlp hỗ trợ nhiều website hơn, nhưng website có thể thay đổi nên một extractor có thể tạm thời không hoạt động. Hãy coi thông tin trong UI là capability chính, không phải lời cam kết rằng mọi URL của mọi website luôn tải được.

## GitHub

Trang tác giả: https://github.com/tqt97
