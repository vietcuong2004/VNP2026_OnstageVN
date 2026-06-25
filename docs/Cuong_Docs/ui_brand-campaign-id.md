# Cập nhật kế hoạch bố cục trang Chi tiết Campaign

## Mục tiêu

Tối ưu bố cục để tận dụng không gian màn hình ngang, nhóm các thông tin liên quan lại với nhau và giữ nguyên toàn bộ dữ liệu, tính năng hiện có.

---

# 1. Hero mở rộng (Hero + KPI)

Thay vì để một khối "Thống kê nhanh" riêng bên dưới, các chỉ số quan trọng sẽ được tích hợp trực tiếp vào Hero.

## Hero bao gồm

### Thông tin chính

* Nút quay lại.
* Tên Campaign.
* Loại Campaign.
* Trạng thái.
* Mô tả ngắn.

### Các nút thao tác

* Quyết toán.
* Đóng Campaign.

### KPI nhanh

Đặt thành một hàng ở cuối Hero:

* 📍 Địa điểm
* 👥 Ứng viên (ví dụ: 3/6)
* 👁️ Lượt xem

Ví dụ:

```text
┌──────────────────────────────────────────────────────────────┐

← Quay lại

Job của Cường
Tuyển cộng tác viên

Chụp ảnh, quay phim theo yêu cầu.

[ Quyết toán ]   [ Đóng Campaign ]

──────────────────────────────────────────────────────────────

📍 Hà Nội        👥 3/6 ứng viên        👁️ 120 lượt xem

└──────────────────────────────────────────────────────────────┘
```

Việc tích hợp KPI vào Hero giúp giảm một khối giao diện riêng và người dùng nắm được thông tin quan trọng ngay khi mở trang.

---

# 2. Hàng thông tin chính

## Bên trái (7 cột)

### Thông tin tuyển chọn

* Bắt đầu Campaign.
* Kết thúc Campaign.
* Sự kiện chính.
* Hạn ứng tuyển.
* Vị trí tuyển.
* Lĩnh vực.

## Bên phải (5 cột)

### Mô tả chung

* Ngân sách.
* Yêu cầu.
* Phúc lợi.
* Đầu việc.

```text
┌───────────────────────────────┬─────────────────────────────┐
│                               │                             │
│   Thông tin tuyển chọn        │      Mô tả chung            │
│                               │                             │
└───────────────────────────────┴─────────────────────────────┘
```

Đây là hai nhóm thông tin mô tả Campaign nên cần được hiển thị cạnh nhau.

---

# 3. Khối "Mời Talent tham gia Campaign"

Đây nên là một module độc lập với thiết kế nổi bật hơn.

## Bố cục đề xuất

### Bên trái

* Affiliate Link.
* Nút Copy Link.
* Nút Chia sẻ (nếu có).

### Bên phải

* QR Code lớn.
* Nút tải xuống QR Code.

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ Mời Talent tham gia Campaign                                 │
│                                                              │
│ ┌──────────────────────┐    ┌───────────────────────────┐    │
│ │ Affiliate Link       │    │        QR CODE            │    │
│ │                      │    │                           │    │
│ │ https://onstage.vn/  │    │        ████████           │    │
│ │ ref/xxxx             │    │        █ ▓ ▓ █            │    │
│ │                      │    │        ████████           │    │
│ │ [Copy Link]          │    │                           │    │
│ │                      │    │ [Tải xuống QR]            │    │
│ └──────────────────────┘    └───────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Lý do

* Nhiều Talent sử dụng điện thoại và có thể quét QR trực tiếp.
* Brand có thể in QR lên poster, standee hoặc gửi qua mạng xã hội.
* Có nút tải QR giúp sử dụng trong các tài liệu truyền thông mà không cần tự tạo lại.

---

# 4. Bộ ảnh Campaign

Giữ nguyên chức năng hiện tại:

* Upload ảnh.
* Chỉnh sửa.
* Xóa.
* Hiển thị danh sách ảnh.

Chiếm toàn bộ chiều ngang để tận dụng không gian.

---

# 5. Nhân sự Campaign

Giữ nguyên toàn bộ giao diện hiện có.

Bao gồm:

* Người phụ trách.
* Talent tham gia.
* Tiến độ.
* Thông tin liên hệ.
* Các nút thao tác.

Không thay đổi vị trí.

---

# Bố cục tổng thể sau khi redesign

```text
┌──────────────────────────────────────────────────────────────┐
│ HERO                                                        │
│ - Tên Campaign                                              │
│ - Trạng thái                                                │
│ - Nút thao tác                                              │
│ - KPI: Địa điểm | Ứng viên | Lượt xem                       │
└──────────────────────────────────────────────────────────────┘

┌───────────────────────────────┬─────────────────────────────┐
│ Thông tin tuyển chọn          │ Mô tả chung                 │
└───────────────────────────────┴─────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Mời Talent tham gia Campaign                                │
│ ┌──────────────────────┐  ┌───────────────────────────────┐ │
│ │ Affiliate Link       │  │ QR Code                      │ │
│ │ [Copy Link]          │  │ [Tải xuống QR]               │ │
│ └──────────────────────┘  └───────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Bộ ảnh Campaign                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Nhân sự Campaign                                             │
└──────────────────────────────────────────────────────────────┘
```

# Kết quả mong muốn

* KPI quan trọng được hiển thị ngay trong Hero, giúp giảm số lượng card và tăng tính trực quan.
* "Thông tin tuyển chọn" và "Mô tả chung" được đặt cùng một hàng để tận dụng chiều ngang của màn hình.
* Module "Mời Talent tham gia Campaign" trở nên chuyên nghiệp hơn với **Affiliate Link + QR Code + nút tải QR**, hỗ trợ tốt cho việc chia sẻ trên cả desktop lẫn thiết bị di động.
* Toàn bộ trang ngắn gọn hơn, cân đối hơn và tận dụng tối đa không gian hiển thị trên màn hình ngang.
