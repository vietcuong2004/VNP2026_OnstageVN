# Roadmap

## Giới thiệu

Tài liệu này mô tả lộ trình phát triển của **Talent Assistant Platform**.

Mục tiêu không phải là xây dựng một Chatbot phức tạp ngay từ đầu, mà tập trung giải quyết vấn đề lớn nhất hiện nay:

> **Talent không muốn truy cập Website để tạo tài khoản và cập nhật hồ sơ.**

Do đó, giai đoạn đầu sẽ ưu tiên xây dựng luồng onboarding thông qua Zalo, giúp Talent có thể hoàn thiện hồ sơ chỉ bằng vài thao tác trong ứng dụng Zalo.

---

# Phase 1 - MVP: Zalo Onboarding (Ưu tiên cao nhất)

## Mục tiêu

Cho phép Talent tạo và cập nhật hồ sơ mà **không cần đăng nhập Website**.

Website chỉ đóng vai trò quản trị, trong khi toàn bộ quá trình onboarding diễn ra trên Zalo.

---

## Tính năng

### Kết nối Zalo với Onstage

* Quét QR để Follow OA.
* Tự động tạo phiên hội thoại.
* Liên kết `zalo_user_id` với Talent.
* Khởi động Conversation Engine.

---

### Tạo hồ sơ bằng hội thoại

Thu thập các thông tin cơ bản:

* Họ tên
* Giới tính
* Ngày sinh
* Chiều cao
* Cân nặng
* Số đo
* Khu vực làm việc
* Link mạng xã hội

Không sử dụng Form hay Website.

---

### Upload Portfolio

Cho phép Talent:

* Gửi nhiều ảnh cùng lúc.
* Upload video giới thiệu.
* Quản lý Portfolio trực tiếp trên Zalo.

---

### Xử lý Media

Tự động:

* Nén ảnh.
* Tạo Thumbnail.
* Lưu Cloud Storage.
* Đưa vào AI Queue.

---

### Đồng bộ hồ sơ

Sau khi hoàn thành, toàn bộ dữ liệu sẽ tự động đồng bộ sang Website để Brand và Agency có thể tìm kiếm ngay.

---

## Kết quả mong muốn

* Talent hoàn thành hồ sơ trong vòng 3–5 phút.
* Không cần tạo tài khoản Website.
* Hồ sơ sẵn sàng cho quá trình tìm kiếm và Booking.

---

# Phase 2 - Profile Management

## Mục tiêu

Cho phép Talent quản lý hồ sơ hoàn toàn bằng hội thoại.

---

## Tính năng

* Cập nhật thông tin cá nhân.
* Thay đổi Avatar & Ảnh bìa (Cover).
* Quản lý Portfolio (Thêm, xóa, thay thế ảnh qua Webview/Zalo Mini App hoặc qua chat).
* Đồng bộ mạng xã hội.
* Hiển thị mức độ hoàn thiện hồ sơ.
* Nhắc bổ sung thông tin còn thiếu.

---

# Phase 3 - Job Assistant

## Mục tiêu

Biến Zalo thành kênh nhận Job chính của Talent.

---

## Tính năng

* Thông báo Job mới.
* Xem chi tiết Job.
* Quan tâm hoặc từ chối Job.
* Theo dõi trạng thái ứng tuyển.
* Nhận thông báo từ Brand.

---

# Phase 4 - AI Assistant

## Mục tiêu

Xây dựng trợ lý AI hỗ trợ Talent trong quá trình phát triển hồ sơ.

---

## Tính năng

* AI Chat.
* Intent Detection.
* AI Recommendation.
* AI Scoring.
* Đề xuất mức giá.
* Gợi ý cải thiện Portfolio.
* Trả lời các câu hỏi thường gặp.

---

# Phase 5 - Talent AI Agent

## Mục tiêu

Chuyển từ Chatbot sang AI Agent có khả năng chủ động hỗ trợ Talent.

---

## Tính năng

* Chủ động nhắc cập nhật Portfolio.
* Gợi ý Job phù hợp.
* Theo dõi lịch làm việc.
* Quản lý hợp đồng.
* Hỗ trợ thương lượng giá.
* Phân tích hiệu quả hoạt động của Talent.

---

# Phase 6 - Multi Platform

## Mục tiêu

Mở rộng Talent Assistant sang nhiều nền tảng nhắn tin khác.

---

## Nền tảng hỗ trợ

* Telegram
* Facebook Messenger
* WhatsApp
* Mobile App
* Website Chat Widget

Toàn bộ Business Logic được tái sử dụng, chỉ cần xây dựng Connector cho từng nền tảng.

---

# Lộ trình ưu tiên

| Giai đoạn   | Mục tiêu                                             | Ưu tiên |
| ----------- | ---------------------------------------------------- | ------- |
| **Phase 1** | Kết nối Zalo, tạo hồ sơ, upload ảnh, đồng bộ Website | ⭐⭐⭐⭐⭐   |
| **Phase 2** | Quản lý và cập nhật hồ sơ qua hội thoại              | ⭐⭐⭐⭐    |
| **Phase 3** | Nhận và quản lý Job trên Zalo                        | ⭐⭐⭐⭐    |
| **Phase 4** | AI Chat và AI Recommendation                         | ⭐⭐⭐     |
| **Phase 5** | Talent AI Agent                                      | ⭐⭐⭐     |
| **Phase 6** | Mở rộng đa nền tảng                                  | ⭐⭐      |

---

# Định hướng phát triển

Trong ngắn hạn, Talent Assistant tập trung vào việc **giảm tối đa rào cản onboarding**, giúp Talent có thể tham gia Onstage chỉ bằng Zalo và hoàn thiện hồ sơ trong vài phút.

Trong dài hạn, Talent Assistant sẽ phát triển thành một **AI Agent** có khả năng đồng hành cùng Talent trong toàn bộ vòng đời sử dụng nền tảng, từ tạo hồ sơ, nhận Job, quản lý công việc đến phát triển thương hiệu cá nhân.
