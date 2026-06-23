# Thiết kế Frontend - Talent / Crownfunding / Donate

## 1. Mục tiêu

Tab **Donate** cho phép Talent tạo và quản lý chiến dịch gây quỹ của mình.

Đây là nơi Talent có thể:

* Tạo chiến dịch quyên góp.
* Chia sẻ mã QR nhận ủng hộ.
* Theo dõi tiến độ gây quỹ.
* Xem danh sách người ủng hộ.
* Đăng cập nhật tiến độ.
* Gửi yêu cầu giải ngân.
* Chỉnh sửa thông tin chiến dịch.

Thiết kế ưu tiên:

* Mobile First.
* Giao diện đơn giản.
* Ít thao tác.
* Có thể chia sẻ ngay lên mạng xã hội.

---

# 2. Cấu trúc trang

```
Talent
└── Crownfunding
    ├── Donate  #Hiện tại cần code ở đây
    ├── Rewards
    ├── Lending
    └── Equity
```

Tab **Donate** là tab mặc định.

---

# 3. Bố cục tổng thể

```
----------------------------------------------------

Tabs

[ Donate ] [ Rewards ] [ Lending ] [ Equity ]

----------------------------------------------------

Banner chiến dịch

----------------------------------------------------

QR Donate

----------------------------------------------------

Thống kê

----------------------------------------------------

Người ủng hộ

----------------------------------------------------

Nhật ký cập nhật

----------------------------------------------------

Giải ngân

----------------------------------------------------
```

Người dùng chỉ cần cuộn từ trên xuống dưới để quản lý toàn bộ chiến dịch.

---

# 4. Banner chiến dịch

Hiển thị:

* Ảnh bìa.
* Tên chiến dịch.
* Mô tả ngắn.
* Thanh tiến độ.
* Số tiền đã quyên góp.
* Mục tiêu gây quỹ.
* Số lượt ủng hộ.

Ví dụ:

```
+--------------------------------------------------+

[Cover Image]

Xây trường học cho trẻ em vùng cao

72%

█████████░░

72.000.000 / 100.000.000 VNĐ

185 người ủng hộ

[ Chỉnh sửa ]

+--------------------------------------------------+
```

Nếu chưa có chiến dịch:

```
Bạn chưa tạo chiến dịch.

[ Tạo chiến dịch ]
```

---

# 5. Khu vực QR Donate (Quan trọng nhất)

Đây là khu vực nổi bật nhất trên giao diện.

```
+--------------------------------+

           QR DONATE

      ┌──────────────┐
      │              │
      │      QR      │
      │              │
      └──────────────┘

https://domain.com/donate/demo

[ Sao chép liên kết ]

[ Tải ảnh QR ]

+--------------------------------+
```

Talent có thể:

* Copy link.
* Tải QR PNG.
* Chia sẻ lên Facebook.
* Chia sẻ lên TikTok.
* Chia sẻ lên Instagram Story.
* Chia sẻ qua Zalo.

---

# 6. Thống kê

Hiển thị dưới dạng 4 Card.

```
┌────────────┐
│ Đã nhận    │
│72.000.000  │
└────────────┘

┌────────────┐
│Mục tiêu    │
│100.000.000 │
└────────────┘

┌────────────┐
│Ủng hộ      │
│185         │
└────────────┘

┌────────────┐
│Đã giải ngân│
│40.000.000  │
└────────────┘
```

---

# 7. Danh sách người ủng hộ

Danh sách hiển thị theo thời gian mới nhất.

```
❤️ ABC Company

5.000.000 VNĐ

"Cố lên nhé!"

--------------------------

❤️ Ẩn danh

500.000 VNĐ

--------------------------

❤️ Nguyễn Văn A

1.000.000 VNĐ
```

Nếu người dùng chọn ẩn danh thì chỉ hiển thị:

```
Ẩn danh
```

Có nút:

```
[Xem tất cả]
```

---

# 8. Nhật ký cập nhật

Talent có thể đăng tiến độ sử dụng tiền quyên góp.

Ví dụ:

```
+--------------------------------+

Tiến độ xây móng

Hôm nay đội thi công đã hoàn thành...

[Ảnh]

[Ảnh]

23/06/2026

+--------------------------------+
```

Đầu danh sách có nút:

```
+ Thêm cập nhật
```

---

# 9. Popup thêm cập nhật

Form rất đơn giản.

```
Tiêu đề

----------------

Nội dung

----------------

+ Thêm ảnh

+ Thêm video

[ Đăng ]
```

Sau khi đăng xong sẽ xuất hiện ngay trong danh sách.

---

# 10. Giải ngân

Ở cuối trang hiển thị khu vực giải ngân.

```
--------------------------------

Đã giải ngân

40.000.000 VNĐ

Có thể yêu cầu

20.000.000 VNĐ

[ Yêu cầu giải ngân ]

--------------------------------
```

---

# 11. Popup yêu cầu giải ngân

```
Số tiền cần giải ngân

--------------------

Lý do

--------------------

+ Upload ảnh

+ Upload video

+ Upload tài liệu

[ Gửi yêu cầu ]
```

Sau khi gửi thành công:

```
Đã gửi yêu cầu.

Vui lòng chờ Admin xét duyệt.
```

---

# 12. Popup tạo hoặc chỉnh sửa chiến dịch

Thông tin gồm:

* Ảnh bìa.
* Tên chiến dịch.
* Mô tả ngắn.
* Nội dung chi tiết.
* Mục tiêu gây quỹ.
* Ngày bắt đầu.
* Ngày kết thúc.

Nút cuối:

```
[Lưu thay đổi]
```

---

# 13. Trạng thái giao diện

## Chưa có chiến dịch

```
Bạn chưa tạo chiến dịch.

[ Tạo chiến dịch ]
```

---

## Đang hoạt động

Hiển thị đầy đủ:

* Banner.
* QR.
* Thống kê.
* Người ủng hộ.
* Nhật ký.
* Giải ngân.

---

## Đã kết thúc

Hiển thị Badge:

```
Completed
```

Ẩn nút tạo QR mới.

Hiển thị:

```
Chiến dịch đã kết thúc.
```

---

# 14. Responsive

## Desktop

```
Banner

QR + Thống kê (2 cột)

Người ủng hộ

Nhật ký

Giải ngân
```

## Mobile

```
Banner

QR

Thống kê

Người ủng hộ

Nhật ký

Giải ngân
```

Mọi thành phần xếp thành một cột để dễ thao tác bằng một tay.

---

# 15. Nguyên tắc thiết kế

* Chỉ sử dụng **một route duy nhất**: `/talent/crownfunding`.
* Tab **Donate** là nơi quản lý toàn bộ chiến dịch.
* **QR Donate** phải là thành phần nổi bật nhất trên màn hình.
* Ưu tiên sử dụng popup (Modal/Drawer) thay vì chuyển sang nhiều trang mới.
* Hạn chế tạo file và component nhỏ; tập trung logic vào một màn hình để dễ phát triển và bảo trì trong giai đoạn đầu.
