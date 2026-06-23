# Đề xuất chỉnh sửa giao diện Talent → Crownfunding → Donate

## Mục tiêu

Giao diện hiện tại đã có nền tảng tốt nhưng vẫn mang tính **"xem chiến dịch"** nhiều hơn là **"quản lý chiến dịch gây quỹ"**.

Cần điều chỉnh để Talent có thể:

* Tạo chiến dịch mới.
* Quản lý nhiều chiến dịch.
* Chia sẻ QR Donate dễ dàng.
* Theo dõi người đã chuyển khoản.
* Cập nhật tiến độ dự án.
* Quản lý giải ngân.

Đồng thời cần nhấn mạnh **QR Donate là thành phần quan trọng nhất của toàn bộ giao diện**.

---

# 1. Bổ sung nút "Tạo chiến dịch"

## Vấn đề hiện tại

Hiện giao diện chỉ hiển thị một chiến dịch đang tồn tại.

Không có cách nào để Talent tạo chiến dịch mới.

---

## Đề xuất

Thêm nút ở góc trên bên phải:

```text
----------------------------------------------------

QUỸ VƯƠNG MIỆN

[ + Tạo chiến dịch ]

----------------------------------------------------
```

Nếu Talent chưa có chiến dịch nào thì hiển thị Empty State:

```text
------------------------------------

Bạn chưa tạo chiến dịch gây quỹ.

[ + Tạo chiến dịch đầu tiên ]

------------------------------------
```

---

# 2. Bổ sung luồng tạo chiến dịch

## Flow đề xuất

```text
Talent

↓

Nhấn "Tạo chiến dịch"

↓

Mở Modal hoặc Drawer

↓

Nhập thông tin

↓

Lưu

↓

Hiển thị chiến dịch mới

↓

Sinh QR Donate

↓

Có thể chia sẻ ngay
```

---

## Form tạo chiến dịch

Các trường nên có:

* Ảnh bìa.
* Tên chiến dịch.
* Mô tả ngắn.
* Nội dung chi tiết.
* Mục tiêu gây quỹ.
* Ngày bắt đầu.
* Ngày kết thúc.

Nút cuối:

```text
[Tạo chiến dịch]
```

Không nên chuyển sang trang mới.

Ưu tiên dùng **Modal** để thao tác nhanh.

---

# 3. Đưa QR Donate lên vị trí trung tâm

## Vấn đề hiện tại

QR đang nằm ở cột phải với kích thước nhỏ.

Người dùng dễ chú ý vào Banner hơn là QR.

Trong khi mục tiêu chính của Talent là **chia sẻ QR để nhận quyên góp**.

---

## Đề xuất

Sau Banner, hiển thị một Card QR lớn.

```text
+------------------------------------------------------+

                MÃ QR GÂY QUỸ

            ┌────────────────┐
            │                │
            │      QR        │
            │                │
            └────────────────┘

https://onstage.vn/donate/abc

[ Sao chép liên kết ]

[ Tải QR ]

[ Chia sẻ ]

+------------------------------------------------------+
```

Card này nên chiếm khoảng 70–80% chiều ngang khu vực chính.

---

# 4. Thêm nút Chia sẻ

Ngoài nút tải QR cần có:

```text
[ Chia sẻ ]
```

Khi bấm mở menu:

* Facebook
* Zalo
* Instagram
* TikTok
* Sao chép liên kết

Giúp Talent quảng bá chiến dịch nhanh hơn.

---

# 5. Chỉnh lại phần thống kê

Hiện tại hợp lý nhưng nên bổ sung:

```text
Đã nhận

72.000.000 VNĐ

------------------

Mục tiêu

100.000.000 VNĐ

------------------

Lượt ủng hộ

185

------------------

Đã giải ngân

40.000.000 VNĐ

------------------

Còn khả dụng

32.000.000 VNĐ
```

---

# 6. Thay "Người ủng hộ gần đây" bằng "Lịch sử quyên góp"

## Vấn đề hiện tại

Danh sách đang thiên về bình luận.

Chưa thể hiện rõ các giao dịch thực tế.

---

## Đề xuất

Hiển thị dạng bảng hoặc danh sách:

```text
------------------------------------------------

LỊCH SỬ QUYÊN GÓP

------------------------------------------------

Nguyễn Văn A

+2.000.000 VNĐ

09:15 - 23/06/2026

-----------------------------------------------

Glow Beauty

+10.000.000 VNĐ

14:30 - 22/06/2026

-----------------------------------------------

Ẩn danh

+500.000 VNĐ

20:11 - 22/06/2026

-----------------------------------------------

CEO Minh Hằng

+5.000.000 VNĐ

18:05 - 21/06/2026
```

Mỗi bản ghi nên hiển thị:

* Avatar.
* Tên người chuyển khoản.
* Số tiền.
* Thời gian.
* Tin nhắn (nếu có).

Nếu chọn ẩn danh thì hiển thị:

```text
Ẩn danh
```

---

# 7. Nhật ký cập nhật

Giữ nguyên ý tưởng nhưng nên làm nổi bật hơn.

Thêm nút:

```text
[ + Viết cập nhật ]
```

Mỗi bài cập nhật gồm:

* Tiêu đề.
* Nội dung.
* Ảnh.
* Video.
* Ngày đăng.

---

# 8. Thêm menu quản lý chiến dịch

Ở góc Banner nên có menu:

```text
⋮

- Chỉnh sửa
- Sao chép liên kết
- Tải QR
- Kết thúc chiến dịch
- Xóa chiến dịch
```

Thay vì chỉ có icon nhỏ như hiện tại.

---

# 9. Điều chỉnh bố cục Desktop

Hiện tại:

```text
Banner | QR
```

Đề xuất:

```text
Banner (100%)

↓

QR Donate (100%)

↓

Thống kê

↓

Lịch sử quyên góp

↓

Nhật ký cập nhật

↓

Giải ngân
```

Như vậy mắt người dùng sẽ tập trung ngay vào QR.

---

# 10. Điều chỉnh Mobile

Thứ tự hiển thị:

```text
Banner

↓

QR Donate

↓

Thống kê

↓

Chia sẻ

↓

Lịch sử quyên góp

↓

Nhật ký cập nhật

↓

Giải ngân
```

QR luôn xuất hiện trước danh sách người ủng hộ.

---

# 11. Đề xuất Mapping Frontend (Tối giản)

Giữ nguyên cấu trúc hiện tại để tránh tạo quá nhiều file:

```text
app/
└── talent/
    └── crownfunding/
        ├── page.tsx
        ├── _components/
        │   ├── tabs.tsx
        │   ├── donate/
        │   │   ├── donate-tab.tsx      // Quản lý toàn bộ giao diện Donate
        │   │   ├── campaign-card.tsx   // Banner + QR + thống kê
        │   │   ├── activity-log.tsx    // Nhật ký cập nhật
        │   │   └── payout-dialog.tsx   // Popup giải ngân
        │   ├── rewards/
        │   ├── lending/
        │   └── equity/
        └── types.ts
```

**Không cần tạo thêm nhiều component nhỏ.** Toàn bộ phần:

* Tạo chiến dịch.
* QR Donate.
* Danh sách quyên góp.
* Popup tạo/chỉnh sửa.

có thể được quản lý trực tiếp trong `donate-tab.tsx` để giảm độ phức tạp của mã nguồn.

---

# 12. Mức độ ưu tiên triển khai

## P0 (Bắt buộc)

* Nút **+ Tạo chiến dịch**.
* Luồng tạo chiến dịch.
* Card **QR Donate** nổi bật.
* Nút **Sao chép / Tải QR / Chia sẻ**.
* Danh sách **Lịch sử quyên góp** (Tên + Số tiền + Thời gian).

## P1 (Nên có)

* Nhật ký cập nhật tiến độ.
* Menu quản lý chiến dịch.
* Chỉ số "Còn khả dụng để giải ngân".

## P2 (Có thể bổ sung sau)

* Chia sẻ trực tiếp lên mạng xã hội.
* Bộ lọc lịch sử quyên góp.
* Xuất báo cáo PDF.
* Hiển thị Top ủng hộ theo tuần/tháng.
