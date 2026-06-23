# Module Gây Quỹ Nhân Ái (Crownfunding - Donate)

Module này quản lý và hiển thị thông tin gây quỹ thiện nguyện (Crownfunding) của các Talent trên Onstage, được thiết kế theo phong cách hiện đại và hỗ trợ responsive toàn diện.

## Cấu trúc thư mục của Module

```text
app/talent/crownfunding/donate/
├── page.tsx                  # Component entry chính: điều phối State và kết nối dữ liệu
├── campaign-management.tsx   # Quản lý danh sách chiến dịch, Panel xem nhanh và form Tạo/Sửa
├── qr-donate.tsx             # Card QR VietQR, tải ảnh QR và các tính năng chia sẻ
├── donation-history.tsx      # Danh sách nhà hảo tâm đã quyên góp cùng thông tin chi tiết
├── activity-log.tsx          # Nhật ký tiến độ và cập nhật hoạt động thực địa
├── payout.tsx                # Luồng giải ngân tài chính và quản lý yêu cầu giải ngân kèm chứng từ
├── ui-layout.tsx             # Các Grid chỉ số thống kê (Stats Grid) và thành phần Layout chung
└── README.md                 # Hướng dẫn và tổng quan kiến trúc module
```

## Các component và vai trò chính

### 1. `page.tsx`
* Đóng vai trò là đầu mối (Container Component) điều phối toàn bộ state như: danh sách chiến dịch, lịch sử đóng góp, cập nhật hoạt động, yêu cầu giải ngân.
* Xử lý các handler chính: Thêm/Sửa/Xóa chiến dịch, Đăng cập nhật tiến độ mới, Tạo yêu cầu giải ngân mới.

### 2. `campaign-management.tsx`
* **`CampaignListPanel`**: Hiển thị danh sách chiến dịch hiện có của Talent với tính năng cuộn ngang (horizontal scroll) mượt mà trên mobile và dạng Grid trên desktop.
* **`CampaignDialog`**: Form modal cao cấp hỗ trợ tải lên tối đa 5 hình ảnh từ thiết bị với hiệu ứng Progress Bar trực quan.

### 3. `qr-donate.tsx`
* **`QrDonate`**: Chứa card QR VietQR trung tâm. Cung cấp chức năng sao chép link chuyển khoản nhanh, nút tải ảnh QR PNG, và menu chia sẻ trực quan lên mạng xã hội (Facebook, Instagram, Zalo...).

### 4. `donation-history.tsx`
* **`DonationHistory`**: Bảng vinh danh và lịch sử chi tiết các lượt quyên góp từ các nhà hảo tâm (hiển thị ẩn danh hoặc dạng thương hiệu đối tác nếu là Brand).

### 5. `activity-log.tsx`
* **`ActivityLog`**: Hiển thị dòng sự kiện (timeline) tiến trình thực hiện dự án nhân ái.
* **`UpdateDialog`**: Form đăng tải cập nhật hoạt động mới, đính kèm hình ảnh mô tả.

### 6. `payout.tsx`
* **`MilestoneList`**: Thống kê tài chính quỹ (Tổng nhận, Đã giải ngân, Còn khả dụng) và lịch sử yêu cầu rút tiền kèm trạng thái xét duyệt (Approved / Pending / Rejected).
* **`PayoutDialog`**: Form tạo yêu cầu giải ngân mới, đính kèm file hóa đơn/chứng từ thực tế của dự án.

### 7. `ui-layout.tsx`
* **`CampaignStatsGrid`**: Grid hiển thị 5 chỉ số tài chính và hoạt động cốt lõi của chiến dịch quyên góp.
