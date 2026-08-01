# Thiết kế luồng hội thoại Chatbot Zalo

## Chức năng: Tạo mới và cập nhật hồ sơ Talent

---

# 1. Mục tiêu

Chatbot Zalo hỗ trợ Talent tạo mới hoặc cập nhật hồ sơ ngay trên Zalo mà không cần truy cập Website.

Hệ thống được thiết kế theo hai cơ chế khác nhau:

* **Luồng tạo mới hồ sơ:** Chatbot chủ động hướng dẫn từng bước để thu thập đầy đủ thông tin.
* **Luồng cập nhật hồ sơ:** Chatbot xử lý theo nhu cầu của người dùng, chỉ hỏi đúng thông tin cần cập nhật và kết thúc sau khi hoàn thành.

---

# 2. Nguyên tắc thiết kế

## 2.1. Hội thoại tự nhiên

Chatbot sử dụng ngôn ngữ gần gũi, giống như một nhân viên hỗ trợ đang trò chuyện với Talent.

Mỗi tin nhắn chỉ hỏi một nội dung.

---

## 2.2. Luôn có ví dụ hoặc lựa chọn

Đối với mọi câu hỏi, chatbot luôn đưa ra ví dụ hoặc các lựa chọn để người dùng dễ trả lời.

Ví dụ:

> Chiều cao của bạn là bao nhiêu?
>
> Ví dụ:
>
> • 168
>
> • 1m68
>
> • 170 cm

---

## 2.3. Chấp nhận câu trả lời tự nhiên

Người dùng không cần trả lời theo cú pháp cố định.

Ví dụ chatbot đều hiểu:

* 168
* 1m68
* 48kg
* Hà Nội
* Model PG
* Chưa có
* Không

---

# 3. Luồng khởi động

## Chatbot

> Xin chào 👋
>
> Mình là trợ lý của OnstageVN.
>
> Mình sẽ hỗ trợ bạn tạo hoặc cập nhật hồ sơ Talent ngay trên Zalo.
>
> Bạn muốn thực hiện chức năng nào?

**Lựa chọn**

* Tạo hồ sơ mới
* Cập nhật hồ sơ

Người dùng có thể trả lời:

* Tạo hồ sơ
* Tạo mới
* 1

hoặc

* Cập nhật
* Sửa hồ sơ
* 2

---

# LUỒNG 1 - TẠO MỚI HỒ SƠ

## Bước 1. Họ và tên

**Chatbot**

> Trước tiên, cho mình xin họ và tên đầy đủ của bạn nhé.
>
> Ví dụ:
>
> Nguyễn Thị Lan

---

## Bước 2. Ngày sinh

**Chatbot**

> Ngày sinh của bạn là bao nhiêu?
>
> Ví dụ:
>
> 15/08/2003

---

## Bước 3. Giới tính

**Chatbot**

> Giới tính của bạn là gì?
>
> Bạn có thể trả lời:
>
> • Nam
>
> • Nữ
>
> • Khác

---

## Bước 4. Nơi sinh sống

**Chatbot**

> Hiện tại bạn đang sinh sống ở đâu?
>
> Ví dụ:
>
> • Hà Nội
>
> • TP.HCM
>
> • Đà Nẵng

---

## Bước 5. Công việc muốn nhận

**Chatbot**

> Bạn muốn nhận những loại công việc nào trên OnstageVN?
>
> Có thể chọn nhiều.
>
> Ví dụ:
>
> • Model
>
> • PG
>
> • PB
>
> • MC
>
> • Creator
>
> • Diễn viên
>
> • Ca sĩ

---

## Bước 6. Chiều cao

**Chatbot**

> Chiều cao của bạn là bao nhiêu?
>
> Ví dụ:
>
> • 168
>
> • 1m68
>
> • 170 cm

---

## Bước 7. Cân nặng

**Chatbot**

> Cân nặng hiện tại của bạn?
>
> Ví dụ:
>
> • 48
>
> • 48kg
>
> • 52 kg

---

## Bước 8. Số đo ba vòng

**Chatbot**

> Nếu bạn biết số đo ba vòng thì gửi mình nhé.
>
> Nếu chưa có có thể trả lời:
>
> • Chưa có
>
> • Không muốn cung cấp

---

## Bước 9. Ảnh đại diện (Avatar)

**Chatbot**

> Tiếp theo, hãy gửi cho mình 1 bức **Ảnh đại diện (Avatar)** nhé 📸
>
> Gợi ý:
>
> • Nên chọn ảnh chân dung rõ mặt, chất lượng cao.
> • Ảnh chụp cận cảnh hoặc bán thân sẽ giúp hồ sơ chuyên nghiệp hơn.

---

## Bước 10. Ảnh bìa (Cover)

**Chatbot**

> Bây giờ hãy gửi cho mình 1 bức **Ảnh bìa (Cover)** nhé 🖼️
>
> Gợi ý:
>
> • Nên chọn ảnh chụp ngang hoặc ảnh chụp trong sự kiện, studio.
> • Nếu chưa có ảnh bìa ưng ý, bạn có thể trả lời:
>
> • **Để sau** (Hệ thống sẽ tự chọn một ảnh đẹp từ Portfolio của bạn làm ảnh bìa sau).

---

## Bước 11. Ảnh Portfolio (Ảnh hồ sơ)

**Chatbot**

> Bây giờ hãy gửi thêm một vài **Ảnh Portfolio** (ảnh hoạt động, thời trang, sự kiện...) đẹp nhất của bạn nhé.
>
> Bạn có thể chọn và gửi nhiều ảnh cùng lúc.
>
> Gợi ý:
>
> • Ảnh toàn thân
> • Ảnh sự kiện/show diễn đã tham gia
> • Ảnh thời trang/Concept

Sau khi người dùng gửi ảnh:

> Mình đã nhận được ảnh rồi.
>
> Bạn còn muốn gửi thêm ảnh không?
>
> Trả lời:
>
> • Có
>
> • Không

---

## Bước 12. Video giới thiệu

**Chatbot**

> Bạn có video giới thiệu không?
>
> Nếu có hãy gửi luôn nhé.
>
> Nếu chưa có có thể trả lời:
>
> • Chưa có
>
> • Để sau

---

## Bước 13. Kỹ năng

**Chatbot**

> Bạn có những kỹ năng nổi bật nào?
>
> Ví dụ:
>
> • Catwalk
>
> • Livestream
>
> • Dance
>
> • MC
>
> • Makeup
>
> • Review sản phẩm

---

## Bước 14. Mạng xã hội

**Chatbot**

> Nếu có Facebook, TikTok hoặc Instagram thì gửi mình nhé.
>
> Bạn có thể gửi nhiều link trong cùng một tin nhắn.

---

## Bước 15. Giá booking

**Chatbot**

> Bạn thường nhận công việc với Phí booking khoảng bao nhiêu?
>
> Ví dụ:
>
> • 500.000/buổi
>
> • 1.000.000/ngày
>
> • Chưa có Phí booking

---

## Bước 16. Khu vực làm việc

**Chatbot**

> Bạn có thể nhận việc ở khu vực nào?
>
> Ví dụ:
>
> • Hà Nội
>
> • Miền Bắc
>
> • Toàn quốc

---

## Bước 17. Kinh nghiệm

**Chatbot**

> Bạn đã từng tham gia sự kiện hoặc làm việc với nhãn hàng nào chưa?
>
> Ví dụ:
>
> • Samsung Roadshow
> • Shopee Live
> • VinFast Event
> • Chưa có kinh nghiệm

---

## Bước 18. Xác nhận

Chatbot hiển thị toàn bộ thông tin đã thu thập.

> Hồ sơ của bạn đã hoàn thành.
>
> Nếu mọi thông tin đều đúng hãy trả lời:
>
> **Đồng ý**
>
> Nếu muốn chỉnh sửa trước khi lưu hãy trả lời:
>
> **Chỉnh sửa**

Sau khi người dùng xác nhận:

> 🎉 Hồ sơ của bạn đã được tạo thành công.
>
> Bạn có thể cập nhật thông tin bất cứ lúc nào bằng cách nhắn:
>
> **Cập nhật hồ sơ**

---

# LUỒNG 2 - CẬP NHẬT HỒ SƠ

Khác với luồng tạo mới, chatbot **không hỏi lại toàn bộ hồ sơ**.

Người dùng chỉ cần nói nội dung muốn thay đổi, chatbot sẽ xử lý đúng nội dung đó.

---

## Bắt đầu

**Người dùng**

> Cập nhật hồ sơ

**Chatbot**

> Bạn muốn cập nhật nội dung nào?
>
> Ví dụ:
>
> • Họ tên
> • Chiều cao / Cân nặng
> • Ảnh đại diện (Avatar)
> • Ảnh bìa (Cover)
> • Ảnh Portfolio
> • Video giới thiệu
> • Mạng xã hội (Facebook, TikTok)
> • Giá booking / Khu vực làm việc
> • Kinh nghiệm

---

## Kịch bản 1 - Cập nhật chiều cao

**Người dùng**

> Chiều cao

**Chatbot**

> Chiều cao mới của bạn là bao nhiêu?
>
> Ví dụ:
>
> • 168
> • 1m68
> • 170 cm

**Người dùng**

> 170

**Chatbot**

> ✅ Mình đã cập nhật chiều cao thành **170 cm**.

*Kết thúc phiên cập nhật.*

---

## Kịch bản 2A - Cập nhật Ảnh đại diện (Avatar)

**Người dùng**

> Đổi avatar (hoặc chọn "Ảnh đại diện" từ danh sách)

**Chatbot**

> Bạn gửi ảnh đại diện mới cho mình nhé 📸

**Người dùng**

(Gửi 1 ảnh chân dung)

**Chatbot**

> ✅ Mình đã cập nhật ảnh đại diện mới của bạn thành công!

*Kết thúc phiên cập nhật.*

---

## Kịch bản 2B - Cập nhật Ảnh bìa (Cover)

**Người dùng**

> Đổi ảnh bìa (hoặc chọn "Ảnh bìa" từ danh sách)

**Chatbot**

> Bạn gửi ảnh bìa mới cho mình nhé 🖼️

**Người dùng**

(Gửi 1 ảnh bìa)

**Chatbot**

> ✅ Mình đã cập nhật ảnh bìa mới của bạn thành công!

*Kết thúc phiên cập nhật.*

---

## Kịch bản 2C - Cập nhật Ảnh Portfolio (Ảnh hồ sơ)

Để giải quyết vấn đề **"Làm thế nào để chatbot biết user đang có những ảnh nào, muốn thay thế hay xóa ảnh nào trong giao diện chat?"**, hệ thống hỗ trợ 3 cơ chế sau:

### Cơ chế 1: Mở Webview/Mini App (Tối ưu & Khuyên dùng)
*Trải nghiệm mượt mà nhất bằng cách mở giao diện quản lý ảnh trực quan.*

**Người dùng**

> Cập nhật Portfolio (hoặc chọn "Ảnh Portfolio" từ danh sách)

**Chatbot**

> Để quản lý, xem lại và xóa/thay thế từng ảnh trong Portfolio một cách thuận tiện nhất, bạn nhấn vào nút dưới đây nhé 👇
> 
> [Nút: Quản lý Portfolio] *(Mở Webview/Zalo Mini App hiển thị danh sách ảnh dạng Grid, có nút Xóa, nút Upload mới, hỗ trợ kéo thả sắp xếp thứ tự ảnh)*

---

### Cơ chế 2: Tải lên nhanh & Lựa chọn cơ bản bằng Chat
*Phù hợp cho việc bổ sung hoặc làm mới toàn bộ album nhanh chóng.*

**Người dùng**

> Cập nhật Portfolio

**Chatbot**

> Bạn gửi ảnh mới cho mình nhé. Bạn có thể gửi nhiều ảnh cùng lúc.

**Người dùng**

(Gửi 3 ảnh mới)

**Chatbot**

> Mình đã nhận được 3 ảnh mới. Bạn muốn xử lý thế nào với số ảnh này?
> 
> • **Thêm vào Portfolio** (Giữ nguyên các ảnh cũ, thêm các ảnh mới này vào)
> • **Thay thế toàn bộ** (Xóa sạch các ảnh cũ trong Portfolio, chỉ giữ lại các ảnh mới này)

**Người dùng**

> Thêm vào Portfolio

**Chatbot**

> ✅ Đã thêm 3 ảnh mới vào Portfolio của bạn thành công!

*Kết thúc phiên cập nhật.*

---

### Cơ chế 3: Đánh số thứ tự ảnh hiện tại (Chat-based management)
*Khi Talent muốn quản lý/xóa/thay thế một ảnh cụ thể mà không muốn rời khỏi màn hình chat.*

**Người dùng**

> Quản lý chi tiết ảnh trên chat

**Chatbot**

> Đây là danh sách các ảnh hiện tại trong Portfolio của bạn:
> 
> *(Gửi tin nhắn Carousel gồm các ảnh hiện tại, mỗi ảnh được đính kèm số thứ tự: Ảnh 1, Ảnh 2, Ảnh 3,...)*
> 
> Bạn muốn thay đổi ảnh nào? Hãy trả lời theo cú pháp, ví dụ:
> • **Xóa 2** (để xóa ảnh số 2)
> • **Thay 3** (để thay thế ảnh số 3 bằng ảnh mới)

**Người dùng**

> Xóa 2

**Chatbot**

> ✅ Đã xóa ảnh số 2 khỏi Portfolio của bạn thành công.

*Kết thúc phiên cập nhật.*

---

## Kịch bản 3 - Cập nhật mạng xã hội

**Người dùng**

> TikTok

**Chatbot**

> Bạn gửi link TikTok mới giúp mình nhé.

**Người dùng**

(Gửi link)

**Chatbot**

> ✅ Mình đã cập nhật tài khoản TikTok.

*Kết thúc phiên cập nhật.*

---

## Kịch bản 4 - Cập nhật giá booking

**Người dùng**

> Giá booking

**Chatbot**

> Phí booking mới của bạn là bao nhiêu?
>
> Ví dụ:
>
> • 500.000/buổi
>
> • 1.500.000/ngày

**Người dùng**

> 2 triệu một ngày

**Chatbot**

> ✅ Mình đã cập nhật giá booking thành **2.000.000 VNĐ/ngày**.

*Kết thúc phiên cập nhật.*

---

# 6. Xử lý khi chatbot không hiểu yêu cầu

Nếu chatbot không xác định được người dùng muốn cập nhật nội dung nào, chatbot sẽ hướng dẫn lại.

Ví dụ:

**Người dùng**

> Muốn sửa hồ sơ

**Chatbot**

> Bạn muốn sửa thông tin nào?
>
> Ví dụ:
>
> • Họ tên
> • Chiều cao / Cân nặng
> • Ảnh đại diện (Avatar)
> • Ảnh bìa (Cover)
> • Ảnh Portfolio
> • Video giới thiệu
> • Mạng xã hội (Facebook, TikTok)
> • Giá booking / Khu vực làm việc
> • Kinh nghiệm

Sau khi người dùng chỉ rõ nội dung cần sửa, chatbot tiếp tục đúng kịch bản tương ứng.
