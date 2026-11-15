# Tải DropSave cho Windows mà không cần tải source code

Người dùng Windows không cần clone repository, không cần Node.js, Rust, Visual Studio hay FFmpeg.

## Cách khuyến nghị: GitHub Releases

1. Mở repository DropSave trên GitHub.
2. Chọn **Releases** ở cột bên phải.
3. Mở phiên bản muốn dùng, ví dụ `v1.0.0`.
4. Trong **Assets**, tải đúng file:

```text
DropSave-Windows-x64-Setup.exe
```

5. Double-click file `.exe` và cài đặt.
6. Mở DropSave từ Start Menu hoặc shortcut.

Không tải các file `.dmg`; chúng dành cho macOS.

## Cách tải bản build từ GitHub Actions

Dùng khi bạn muốn test build mới chưa phát hành thành Release:

1. Vào tab **Actions** của repository.
2. Chọn workflow **Release Desktop**.
3. Mở workflow run đã thành công.
4. Kéo xuống mục **Artifacts**.
5. Tải artifact **DropSave-Windows-x64**.
6. GitHub tải về một file ZIP. Giải nén ZIP.
7. Bên trong có:

```text
DropSave-Windows-x64-Setup.exe
```

8. Double-click installer để cài.

> GitHub Actions artifacts là ZIP do GitHub đóng gói. Người dùng chỉ cần file `.exe` bên trong; không cần tải cả folder source của dự án.

## Nếu Windows SmartScreen cảnh báo

Khi installer chưa có certificate code signing, Windows có thể hiển thị `Unknown publisher`. Đây là hạng mục release cần hoàn thiện trước khi phát hành đại trà. Không nên hướng dẫn người dùng bỏ qua cảnh báo bảo mật như một quy trình mặc định.
