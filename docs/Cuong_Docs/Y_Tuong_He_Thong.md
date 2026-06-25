# Ý Tưởng Hệ Thống — OnstageVN

> **Hệ sinh thái vòng đời (Lifecycle Ecosystem)** đồng hành cùng người đẹp từ con số 0 cho đến khi tỏa sáng và khai thác thương mại bền vững.

---

## I. PHÂN TÍCH KIẾN TRÚC HỆ THỐNG THEO VÒNG ĐỜI (Lifecycle)

Hệ thống sẽ giải quyết bài toán cốt lõi: *"Số hóa và tự động hóa quy trình quản trị, kết nối trong ngành công nghiệp sắc đẹp"* qua **4 giai đoạn chính**:

### 1. Giai đoạn 1: Trước cuộc thi (Pre-Pageant / Incubation)

- **Hệ thống Định hướng & Match-making:** Chuyên gia hoặc Thuật toán AI phân tích chỉ số nhân trắc học, kỹ năng, gương mặt (với định hướng nhân tướng học/hình ảnh phù hợp) để gợi ý các cuộc thi phù hợp (Hoa hậu, Hoa khôi, Người mẫu Thương hiệu, Fitness...).
- **Trung tâm dịch vụ phụ trợ (B2B Marketplace):** Nơi các thí sinh kết nối với các đối tác chiến lược:
  - **Nhà thiết kế/Thương hiệu:** Thuê/tài trợ trang phục dạ hội, áo dài.
  - **Makeup Artists/Stylists:** Đặt lịch theo gói đồng hành suốt cuộc thi.
  - **Trung tâm Đào tạo:** Đăng ký khóa học Catwalk, ứng xử, giải phóng hình thể.
- **Kết nối Nhà tài trợ sớm (Early Brand Endorsement):** Các nhãn hàng có thể tìm kiếm gương mặt tiềm năng từ vòng hồ sơ để tài trợ ngân sách đổi lại quyền lợi truyền thông ngay từ đầu.

### 2. Giai đoạn 2: Trong cuộc thi (In-Pageant / Acceleration)

- **Quản trị hình ảnh & Truyền thông số:** Tích hợp công cụ lên lịch bám sát timeline cuộc thi. Hỗ trợ thí sinh xây dựng nội dung trên TikTok, Facebook, Instagram tự động theo các tuyến bài (Content Matrix) có sẵn của app.
- **Hệ thống Đánh giá Chất lượng (QC & Monitoring):** *(Áp dụng từ mô hình quản lý KOL chuyên nghiệp)* Theo dõi chỉ số tăng trưởng tương tác (Followers, Engagement, Sentiment) của từng thí sinh theo thời gian thực để các nhãn hàng/nhà đầu tư theo dõi "phong độ".

### 3. Giai đoạn 3: Sau cuộc thi (Post-Pageant / Monetization)

- **Hệ thống Booking Tự động (Smart Booking Engine):** Nhãn hàng (Brands) hoặc Agency tạo chiến dịch (Campaign) → Hệ thống tự động filter danh sách Người đẹp/Model đáp ứng tiêu chí (Chiều cao, độ tuổi, khu vực, phân khúc giá Catwalk/Event/KOL).
- **Hợp đồng điện tử (Smart Contract):** Tự động khóa tiền cọc (Escrow) để bảo vệ quyền lợi cho cả hai bên, tránh tình trạng bùng show hoặc quỵt cát-xê.
- **Quản lý Job ngắn hạn & dài hạn:** Phân loại rõ ràng giữa job sự kiện (Event, Catwalk, PG) và job đại sứ thương hiệu (Ambassador, Retainer contract).

### 4. Tính năng Đặc biệt: Crown Funding (Quỹ Vương Miện / Gọi vốn cộng đồng)

- **Ủng hộ dự án Nhân ái/Tài năng:** Trong các cuộc thi Hoa hậu, dự án Nhân ái chiếm điểm số rất lớn. Tính năng này cho phép Fan và Doanh nghiệp quyên góp tiền trực tiếp cho dự án xã hội của thí sinh (đảm bảo minh bạch qua sao kê/blockchain hoặc ví điện tử).
- **Fan Voting & Gifting:** Tích hợp cổng bình chọn (Vote) nhận quà ảo quy đổi ra giá trị thực, giúp thí sinh có thêm ngân sách chi trả cho trang phục, makeup trong cuộc thi.

---

## II. HỌC HỎI TỪ CÁC MÔ HÌNH QUỐC TẾ & TÀI LIỆU KỸ THUẬT

### Từ Backstage & StarNow

- **Cơ chế Subscription (Thu phí thành viên):** Người đẹp/Model trả phí tháng/năm để có "Premium Profile" (được ưu tiên hiển thị đầu bảng tìm kiếm của Nhãn hàng, nhận tin tuyển dụng sớm).
- **Portfolio điện tử chuẩn hóa:** Hồ sơ không chỉ có ảnh, mà bắt buộc phải có:
  - Chiều cao, cân nặng, số đo 3 vòng
  - Video Catwalk (Polaroid)
  - Video giới thiệu bản thân
  - Liên kết mạng xã hội
  - Lịch trống (Availability Calendar)

### Từ tài liệu Quản lý KOLs/Models (manager-kols-models)

- **Three-Layer Data Strategy (Chiến lược dữ liệu 3 lớp):**
  1. **Dữ liệu tự động (API):** Cập nhật tự động lượt follow, tương tác thực tế từ TikTok/Instagram của người đẹp.
  2. **Dữ liệu thủ công (Plugin/Admin nhập):** Đánh giá từ chuyên gia về thái độ làm việc, kỹ năng catwalk, điểm uy tín (Reliability tracking).
  3. **Dữ liệu báo giá (Rate Card):** Khóa khoảng giá tối thiểu cho các dịch vụ (Post, Video, Livestream, Dự sự kiện).

---

> Để đội ngũ kỹ thuật (Tech Leader, Developers, UI/UX Designers) có thể nắm bắt chính xác logic cốt lõi và triển khai hệ thống phần mềm mà không bị chệch hướng, tài liệu này cần được viết bằng ngôn ngữ chuẩn kỹ thuật: rõ ràng, phân tách module và tường minh về mặt dữ liệu (Data & Logic Flow).
>
> Dưới đây là bản **Tài liệu Định hướng Phát triển Sản phẩm Tổng hợp** (Product Requirement Document - PRD Shortform). Có thể gửi thẳng file này cho Tech Leader của dự án làm kim chỉ nam triển khai.

---

# TÀI LIỆU ĐỊNH HƯỚNG PHÁT TRIỂN SẢN PHẨM (PRODUCT SPECIFICATION)

**Dự án:** Nền tảng Công nghệ Quản trị & Kết nối Tài năng Giải trí 4.0

---

## MÔ ĐUN 1: KIẾN TRÚC PHÂN HẠNG TÀI NĂNG SỐ HÓA (TALENT TIERING ENGINE)

Hệ thống Core Backend sẽ tự động chạy thuật toán quét dữ liệu đầu vào của Model/Người đẹp và chấm điểm tự động theo **Hệ số 100 điểm**, sau đó xếp vào **4 Tier (Hạng)**.

### 1. Thuật toán chấm điểm 10 Tiêu chí *(Mỗi tiêu chí tối đa 10 điểm)*

| Mã | Tiêu chí | Mô tả |
|---|---|---|
| **M1.1** | Danh hiệu & Thành tích | Phân loại theo cấp cuộc thi (Quốc tế/Quốc gia = 9-10đ; Cấp Tỉnh/Ngành = 5-6đ; Tự do = 1-2đ). |
| **M1.2** | Nhân trắc học & Hình thể | Tính điểm dựa trên dữ liệu chiều cao, cấu trúc số đo và tỷ lệ đối xứng gương mặt/khung xương. |
| **M1.3** | Social Metrics | API tự động quét, đo lường tổng lượng Followers, Reach và Engagement Rate trên TikTok, Instagram, Facebook. |
| **M1.4** | Học vấn & Ngoại ngữ | Điểm số dựa trên trình độ bằng cấp và chứng chỉ ngoại ngữ thực tế (VD: IELTS ≥ 7.0 / Song ngữ = 10đ). |
| **M1.5** | Portfolio & Kinh nghiệm | Bộ lưu trữ hồ sơ năng lực, thâm niên trong nghề và số lượng chiến dịch lớn từng hợp tác thành công. |
| **M1.6** | Uy tín Vận hành & Thái độ | Tự động tích lũy điểm dựa trên lịch sử làm việc thực tế trên app (Đúng giờ, không hủy show, đánh giá sao từ Brand). |
| **M1.7** | Kỹ năng Chuyên môn | Đánh giá năng lực thực tế về Catwalk, Pose dáng, Diễn xuất trước camera, Live-streaming hoặc MC. |
| **M1.8** | Giá trị Thương mại (ROI) | Đo lường khả năng chuyển đổi doanh thu hoặc hiệu ứng Viral mà tài năng mang lại cho chiến dịch. |
| **M1.9** | Thích ứng Công nghệ | Tần suất tương tác, cập nhật hồ sơ số và năng lực tự sáng tạo nội dung số (Content Creator). |
| **M1.10** | An toàn Hình ảnh (Brand Safety) | Bộ lọc tự động quét lịch sử số, đảm bảo hồ sơ "sạch", không scandal để bảo vệ cho các nhãn hàng tài trợ. |

### 2. Logic phân Tier tự động của hệ thống (Tiering Logic)

| Hạng | Khoảng điểm | Mô tả |
|---|---|---|
| **🥇 HẠNG S** (Celeb / Super VIP) | 90 – 100 điểm | Nhóm Hoa hậu Quốc gia, Ngôi sao hạng S. |
| **🥈 HẠNG A** (High-end Professional) | 70 – 89 điểm | Nhóm Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP. |
| **🥉 HẠNG B** (Mid-range / Freelance) | 45 – 69 điểm | Nhóm Mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp. |
| **⬜ HẠNG C** (Entry-level / Newbie) | 20 – 44 điểm | Nhóm mẫu tự do mới vào nghề, diễn viên phụ, PG sự kiện đại trà. |

> [!NOTE]
> **Lưu ý cho Kỹ thuật:** Nếu tổng điểm dưới 20, tự động chuyển trạng thái tài khoản thành *"Dự bị/Chờ cập nhật"* (Potential Profile).

---

## MÔ ĐUN 2: KỊCH BẢN KẾT NỐI VÀ TỰ ĐỘNG HÓA THƯƠNG MẠI (MATCH-MAKING B2B)

Hệ thống phải tối ưu hóa quy trình kết nối (Match-making) giữa **nguồn cung** (Model) và **nguồn cầu** (30 Doanh nghiệp mục tiêu thuộc 3 nhóm chiến lược: Local Brands, Event Agencies, Luxury Brands).

### 1. Luồng trải nghiệm phía Doanh nghiệp (Brand Portal Flow)

1. **Bước 1:** Brand đăng nhập hệ thống → Khởi tạo chiến dịch (Campaign) theo nhu cầu *(VD: Chụp ảnh Lookbook thời trang, Event Khai trương xe sang, Phiên Mega Live bán mỹ phẩm)*.
2. **Bước 2:** Brand thiết lập bộ lọc nâng cao (Filter System): Lọc theo Tier (S/A/B/C) → Lọc theo Tiêu chí chuyên sâu *(VD: Cần Hạng B có tiêu chí số 7 về Livestream đạt từ 8 điểm trở lên)*.
3. **Bước 3:** Hệ thống AI quét Data và trả về danh sách Hồ sơ (Verified Profiles) phù hợp tối ưu nhất tương ứng với 20 ngành nghề/công việc → Brand bấm nút **"Gửi lời mời kết nối"** hoặc **"Book ngay"**.

### 2. Luồng trải nghiệm phía Tài năng (Talent Portal Flow)

Thí sinh/Model nhận thông báo Job (Push Notification) khớp lệnh từ hệ thống → Xem kịch bản công việc, yêu cầu trang phục, thời gian, địa điểm và mức cát-xê minh bạch → Bấm **"Chấp nhận"** hoặc **"Từ chối"**.

---

## MÔ ĐUN 3: TÍNH NĂNG CỐT LÕI & CƠ CHẾ BẢO VỆ (CORE FEATURES)

### 1. Hệ thống Bảo vệ Dòng tiền Đặt cọc (Escrow Payment System)

- **Logic vận hành:** Khi hai bên khớp lệnh giao dịch thành công, ngân sách booking từ Doanh nghiệp sẽ tự động được khóa/đặt cọc (Escrow) trong hệ thống của sàn.
- **Điều kiện giải ngân (Release Condition):** Số tiền chỉ được tự động giải ngân cho Model sau khi hệ thống ghi nhận sự kiện hoàn thành công việc (Brand bấm xác nhận nghiệm thu hoặc hệ thống tự động nghiệm thu sau 24h nếu không có khiếu nại).
- **Xử lý tranh chấp (Dispute Resolution):** Nếu xảy ra sự cố hủy show hoặc không đúng cam kết, Admin hệ thống có quyền can thiệp dựa trên minh chứng hợp đồng điện tử để hoàn trả dòng tiền và tự động trừ điểm Uy tín (Tiêu chí số 6) của bên vi phạm.

### 2. Giải pháp Quản trị Doanh nghiệp Tập trung (Enterprise Tools)

- **Tích hợp QR & GPS Check-in:** Dành cho các đơn vị chạy sự kiện (Event Agencies). Hệ thống quản lý lịch trình bằng cách bắt buộc nhân sự PG/Model quét mã QR tại hiện trường hoặc định vị vị trí thời gian thực để tự động chấm công.
- **Giải pháp Tài chính 1 Hóa đơn:** Backend xử lý gom toàn bộ giao dịch của chiến dịch *(VD: Book 30 PG cho event)* thành một hóa đơn tổng duy nhất xuất cho Doanh nghiệp, sàn tự động phân rã dòng tiền chi trả cho từng cá nhân để tối ưu chứng từ thuế cho khối Agency.

### 3. Hệ thống CMS Giải đấu & Cổng Bình chọn (Voting Engine)

- **Công cụ dành cho BTC Cuộc thi Sắc đẹp:** Cung cấp giao diện quản trị (Dashboard) số hóa toàn bộ hồ sơ nhân trắc học của thí sinh, loại bỏ thủ tục giấy tờ.
- **Cổng bình chọn số:** Tích hợp ví điện tử thời gian thực để người hâm mộ vote cho thí sinh, tự động đồng bộ điểm số lên bảng xếp hạng và thiết lập cơ chế chia sẻ doanh thu (Revenue Sharing) tự động giữa Sàn và Ban tổ chức.

---

## MÔ ĐUN 4: ĐỊNH HƯỚNG GIAO DIỆN (UI/UX DESIGN SPECIFICATIONS)

- **Phong cách thiết kế:** Luxury Tech / Futuristic Minimalist *(Công nghệ hiện đại kết hợp Xa xỉ)*.
- **Bảng màu chủ đạo (Color Palette):**
  - **Nền tảng (Background):** Màu tối sâu (Deep Dark Blue / Matte Black) để tăng chiều sâu và tạo cảm giác cao cấp.
  - **Màu nhận diện phân hạng:**
    - Hạng S → Viền **Vàng Kim** phát sáng (Gold Neon Aura)
    - Hạng A → Viền **Bạc ánh kim** (Silver Metallic)
    - Hạng B → Sắc **Tím/Xanh Neon** thời thượng
    - Hạng C → **Xanh Mint** tối giản
- **Yêu cầu thiết kế scannable:** Toàn bộ chỉ số, điểm số hệ 100 của model phải được hiển thị dưới dạng **Đồ thị mạng nhện (Radar Chart)** hoặc **thanh đo tiến trình (Progress Bar)** để các Giám đốc Marketing của brand có thể đọc vị toàn bộ thế mạnh của tài năng chỉ trong vòng **5 giây**.

---

## Trả lời câu hỏi của Tùng về 30 câu hỏi đầu vào

Để xây dựng một hệ thống tự động chấm điểm và đưa ra gợi ý cuộc thi phù hợp nhất cho các thí sinh (như Hoa hậu cấp Quốc gia, Hoa khôi Du lịch, Người mẫu Thời trang/Runway, hay Người mẫu Ảnh/KOLs), bảng khảo sát cần kết hợp giữa **thông tin hành chính** và **hệ thống câu hỏi trắc nghiệm có trọng số (điểm số)**.

Dưới đây là cấu trúc chi tiết **Bảng khảo sát 30 câu hỏi kèm thuật toán tính điểm** để anh tích hợp vào tính năng "Tư vấn & Định hướng" trên App:

---

# PHẦN A: BẢNG KHẢO SÁT 30 CÂU HỎI

### I. THÔNG TIN HÀNH CHÍNH & NHÂN TRẮC HỌC CƠ BẢN (Câu 1 - 10)

*(Nhóm này dùng làm điều kiện lọc cấu trúc (Filter) bắt buộc của các cuộc thi, không tính điểm chọn cuộc thi nhưng bắt buộc phải có).*

1. **Họ và tên:** ............................................................
2. **Năm sinh:** ............................................................
3. **Quê quán (Tỉnh/Thành phố gốc):** ............................................................
4. **Học vấn hiện tại:**
* [ ] THPT / Trung cấp
* [ ] Cao đẳng / Đại học
* [ ] Đã tốt nghiệp Đại học / Thạc sĩ


5. **Tình trạng hôn nhân & Con cái:**
* [ ] Độc thân, chưa từng sinh con
* [ ] Đã kết hôn / Đã sinh con


6. **Chiều cao chính xác (cm):** .................... cm
7. **Cân nặng chính xác (kg):** .................... kg
8. **Số đo 3 vòng (cm):** Vòng 1: ........... | Vòng 2: ........... | Vòng 3: ...........
9. **Tình trạng phẫu thuật thẩm mỹ:**
* [ ] Vẻ đẹp hoàn toàn tự nhiên, chưa từng can thiệp
* [ ] Đã can thiệp nhẹ (Làm răng, tiêm filler...)
* [ ] Đã đại phẫu (Nâng mũi, nâng ngực, gọt hàm...)


10. **Trình độ Ngoại ngữ (Tiếng Anh hoặc ngôn ngữ khác):**
* [ ] Giao tiếp cơ bản / Chưa có chứng chỉ
* [ ] Khá (Tương đương IELTS 5.0 - 6.0)
* [ ] Thành thạo / Lưu loát (Tương đương IELTS 6.5 trở lên)



---

### II. ĐẶC ĐIỂM HÌNH THỂ & PHONG CÁCH (Câu 11 - 17)

*(Bắt đầu tính điểm theo các Nhóm xu hướng: **[A] Hoa hậu/Hoa khôi truyền thống**, **[B] Người mẫu Runway**, **[C] KOLs/Người mẫu ảnh/Giải trí**)*

11. **Mái tóc hiện tại của bạn phù hợp nhất với mô tả nào?**
* [ ] Dài, đen mượt/nâu trầm tự nhiên, truyền thống **(3đ nhóm A)**
* [ ] Tóc ngắn, tóc tém hoặc cắt layer cá tính **(3đ nhóm B)**
* [ ] Tóc nhuộm màu thời trang, uốn xoăn hiện đại **(3đ nhóm C)**


12. **Làn da của bạn thuộc tone nào và tình trạng hiện tại?**
* [ ] Trắng mịn, đều màu, không tì vết **(3đ nhóm A)**
* [ ] Nâu khỏe khoắn, bánh mật, mịn màng **(3đ nhóm B)**
* [ ] Trắng sáng hoặc có hình xăm nhỏ nghệ thuật **(3đ nhóm C)**


13. **Cấu trúc khung xương và gương mặt của bạn có đặc điểm gì nổi bật?**
* [ ] Gương mặt hài hòa, phúc hậu, nụ cười rạng rỡ ăn ảnh **(3đ nhóm A)**
* [ ] Khung xương góc cạnh, high-fashion, mặt lạnh/ấn tượng **(3đ nhóm B)**
* [ ] Gương mặt thanh tú, trẻ trung, chuẩn style hotgirl/vlogger **(3đ nhóm C)**


14. **Tỷ lệ cơ thể (Chân và lưng) của bạn như thế nào?**
* [ ] Cân đối, thắt eo rõ ràng, hông quả táo tròn đầy **(3đ nhóm A)**
* [ ] Lưng ngắn chân dài, tỷ lệ nhân trắc học vượt trội **(3đ nhóm B)**
* [ ] Nhỏ nhắn, mảnh mai, dễ mặc đồ đa dạng phong cách **(3đ nhóm C)**


15. **Gu thời trang hằng ngày của bạn hướng tới phong cách nào?**
* [ ] Thanh lịch, nữ tính, váy đầm nhẹ nhàng hoặc áo dài **(3đ nhóm A)**
* [ ] Độc lạ, phá cách, tối giản, Unisex hoặc High-street **(3đ nhóm B)**
* [ ] Hợp trend, năng động, gợi cảm hoặc dễ thương **(3đ nhóm C)**


16. **Bạn tự tin nhất với kỹ năng nào khi mang giày cao gót?**
* [ ] Đi uyển chuyển, nhẹ nhàng, vừa đi vừa cười tương tác **(3đ nhóm A)**
* [ ] Bước đi mạnh mẽ, đánh hông chuẩn, sải bước dài góc cạnh **(3đ nhóm B)**
* [ ] Đi đứng cơ bản, tự tin tạo dáng đứng trước ống kính (Pose dáng) **(3đ nhóm C)**


17. **Khả năng biểu cảm cơ mặt của bạn tốt nhất khi nào?**
* [ ] Khi cười tươi rạng rỡ, ánh mắt ấm áp thân thiện **(3đ nhóm A)**
* [ ] Khi làm mặt lạnh sắc sảo, thần thái cuốn hút, high-fashion **(3đ nhóm B)**
* [ ] Biểu cảm đa dạng: Đáng yêu, tinh nghịch, quyến rũ linh hoạt **(3đ nhóm C)**



---

### III. TÀI NĂNG, ĐAM MÊ & SỞ THÍCH (Câu 18 - 24)

18. **Sở thích lớn nhất của bạn trong thời gian rảnh rỗi là gì?**
* [ ] Đọc sách, nấu ăn, yoga, tham gia hoạt động thiện nguyện **(3đ nhóm A)**
* [ ] Xem các show thời trang quốc tế, tập gym, nghiên cứu phối đồ **(3đ nhóm B)**
* [ ] Quay TikTok, chụp ảnh lookbook, nhảy hiện đại, ca hát **(3đ nhóm C)**


19. **Bạn sở hữu năng khiếu nghệ thuật nào nổi bật nhất?**
* [ ] Thuyết trình/Biện luận, múa dân gian, cắm hoa, hội họa **(3đ nhóm A)**
* [ ] Cảm nhận âm nhạc tốt, khả năng làm chủ sàn diễn tốt **(3đ nhóm B)**
* [ ] Ca hát, nhảy hiện đại, diễn xuất, làm MC/Livestream **(3đ nhóm C)**


20. **Lĩnh vực xã hội nào bạn quan tâm và muốn đóng góp nhất?**
* [ ] Giáo dục cho trẻ em vùng cao, bảo vệ phụ nữ, môi trường **(3đ nhóm A)**
* [ ] Phát triển ngành công nghiệp thời trang bền vững **(3đ nhóm B)**
* [ ] Thúc đẩy xu hướng giải trí số, xây dựng cộng đồng trẻ sáng tạo **(3đ nhóm C)**


21. **Nếu được chọn một thần tượng để hướng tới, bạn sẽ chọn ai?**
* [ ] Các Hoa hậu có sức ảnh hưởng quốc tế và giàu lòng nhân ái **(3đ nhóm A)**
* [ ] Các Siêu mẫu thế giới hoặc Giám đốc sáng tạo thời trang **(3đ nhóm B)**
* [ ] Các Hot TikToker, Beauty Blogger, Nghệ sĩ đa tài **(3đ nhóm C)**


22. **Môi trường làm việc khiến bạn cảm thấy hào hứng nhất?**
* [ ] Các hội thảo lớn, chương trình giao lưu văn hóa, sự kiện ngoại giao **(3đ nhóm A)**
* [ ] Sàn diễn chữ T, studio chụp ảnh của các nhà thiết kế lớn **(3đ nhóm B)**
* [ ] Phim trường, sự kiện giải trí ra mắt sản phẩm, thảm đỏ showbiz **(3đ nhóm C)**


23. **Bạn nghĩ thế mạnh lớn nhất trong tính cách của mình là gì?**
* [ ] Điềm đạm, biết lắng nghe, giàu lòng trắc ẩn và tinh tế **(3đ nhóm A)**
* [ ] Bản lĩnh, cá tính mạnh, kiên trì và chịu được áp lực cao **(3đ nhóm B)**
* [ ] Hoạt ngôn, năng động, hài hước và dễ thích nghi **(3đ nhóm C)**


24. **Khi đối mặt với những lời bình luận tiêu cực trên mạng xã hội, bạn sẽ làm gì?**
* [ ] Giữ im lặng, chọn lọc ý kiến đúng để sửa đổi, ứng xử văn minh **(3đ nhóm A)**
* [ ] Không quan tâm, tập trung nâng cấp giá trị chuyên môn cá nhân **(3đ nhóm B)**
* [ ] Thẳng thắn đối thoại hoặc biến nó thành nội dung sáng tạo một cách thông minh **(3đ nhóm C)**



---

### IV. TƯ DUY NỀN TẢNG & MỤC TIÊU SỰ NGHIỆP (Câu 25 - 30)

25. **Mục tiêu lớn nhất của bạn khi quyết định tham gia một cuộc thi là gì?**
* [ ] Trở thành người có sức ảnh hưởng để làm dự án cộng đồng lớn **(3đ nhóm A)**
* [ ] Khẳng định vị thế nghề nghiệp, trở thành First Face/Vedette **(3đ nhóm B)**
* [ ] Tăng độ nhận diện (Viral), tìm kiếm cơ hội lấn sân Showbiz/KOLs **(3đ nhóm C)**


26. **Bạn định nghĩa như thế nào là một "Người phụ nữ thành công"?**
* [ ] Là người dung hòa được gia đình, sự nghiệp và cống hiến cho xã hội **(3đ nhóm A)**
* [ ] Là người đạt đến đỉnh cao chuyên môn trong lĩnh vực mình theo đuổi **(3đ nhóm B)**
* [ ] Là người tự chủ tài chính, tự do sáng tạo và làm chủ cuộc sống **(3đ nhóm C)**


27. **Kỹ năng mềm nào bạn cảm thấy mình cần được đào tạo thêm nhất hiện tại?**
* [ ] Kỹ năng ứng xử trước câu hỏi khó, trả lời phỏng vấn (Interview) **(3đ nhóm A)**
* [ ] Kỹ năng giải phóng hình thể chuyên sâu, tạo dáng high-fashion **(3đ nhóm B)**
* [ ] Kỹ năng biên tập nội dung video, livestream, xây dựng thương hiệu cá nhân **(3đ nhóm C)**


28. **Nếu ban giám khảo hỏi: "Điểm yếu lớn nhất của bạn là gì?", bạn chọn cách trả lời nào?**
* [ ] Chia sẻ chân thành về một thiếu sót và cách bạn đang nỗ lực học tập để vượt qua **(3đ nhóm A)**
* [ ] Biến điểm yếu thành nét độc bản/cá tính riêng biệt của bản thân **(3đ nhóm B)**
* [ ] Trả lời một cách thông minh, khéo léo lồng ghép sự hài hước để tạo điểm nhấn **(3đ nhóm C)**


29. **Bạn mong muốn cộng đồng nhớ đến mình với hình ảnh nào sau cuộc thi?**
* [ ] Một người đẹp tri thức, thanh lịch, có trái tim ấm áp **(3đ nhóm A)**
* [ ] Một biểu tượng thời trang sắc lạnh, chuyên nghiệp và đẳng cấp **(3đ nhóm B)**
* [ ] Một cô gái năng lượng, đa tài, truyền cảm hứng tích cực cho giới trẻ **(3đ nhóm C)**


30. **Mức độ sẵn sàng đầu tư (thời gian, công sức, tài chính) của bạn cho cuộc thi?**
* [ ] Sẵn sàng bảo lưu học tập/công việc, tập trung 100% để đạt vương miện **(3đ nhóm A)**
* [ ] Sẵn sàng rèn luyện thể hình khốc liệt để đạt chuẩn số đo khắt khe **(3đ nhóm B)**
* [ ] Muốn vừa thi vừa trải nghiệm, tối ưu hóa hình ảnh ngay trong quá trình thi **(3đ nhóm C)**



---

# PHẦN B: THUẬT TOÁN TỔNG HỢP ĐIỂM & ĐƯA RA KẾT QUẢ TƯ VẤN

Khi thí sinh bấm "Hoàn thành khảo sát", hệ thống tự động xử lý qua 2 bước lọc:

### BƯỚC 1: LỌC ĐIỀU KIỆN CẦN (Hard Rules - Dựa trên Câu 1 - 10)

* **Nếu câu 5 chọn "Đã kết hôn/Có con" HOẶC câu 9 chọn "Đã đại phẫu":** Tự động loại khỏi danh sách gợi ý các cuộc thi Hoa hậu quốc gia khắt khe (như Hoa hậu Việt Nam). Chuyển hướng gợi ý sang: *Hoa hậu Quý bà (Mrs), các cuộc thi Hoa khôi ngành nghề, hoặc cuộc thi Người mẫu, KOLs*.
* **Nếu Chiều cao < 165cm:** Loại khỏi nhóm gợi ý Người mẫu Runway (Nhóm B). Ưu tiên nhóm gợi ý KOLs/Model Ảnh/Hoa khôi Du lịch (Nhóm C).
* **Nếu Ngoại ngữ chọn "Thành thạo" (IELTS >6.5):** Cộng thẳng điểm ưu tiên vào các cuộc thi có bản quyền gửi thí sinh đi thi Quốc tế.

### BƯỚC 2: TÍNH ĐIỂM XU HƯỚNG (Dựa trên Câu 11 - 30)

Mỗi câu hỏi trắc nghiệm từ câu 11 đến câu 30 đều có 3 đáp án tương ứng với 3 điểm (3 điểm cho nhóm A, hoặc B, hoặc C). Hệ thống cộng tổng số điểm của từng nhóm:

* **Tổng điểm Nhóm A cao nhất (Từ 35 - 60 điểm):**
* **Kết quả tư vấn:** Bạn phù hợp với **CÁC CUỘC THI HOA HẬU / HOA KHÔI TRUYỀN THỐNG & NHÂN ÁI**.
* **Gợi ý cuộc thi tại Việt Nam:** Hoa hậu Việt Nam, Hoa hậu Thế giới Việt Nam (Miss World VN), Hoa khôi Sinh viên, Hoa khôi các tỉnh thành/Du lịch.
* **Định hướng từ App:** Hệ thống sẽ kết nối bạn với các Mentor về ứng xử, các nhà thiết kế Áo dài/Dạ hội, và các dự án thiện nguyện để làm đẹp hồ sơ.


* **Tổng điểm Nhóm B cao nhất (Từ 35 - 60 điểm):**
* **Kết quả tư vấn:** Bạn phù hợp với **CÁC CUỘC THI NGƯỜI MẪU THỜI TRANG / RUNWAY CHUYÊN NGHIỆP**.
* **Gợi ý cuộc thi tại Việt Nam:** Vietnam's Next Top Model, The New Mentor, Supermodel Vietnam, các cuộc thi Tìm kiếm gương mặt người mẫu thời trang quốc tế.
* **Định hướng từ App:** Hệ thống kết nối bạn với các học viện đào tạo Catwalk chuyên sâu, các Model Agency lớn và các nhà thiết kế Avant-garde/High-Fashion.


* **Tổng điểm Nhóm C cao nhất (Từ 35 - 60 điểm):**
* **Kết quả tư vấn:** Bạn phù hợp với **CÁC CUỘC THI NGƯỜI ĐẸP THƯƠNG HIỆU / KOLS / GIẢI TRÍ & THẾ HỆ MỚI**.
* **Gợi ý cuộc thi tại Việt Nam:** Miss Grand Vietnam (chuộng tính giải trí/năng động), The Face Vietnam, Hoa hậu Chuyển giới (nếu thuộc cộng đồng), các cuộc thi KOC/KOLs Tournament, Người mẫu ảnh/Lookbook.
* **Định hướng từ App:** Hệ thống kết nối bạn với các Agency quảng cáo, các thương hiệu mỹ phẩm/local brand đang cần tìm người review, chụp hình lookbook, livestream hoặc đóng MV.



### BƯỚC 3: KẾT QUẢ ĐỒNG HIỂN THỊ TRÊN APP (UI/UX)

Sau khi nộp form, màn hình sẽ hiện lên sơ đồ mạng nhện (Radar Chart) thể hiện tỷ lệ % độ phù hợp của thí sinh đối với 3 nhóm ngành này, đi kèm danh sách 3 cuộc thi đang mở đơn đăng ký phù hợp nhất với họ để họ bấm "Đăng ký ngay qua App".

