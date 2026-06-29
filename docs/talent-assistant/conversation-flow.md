# Conversation Flow - Talent Assistant Platform

## 1. Giới thiệu

Tài liệu này mô tả toàn bộ luồng hội thoại giữa Talent và Talent Assistant (Zalo Official Account).

Khác với Website truyền thống sử dụng Form, Talent Assistant hoạt động theo mô hình **Conversational UI**, trong đó người dùng chỉ cần trò chuyện với Bot để hoàn thành mọi thao tác.

Bot đóng vai trò như một trợ lý cá nhân, hướng dẫn Talent từng bước thay vì yêu cầu điền biểu mẫu dài.

---

# 2. Nguyên tắc thiết kế

Conversation được xây dựng dựa trên các nguyên tắc sau:

* Chat First.
* One Question At A Time.
* Không yêu cầu người dùng điền form dài.
* Có thể dừng bất kỳ lúc nào.
* Có thể tiếp tục sau nhiều ngày.
* AI hiểu được câu trả lời tự nhiên.
* Luôn có nút bỏ qua (Skip).
* Luôn có thể quay lại chỉnh sửa.

---

# 3. Trạng thái hội thoại

Conversation được quản lý dưới dạng State Machine.

```
START

↓

WELCOME

↓

MAIN_MENU

↓

CREATE_PROFILE

↓

PROFILE_COMPLETED

↓

NORMAL_MODE
```

Mỗi người dùng luôn chỉ tồn tại một trạng thái hội thoại tại một thời điểm.

Ví dụ:

```
conversation.current_state

=

WAIT_HEIGHT
```

Nếu người dùng gửi tin nhắn mới, Bot sẽ xử lý dựa trên trạng thái hiện tại.

---

# 4. Luồng khởi động

## 4.1 Follow OA

Talent quét QR hoặc tìm Official Account.

↓

Follow.

↓

Webhook nhận sự kiện Follow.

↓

Tạo Conversation.

```
state = WELCOME
```

---

## 4.2 Chào mừng

Bot gửi tin nhắn:

```
Xin chào 👋

Mình là trợ lý Onstage.

Mình sẽ giúp bạn tạo hồ sơ, nhận Job và quản lý Portfolio.

Bạn muốn làm gì?
```

Hiển thị Quick Reply:

* Tạo hồ sơ
* Tôi đã có hồ sơ
* Xem Job
* Trợ giúp

---

# 5. Luồng tạo hồ sơ

Nếu người dùng chọn **Tạo hồ sơ**.

Conversation chuyển sang:

```
WAIT_NAME
```

---

## Bước 1 - Họ tên

Bot:

```
Tên đầy đủ của bạn là gì?
```

Talent:

```
Nguyễn Minh Anh
```

Bot lưu dữ liệu.

↓

State tiếp theo:

```
WAIT_GENDER
```

---

## Bước 2 - Giới tính

Quick Reply

* Nam
* Nữ
* Khác

↓

Lưu dữ liệu.

↓

State tiếp theo.

---

## Bước 3 - Ngày sinh

Bot:

```
Ngày sinh của bạn?

Ví dụ:

12/05/2002
```

↓

Kiểm tra định dạng.

↓

Lưu.

---

## Bước 4 - Chiều cao

Bot

```
Chiều cao của bạn?

Ví dụ

170 cm
```

AI chấp nhận:

```
170

170cm

1m70

1m7
```

↓

Chuẩn hóa.

↓

170

---

## Bước 5 - Cân nặng

Bot

```
Cân nặng của bạn?
```

Ví dụ

```
48

48kg

48 kg
```

↓

Chuẩn hóa.

---

## Bước 6 - Số đo

Bot

```
Số đo 3 vòng?

Ví dụ

84-60-90
```

↓

Kiểm tra định dạng.

↓

Lưu.

---

## Bước 7 - Khu vực làm việc

Quick Reply

* Hà Nội
* TP.HCM
* Đà Nẵng
* Khác

Hoặc nhập tự do.

---

## Bước 8 - Link mạng xã hội

Bot

```
Gửi Facebook hoặc Instagram của bạn.
```

Talent có thể gửi:

```
facebook.com/...

instagram.com/...

tiktok.com/...
```

Bot tự nhận diện nền tảng.

↓

Lưu.

↓

Chuẩn bị đồng bộ.

---

## Bước 9 - Upload Portfolio

Bot

```
Hãy gửi những ảnh đẹp nhất của bạn.

Bạn có thể gửi nhiều ảnh cùng lúc.
```

↓

Talent chọn Album.

↓

Upload.

↓

Bot trả lời

```
Đã nhận 12 ảnh ❤️

Bạn muốn gửi thêm không?
```

Quick Reply

* Gửi thêm
* Hoàn thành

---

## Bước 10 - Hoàn tất

Bot

```
🎉 Hồ sơ của bạn đã được tạo.

Độ hoàn thiện:

72%
```

Bot gợi ý:

* Upload Video
* Xác minh CCCD
* Thêm Portfolio

---

# 6. Luồng chỉnh sửa hồ sơ

Sau khi tạo hồ sơ.

Conversation chuyển sang:

```
NORMAL_MODE
```

Ở trạng thái này người dùng có thể chat tự nhiên.

Ví dụ:

```
cao 172
```

↓

AI

↓

Update Height

---

```
cân nặng 49kg
```

↓

Update Weight

---

```
đổi avatar
```

↓

Bot gửi danh sách ảnh.

↓

Người dùng chọn.

---

```
xóa ảnh thứ 3
```

↓

Bot xác nhận.

↓

Xóa.

---

```
thêm ảnh
```

↓

Conversation chuyển sang Upload Mode.

---

# 7. Luồng nhận Job

Bot chủ động gửi:

```
🎉 Có Job mới

Samsung

15/07

5 triệu

Quận 1
```

Quick Reply

* Quan tâm
* Từ chối
* Xem chi tiết

---

Nếu chọn:

Quan tâm

↓

Bot

```
Bạn xác nhận muốn ứng tuyển?
```

↓

Có

↓

Application được tạo.

↓

Brand nhận được thông báo.

---

# 8. Luồng AI Hỏi đáp

Talent có thể hỏi bất kỳ lúc nào.

Ví dụ

```
Tôi còn thiếu gì?
```

↓

AI

```
Bạn còn thiếu:

• CCCD

• Video giới thiệu

• 2 ảnh toàn thân
```

---

```
Ảnh nào đẹp nhất?
```

↓

AI

```
Ảnh số 5 được đánh giá tốt nhất.
```

---

```
Tôi nên để giá bao nhiêu?
```

↓

AI

Phân tích

↓

Đề xuất mức giá.

---

# 9. Luồng đồng bộ mạng xã hội

Talent gửi

```
instagram.com/abc
```

↓

Bot

```
Đang đồng bộ...
```

↓

Backend

↓

Crawler/API

↓

Bot

```
Đã đồng bộ:

Username

Followers

Avatar

Bio
```

---

# 10. Luồng Upload Media

Người dùng gửi:

* Ảnh
* Video

↓

Bot

```
Đang tải lên...
```

↓

Media Service

↓

AI Queue

↓

Bot

```
Đã xử lý thành công.

Ảnh số 2 được đề xuất làm Avatar.
```

---

# 11. Luồng Resume Conversation

Nếu người dùng dừng giữa chừng.

Ví dụ:

```
WAIT_IMAGES
```

Sau 3 ngày quay lại.

Bot:

```
Chúng ta đang ở bước Upload Portfolio.

Bạn muốn tiếp tục chứ?
```

Quick Reply

* Tiếp tục
* Làm lại

---

# 12. Luồng chuyển sang nhân viên hỗ trợ

Nếu AI không hiểu.

Ví dụ:

```
Tôi muốn khiếu nại.
```

↓

Bot

```
Mình sẽ kết nối bạn với đội ngũ hỗ trợ.
```

↓

Tạo Support Ticket.

↓

Admin nhận được thông báo.

---

# 13. Luồng hội thoại đặc biệt

## Hồ sơ chưa hoàn thành

Nếu hồ sơ dưới 80%.

Bot sẽ nhắc:

```
Bạn chỉ còn thiếu 2 bước để hoàn thiện hồ sơ.

Hoàn thiện ngay sẽ tăng khả năng được Brand lựa chọn.
```

---

## Không hoạt động lâu

Sau 30 ngày.

Bot gửi:

```
Đã lâu bạn chưa cập nhật Portfolio.

Bạn có ảnh mới không?
```

---

## Sau khi hoàn thành Job

Bot hỏi:

```
Job hôm nay diễn ra như thế nào?

★★★★★
```

↓

Thu thập đánh giá.

---

# 14. Nguyên tắc UX

* Không hỏi quá nhiều trong một tin nhắn.
* Một câu hỏi chỉ có một mục tiêu.
* Luôn ưu tiên Quick Reply thay vì bắt người dùng nhập.
* Nếu có thể tự động suy luận thì không hỏi.
* Không yêu cầu nhập lại dữ liệu đã có.
* Luôn hiển thị tiến trình hoàn thành hồ sơ.
* Luôn cho phép bỏ qua.
* Luôn có thể quay lại chỉnh sửa.

---

# 15. Khả năng mở rộng

Conversation Engine được thiết kế độc lập với nền tảng nhắn tin.

Do đó toàn bộ luồng hội thoại có thể tái sử dụng cho:

* Zalo Official Account
* Telegram Bot
* Facebook Messenger
* WhatsApp
* Mobile App Chat
* Website Chat Widget

Mỗi nền tảng chỉ cần triển khai lớp Connector riêng, trong khi Conversation Engine và Business Logic được dùng chung.
