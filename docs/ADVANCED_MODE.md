# Advanced Mode — Design & Safety Plan

Advanced Mode chứa các tính năng mạnh nhưng có failure surface và privacy cost cao hơn luồng tải public mặc định.

## Nguyên tắc

- Mặc định **tắt**.
- Không tự đọc cookies/session trình duyệt.
- Không lưu password hoặc cookie raw vào DropSave.
- Browser session chỉ được sử dụng sau hành động rõ ràng của người dùng.
- Proxy/custom arguments không được ghép thành shell string.
- Advanced options phải được validate thành argument list trước khi truyền cho yt-dlp.
- Luồng mặc định luôn ưu tiên trải nghiệm đơn giản và file dễ phát.

## Nhóm A — Authenticated sources

### Browser cookie import

UI dự kiến:

```text
Advanced Mode
  Cookies từ trình duyệt
  [Không dùng ▼]

  Chrome
  Edge
  Firefox
  Brave
```

DropSave chỉ truyền browser đã chọn cho yt-dlp trong phiên tải hiện tại. Không copy cookie database vào storage của app.

### Login / private content

Ưu tiên browser session hiện có thay vì tự xây form username/password.

Không nên lưu credential YouTube/Facebook trong DropSave.

### Embedded browser

Chỉ xem xét khi browser-cookie flow không giải quyết được use case. Embedded browser làm tăng đáng kể complexity, attack surface và maintenance cost.

## Nhóm B — Queue / playlist

- Playlist phải hiển thị số lượng item trước khi bắt đầu.
- Cho phép chọn/bỏ chọn item.
- Queue có pause/cancel từng item.
- Concurrency mặc định thấp; giới hạn tối đa 10 chỉ dành cho người dùng chủ động chọn.
- Không nên chạy 10 FFmpeg post-process đồng thời.
- Scheduler phải giới hạn riêng download concurrency và post-process concurrency.

## Nhóm C — Network

### Proxy

Chỉ nhận URL proxy hợp lệ qua field riêng.

Không log credential proxy.

### Retry

Core mode đã có bounded retry cho HTTP/fragment/extractor. Advanced mode có thể cho chỉnh retry count/cadence nhưng phải có giới hạn an toàn.

## Nhóm D — Format control

Power-user mode có thể hỗ trợ:

- Format ID như `137+140`.
- Custom yt-dlp arguments.
- Codec/container preferences.

Custom arguments phải đi qua allow/deny policy. Không chấp nhận shell operators hoặc command chaining.

## Thứ tự triển khai

1. Browser cookies với consent rõ ràng.
2. Playlist + queue model.
3. Concurrency scheduler.
4. Proxy.
5. Format selector UI.
6. Custom yt-dlp arguments.
7. Embedded browser — chỉ khi thực sự cần.

## Không thay đổi nguyên tắc mặc định

Core DropSave vẫn là:

```text
Paste URL
→ Preview
→ Video/Audio
→ Compatible output
→ Download
```

Advanced Mode không được làm luồng này phức tạp hơn.
