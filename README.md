# Hướng dẫn đưa trang web lên GitHub Pages cá nhân

Chào **Longvd1999**, dưới đây là các bước để đưa ứng dụng học tiếng Anh của bạn lên internet miễn phí.

## Bước 1: Tạo Repository trên GitHub
1. Đăng nhập vào tài khoản GitHub của bạn: [github.com](https://github.com/)
2. Nhấn nút **New** (hoặc truy cập [github.com/new](https://github.com/new)) để tạo kho chứa mới.
3. Điền các thông tin sau:
   * **Repository name**: `easy-english`
   * **Public/Private**: Chọn **Public** (Bắt buộc chọn Public để dùng GitHub Pages miễn phí).
   * Không tích chọn bất kỳ ô nào khác (như Add a README file, .gitignore, license...).
4. Nhấp nút **Create repository** ở dưới cùng.

---

## Bước 2: Chạy file deploy.bat để đẩy code lên
1. Trong thư mục này, nhấp đúp chuột vào file **`deploy.bat`**.
2. Một cửa sổ dòng lệnh (CMD) sẽ hiện lên và thực hiện tự động các bước thiết lập Git.
3. Trình duyệt hoặc cửa sổ đăng nhập của GitHub sẽ xuất hiện yêu cầu bạn xác thực đăng nhập (Sign in with your browser). Bạn chỉ cần bấm đồng ý xác thực để cho phép đẩy mã nguồn lên.
4. Chờ dòng lệnh chạy xong và nhấn phím bất kỳ để đóng lại.

---

## Bước 3: Kích hoạt trang web chạy Online
Sau khi đẩy code lên thành công ở Bước 2:
1. Vào trang repository của bạn trên GitHub: `https://github.com/Longvd1999/easy-english`
2. Chọn tab **Settings** (Cài đặt) ở thanh menu trên cùng.
3. Chọn mục **Pages** ở danh sách menu bên trái.
4. Tại phần **Build and deployment** -> **Branch**:
   * Chuyển từ `None` sang **`main`** (hoặc `master`).
   * Giữ nguyên thư mục `/ (root)`.
   * Nhấn nút **Save**.
5. Đợi khoảng 1-2 phút, bạn tải lại trang Cài đặt Pages đó, bạn sẽ thấy một đường link màu xanh lá hiện lên ở phía trên cùng, dạng:
   👉 **`https://Longvd1999.github.io/easy-english/`**

Đây chính là địa chỉ trang web học tiếng Anh online của riêng bạn! Bạn có thể lưu lại và học trên mọi thiết bị kể cả điện thoại.
