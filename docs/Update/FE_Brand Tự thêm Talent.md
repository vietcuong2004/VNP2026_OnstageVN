# Kế hoạch cải tiến tính năng Quản lý Talent cho Agency/Brand

## Mục tiêu

Giảm tối đa rào cản khi Agency/Brand thêm talent vào hệ thống.

Thay vì bắt Talent phải tự đăng ký tài khoản trước rồi mới có thể tham gia roster, hệ thống cho phép Agency chủ động tạo và quản lý talent ngay lập tức.

---

# Vấn đề hiện tại

Luồng hiện tại:

```
Talent tự đăng ký
        │
        ▼
Tạo hồ sơ
        │
        ▼
Brand tìm kiếm
        │
        ▼
Gửi lời mời
        │
        ▼
Talent xác nhận
        │
        ▼
Tham gia roster
```

Nhược điểm:

* Không phù hợp với các Agency/Bầu show đã có sẵn đội ngũ talent.
* Mất nhiều thời gian onboarding.
* Brand phải chờ Talent tạo tài khoản trước mới có thể quản lý.

---

# Luồng đề xuất

Hệ thống hỗ trợ **2 cách thêm Talent**.

## 1. Thêm Talent từ hệ thống

Áp dụng khi Talent đã có tài khoản OnstageVN.

### Quy trình

```
Brand
    │
    ▼
Thêm từ hệ thống
    │
    ▼
Tìm kiếm Talent
    │
    ▼
Gửi lời mời
    │
    ▼
Talent xác nhận
    │
    ▼
Xuất hiện trong roster
```

Đây là luồng hiện có và vẫn được giữ nguyên.

---

## 2. Thêm Talent mới (Managed Talent)

Áp dụng khi Talent chưa từng sử dụng OnstageVN.

### Quy trình

```
Brand
    │
    ▼
Bấm "Thêm Talent mới"
    │
    ▼
Nhập thông tin cơ bản
    │
    ▼
Backend tự tạo Managed Account
    │
    ▼
Talent xuất hiện ngay trong roster
```

Không yêu cầu:

* Email
* Mật khẩu
* OTP
* Xác thực

---

# Thiết kế UI

## Hero

```
------------------------------------------------------------

                QUẢN LÝ TALENT

 Quản lý đội ngũ talent và cộng tác viên của bạn

        [+ Thêm Talent mới]

      [🔍 Thêm từ hệ thống]

------------------------------------------------------------
```

Trong đó:

* "Thêm Talent mới" là CTA chính.
* "Thêm từ hệ thống" là CTA phụ.

---

# Form Thêm Talent mới

Chỉ yêu cầu các thông tin tối thiểu:

* Ảnh đại diện (không bắt buộc)
* Họ và tên
* Ngày sinh hoặc tuổi
* Số điện thoại
* Địa chỉ / Khu vực
* Nghề nghiệp (Model / KOL / MC / PG / ...)
* Ghi chú (không bắt buộc)

Sau khi nhấn **Tạo Talent**, backend sẽ tự sinh tài khoản quản lý nội bộ.

---

# Thiết kế Backend

## Managed Account

Khi Brand tạo Talent mới, backend tạo:

```
User ID: 84521

Name: Nguyễn Văn A

Phone: 09xxxxxxxx

Status:
MANAGED

Owner:
Brand ABC
```

Không bắt buộc phải có:

* Email thật
* Password thật

Có thể lưu dưới dạng tài khoản chưa kích hoạt hoặc sử dụng email nội bộ phục vụ hệ thống.

---

# Trạng thái Talent

## Managed

* Được tạo bởi Brand.
* Chưa tự đăng nhập.
* Brand quản lý hoàn toàn.

---

## Linked

* Talent đã kích hoạt tài khoản.
* Có email hoặc Google Account riêng.
* Tiếp tục thuộc quyền quản lý của Brand.

---

## Invited

* Là Talent có sẵn trên hệ thống.
* Đã được mời nhưng chưa xác nhận.

---

## Active

* Talent đang hoạt động bình thường trong roster.

---

# Chuyển đổi sang tài khoản cá nhân

Trong tương lai, Brand có thể chọn:

```
Kích hoạt tài khoản
```

Sau đó hệ thống gửi thông tin hoặc đường dẫn để Talent:

* Thiết lập email thật.
* Đặt mật khẩu.
* Hoặc liên kết Google.

Sau khi hoàn thành:

```
Managed Account
        │
        ▼
Activated Account
        │
        ▼
Linked Google (nếu muốn)
```

Quan trọng:

* User ID không đổi.
* Profile không đổi.
* Portfolio không đổi.
* Booking không đổi.
* Lịch sử không đổi.

---

# Điều chỉnh giao diện Roster

Mỗi Talent nên hiển thị badge trạng thái.

Ví dụ:

```
[Linh Chi]

● Managed
```

```
[Minh Anh]

● Linked
```

```
[Talent A]

● Chờ xác nhận
```

---

# Quyền của Brand với Managed Talent

Được phép:

* Chỉnh sửa hồ sơ.
* Cập nhật ảnh.
* Cập nhật thông tin.
* Đăng chiến dịch.
* Gắn booking.
* Xóa khỏi roster.
* Kích hoạt tài khoản cho Talent.

---

# Lợi ích

## Đối với Agency

* Không cần yêu cầu Talent tự đăng ký.
* Có thể thêm hàng chục Talent trong vài phút.
* Phù hợp với mô hình quản lý truyền thống của các Bầu show.

## Đối với Talent

* Không bị ép tạo tài khoản ngay từ đầu.
* Chỉ cần kích hoạt khi thực sự muốn sử dụng nền tảng.

## Đối với hệ thống

* Giảm tỷ lệ bỏ cuộc khi onboarding.
* Tăng tốc độ nhập dữ liệu roster.
* Dễ mở rộng sang import Excel hoặc tạo hàng loạt trong tương lai.

---

# Định hướng mở rộng

Các phiên bản sau có thể bổ sung:

* Import Talent từ Excel/CSV.
* Tạo nhiều Talent cùng lúc.
* Chia sẻ link kích hoạt cho từng Talent.
* Đồng bộ Google Account sau khi kích hoạt.
* Theo dõi trạng thái kích hoạt của từng Talent.
* Chuyển quyền quản lý giữa các Agency nếu cần.
