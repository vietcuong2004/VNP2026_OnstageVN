# Kịch bản hội thoại chi tiết - Zalo Chatbot Brand

Tài liệu này chứa kịch bản hội thoại tương tác theo dạng chọn số/option ngắn gọn và trực quan giữa Chatbot Zalo và Brand/Agency.

Tài liệu bổ trợ cho thiết kế luồng tổng thể tại [campaign-creation-flow.md](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/docs/zalo-chatbot/campaign-creation-flow.md).

---

## 1. PHÂN LOẠI TRƯỜNG THÔNG TIN (FIELD CATEGORIZATION)

### Nhóm A: Thông tin BẮT BUỘC & KHUYÊN DÙNG (Tạo nhanh Job qua Chatbot)
Đây là các thông tin cốt lõi để khởi tạo thành công chiến dịch và hiển thị trên bảng tin tuyển dụng.

| Tên Trường (API) | Cột CSDL (Field) | Mô tả trong Form | Định dạng & Quy tắc validation | Gợi ý xử lý của Chatbot |
| :--- | :--- | :--- | :--- | :--- |
| **`title`** | `campaigns.title` | Tiêu đề Job | Chữ tự do (10 - 100 ký tự) | Nhập text tự do |
| **`jobType`** | `campaigns.job_type` | Loại hình công việc | Trùng khớp với danh mục loại hình được định cấu hình | Chọn nhanh qua nút bấm (Quick Replies). Nếu gõ tay, AI sẽ nhận diện loại hình gần nhất. |
| **`city`** | `campaigns.city` | Thành phố làm việc | Tên tỉnh/thành phố hợp lệ tại Việt Nam | Chọn nhanh (Hà Nội, TP.HCM, Đà Nẵng...) hoặc gõ tự do. |
| **`eventDate`** | `campaigns.event_date` | Ngày diễn ra sự kiện | Định dạng `YYYY-MM-DD`. Phải là ngày trong tương lai. | Nhận diện ngày thông minh (Ví dụ: "thứ 7 tuần sau", "30/08" -> parse tự động). |
| **`talentQuantity`** | `campaigns.talent_quantity` | Số lượng cần tuyển | Số nguyên dương (> 0) | Trích xuất số từ câu trả lời tự nhiên (Ví dụ: "cần tuyển 3 bạn" -> `3`). |
| **`budget` / `budgetNegotiable`** | `campaigns.budget_min` / `campaigns.budget_max` | Thù lao (Cát-xê) | Số tiền cụ thể (>= 0) HOẶC đặt cờ Thỏa thuận | Gợi ý nút bấm "Thỏa thuận" hoặc nhập tiền tự do (Ví dụ: "1tr5", "800k/ngày" -> parse số). |
| **`description`** | `campaigns.description` | Mô tả công việc ngắn | Chữ tự do (tối thiểu 20 ký tự) | Nhập text tự do hoặc ghi âm giọng nói chuyển đổi thành văn bản. |
| **`campaignImages`** | `campaign_media.path` | Ảnh minh họa | Tối đa 10 ảnh (Có thể bỏ qua ở bước tạo nhanh) | Người dùng gửi trực tiếp ảnh từ Zalo hoặc chọn "Bỏ qua". |

### Nhóm B: Thông tin BỔ SUNG SAU (Hoàn thiện trên Web/App)
Những thông tin này có thể được bổ sung sau để tối ưu hiệu quả tìm kiếm nhưng **không bắt buộc** phải điền qua chatbot. Chatbot sẽ mặc định đặt giá trị trống hoặc điền giá trị mặc định để rút ngắn luồng.

| Tên Trường (API) | Cột CSDL (Field) | Mô tả trong Form | Giá trị mặc định khi tạo nhanh |
| :--- | :--- | :--- | :--- |
| **`address`** | `campaigns.location` | Địa chỉ chi tiết sự kiện | Lấy trùng với **`city`** |
| **`startDate` / `endDate`** | `campaigns.start_date` / `campaigns.end_date` | Ngày bắt đầu/kết thúc nhận hồ sơ | Ngày tạo / ngày diễn ra sự kiện chính |
| **`applicationDeadline`** | `campaigns.application_deadline` | Hạn ứng tuyển | Trước ngày diễn ra sự kiện chính 1 ngày |
| **`responsibilities`** | `campaigns.responsibilities` | Đầu việc chi tiết | `["Thỏa thuận theo mô tả"]` (Mảng JSON) |
| **`benefits`** | `campaigns.benefits` | Quyền lợi & Đãi ngộ | `["Thỏa thuận theo mô tả"]` (Mảng JSON) |
| **`industries`** | `campaigns.industries` | Lĩnh vực | Tự động phân loại dựa trên `jobType` |
| **`targetProfiles`** | `campaigns.target_profiles` | Nhóm Talent phù hợp | Tự động phân loại dựa trên `jobType` |
| **`heightMin` / `weightMax`** | `campaigns.height_min_cm` / `campaigns.weight_max_kg` | Yêu cầu chiều cao, cân nặng | Để trống (Không yêu cầu) |
| **`experienceMin`** | `campaigns.experience_min_years` | Yêu cầu số năm kinh nghiệm | Để trống (Không yêu cầu) |
| **`contactNote`** | `campaigns.contact_note` | Ghi chú liên hệ | Để trống |
| **`escrowed`** | *N/A* (Ký quỹ qua Stripe/MoMo) | Ký quỹ bảo chứng | **`false`** (Ký quỹ sau khi khớp nối thành công) |

---

## 2. KHỞI ĐỘNG CHATBOT (WELCOME & MAIN MENU)

* **Chatbot:**
  > Mình là trợ lý Campaign của OnstageVN.
  > 
  > Bạn muốn làm gì?
  > 
  > 1. Tạo campaign nhanh
  > 2. Campaign của tôi
  > 3. Đề xuất talent phù hợp với campaign
  > 4. Tài khoản & liên kết Zalo
  > 
  > Bạn có thể nhắn số 1, 2, 3, 4 hoặc gửi thẳng nội dung campaign.

---

## 3. LUỒNG 1 - TẠO CAMPAIGN NHANH

### Bước 1: Tiêu đề campaign
* **Người dùng nhắn:** `1` hoặc `Tạo campaign`
* **Chatbot:**
  > Nhập tiêu đề campaign của bạn nhé (Ví dụ: Tuyển KOL livestream mỹ phẩm)

---

### Bước 2: Loại hình công việc (Job Type)
* **Người dùng nhắn:** `Tuyển mẫu lookbook thời trang`
* **Chatbot:**
  > Chọn loại hình công việc phù hợp:
  > 
  > 1. Tuyển cộng tác viên
  > 2. Tuyển đại sứ
  > 3. Beauty KOL/KOC
  > 4. KOL livestream
  > 5. Model lookbook
  > 6. PG event
  > 7. MC sự kiện
  > 8. Dancer performance
  > 9. Khác
  > 
  > Bạn có thể nhắn số hoặc chọn nhanh nút bấm.

---

### Bước 3: Địa điểm làm việc (Location)
* **Người dùng nhắn:** `5` (hoặc `Model lookbook`)
* **Chatbot:**
  > Công việc này diễn ra ở thành phố nào?
  > 
  > 1. Hà Nội
  > 2. TP.HCM
  > 3. Đà Nẵng
  > 4. Nhập tỉnh/thành phố khác

---

### Bước 4: Thời gian diễn ra (Event Date)
* **Người dùng nhắn:** `2` (hoặc `TP.HCM`)
* **Chatbot:**
  > Ngày diễn ra sự kiện là khi nào? (Ví dụ: 30/08/2026 hoặc "Chủ nhật tuần này")

---

### Bước 5: Số lượng tuyển dụng (Quantity)
* **Người dùng nhắn:** `30/08/2026` (hoặc `chủ nhật tuần này`)
* **Chatbot:**
  > Số lượng talent cần tuyển? (Ví dụ: 3)

---

### Bước 6: Mức thù lao (Cát-xê)
* **Người dùng nhắn:** `2` (hoặc `Cần 2 bạn`)
* **Chatbot:**
  > Thù lao dự kiến cho mỗi bạn là bao nhiêu?
  > 
  > 1. Thỏa thuận
  > 2. 500.000/ngày
  > 3. 1.000.000/ngày
  > 4. 2.000.000/ngày
  > 
  > Hoặc bạn gõ số tiền khác (Ví dụ: 1.500.000)

---

### Bước 7: Mô tả công việc
* **Người dùng nhắn:** `1.500.000` (hoặc `1tr5`)
* **Chatbot:**
  > Viết mô tả công việc ngắn gọn (Ví dụ: Yêu cầu chiều cao, trang phục, lịch chụp...)

---

### Bước 8: Ảnh minh họa (Campaign Images)
* **Người dùng nhắn:** `Chụp lookbook 20 bộ trang phục hè tại studio Q1.`
* **Chatbot:**
  > Bạn có muốn thêm ảnh minh họa cho campaign (ảnh concept, sản phẩm...) không?
  > 
  > 1. Bỏ qua
  > 2. Bắt đầu đăng ảnh

---

### Bước 8.1: Nhận ảnh từ người dùng (Nếu chọn 2)
* **Người dùng nhắn:** `2` (hoặc `Bắt đầu đăng ảnh`)
* **Chatbot:**
  > Vui lòng gửi ảnh minh họa nhé. Bạn có thể chọn và gửi nhiều ảnh cùng lúc (tối đa 10 ảnh).
* **Người dùng nhắn:** (Gửi các file ảnh từ thư viện hoặc camera)
* **Chatbot:**
  > Nhận được 3 ảnh thành công.
  > 
  > 1. Hoàn tất và tiếp tục
  > 2. Gửi thêm ảnh
* **Người dùng nhắn:** `1` (hoặc `Hoàn tất và tiếp tục`)

---

### Bước 9: Xác nhận & Đăng tuyển
* **Người dùng nhắn:** `1` (ở Bước 8 nếu chọn Bỏ qua) HOẶC `1` (ở Bước 8.1 nếu chọn Hoàn tất và tiếp tục)
* **Chatbot:**
  > Xác nhận thông tin campaign:
  > 
  > • Tiêu đề: Tuyển mẫu lookbook thời trang
  > • Loại hình: Model lookbook
  > • Địa điểm: TP.HCM
  > • Thời gian: 30/08/2026
  > • Số lượng: 2
  > • Thù lao: 1.500.000đ/ngày
  > • Mô tả: Chụp lookbook 20 bộ trang phục hè tại studio Q1.
  > • Ảnh đính kèm: [3 ảnh đã tải lên] (Hoặc: Chưa có)
  > 
  > Bạn có muốn đăng tuyển ngay không?
  > 
  > 1. Đồng ý đăng
  > 2. Chỉnh sửa lại
  > 3. Hủy bỏ

* **Người dùng nhắn:** `1` (hoặc chọn `Đồng ý đăng`)
* **Chatbot:**
  > 🎉 Đăng tuyển thành công! Chiến dịch của bạn đã hiển thị trên OnstageVN.
  > 
  > Link quản lý: https://onstage.vn/campaign/12345
  > (Bạn có thể truy cập link trên để cập nhật thêm ảnh hoặc thực hiện ký quỹ bảo chứng).

---

## 4. LUỒNG 2 - CHỈNH SỬA CAMPAIGN CỦA TÔI

* **Người dùng nhắn:** `2` hoặc `Campaign của tôi`
* **Chatbot:**
  > Chọn campaign bạn muốn xem/chỉnh sửa:
  > 
  > 1. Tuyển mẫu lookbook thời trang (Đang chạy - 5 ứng viên)
  > 2. Tuyển KOL livestream mỹ phẩm (Đang chạy - 12 ứng viên)

---

### Cập nhật campaign
* **Người dùng nhắn:** `1`
* **Chatbot:**
  > Bạn muốn làm gì với campaign "Tuyển mẫu lookbook thời trang"?
  > 
  > 1. Xem danh sách ứng viên (5)
  > 2. Cập nhật thông tin (Thù lao, Số lượng, Mô tả)
  > 3. Đóng nhận hồ sơ

* **Người dùng nhắn:** `2`
* **Chatbot:**
  > Bạn muốn cập nhật thông tin nào?
  > 
  > 1. Thù lao
  > 2. Số lượng tuyển
  > 3. Mô tả công việc

* **Người dùng nhắn:** `1`
* **Chatbot:**
  > Nhập mức thù lao mới:

* **Người dùng nhắn:** `2.000.000`
* **Chatbot:**
  > ✅ Đã cập nhật thù lao mới thành **2.000.000 VND/ngày**.

---

### Đóng nhận hồ sơ
* **Người dùng nhắn:** `3` (từ menu chi tiết campaign)
* **Chatbot:**
  > Xác nhận đóng nhận hồ sơ campaign này?
  > 
  > 1. Đồng ý đóng
  > 2. Quay lại
* **Người dùng nhắn:** `1`
* **Chatbot:**
  > ✅ Đã đóng nhận hồ sơ chiến dịch thành công.

---

