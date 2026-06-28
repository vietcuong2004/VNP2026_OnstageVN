# Kế hoạch chỉnh sửa giao diện Quản lý Talent (Phiên bản cuối)

# Mục tiêu

Giúp Brand có thể thêm và quản lý Talent một cách nhanh chóng, không yêu cầu Talent phải tự tạo tài khoản trước.

Triết lý thiết kế:

* Ưu tiên thao tác nhanh.
* Giảm tối đa số bước.
* Không ép nhập nhiều thông tin.
* Người dùng không cần hiểu các khái niệm kỹ thuật như "tài khoản", "user", "managed account".

---

# 1. Chỉnh sửa khu vực Header

## Hiện tại

Chỉ có một nút:

```text
+ Thêm Talent
```

Người dùng không biết nút này dùng để:

* Thêm Talent mới.
* Hay thêm Talent đã có trên hệ thống.

---

## Đề xuất

Thay bằng hai nút hành động độc lập.

```text
┌────────────────────────────────────────────────────────────┐

                     Talent của tôi

      Quản lý toàn bộ Talent thuộc Brand của bạn

      [+ Thêm Talent mới]   [🔍 Thêm từ hệ thống]

└────────────────────────────────────────────────────────────┘
```

### ➕ Thêm Talent mới

Dùng khi:

* Đây là Talent của Brand.
* Chưa có tài khoản OnstageVN.
* Muốn tạo nhanh để quản lý.

### 🔍 Thêm từ hệ thống

Dùng khi:

* Talent đã có tài khoản OnstageVN.
* Muốn liên kết vào Brand hiện tại.

---

# 2. Luồng "Thêm Talent mới"

## Mục tiêu

Toàn bộ quá trình hoàn thành trong khoảng 20–30 giây.

Không yêu cầu người dùng nhập quá nhiều thông tin.

---

## Form đề xuất

```text
──────────────────────────────

THÊM TALENT MỚI

Họ và tên *

[________________________]

Số điện thoại

[________________________]

Khu vực

[ Hà Nội ▼ ]

Nghề nghiệp

[ Model ▼ ]

        [Tạo Talent]

──────────────────────────────
```

## Không yêu cầu

* Email
* Mật khẩu
* Username
* CCCD
* Link Facebook
* Link TikTok
* Chiều cao
* Cân nặng
* Portfolio
* Video giới thiệu

Các thông tin này có thể cập nhật sau.

---

# 3. Luồng "Thêm từ hệ thống"

Hiển thị modal tìm kiếm:

```text
──────────────────────────────

Tìm Talent

[________________________]

──────────────────────────────

○ Linh Chi

○ Minh Anh

○ Thanh Hương

        [Thêm vào Brand]

──────────────────────────────
```

Sau khi Talent chấp nhận lời mời, hồ sơ sẽ xuất hiện trong danh sách quản lý của Brand.

---

# 4. Cơ chế Backend

Khi Brand bấm "Tạo Talent":

* Backend tạo một bản ghi mới trong bảng `users`.
* Gán `user_id` duy nhất.
* Đặt trạng thái là `managed`.
* Chưa yêu cầu email hoặc mật khẩu.
* Gắn `owner_brand_id` tương ứng.

Ví dụ:

```text
users

id: 84521

display_name: "Linh Chi"

phone: "0988888888"

login_status: "managed"

owner_brand_id: 18

email: NULL

password_hash: NULL
```

Từ thời điểm này, toàn bộ hệ thống (booking, chat, campaign, notification...) đều sử dụng `user_id` này.

---

# 5. Sau khi tạo thành công

Hiển thị thông báo:

```text
────────────────────────────

✅ Đã thêm Talent thành công

Bạn có thể bắt đầu quản lý Talent ngay bây giờ.

Thông tin chi tiết có thể bổ sung sau.

         [Hoàn tất]

────────────────────────────
```

Không yêu cầu người dùng thực hiện thêm bước nào khác.

---

# 6. Hiển thị trên danh sách Talent

Các Talent mới tạo vẫn xuất hiện bình thường.

Ví dụ:

```text
┌──────────────────────────────┐

🟡 Managed

Linh Chi

📍 Hà Nội

🎭 Model

[Chỉnh sửa]

└──────────────────────────────┘
```

Badge `Managed` chỉ mang ý nghĩa nội bộ để phân biệt đây là Talent do Brand tạo.

---

# 7. Hoàn thiện hồ sơ sau

Sau khi tạo, Brand có thể bổ sung:

* Ảnh đại diện
* Chiều cao
* Cân nặng
* Ngày sinh
* Mạng xã hội
* Portfolio
* Video giới thiệu
* Kinh nghiệm làm việc
* Giá booking

Không bắt buộc phải nhập ngay khi tạo.

---

# 8. Kích hoạt tài khoản cho Talent

Khi Talent muốn tự sử dụng OnstageVN, Brand có thể gửi lời mời kích hoạt.

Talent sẽ:

* Thêm email thật.
* Thiết lập mật khẩu hoặc đăng nhập bằng Google.

Sau khi hoàn tất:

```text
Managed
      │
      ▼
Activated
```

`user_id` vẫn giữ nguyên, toàn bộ dữ liệu và lịch sử được bảo toàn.

---

# 9. Nguyên tắc thiết kế

* Chỉ hiển thị những trường thật sự cần thiết.
* Tạo trước, hoàn thiện sau.
* Giảm số lần click.
* Không yêu cầu hiểu kiến thức kỹ thuật.
* Không bắt buộc Talent phải đăng ký mới được quản lý.
* Mọi dữ liệu đều xoay quanh một `user_id` duy nhất để dễ mở rộng và bảo trì.

---

# 10. Kết luận

Phiên bản cuối cùng của giao diện sẽ có **hai nút chính**:

## ➕ Thêm Talent mới

* CTA chính.
* Dành cho Talent chưa có trên hệ thống.
* Chỉ cần nhập 4 thông tin cơ bản.
* Backend tạo `Managed Account` và hiển thị ngay trong danh sách.

## 🔍 Thêm từ hệ thống

* CTA phụ.
* Dành cho Talent đã có tài khoản OnstageVN.
* Brand tìm kiếm và gửi lời mời liên kết vào danh sách quản lý.

Thiết kế này phù hợp với thói quen sử dụng của các Brand/Bầu show, giảm đáng kể thời gian onboarding, đồng thời vẫn đảm bảo kiến trúc dữ liệu nhất quán và khả năng mở rộng trong tương lai.
