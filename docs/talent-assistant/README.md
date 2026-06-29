# Talent Assistant Platform

> **Conversational AI Platform for Talent Management**

## Giới thiệu

Talent Assistant Platform là module cho phép **Talent (KOL, Model, PG, MC...)** tương tác với hệ thống Onstage thông qua các nền tảng nhắn tin như **Zalo Official Account**, thay vì phải truy cập Website hoặc cài đặt ứng dụng riêng.

Khác với mô hình truyền thống yêu cầu người dùng đăng ký tài khoản và sử dụng Dashboard, Talent Assistant được xây dựng theo triết lý **Chat First**, trong đó mọi thao tác đều có thể thực hiện thông qua cuộc trò chuyện với Bot.

Website của Onstage sẽ tập trung phục vụ:

* Brand
* Agency
* Admin

Trong khi Talent chỉ cần sử dụng Zalo như một "trợ lý cá nhân" để quản lý hồ sơ, cập nhật Portfolio và nhận Job.

---

# Mục tiêu

Talent Assistant hướng tới ba mục tiêu chính:

## 1. Giảm rào cản sử dụng

Talent không cần:

* Đăng ký Website
* Ghi nhớ mật khẩu
* Học cách sử dụng Dashboard
* Điền các biểu mẫu dài

Chỉ cần trò chuyện với Bot.

---

## 2. Tăng tốc quá trình onboarding

Thông tin Talent được thu thập thông qua hội thoại:

* Họ tên
* Chiều cao
* Cân nặng
* Số đo
* Portfolio
* Mạng xã hội

Toàn bộ quá trình diễn ra trong vài phút.

---

## 3. Xây dựng trợ lý AI cho Talent

Talent Assistant không chỉ là Bot trả lời tin nhắn.

Trong tương lai, Assistant sẽ trở thành một AI Agent có khả năng:

* Quản lý hồ sơ
* Quản lý lịch làm việc
* Đề xuất mức giá
* Tư vấn hoàn thiện Portfolio
* Hỗ trợ giao tiếp với Brand
* Tự động hóa các công việc lặp lại

---

# Triết lý thiết kế

Talent Assistant được xây dựng dựa trên các nguyên tắc sau:

* **Chat First** – Hội thoại là giao diện chính.
* **Mobile First** – Hoạt động hoàn toàn trên điện thoại.
* **AI First** – AI hỗ trợ xử lý hội thoại và phân tích dữ liệu.
* **Event Driven** – Mọi thao tác đều được xử lý theo sự kiện.
* **Platform Independent** – Không phụ thuộc vào Zalo, có thể mở rộng sang các nền tảng khác.

---

# Kiến trúc tổng thể

```text
                 Brand Portal
                      │
                      │
              Onstage Backend
                      │
      ┌───────────────┼────────────────┐
      │               │                │
 Website         Admin Portal     Talent Assistant
                                          │
                                   Zalo Connector
                                          │
                                   Zalo Official Account
                                          │
                                        Talent
```

Website là công cụ dành cho Brand và Agency.

Talent Assistant là giao diện chính dành cho Talent.

---

# Các chức năng chính

## Quản lý hồ sơ

Talent có thể:

* Tạo hồ sơ
* Cập nhật thông tin
* Thay đổi Avatar
* Quản lý Portfolio
* Đồng bộ mạng xã hội

---

## Quản lý Media

Hỗ trợ:

* Upload nhiều ảnh
* Upload video
* AI đánh giá chất lượng ảnh
* Đề xuất ảnh đại diện
* Quản lý Portfolio

---

## Quản lý Job

Talent có thể:

* Nhận Job mới
* Xem chi tiết Job
* Quan tâm Job
* Từ chối Job
* Theo dõi trạng thái ứng tuyển

---

## AI Assistant

AI hỗ trợ:

* Trả lời câu hỏi
* Phân tích hồ sơ
* Đề xuất cải thiện Portfolio
* Đề xuất mức giá
* Gợi ý bổ sung thông tin còn thiếu

---

## Đồng bộ dữ liệu

Talent Assistant luôn đồng bộ hai chiều với Website.

```text
Website

↓

Database

↓

Talent Assistant

↓

Talent
```

Mọi thay đổi đều được cập nhật theo thời gian thực.

---

# Cấu trúc tài liệu

```
docs/
└── talent-assistant/
    ├── README.md
    ├── architecture.md        # Kiến trúc tổng thể
    ├── conversation-flow.md   # Luồng hội thoại
    ├── zalo-integration.md    # Webhook, OA, API
    ├── ai-features.md         # AI xử lý hội thoại, ảnh
    ├── media-upload.md        # Upload ảnh/video
    └── roadmap.md             # Kế hoạch triển khai
```

---

## README.md

Giới thiệu tổng quan về Talent Assistant Platform.

---

## architecture.md

Mô tả kiến trúc tổng thể của hệ thống.

Bao gồm:

* Presentation Layer
* Business Layer
* Integration Layer
* Service Architecture
* Event Flow
* Database Architecture

---

## conversation-flow.md

Mô tả toàn bộ luồng hội thoại giữa Talent và Assistant.

Bao gồm:

* Onboarding
* Đăng ký
* Chỉnh sửa hồ sơ
* Nhận Job
* AI Chat
* Resume Conversation
* Notification

---

## zalo-integration.md

Mô tả quá trình tích hợp với Zalo Official Account.

Bao gồm:

* Official Account
* Webhook
* Event
* API
* Authentication
* QR Flow
* Message Flow

---

## ai-features.md

Mô tả các tính năng AI của hệ thống.

Bao gồm:

* Intent Detection
* Image Analysis
* Recommendation Engine
* AI Chat
* Smart Completion
* AI Scoring

---

## media-upload.md

Mô tả quy trình quản lý Media.

Bao gồm:

* Upload
* Compression
* Thumbnail
* AI Queue
* Cloud Storage
* Avatar Selection

---

## roadmap.md

Lộ trình phát triển Talent Assistant.

Bao gồm:

* MVP
* Phase 2
* Phase 3
* AI Agent
* Multi-platform

---

# Định hướng phát triển

Talent Assistant không chỉ là một Zalo Bot.

Mục tiêu dài hạn là xây dựng một **Conversational Talent Platform**, nơi mọi tương tác của Talent với Onstage đều diễn ra thông qua hội thoại.

Trong tương lai, Business Layer sẽ được tái sử dụng cho nhiều kênh giao tiếp khác nhau:

```text
                    Talent Assistant

                           │

        ┌──────────────────┼──────────────────┐

        │                  │                  │

   Zalo Official      Telegram Bot      Messenger

        │                  │                  │

        └──────────────────┼──────────────────┘

                  Shared Business Layer
```

Nhờ kiến trúc này, Onstage chỉ cần xây dựng thêm các Connector cho từng nền tảng mới, trong khi toàn bộ nghiệp vụ, AI và dữ liệu được dùng chung. Điều này giúp giảm chi phí phát triển, tăng khả năng mở rộng và mang đến trải nghiệm thống nhất cho Talent trên mọi nền tảng nhắn tin.
