# ONSTAGE VN

# TÀI LIỆU THIẾT KẾ UI/UX

# BRAND PORTAL

Phiên bản: 1.0

---

# 1. GIỚI THIỆU

## 1.1 Mục tiêu hệ thống

Brand Portal là hệ thống dành cho:

* Nhãn hàng
* Agency
* Công ty tổ chức sự kiện
* Doanh nghiệp
* Bộ phận Marketing
* Bộ phận HR

Cho phép:

* Tìm kiếm Talent
* Quản lý Talent
* Đăng chiến dịch tuyển dụng
* Tuyển chọn ứng viên
* Theo dõi hiệu quả tuyển dụng
* Quản lý ngân sách

---

# 2. CẤU TRÚC ĐIỀU HƯỚNG

```text
/app/brand

├── dashboard
├── talents
│   ├── search
│   ├── saved
│   ├── compare
│   └── profile
│
├── campaigns
│   ├── list
│   ├── create
│   ├── detail
│   └── applicants
│
├── messages
├── analytics
├── team
├── billing
├── notifications
└── settings
```

---

# 3. APP SHELL

Toàn bộ hệ thống sử dụng chung App Shell.

## 3.1 Sidebar

Chiều rộng:

* Expanded: 280px
* Collapse: 80px

### Thành phần

Logo

Menu:

* Trang tổng quan
* Talent
* Chiến dịch
* Tin nhắn
* Báo cáo
* Thành viên
* Thanh toán
* Cài đặt

Footer:

* Avatar
* Tên doanh nghiệp
* Gói thành viên

---

## 3.2 Top Bar

Chiều cao:

80px

### Thành phần

Ô tìm kiếm toàn cục

Placeholder:

"Tìm Talent, chiến dịch..."

Thông báo

Tin nhắn

Avatar người dùng

---

# 4. TRANG TỔNG QUAN

Route:

```text
/app/brand/dashboard
```

---

## 4.1 Mục tiêu

Giúp nhà tuyển dụng nhìn thấy toàn bộ hoạt động tuyển dụng trên một màn hình.

---

## 4.2 Bố cục

```text
KPI Cards
Funnel
Applications
Calendar
Recommendations
```

---

# 4.3 KPI Cards

Hiển thị 4 card.

## Card 1

Tiêu đề:

Chiến dịch đang hoạt động

Dữ liệu:

* Tổng số chiến dịch
* So sánh tháng trước

---

## Card 2

Tiêu đề:

Ứng viên nhận được

Dữ liệu:

* Tổng số ứng viên
* Tăng giảm %

---

## Card 3

Tiêu đề:

Đã tuyển thành công

Dữ liệu:

* Số lượng Talent xác nhận

---

## Card 4

Tiêu đề:

Ngân sách sử dụng

Dữ liệu:

* Đã chi
* Còn lại

---

# 4.4 Phễu tuyển dụng

Các giai đoạn:

Ứng tuyển

↓

Đã chọn lọc

↓

Phỏng vấn

↓

Đã duyệt

↓

Đã xác nhận

---

# 4.5 Ứng viên mới nhất

Bảng dữ liệu

Cột:

* Talent
* Chiến dịch
* Điểm phù hợp
* Trạng thái
* Ngày ứng tuyển

---

# 4.6 Talent được đề xuất

Hiển thị:

10 Talent phù hợp nhất

Mỗi Card gồm:

* Avatar
* Tên
* Followers
* Điểm phù hợp
* Nút xem hồ sơ

---

# 5. TÌM KIẾM TALENT

Route

```text
/app/brand/search
```

---

## 5.1 Mục tiêu

Cho phép nhà tuyển dụng tìm đúng Talent trong thời gian ngắn nhất.

---

## 5.2 Layout

```text
Sidebar Filters
+
Result Grid
```

Sidebar:

320px

Content:

Flexible

---

# 5.3 Bộ lọc

## Thông tin cơ bản

Giới tính

* Nam
* Nữ
* Khác

---

Độ tuổi

Slider:

18 → 40

---

Địa điểm

Dropdown:

* Tỉnh
* Thành phố

---

## Ngoại hình

Chiều cao

150 → 190cm

---

Cân nặng

40 → 90kg

---

Số đo

* Vòng 1
* Vòng 2
* Vòng 3

---

## Nghề nghiệp

Loại Talent

Multi Select

* Model
* KOL
* Influencer
* MC
* PG
* Dancer

---

Kinh nghiệm

* Dưới 1 năm
* 1-3 năm
* 3-5 năm
* 5+ năm

---

## Mạng xã hội

Nền tảng

* TikTok
* Instagram
* Facebook
* YouTube

---

Followers

0 → 1.000.000+

---

Engagement

0 → 20%

---

## Chất lượng

Đã xác minh

Checkbox

---

Đánh giá

1 → 5 sao

---

Số job hoàn thành

0 → 500+

---

# 5.4 Kết quả tìm kiếm

Dạng hiển thị:

Grid

4 card / hàng

---

## Talent Card

Ảnh chính

Badge xác minh

Tên Talent

Loại Talent

Chiều cao

Tuổi

Địa điểm

Followers

Tỷ lệ tương tác

Trạng thái lịch

Nút:

* Xem hồ sơ
* Lưu
* So sánh
* Mời ứng tuyển

---

# 6. HỒ SƠ TALENT

Route

```text
/app/brand/talents/profile/:id
```

---

## Layout

```text
40% Media
60% Information
```

---

# 6.1 Khu vực Media

Gallery

Video giới thiệu

Portfolio

Lightbox

---

# 6.2 Thông tin cơ bản

Họ tên

Tuổi

Chiều cao

Cân nặng

Số đo

Địa điểm

Ngôn ngữ

---

# 6.3 Kinh nghiệm

Số năm kinh nghiệm

Dự án đã tham gia

Thương hiệu từng hợp tác

---

# 6.4 Kỹ năng

Tag Component

Ví dụ:

* Catwalk
* MC
* Livestream
* Dance
* Acting

---

# 6.5 Lịch làm việc

Calendar

Màu:

Xanh:

Rảnh

Vàng:

Có thể nhận việc

Đỏ:

Bận

---

# 6.6 Mạng xã hội

Biểu đồ tăng trưởng

Biểu đồ tương tác

Danh sách tài khoản đã xác minh

---

# 6.7 Đánh giá

Danh sách review

Điểm trung bình

Số lượng dự án hoàn thành

---

# 6.8 Thanh hành động

Sticky Sidebar

Buttons:

* Lưu Talent
* Mời ứng tuyển
* Nhắn tin
* Mở khóa liên hệ

---

# 7. DANH SÁCH ĐÃ LƯU

Route

```text
/app/brand/talents/saved
```

---

## Sidebar

Thư mục

Ví dụ:

* Campaign mùa hè
* KOL TikTok
* MC sự kiện
* Talent dự phòng

---

## Content

Danh sách Talent

Grid View

List View

---

## Chức năng

Tạo thư mục

Đổi tên

Gộp

Chia sẻ

Xuất Excel

---

# 8. SO SÁNH TALENT

Route

```text
/app/brand/talents/compare
```

---

Tối đa 4 Talent

---

Hiển thị

* Avatar
* Followers
* Engagement
* Giá tham khảo
* Đánh giá
* Kinh nghiệm
* Lịch làm việc

---

Hệ thống đánh dấu:

* Phù hợp nhất
* Followers cao nhất
* Giá tốt nhất

---

# 9. DANH SÁCH CHIẾN DỊCH

Route

```text
/app/brand/campaigns
```

---

## Header

Nút:

Tạo chiến dịch

Sử dụng mẫu

---

## Bảng dữ liệu

Tên chiến dịch

Trạng thái

Số ứng viên

Ngân sách

Hạn tuyển

Người phụ trách

Ngày tạo

---

## Trạng thái

Bản nháp

Đang tuyển

Đã đóng

Hoàn thành

Đã lưu trữ

---

# 10. TẠO CHIẾN DỊCH

Route

```text
/app/brand/campaigns/create
```

---

Wizard 6 bước

Bước 1

Thông tin cơ bản

Bước 2

Yêu cầu Talent

Bước 3

Thời gian & địa điểm

Bước 4

Hình ảnh chiến dịch

Bước 5

Hiển thị & quảng bá

Bước 6

Xem trước & đăng tải

---

# 11. QUẢN LÝ ỨNG VIÊN (ATS)

Route

```text
/app/brand/campaigns/applicants
```

---

Kanban Board

Các cột:

Ứng tuyển

Đã chọn lọc

Phỏng vấn

Đã duyệt

Đã xác nhận

Hoàn thành

---

Applicant Card

Avatar

Tên

Match Score

Ngày ứng tuyển

Tags kỹ năng

---

Bulk Actions

Di chuyển

Nhắn tin

Duyệt

Từ chối

Xuất Excel

---

# 12. TIN NHẮN

Route

```text
/app/brand/messages
```

---

Layout

Conversation List

|

Chat Window

---

Chức năng

* Tin nhắn văn bản
* Gửi ảnh
* Gửi tài liệu
* Emoji
* Tìm kiếm

---

# 13. BÁO CÁO & PHÂN TÍCH

Route

```text
/app/brand/analytics
```

---

Báo cáo tuyển dụng

* Lượt xem
* Ứng tuyển
* Tỷ lệ chuyển đổi

---

Nguồn ứng viên

* Tìm kiếm
* Đề xuất
* Mời trực tiếp

---

Theo dõi ngân sách

* Kế hoạch
* Thực tế

---

Chỉ số ROI

* Cost Per Hire
* Time To Fill
* Hiring Success Rate

---

# 14. THÀNH VIÊN

Route

```text
/app/brand/team
```

---

Danh sách thành viên

* Họ tên
* Email
* Vai trò
* Hoạt động gần nhất

---

Vai trò

Admin

Hiring Manager

Viewer

---

# 15. THANH TOÁN

Route

```text
/app/brand/billing
```

---

Gói hiện tại

* Free
* Silver
* Gold
* Diamond

---

Thống kê sử dụng

* Số lượt mở khóa liên hệ
* Số Talent đã lưu
* Số chiến dịch hoạt động

---

Lịch sử thanh toán

* Mã hóa đơn
* Ngày thanh toán
* Giá trị
* Trạng thái

---

# 16. THÔNG BÁO

Route

```text
/app/brand/notifications
```

---

Loại thông báo

* Có ứng viên mới
* Có tin nhắn mới
* Chiến dịch sắp hết hạn
* Talent phản hồi lời mời

---

# 17. CÀI ĐẶT

Route

```text
/app/brand/settings
```

---

Thông tin doanh nghiệp

Logo

Tên công ty

Website

Email

Số điện thoại

Địa chỉ

---

Quản lý thông báo

Email

Push

SMS

---

Bảo mật

Đổi mật khẩu

Xác thực 2 lớp

Quản lý thiết bị đăng nhập

---

# 18. DESIGN SYSTEM

## Màu sắc

Primary

#C9A86A

Secondary

#1B1E24

Background

#0F1115

Surface

#171A21

Border

#2B313D

---

## Typography

Heading 1

40px

Heading 2

32px

Heading 3

24px

Body

16px

Caption

14px

---

## Border Radius

Card

16px

Button

12px

Input

12px

---

## Grid

Desktop

1440px

12 Columns

Sidebar

280px

Content Max Width

1600px
