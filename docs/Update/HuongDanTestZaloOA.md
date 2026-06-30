# Hướng dẫn kết nối và kiểm thử Zalo OA Webhook (Local & Docker)

Tài liệu này cung cấp hướng dẫn từng bước để cấu hình Zalo Official Account (OA) thật, liên kết với cổng webhook của Onstage Backend chạy dưới local Docker qua Ngrok.

---

## BƯỚC 1: Lấy thông tin App ID & Secret từ Zalo Developers
1. Truy cập trang quản trị nhà phát triển: [developers.zalo.me](https://developers.zalo.me/) và đăng nhập bằng tài khoản Zalo.
2. Chọn **Ứng dụng của tôi** (My Apps) ở góc trên bên phải -> Chọn ứng dụng dự án Onstage (nếu chưa có, ấn **Thêm ứng dụng mới**).
3. Vào mục **Cài đặt** (Settings) -> **Cài đặt chung** (General Settings).
4. Sao chép lại 2 thông tin bảo mật:
   * **App ID**
   * **App Secret**

---

## BƯỚC 2: Liên kết Zalo App với Zalo OA
1. Trong giao diện Zalo App, chọn mục **Official Account** -> **Quản lý liên kết** ở menu bên trái.
2. Nhấn nút **Liên kết OA** -> Chọn Zalo OA của bạn để gán quyền quản trị tin nhắn/sự kiện cho App này.
3. Truy cập trang quản lý Zalo OA [oa.zalo.me/manage](https://oa.zalo.me/manage), sao chép **OA ID** và **OA Secret Key** (nếu hệ thống yêu cầu).

---

## BƯỚC 3: Cấu hình Webhook trên Zalo Developers
1. Trong giao diện Zalo App, chọn mục **Webhook** ở menu bên trái.
2. Tại trường **Webhook URL**, điền URL ngrok của bạn (đã nối thêm endpoint `/api/webhooks/zalo`):
   ```text
   https://crispy-prewashed-preformed.ngrok-free.dev/api/webhooks/zalo
   ```
3. Nhấn **Kiểm tra/Test** hoặc **Cập nhật** để Zalo lưu URL này.
4. **Bật lắng nghe các sự kiện** bằng cách tích chọn:
   * `Người dùng quan tâm OA (follow)`
   * `Người dùng bỏ quan tâm OA (unfollow)`
   * `Người dùng gửi tin nhắn dạng văn bản (user_send_text)`
   * `Người dùng gửi tin nhắn dạng hình ảnh (user_send_image)`
5. Sao chép chuỗi **Webhook Secret** (Zalo hiển thị ngay trên trang cấu hình Webhook này) để làm khóa xác thực signature.

---

## BƯỚC 4: Cập nhật cấu hình ở Backend
Mở file `.env` ở thư mục `backend` và điền các thông tin bạn vừa lấy được vào cuối file:

```env
# Zalo OA Integration
ZALO_APP_ID=điền_app_id_ở_bước_1
ZALO_APP_SECRET=điền_app_secret_ở_bước_1
ZALO_OA_SECRET_KEY=điền_oa_secret_key_ở_bước_2
ZALO_WEBHOOK_SECRET=điền_webhook_secret_ở_bước_3
```

Vì backend chạy trong Docker, bạn cần khởi động lại container để tải cấu hình mới:
```bash
docker compose up -d --build
```

---

## BƯỚC 5: Theo dõi Logs và Tiến hành Test

### 1. Giả lập Webhook bằng Postman hoặc cURL (Nhanh nhất)
Nếu chưa cấu hình Zalo OA thật, bạn có thể gửi request cURL trực tiếp vào backend để test luồng logic vì hệ thống sẽ tự động bỏ qua xác thực chữ ký nếu không cấu hình key trong `.env`:

* **Test Follow OA:**
  ```bash
  curl -X POST http://localhost:8080/api/webhooks/zalo \
    -H "Content-Type: application/json" \
    -d '\''{
      "event_name": "follow",
      "app_id": "123456789",
      "timestamp": 1719648987,
      "sender": {
        "id": "zalo_test_user_id_111"
      },
      "recipient": {
        "id": "oa_test_id"
      }
    }'\''
  ```
  * **Kết quả:** Bảng `users` sẽ tạo mới 1 Ghost Talent Account, bảng `zalo_accounts` sẽ lưu liên kết, bảng `profiles` cũng tự động được khởi tạo.

* **Test Unfollow OA:**
  ```bash
  curl -X POST http://localhost:8080/api/webhooks/zalo \
    -H "Content-Type: application/json" \
    -d '\''{
      "event_name": "unfollow",
      "app_id": "123456789",
      "timestamp": 1719649987,
      "sender": {
        "id": "zalo_test_user_id_111"
      }
    }'\''
  ```
  * **Kết quả:** Cột `followed_at` trong bảng `zalo_accounts` của user tương ứng đổi thành `NULL`.

---

### 2. Test với Zalo OA thật bằng điện thoại
1. Chạy lệnh theo dõi log realtime trên container app:
   ```bash
   docker compose logs -f app
   ```
2. Dùng điện thoại quét mã QR của Zalo OA của bạn -> Nhấn **Quan tâm**.
   * Logs sẽ in ra thông báo `Zalo Webhook Received` và `Zalo OA User Follow...`.
   * Hãy kiểm tra trong DB để xác nhận tài khoản Talent và liên kết Zalo đã được tạo thành công.
3. Trên Zalo điện thoại, chọn **Bỏ quan tâm** (Unfollow).
   * Logs sẽ in thông báo unfollow.
   * Cột `followed_at` của bản ghi trong database chuyển thành `NULL`.
