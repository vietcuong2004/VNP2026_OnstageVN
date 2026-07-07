# Architecture - Talent Assistant Platform (Zalo Integration)

## 1. Giới thiệu

Tài liệu này mô tả kiến trúc tổng thể của **Talent Assistant Platform**, một module cho phép Talent (KOL, Model, PG, MC...) tương tác với nền tảng Onstage thông qua **Zalo Official Account (OA)** thay vì phải sử dụng Website.

Mục tiêu của kiến trúc là biến Zalo thành giao diện chính dành cho Talent, trong khi Website tiếp tục phục vụ các đối tượng Brand, Agency và Admin.

---

# 2. Mục tiêu thiết kế

## 2.1. Mục tiêu

Kiến trúc được xây dựng dựa trên các nguyên tắc sau:

* Mobile First.
* Chat First.
* Event Driven.
* API First.
* AI Ready.
* Có khả năng mở rộng sang Telegram, Messenger hoặc WhatsApp mà không cần thay đổi Business Logic.

---

## 2.2. Đối tượng sử dụng

| Đối tượng | Công cụ chính         |
| --------- | --------------------- |
| Talent    | Zalo Official Account |
| Brand     | Website               |
| Admin     | Website               |

Website không còn là công cụ bắt buộc đối với Talent.

---

# 3. Kiến trúc tổng thể

```
                         Brand Portal
                              │
                              │
                    ┌─────────▼─────────┐
                    │   Onstage API     │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
     Admin Portal      Business Services     Talent Assistant
                                                  │
                                            Zalo Connector
                                                  │
                                            Zalo Official
                                                Account
                                                  │
                                                Talent
```

Kiến trúc được chia thành ba lớp chính:

* Presentation Layer
* Business Layer
* Integration Layer

---

# 4. Presentation Layer

Đây là lớp giao tiếp với người dùng.

## 4.1 Website

Website được sử dụng bởi:

* Brand
* Admin

Website chịu trách nhiệm:

* Quản lý Talent
* Đăng Job
* Theo dõi ứng tuyển
* Dashboard
* Analytics
* Booking
* Quản trị hệ thống

Website không phải là kênh chính của Talent.

---

## 4.2 Zalo Official Account

Đây là giao diện chính dành cho Talent.

Talent có thể:

* Chat với Bot
* Tạo hồ sơ
* Upload Portfolio
* Cập nhật thông tin
* Nhận Job
* Xác nhận Job
* Nhận thông báo

Mọi thao tác đều diễn ra trong Zalo.

---

# 5. Integration Layer

Integration Layer chịu trách nhiệm giao tiếp với nền tảng bên ngoài.

```
Talent

↓

Zalo OA

↓

Webhook

↓

Message Processor
```

Layer này không xử lý nghiệp vụ.

Chỉ thực hiện:

* Nhận Event
* Xác thực
* Parse dữ liệu
* Chuyển tiếp sang Business Layer

---

## 5.1 Zalo Connector

Là Gateway giữa Zalo và hệ thống.

Chức năng:

* Verify Webhook
* Receive Message
* Receive Image
* Receive Video
* Send Message
* Send Notification
* Send Button
* Send Menu

Không chứa Business Logic.

---

## 5.2 Webhook Server

Webhook nhận các Event từ Zalo.

Ví dụ:

* User Follow
* User Unfollow
* Text Message
* Image Upload
* Video Upload
* Button Click
* QR Scan

Sau đó chuyển Event sang Message Processor.

---

## 5.3 Message Processor

Nhiệm vụ:

* Chuẩn hóa dữ liệu
* Xác định loại Event
* Tạo Command
* Gửi tới Business Services

Ví dụ:

```
Image Upload

↓

UploadMediaCommand
```

```
Text Message

↓

ConversationCommand
```

---

# 6. Business Layer

Business Layer chứa toàn bộ nghiệp vụ của Talent Assistant.

```
Conversation Engine

Media Service

Talent Service

Job Service

Notification Service

AI Service

Sync Service
```

Các Service hoạt động độc lập.

---

## 6.1 Conversation Engine

Quản lý trạng thái hội thoại.

Ví dụ

```
START

↓

WAIT_NAME

↓

WAIT_HEIGHT

↓

WAIT_WEIGHT

↓

WAIT_IMAGES

↓

COMPLETE
```

Conversation Engine giúp Bot nhớ người dùng đang ở bước nào.

Nếu người dùng thoát Zalo, hệ thống vẫn có thể tiếp tục cuộc hội thoại sau.

---

## 6.2 Talent Service

Quản lý toàn bộ hồ sơ Talent.

Bao gồm:

* Thông tin cá nhân
* Portfolio
* Social Links
* Pricing
* Availability
* Completion Score

Đây là nguồn dữ liệu duy nhất (Single Source of Truth).

---

## 6.3 Media Service

Quản lý toàn bộ dữ liệu media.

Bao gồm:

* Upload ảnh
* Upload video
* Resize
* Thumbnail
* Compression
* Metadata
* Cloud Storage

Media Service không xử lý AI.

---

## 6.4 AI Service

AI Service thực hiện các tác vụ thông minh.

Ví dụ:

### Intent Detection

Hiểu ý định người dùng.

Ví dụ

```
cao 170
```

↓

Update Height

---

```
đổi avatar
```

↓

Open Avatar Selection

---

```
thêm ảnh
```

↓

Upload Mode

---

### AI Image Analysis

Đánh giá ảnh:

* Face Detection
* Portrait Score
* NSFW Detection
* Blur Detection
* Duplicate Detection

---

### AI Recommendation

Gợi ý:

* Hồ sơ còn thiếu gì
* Ảnh đẹp nhất
* Avatar nên sử dụng
* Khả năng được Brand lựa chọn

---

## 6.5 Job Service

Quản lý Job.

Bao gồm:

* Matching
* Invitation
* Apply
* Accept
* Reject

Khi có Job phù hợp:

Brand

↓

Job Service

↓

Notification Service

↓

Talent

---

## 6.6 Notification Service

Quản lý toàn bộ Notification.

Ví dụ:

* Có Job mới
* Brand nhắn tin
* Hồ sơ thiếu thông tin
* Hồ sơ được duyệt
* Nhắc cập nhật Portfolio

Notification Service hỗ trợ nhiều kênh:

* Zalo
* Email
* Push Notification
* Telegram (tương lai)

---

## 6.7 Sync Service

Đồng bộ dữ liệu giữa các nền tảng.

```
Website

↓

Sync Service

↓

Database

↓

Zalo
```

hoặc

```
Zalo

↓

Sync Service

↓

Database

↓

Website
```

Đảm bảo dữ liệu luôn đồng nhất.

---

# 7. Database Architecture

```
Talent
│
├── Profile
├── Portfolio
├── Media
├── Social Accounts
├── Availability
├── Jobs
├── Conversation
└── Notifications
```

Talent là thực thể trung tâm.

Các module khác chỉ tham chiếu đến Talent.

---

# 8. Event Flow

Ví dụ Talent gửi ảnh.

```
Talent

↓

Zalo OA

↓

Webhook

↓

Message Processor

↓

Media Service

↓

Cloud Storage

↓

Database

↓

AI Queue

↓

AI Service

↓

Update Profile

↓

Notification
```

Toàn bộ luồng được xử lý bất đồng bộ nhằm giảm thời gian phản hồi.

---

# 9. Nguyên tắc thiết kế

## Stateless Connector

Webhook không lưu trạng thái.

Toàn bộ trạng thái được lưu trong Database.

---

## Single Source of Truth

Mọi dữ liệu đều được lưu trong Database.

Website và Zalo chỉ là hai giao diện hiển thị dữ liệu.

---

## Event Driven

Mọi thao tác đều sinh Event.

Ví dụ:

* UserFollowed
* MessageReceived
* ImageUploaded
* ProfileUpdated
* JobAccepted

Các Service chỉ xử lý Event của mình.

---

## Service Separation

Mỗi Service chỉ chịu trách nhiệm cho một nghiệp vụ duy nhất.

Ví dụ:

* Conversation Service không xử lý Upload.
* Upload Service không xử lý AI.
* AI Service không gửi Notification.

Giúp hệ thống dễ bảo trì và mở rộng.

---

# 10. Khả năng mở rộng

Kiến trúc được thiết kế để có thể bổ sung thêm các kênh giao tiếp khác mà không thay đổi Business Layer.

Ví dụ:

```
                 Talent Assistant

                        │

        ┌───────────────┼───────────────┐
        │               │               │

     Zalo OA      Telegram Bot     Messenger

        │               │               │

        └───────────────┼───────────────┘

                Business Layer
```

Mỗi nền tảng chỉ cần xây dựng một Connector riêng.

Business Logic được tái sử dụng hoàn toàn.

---

# 11. Kiến trúc triển khai

```
                Internet

                    │

              Reverse Proxy

                    │

               Next.js Server

                    │

        ┌───────────┼────────────┐

        │           │            │

   REST API     Webhook API    Admin API

                    │

             Business Services

                    │

        ┌───────────┼────────────┐

        │                        │

    Database              Cloud Storage

        │                        │

        └──────────────┬─────────┘

                       │

                  AI Processing
```

Kiến trúc này cho phép:

* Dễ dàng mở rộng số lượng Talent.
* Thêm nhiều nền tảng nhắn tin trong tương lai.
* Tách riêng các Service khi hệ thống phát triển lớn hơn.
* Triển khai AI độc lập với Website và Bot.
