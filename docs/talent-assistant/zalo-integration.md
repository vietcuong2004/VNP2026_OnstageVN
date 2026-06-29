# Zalo Integration

## Giới thiệu

Tài liệu này mô tả kiến trúc và quy trình tích hợp giữa **Talent Assistant Platform** và **Zalo Official Account (OA)**.

Mục tiêu của module là biến Zalo thành kênh giao tiếp chính giữa Talent và hệ thống Onstage. Thay vì yêu cầu Talent đăng nhập Website, mọi thao tác như tạo hồ sơ, cập nhật Portfolio, nhận Job hay trao đổi thông tin đều được thực hiện thông qua Zalo.

Module được thiết kế theo hướng **Platform Connector**, nghĩa là toàn bộ nghiệp vụ được xử lý trong Business Layer, còn Zalo chỉ đóng vai trò là một kênh truyền tải dữ liệu.

---

# Mục tiêu

Việc tích hợp Zalo nhằm đạt được các mục tiêu sau:

* Giảm rào cản đăng ký tài khoản.
* Cho phép Talent sử dụng Onstage mà không cần Website.
* Đồng bộ dữ liệu theo thời gian thực.
* Gửi thông báo Job ngay lập tức.
* Hỗ trợ AI Assistant thông qua hội thoại.
* Chuẩn bị kiến trúc để mở rộng sang Telegram, Messenger hoặc WhatsApp.

---

# Kiến trúc tích hợp

```text
                    Talent

                       │

                Zalo Official Account

                       │

                  Webhook Server

                       │

               Message Processor

                       │

               Business Services

                       │

                   Database
```

Zalo không giao tiếp trực tiếp với Database.

Mọi dữ liệu đều đi qua Business Layer.

---

# Thành phần hệ thống

## 1. Zalo Official Account

Đây là giao diện mà Talent sử dụng.

Các chức năng chính:

* Follow OA
* Chat với Bot
* Upload ảnh
* Upload video
* Nhấn Quick Reply
* Nhận Notification
* Nhận Job
* Nhận Menu
* Quét QR Code

OA không xử lý nghiệp vụ.

Chỉ đóng vai trò là giao diện hội thoại.

---

## 2. Webhook Server

Webhook là điểm nhận toàn bộ sự kiện từ Zalo.

Ví dụ:

* User Follow
* User Unfollow
* User gửi Text
* User gửi Image
* User gửi Video
* User Click Button
* User Scan QR

Webhook thực hiện:

* Verify Request
* Parse Payload
* Kiểm tra Token
* Chuyển Event sang Message Processor

Webhook tuyệt đối không xử lý Business Logic.

---

## 3. Message Processor

Message Processor chịu trách nhiệm:

* Phân loại Event
* Chuẩn hóa dữ liệu
* Xác định Intent sơ bộ
* Gửi Command đến Service phù hợp

Ví dụ:

```text
Text Message

↓

Conversation Engine
```

```text
Image

↓

Media Service
```

```text
Quick Reply

↓

Action Handler
```

---

# Quy trình kết nối

## Bước 1

Talent quét QR Code của Onstage.

```text
Talent

↓

Scan QR

↓

Follow OA
```

---

## Bước 2

Zalo gửi sự kiện Follow.

```text
User Follow

↓

Webhook
```

---

## Bước 3

Webhook tạo phiên làm việc.

```text
Conversation

status = WELCOME
```

---

## Bước 4

Bot gửi tin nhắn chào mừng.

```text
Xin chào 👋

Mình là trợ lý của Onstage.

Mình sẽ giúp bạn tạo hồ sơ và nhận Job.
```

---

# Định danh người dùng

Mỗi Talent sẽ được liên kết với một tài khoản Zalo thông qua `zalo_user_id`.

Ví dụ:

```text
Talent

id

123

↓

Zalo Account

zalo_user_id

987654321
```

Hệ thống không sử dụng số điện thoại làm khóa chính.

Việc ánh xạ giữa Talent và Zalo được lưu trong bảng riêng.

Ví dụ:

```text
Talent

id

name

...

------------------

ZaloAccount

id

talent_id

zalo_user_id

display_name

avatar

followed_at
```

Một Talent chỉ liên kết với một tài khoản Zalo tại một thời điểm.

---

# Quy trình gửi tin nhắn

Khi Talent gửi tin nhắn.

```text
Talent

↓

Zalo OA

↓

Webhook

↓

Message Processor

↓

Conversation Engine

↓

Business Service

↓

Response Builder

↓

Zalo OA

↓

Talent
```

Response Builder chịu trách nhiệm chuyển kết quả nghiệp vụ thành định dạng mà Zalo có thể hiển thị.

---

# Quy trình Upload Media

Talent gửi nhiều ảnh.

```text
Talent

↓

Image

↓

Webhook

↓

Media Service

↓

Cloud Storage

↓

AI Queue

↓

Database

↓

Bot xác nhận
```

Media không được lưu trực tiếp từ Webhook.

Toàn bộ Upload đều đi qua Media Service.

---

# Quy trình Quick Reply

Bot gửi:

```text
Bạn muốn làm gì?

[ Tạo hồ sơ ]

[ Xem Job ]

[ Trợ giúp ]
```

Khi người dùng nhấn nút.

```text
Quick Reply

↓

Webhook

↓

Message Processor

↓

Action Handler

↓

Business Service
```

Mỗi nút đều mang một Action Code.

Ví dụ:

```text
CREATE_PROFILE

VIEW_JOB

UPLOAD_MEDIA

HELP
```

Bot không xử lý dựa trên nội dung hiển thị.

Chỉ xử lý Action Code.

---

# Quy trình Notification

Khi có Job mới.

```text
Brand

↓

Create Job

↓

Matching Engine

↓

Notification Service

↓

Zalo API

↓

Talent
```

Notification có thể bao gồm:

* Job mới
* Hồ sơ được duyệt
* Hồ sơ bị từ chối
* Nhắc cập nhật Portfolio
* Thông báo thanh toán
* Tin nhắn từ Brand

---

# Quy trình QR Code

QR Code đóng vai trò là điểm khởi đầu để Talent tham gia hệ thống.

```text
Poster

↓

QR Code

↓

Follow OA

↓

Conversation

↓

Profile
```

Ngoài QR chung của nền tảng, hệ thống có thể tạo QR động cho từng chiến dịch hoặc từng Agency.

Ví dụ:

```text
QR Campaign

↓

Talent

↓

Auto Join Campaign

↓

Bắt đầu hội thoại
```

---

# Đồng bộ hồ sơ

Sau khi Talent cập nhật thông tin trên Zalo.

```text
Conversation Engine

↓

Talent Service

↓

Database

↓

Sync Service

↓

Website
```

Brand luôn nhìn thấy thông tin mới nhất.

Ngược lại.

Nếu Admin chỉnh sửa hồ sơ.

```text
Website

↓

Sync Service

↓

Database

↓

Notification

↓

Talent
```

Talent sẽ nhận được thông báo ngay trên Zalo.

---

# Xử lý lỗi

Nếu Zalo gửi dữ liệu không hợp lệ.

Webhook trả về lỗi xác thực.

Nếu Business Service gặp lỗi.

Bot phản hồi:

```text
Xin lỗi, hiện tại hệ thống đang bận.

Bạn vui lòng thử lại sau vài phút.
```

Nếu Upload thất bại.

Bot sẽ yêu cầu người dùng gửi lại.

---

# Giới hạn nền tảng

Do phụ thuộc vào nền tảng Zalo, hệ thống cần lưu ý:

* Một số loại Message có giới hạn kích thước.
* Có giới hạn số lượng Notification chủ động.
* Một số API yêu cầu OA đã được xác thực.
* Người dùng phải Follow OA để nhận được tin nhắn chủ động.

Business Layer không phụ thuộc vào các giới hạn này.

Mọi khác biệt đều được xử lý tại lớp Zalo Connector.

---

# Bảo mật

Module tích hợp cần đảm bảo:

* Xác thực Webhook.
* Kiểm tra Access Token.
* Không lưu Access Token phía Client.
* Mã hóa thông tin nhạy cảm.
* Ghi log toàn bộ Event.
* Chống gửi trùng Event (Idempotency).

---

# Khả năng mở rộng

Zalo chỉ là một Connector.

Trong tương lai có thể bổ sung:

```text
                    Talent Assistant

                           │

        ┌──────────────────┼──────────────────┐

        │                  │                  │

      Zalo            Telegram         Messenger

        │                  │                  │

        └──────────────────┼──────────────────┘

               Shared Business Layer
```

Business Logic được dùng chung.

Mỗi nền tảng chỉ cần triển khai:

* Authentication
* Webhook
* Message Mapping
* Response Builder

Điều này giúp giảm đáng kể chi phí phát triển khi mở rộng Talent Assistant sang nhiều nền tảng nhắn tin khác.
