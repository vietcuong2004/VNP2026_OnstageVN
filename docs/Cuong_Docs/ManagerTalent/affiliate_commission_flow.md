# 💰 Luồng Hoạt Động & Nhận Hoa Hồng Affiliate (Roster Manager)

Tài liệu này mô tả chi tiết luồng vận hành dòng tiền và hoa hồng affiliate khi tài khoản **Brand** đóng vai trò là **Talent Manager** quản lý mạng lưới Roster KOL/KOC trên nền tảng OnStage.

---

## 1. 📊 Sơ Đồ & Định Nghĩa Các Đối Tượng Nhận Hoa Hồng (Commission Model)

Khi một nhãn hàng (Brand) đặt Booking cho một KOL với ngân sách **10.000.000đ**, dòng tiền sẽ tự động phân bổ qua Smart Contract của OnStage theo mô hình đa tầng:

```mermaid
graph TD
    Booking["Booking Ngân Sách<br>10.000.000đ"] --> Platform["Platform Fee (15%)<br>1.500.000đ<br>(Hệ thống OnStage)"]
    Booking --> F1["KOL Thực Hiện (F1: 75%)<br>7.500.000đ<br>(Ví KOL A)"]
    Booking --> F0["Brand Manager (F0: 10%)<br>1.000.000đ<br>(Ví Của Brand)"]
    Booking --> F2["Upline của Manager (F2: 5%)<br>500.000đ<br>(Ví Tuyến Trên)"]
    
    style Booking fill:#f9f,stroke:#333,stroke-width:2px
    style F0 fill:#fb1,stroke:#333,stroke-width:2px,color:#000
    style F1 fill:#8f8,stroke:#333,stroke-width:1px,color:#000
```

### 👥 Chi tiết các đối tượng và tỷ lệ hoa hồng nhận được:

#### 1. 🟡 Brand Manager (F0) — Nhận 10% hoa hồng
* **Định nghĩa**: Là **tài khoản Brand (Brand Account)** đóng vai trò là quản lý trực tiếp (F0) của KOL thực hiện (F1). Brand là người mời KOL này vào Roster và được họ xác nhận đồng ý liên kết.
* **Phần trăm nhận**: **10%** giá trị thù lao của bất kỳ job nào mà KOL trong Roster của Brand hoàn thành.
* **Ví dụ**: KOL Mai Anh thuộc Roster của Brand nhận booking 10.000.000đ → Brand nhận **1.000.000đ** tiền hoa hồng trực tiếp.

#### 2. 🟢 KOL Thực Hiện (F1) — Nhận 75% thù lao
* **Định nghĩa**: Là KOL trực tiếp nhận booking từ nhãn hàng và thực hiện công việc (livestream, chụp ảnh, review sản phẩm...).
* **Phần trăm nhận**: **75%** giá trị hợp đồng. Đây là phần thù lao thực tế của KOL sau khi đã trích hoa hồng quản lý cho Manager và phí hệ thống OnStage.
* **Ví dụ**: Booking 10.000.000đ → KOL F1 nhận **7.500.000đ** vào ví cá nhân.

#### 3. 🟣 Upline/Manager Tuyến Trên (F2) — Nhận 5% hoa hồng
* **Định nghĩa**: 
  * Từ góc nhìn của **Brand**: F2 là các KOL/KOC gián tiếp được giới thiệu tham gia hệ thống bởi KOL F1 trong Roster của Brand. Brand nhận **5%** thù lao của các KOL F2 này.
  * Từ góc nhìn **Hợp đồng**: F2 là người quản lý tuyến trên của Brand (Manager Upline - người đã chia sẻ Affiliate Link giới thiệu Brand đăng ký). Họ nhận **5%** thù lao từ job của KOL trong Roster của Brand.
* **Ví dụ**: KOL F1 Mai Anh tuyển được KOL F2 Lê Mai. Khi Lê Mai hoàn thành booking 10.000.000đ → Brand (Manager F1 của Mai Anh) nhận hoa hồng thụ động F2 là **500.000đ**.

#### 4. 🔴 Tuyến Dưới Cấp 2 (F3) — Nhận 2% hoa hồng
* **Định nghĩa**: Là các KOL tuyến dưới do KOL F2 giới thiệu tham gia hệ thống (gián tiếp 2 cấp so với Brand).
* **Phần trăm nhận**: Brand nhận **2%** thù lao từ bất kỳ job nào mà KOL F3 này thực hiện thành công.
* **Ví dụ**: Lê Mai (F2) tuyển tiếp Kiều Anh (F3). Kiều Anh hoàn thành booking 10.000.000đ → Brand nhận hoa hồng thụ động F3 là **200.000đ**.

#### 5. ⚙️ Phí Nền Tảng OnStage (Platform Fee) — Giữ lại 15%
* **Định nghĩa**: Khoản phí hệ thống dùng để vận hành nền tảng, cung cấp dịch vụ ký quỹ bảo chứng (Escrow) đảm bảo an toàn dòng tiền cho cả nhãn hàng và KOL.
* **Phần trăm giữ lại**: **15%** giá trị booking.
* **Ví dụ**: Booking 10.000.000đ → Nền tảng thu **1.500.000đ**.

---

## 2. 🛣️ Chi Tiết 5 Bước Trong Luồng Nhận Hoa Hồng

### Bước 1: Thiết Lập Liên Kết Roster (Kích Hoạt F1)
1. **Gửi Lời Mời**: Brand vào `/brand/my-talents`, bấm **"Thêm Talent"** để tìm kiếm và mời KOL.
2. **KOL Đồng Ý**: Hệ thống gửi thông báo đến tài khoản của KOL. KOL truy cập trang `/talent/roster`, bấm **"Chấp nhận"** để liên kết chính thức.
3. **Kết Quả**: KOL chính thức được thêm vào Roster của Brand. Trạng thái chuyển thành **"Đã chấp nhận"** (Accepted).

---

### Bước 2: Nhận Hoa Hồng Trực Tiếp F1 (Roster Jobs)
* **Điều Kiện**: KOL thuộc Roster của Brand thực hiện thành công một Campaign/Booking trên nền tảng.
* **Cách Tính**: Brand nhận **10%** giá trị thù lao của Booking đó.
* **Ví Dụ**: 
  * KOL Mai Anh hoàn thành Job Livestream trị giá **8.000.000đ**.
  * Ngay khi Campaign được nghiệm thu, tài khoản của Brand tự động cộng thêm: 
    $$\text{Hoa hồng F1} = 8.000.000đ \times 10\% = 800.000đ$$

---

### Bước 3: Chia Sẻ Affiliate Link (Mở Rộng Tuyển Dụng Brand)
* **Cơ Chế**: Mỗi Manager có một **Affiliate Link** duy nhất: `onstage.vn/ref/mgr-xxx`.
* **Cách Hoạt Động**:
  1. Brand chia sẻ link này cho các Brand đối tác hoặc Agency đối tác.
  2. Brand đối tác nhấp vào link, đăng ký tài khoản Brand mới trên OnStage.
  3. Khi Brand mới này tạo và thanh toán **Booking đầu tiên** trên hệ thống, Brand sẽ nhận **Bonus Affiliate 3%** từ ngân sách booking đó.
* **Ví Dụ**: Brand đối tác đăng ký qua link của Brand và book KOL đầu tiên với ngân sách **50.000.000đ**. Brand nhận ngay hoa hồng giới thiệu:
  $$\text{Bonus Affiliate} = 50.000.000đ \times 3\% = 1.500.000đ$$

---

### Bước 4: Nhận Hoa Hồng Thụ Động MLM (Tuyến Dưới F2 & F3)
* **Cơ Chế**: Các KOL trong Roster của Brand dùng mã giới thiệu (Referral Code) của họ để mời KOL khác tham gia OnStage.
* **Cách Hoạt Động**:
  * **Tầng F2**: Khi KOL F2 (tuyến dưới do KOL F1 của Brand giới thiệu) nhận và hoàn thành Job, Brand nhận **5%** thù lao Job đó.
  * **Tầng F3**: Khi KOL F3 (tuyến dưới của F2) hoàn thành Job, Brand nhận **2%** thù lao Job đó.
* **Ví Dụ**: 
  * KOL F1 Mai Anh giới thiệu KOL khác là KOL F2 Lê Mai tham gia OnStage.
  * Lê Mai nhận được Job quay Video Review trị giá **10.000.000đ** từ một nhãn hàng khác.
  * Khi Job hoàn thành, Brand nhận hoa hồng thụ động F2:
    $$\text{Hoa hồng F2} = 10.000.000đ \times 5\% = 500.000đ$$

---

### Bước 5: Đối Soát Số Dư & Rút Tiền (Payout)
1. **Cập Nhật Số Dư**: Tất cả các khoản hoa hồng (F1 Roster, F2 MLM, Affiliate Brand) được cộng dồn thời gian thực (Real-time) vào ví quản lý của Brand tại mục **Số dư khả dụng**.
2. **Yêu Cầu Thanh Toán**: Bấm nút **"Rút tiền về ví"** trên dashboard.
3. **Chuyển Khoản**: Hệ thống tự động phê duyệt và chuyển tiền về tài khoản ngân hàng liên kết của Brand (ví dụ: Techcombank) và cập nhật giao dịch vào bảng **Lịch sử thanh toán** ở trạng thái "Thành công".

---

## 3. 📝 Bảng Tổng Hợp So Sánh Các Loại Hoa Hồng

| Loại Hoa Hồng | Tỷ Lệ | Cơ Sở Tính | Người Chi Trả | Tần Suất Nhận |
| :--- | :---: | :--- | :--- | :--- |
| **F1 (Roster Jobs)** | **10%** | Ngân sách Booking của KOL trong Roster | Brand Thuê KOL | Mỗi khi KOL hoàn thành Job |
| **Affiliate Brand** | **3%** | Giá trị Booking đầu tiên của Brand được giới thiệu | Nền tảng trích trả | 1 lần duy nhất trên mỗi Brand mới |
| **F2 MLM (Thụ động)** | **5%** | Ngân sách Booking của KOL F2 | Brand Thuê KOL F2 | Mỗi khi KOL F2 hoàn thành Job |
| **F3 MLM (Thụ động)** | **2%** | Ngân sách Booking của KOL F3 | Brand Thuê KOL F3 | Mỗi khi KOL F3 hoàn thành Job |
