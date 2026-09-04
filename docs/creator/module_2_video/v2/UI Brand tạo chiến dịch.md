# ONSTAGE.VN – ĐẶC TẢ CHI TIẾT TOÀN DIỆN LUỒNG BRAND TẠO CHIẾN DỊCH NỘI DUNG
## TỪ TẠO YÊU CẦU CHIẾN DỊCH ĐẾN KHI CHIẾN DỊCH ĐƯỢC GỬI CHO CREATOR (MODULE 2)

> **Mục tiêu tài liệu:** Đặc tả chi tiết 100% toàn bộ 14 màn hình trong luồng Nhãn hàng (Brand) tạo chiến dịch Creator, từ lúc xem dashboard, nhập wizard yêu cầu, nhận báo giá từ Admin, thanh toán đặt cọc 50%, theo dõi tuyển KOC cho đến khi Creator nhận brief và nộp video.  
> **Tài liệu nguồn:** Chuẩn hóa trực tiếp theo sơ đồ thiết kế luồng chi tiết `LUỒNG CHI TIẾT – BRAND TẠO CHIẾN DỊCH`.  
> **Thư mục triển khai:** `frontend/app/creator/campaigns/...`

---

# MỤC LỤC & SƠ ĐỒ 14 MÀN HÌNH

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                LUỒNG CHI TIẾT – BRAND TẠO CHIẾN DỊCH NỘI DUNG                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
  │
  ├── [GIAI ĐOẠN 1: KHỞI TẠO & NHẬP YÊU CẦU WIZARD]
  │   ├── Màn 01: Dashboard quản lý chiến dịch (Tổng quan & Tạo mới)               ──► /creator/campaigns
  │   ├── Màn 02: Bước 1 – Thông tin cơ bản chiến dịch                             ──► /creator/campaigns/create
  │   ├── Màn 03: Bước 2 – Nhập chi tiết sản phẩm & Kho tư liệu Drive              ──► /creator/campaigns/create?step=2
  │   ├── Màn 04: Bước 3 – Yêu cầu nội dung: Chọn hình thức (Gói A vs Gói B)       ──► /creator/campaigns/create?step=3
  │   ├── Màn 05: Bước 4 – Yêu cầu nội dung: Chi tiết kịch bản, USP & Don'ts        ──► /creator/campaigns/create?step=4
  │   ├── Màn 06: Bước 5 – Chọn gói lượt xem mục tiêu                              ──► /creator/campaigns/create?step=5
  │   ├── Màn 07: Bước 6 – Bảng báo giá ước tính chi phí                           ──► /creator/campaigns/create?step=6
  │   └── Màn 08: Bước 7 – Xác nhận gửi yêu cầu chiến dịch thành công              ──► /creator/campaigns/create/success
  │
  ├── [GIAI ĐOẠN 2: THẨM ĐỊNH, BÁO GIÁ & ĐẶT CỌC]
  │   ├── Màn 09: Nhận & Xem Báo giá chính thức từ Admin Onstage                   ──► /creator/campaigns/[id]/quotation
  │   ├── Màn 10: Chấp nhận báo giá & Thanh toán đặt cọc (50%)                     ──► /creator/campaigns/[id]/deposit
  │   └── Màn 11: Xác nhận chiến dịch đã kích hoạt thành công                      ──► /creator/campaigns/[id]/activated
  │
  └── [GIAI ĐOẠN 3: VẬN HÀNH, TUYỂN KOC & GIAO BRIEF]
      ├── Màn 12: Theo dõi tiến độ tuyển & Chốt danh sách Creator                  ──► /creator/campaigns/[id]/recruiting
      ├── Màn 13: Xem chi tiết toàn diện chiến dịch (Dashboard 5 Tab)              ──► /creator/campaigns/[id]
      └── Màn 14: Giao diện phía Creator nhận Brief & Bắt đầu làm video            ──► /creator/campaigns/[id]/brief
```

---

# VÒNG ĐỜI 8 TRẠNG THÁI CHIẾN DỊCH (CAMPAIGN LIFECYCLE STATES)

```text
[ 1. Chờ duyệt ] ──► [ 2. Đã báo giá ] ──► [ 3. Đã đặt cọc ] ──► [ 4. Đang tuyển Creator ]
      │                     │                     │                       │
 Admin xem xét        Chờ Brand duyệt        Onstage bắt đầu        Mời & Chốt danh sách
 yêu cầu chiến dịch   phương án ngân sách    triển khai             Creator tham gia
      │                     │                     │                       │
      ▼                     ▼                     ▼                       ▼
[ 5. Đang làm video ] ──► [ 6. Duyệt video ] ──► [ 7. Đo lường view ] ──► [ 8. Hoàn thành ]
 Creator nhận hàng,    Brand/Admin duyệt     Đo lường lượt xem      Nghiệm thu, đối soát
 sản xuất bản nháp     kịch bản & clip nháp  chính thức trong 14 ngày & quyết toán thù lao
```

---

# CHI TIẾT TỪNG MÀN HÌNH (MÀN 01 ĐẾN MÀN 14)

---

## MÀN 01: Dashboard Quản lý Chiến dịch (Tổng quan & Tạo mới)
* **Route:** `/creator/campaigns`
* **Vị trí file:** `frontend/app/creator/campaigns/page.tsx`
* **Mục đích:** Màn hình chính của Brand Portal để theo dõi danh sách toàn bộ các chiến dịch nội dung, tiến độ lượt xem cam kết và nút tạo chiến dịch mới.

### Bố cục giao diện (Wireframe)
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| SIDEBAR BRAND PORTAL:                                                                                                         |
| 🏠 DÀNH CHO CREATOR                                                                                                           |
|   • Chiến dịch Creator (Active)                                                                                               |
|   • [ + Tạo chiến dịch ]                                                                                                      |
| ⚙️ TÀI KHOẢN & HỆ THỐNG                                                                                                       |
|   • Hồ sơ cá nhân | Đăng ký nhanh | Về chúng tôi | Cài đặt | [ Đăng xuất ]                                                    |
+-------------------------------------------------------------------------------------------------------------------------------+
| HEADER NỘI DUNG:                                                                                                              |
| Quản lý Chiến dịch Creator                                                        [ + Tạo chiến dịch mới (Nút Đỏ #C72524) ]   |
| Theo dõi tiến độ sản xuất nội dung, duyệt video và cam kết lượt xem thời gian thực...                                         |
+-------------------------------------------------------------------------------------------------------------------------------+
| BỘ LỌC & TÌM KIẾM:                                                                                                            |
| [ 🔍 Tìm theo tên chiến dịch, mã hoặc sản phẩm...                                 ]  [ Tất cả (Active Đỏ) ] [ Đang chạy ]     |
|                                                                                      [ Chờ duyệt ] [ Hoàn tất ]               |
+-------------------------------------------------------------------------------------------------------------------------------+
| BẢNG QUẢN LÝ CHIẾN DỊCH DUY NHẤT (SINGLE UNIFIED TABLE):                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- |
| CHIẾN DỊCH / SẢN PHẨM               | HÌNH THỨC          | TIẾN ĐỘ LƯỢT XEM          | NGÂN SÁCH     | THAO TÁC               |
| ----------------------------------------------------------------------------------------------------------------------------- |
| [Ảnh] Ra mắt Kem chống nắng PureSun | Review trực tiếp   | 388.420 / 500.000 Views   | 85.000.000 đ  | [ Xem chi tiết > (Đỏ) ]|
|       CP-2026-089                   |                    | [====== 78%] Đang đo view |               |                        |
| ----------------------------------------------------------------------------------------------------------------------------- |
| [Ảnh] Phủ sóng Serum GlowMax        | Nhắc tên / Logo    | 1.054.000 / 1.000.000     | 130.000.000 đ | [ Xem chi tiết > (Đỏ) ]|
|       CP-2026-074                   |                    | [====== 100%] Hoàn thành  |               |                        |
| ----------------------------------------------------------------------------------------------------------------------------- |
| [Ảnh] Trải nghiệm Son Kem Lì Velvet | Review trực tiếp   | 0 / 300.000 Views         | 45.000.000 đ  | [ Xem chi tiết > (Đỏ) ]|
|       CP-2026-092                   |                    | [ 0%] Chờ duyệt báo giá   |               |                        |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 02: Bước 1 – Thông tin Cơ bản Chiến dịch
* **Route:** `/creator/campaigns/create`
* **Vị trí file:** `frontend/app/creator/campaigns/create/page.tsx`
* **Thanh tiến trình (Stepper):** `(•) 1. Thông tin` ── `( ) 2. Sản phẩm` ── `( ) 3. Yêu cầu nội dung` ── `( ) 4. Ngân sách`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BƯỚC 1: THÔNG TIN CƠ BẢN VỀ CHIẾN DỊCH                                                                                        |
|                                                                                                                               |
| 1. Tên chiến dịch: *                                                                                                          |
|    [ Serum ABC – Review tháng 8                                                                                             ] |
|                                                                                                                               |
| 2. Thương hiệu: *                                            3. Ngành hàng: *                                                 |
|    [ ABC Cosmetics                                      ▼ ]  [ Làm đẹp – Chăm sóc da                                      ▼ ] |
|                                                                                                                               |
| 4. Nền tảng chính: *                                         5. Thời gian đo lường lượt xem: *                                |
|    [ TikTok                                             ▼ ]  [ 14 ngày sau khi đăng                                       ▼ ] |
|                                                                                                                               |
| 6. Hạn hoàn thành đăng video (Deadline): *                                                                                    |
|    [ 30/08/2025 📅 ] (Creator bắt buộc phải đăng video trước ngày này)                                                        |
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                                                       [ Tiếp tục: Nhập Sản Phẩm ──► (Nút Đỏ) ]|
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 03: Bước 2 – Nhập Chi tiết Sản phẩm & Kho Tư liệu
* **Route:** `/creator/campaigns/create?step=2`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BƯỚC 2: CHỌN / NHẬP SẢN PHẨM & TẢI LÊN TƯ LIỆU                                                                                |
|                                                                                                                               |
| 1. Tên sản phẩm: *                                           2. Mã SKU sản phẩm:                                              |
|    [ Serum Sáng Da Mờ Thâm ABC Vitamin C                   ]  [ SKU-ABC-VITC-01                                             ] |
|                                                                                                                               |
| 3. Link sản phẩm trên sàn TMĐT / Website:                    4. Giá bán lẻ niêm yết: *                                        |
|    [ https://tiktok.com/@abccosmetics/product/12345678      ]  [ 350.000 đ                                                   ] |
|                                                                                                                               |
| 5. Hình ảnh sản phẩm (Tối đa 5 ảnh, định dạng JPG/PNG):                                                                       |
|    +-------------+ +-------------+ +-------------+ +-------------+                                                            |
|    | [ Ảnh 1 ]   | | [ Ảnh 2 ]   | | [ Ảnh 3 ]   | | [ + Thêm ]  |                                                            |
|    +-------------+ +-------------+ +-------------+ +-------------+                                                            |
|                                                                                                                               |
| 6. Đường dẫn Kho Tư Liệu (Google Drive chứa Video gốc, hình ảnh chất lượng cao, Guideline):                                   |
|    [ https://drive.google.com/drive/folders/1ABCxyz...                                                                      ] |
+-------------------------------------------------------------------------------------------------------------------------------+
| [ ◄ Quay lại ]                                                                        [ Tiếp tục: Chọn Hình Thức ──► (Nút Đỏ) ]|
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 04: Bước 3 – Yêu cầu Nội dung: Chọn Hình thức Xuất hiện
* **Route:** `/creator/campaigns/create?step=3`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BƯỚC 3: CHỌN HÌNH THỨC XUẤT HIỆN CỦA SẢN PHẨM TRONG VIDEO                                                                     |
|                                                                                                                               |
| +---------------------------------------------------------+ +---------------------------------------------------------+   |
| | ( ) CHỈ XUẤT HIỆN / NHẮC ĐẾN (PLACEMENT)                | | (•) TRẢI NGHIỆM & SỬ DỤNG TRỰC TIẾP (DIRECT REVIEW)     |   |
| +---------------------------------------------------------+ +---------------------------------------------------------+   |
| | • Sản phẩm hoặc tên sản phẩm xuất hiện trong video,     | | • Creator nhận sản phẩm thật, mở hộp (unboxing), sử     |   |
| |   không cần trải nghiệm trực tiếp.                      | |   dụng thực tế trên da và chia sẻ trải nghiệm.          |   |
| | • Sử dụng hình ảnh/video từ kho Drive của Brand.        | | • Review chân thực, demo công năng và hiệu quả.         |   |
| | • Ví dụ: Đưa ra cảnh mở hộp, khung hình, nhắc tên,      | | • Ví dụ: Mở hộp, test texture, thoa thử, đánh giá cảm   |   |
| |   hiển thị ảnh, chèn logo...                            | |   nhận trước & sau khi dùng...                          |   |
| +---------------------------------------------------------+ +---------------------------------------------------------+   |
|                                                                                                                               |
| [Nếu chọn Trải nghiệm trực tiếp] THÔNG TIN GỬI HÀNG MẪU:                                                                      |
| • Số lượng mẫu gửi mỗi KOC: [ 1 hộp ▼ ]     • Địa chỉ kho gửi: [ Kho Hà Nội: 123 Cầu Giấy, P. Dịch Vọng, Hà Nội             ] |
+-------------------------------------------------------------------------------------------------------------------------------+
| [ ◄ Quay lại ]                                                                        [ Tiếp tục: Chi Tiết Yêu Cầu ──►(Nút Đỏ)]|
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 05: Bước 4 – Yêu cầu Nội dung: Chi tiết Kịch bản & USP
* **Route:** `/creator/campaigns/create?step=4`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BƯỚC 4: NHẬP YÊU CẦU NỘI DUNG CỤ THỂ                                                                                          |
|                                                                                                                               |
| 1. Độ dài video mong muốn:                                                                                                    |
|    [ 15 – 30 giây                                                                                                         ▼ ] |
|                                                                                                                               |
| 2. NỘI DUNG BẮT BUỘC TRONG VIDEO (CHECKLIST):                                                                                 |
|    [x] Nhắc tên sản phẩm: Serum ABC                                                                                           |
|    [x] Hiển thị sản phẩm rõ ràng trong video                                                                                  |
|    [x] Lời kêu gọi hành động (CTA): Thêm link sản phẩm tại link bio                                                           |
|    [x] Hashtag chính thức: #SerumABC #Onstage                                                                                 |
|    [ + Thêm yêu cầu bắt buộc khác ]                                                                                           |
|                                                                                                                               |
| 3. Nội dung / Điều cần nhấn mạnh (USP sản phẩm):                                                                              |
|    [ Thành phần Vitamin C | Dưỡng sáng da | Mờ thâm | Kiểm soát dầu | Phù hợp da nhạy cảm                                  ] |
|    (Tối đa 300 ký tự)                                                                                                         |
|                                                                                                                               |
| 4. Tài liệu tham khảo kịch bản (nếu có):                                                                                      |
|    [ + Tải lên file kịch bản mẫu / guideline (PDF/DOCX) ]                                                                     |
+-------------------------------------------------------------------------------------------------------------------------------+
| [ ◄ Quay lại ]                                                                        [ Tiếp tục: Chọn Gói Views ──► (Nút Đỏ) ]|
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 06: Bước 5 – Chọn Gói Lượt xem Mục tiêu
* **Route:** `/creator/campaigns/create?step=5`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BƯỚC 5: CHỌN MỤC TIÊU LƯỢT XEM MONG MUỐN                                                                                      |
|                                                                                                                               |
| +---------------------------------------------------------------------------------------------------------------------------+ |
| | ( )  100.000 lượt xem                                                                                       18.000.000 đ  | |
| +---------------------------------------------------------------------------------------------------------------------------+ |
| | ( )  300.000 lượt xem                                                                                       45.000.000 đ  | |
| +---------------------------------------------------------------------------------------------------------------------------+ |
| | (•)  500.000 LƯỢT XEM (KHUYÊN DÙNG)                                                                   ★ 70.000.000 Đ      | |
| |      (Cam kết bảo hành 100% KPI lượt xem trong 14 ngày bởi Onstage)                                                       | |
| +---------------------------------------------------------------------------------------------------------------------------+ |
| | ( )  1.000.000 lượt xem                                                                                    120.000.000 đ  | |
| +---------------------------------------------------------------------------------------------------------------------------+ |
| | ( )  2.000.000 lượt xem                                                                                    220.000.000 đ  | |
| +---------------------------------------------------------------------------------------------------------------------------+ |
| | ( )  Tùy chỉnh số lượt xem: [ Nhập số lượt xem: 750.000 Views                                                           ] | |
+-------------------------------------------------------------------------------------------------------------------------------+
| [ ◄ Quay lại ]                                                                        [ Tiếp tục: Xem Báo Giá ──► (Nút Đỏ) ]  |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 07: Bước 6 – Bảng Báo giá Ước tính Chi phí
* **Route:** `/creator/campaigns/create?step=6`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BƯỚC 6: BÁO GIÁ ƯỚC TÍNH CHI PHÍ CHIẾN DỊCH                                                                                  |
|                                                                                                                               |
| BẢNG TÍNH CHI PHÍ DỰ KIẾN:                                                                                                    |
| ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── |
| • 500.000 Lượt xem cam kết:                                                                                   70.000.000 đ    |
| • Phụ phí hình thức (Trải nghiệm thực tế):                                                                     8.000.000 đ    |
| • Quyền sử dụng nội dung 30 ngày:                                                                              5.000.000 đ    |
| • Quảng cáo ủy quyền (Spark Ads Code):                                                                         5.000.000 đ    |
| • Phí quản lý nền tảng & Bảo trợ View (10%):                                                                   8.800.000 đ    |
| ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── |
| TỔNG NGÂN SÁCH DỰ KIẾN:                                                                                      ★ 96.800.000 Đ   |
| (Lưu ý: Mức giá có thể được Admin điều chỉnh tối ưu sau khi thẩm định chi tiết sản phẩm).                                     |
+-------------------------------------------------------------------------------------------------------------------------------+
| [ ◄ Quay lại ]                                                                        [ ★ GỬI YÊU CẦU CHIẾN DỊCH (NÚT ĐỎ) ]   |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 08: Bước 7 – Xác nhận Gửi Yêu cầu Thành công
* **Route:** `/creator/campaigns/create/success`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                               |
|                                            [ 🚀 Icon Máy Bay Giấy Đỏ Phóng Lên ]                                              |
|                                                                                                                               |
|                                          YÊU CẦU CHIẾN DỊCH ĐÃ ĐƯỢC GỬI THÀNH CÔNG!                                           |
|                                                                                                                               |
|                            Onstage sẽ xem xét sản phẩm và gửi báo giá chính thức cho bạn trong 1 – 2 ngày làm việc.           |
|                                                                                                                               |
|                                        Mã yêu cầu:    #REQ250820-001                                                          |
|                                        Thời gian gửi: 20/08/2025 15:30                                                        |
|                                                                                                                               |
|                                              [ Quay Về Dashboard Chiến Dịch (Nút Đỏ) ]                                        |
|                                                                                                                               |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 09: Nhận & Xem Báo giá Chính thức từ Admin Onstage
* **Route:** `/creator/campaigns/[id]/quotation`
* **Vị trí file:** `frontend/app/creator/campaigns/[id]/quotation/page.tsx`
* **Mục đích:** Xem phương án ngân sách chính thức đã được Onstage tối ưu sau khi thẩm định sản phẩm và phân bổ KOC.

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| BÁO GIÁ CHÍNH THỨC TỪ ONSTAGE                                                                                                 |
| Serum ABC – Review tháng 8  |  Mã yêu cầu: #REQ250820-001                                                                     |
+-------------------------------------------------------------------------------------------------------------------------------+
| THÔNG TIN PHƯƠNG ÁN TRIỂN KHAI:                                                                                               |
| • Gói lượt xem cam kết:             500.000 Lượt xem                                                                          |
| • Hình thức nội dung:               Trải nghiệm & sử dụng trực tiếp (Gửi mẫu thật)                                            |
| • Thời gian đo lường:               14 ngày sau khi đăng                                                                      |
| • Deadline đăng video:              30/08/2025                                                                                |
| • Số lượng Creator dự kiến:         10 – 15 Creator                                                                           |
| ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── |
| TỔNG NGÂN SÁCH CHÍNH THỨC:                                                                                   ★ 85.000.000 Đ   |
| (Báo giá có hiệu lực đến hết ngày: 29/08/2025)                                                                                |
+-------------------------------------------------------------------------------------------------------------------------------+
| [ Yêu cầu điều chỉnh báo giá ]                                                    [ ★ CHẤP NHẬN BÁO GIÁ (NÚT ĐỎ #C72524) ]     |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 10: Chấp nhận Báo giá & Thanh toán Đặt cọc 50%
* **Route:** `/creator/campaigns/[id]/deposit`
* **Vị trí file:** `frontend/app/creator/campaigns/[id]/deposit/page.tsx`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| CHẤP NHẬN BÁO GIÁ & ĐẶT CỌC                                                                                                   |
| Thanh toán đợt 1 (50%) để Onstage bắt đầu tuyển Creator và triển khai chiến dịch.                                             |
+-------------------------------------------------------------------------------------------------------------------------------+
| BẢNG TÍNH TIỀN ĐẶT CỌC:                                                                                                       |
| • Tổng ngân sách:                   85.000.000 đ                                                                              |
| • ĐẶT CỌC (50% ĐỢT 1):              ★ 42.500.000 Đ                                                                            |
| • Còn lại (50% Đợt 2):              42.500.000 đ (Thanh toán sau 30 ngày kể từ khi đo lường xong)                             |
|                                                                                                                               |
| CHỌN PHƯƠNG THỨC THANH TOÁN:                                                                                                  |
| (•) Chuyển khoản ngân hàng (Quét mã VietQR tự động)                                                                           |
| ( ) Thẻ tín dụng / Ghi nợ quốc tế (Visa / Mastercard)                                                                         |
|                                                                                                                               |
| (Sau khi chuyển khoản thành công, vui lòng bấm nút bên dưới để tải ảnh chụp màn hình biên lai).                               |
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                                               [ ★ THANH TOÁN & UPLOAD BIÊN LAI (NÚT ĐỎ) ]     |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 11: Xác nhận Chiến dịch Đã được Kích hoạt
* **Route:** `/creator/campaigns/[id]/activated`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                               |
|                                                [ 🟢 Icon Tích Xanh Lớn Hoàn Tất ]                                             |
|                                                                                                                               |
|                                                   CHIẾN DỊCH ĐÃ ĐƯỢC KÍCH HOẠT!                                               |
|                                                                                                                               |
|                                          Onstage đang tuyển Creator và sẽ cập nhật tiến độ cho bạn.                           |
|                                                                                                                               |
|                                        Mã chiến dịch:  #CAM250820-001                                                         |
|                                        Trạng thái:     Đang tuyển Creator                                                     |
|                                        Ngày kích hoạt: 20/08/2025 10:15                                                       |
|                                                                                                                               |
|                                                [ Xem Chi Tiết Chiến Dịch (Nút Đỏ) ]                                           |
|                                                                                                                               |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 12: Theo dõi Tiến độ Tuyển Creator
* **Route:** `/creator/campaigns/[id]/recruiting`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| THEO DÕI TIẾN ĐỘ TUYỂN CREATOR                                                                                                |
| Xem tiến độ mời và danh sách Creator xác nhận tham gia chiến dịch.                                                            |
+-------------------------------------------------------------------------------------------------------------------------------+
| THANH TIẾN ĐỘ TUYỂN CREATOR (5 BƯỚC TRẠNG THÁI):                                                                              |
| [ Đã mời: 25 ] ──► [ Đã chấp nhận: 12 ] ──► [ Đang nhận hàng: 3 ] ──► [ Đang làm video: 6 ] ──► [ Đã đăng: 0 ]               |
+-------------------------------------------------------------------------------------------------------------------------------+
| DANH SÁCH CREATOR ĐÃ CHẤP NHẬN (12 CREATOR):                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------- |
| • [Avatar] Linh Chi  (@linhchi.beauty)     | Follower: 88K   | Dự kiến Views: 45K  | Trạng thái: Đã gửi sản phẩm mẫu          |
| • [Avatar] Hà My    (@hamy.skincare)       | Follower: 124K  | Dự kiến Views: 60K  | Trạng thái: Đang sản xuất video nháp     |
| • [Avatar] Minh Anh (@minhanh.review)      | Follower: 52K   | Dự kiến Views: 30K  | Trạng thái: Đã nhận hàng                 |
|                                                                                                                               |
|                                                                                                         [ Xem tất cả 12 KOC > ]|
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 13: Xem Chi tiết Toàn diện Chiến dịch (5 Tab)
* **Route:** `/creator/campaigns/[id]`
* **Vị trí file:** `frontend/app/creator/campaigns/[id]/page.tsx`

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------------------------------------------------------+
| [← Danh sách chiến dịch]   CHI TIẾT CHIẾN DỊCH: #CAM250820-001                                                                |
+-------------------------------------------------------------------------------------------------------------------------------+
| HỆ THỐNG 5 TAB CHI TIẾT:                                                                                                      |
| [ ★ Tổng quan (Active) ]   [ 📑 Yêu cầu ]   [ 👥 Creator (12) ]   [ 📊 Tiến độ Views ]   [ 💳 Thanh toán ]                    |
+-------------------------------------------------------------------------------------------------------------------------------+
| TAB TỔNG QUAN (OVERVIEW):                                                                                                     |
|                                                                                                                               |
| +---------------------------------------------------------+ +---------------------------------------------------------+   |
| | THÔNG TIN SẢN PHẨM & GÓI CAM KẾT:                       | | TIẾN ĐỘ NGÂN SÁCH & THỜI HẠN:                           |   |
| | [Ảnh SP] Serum ABC Vitamin C                            | | • Tổng ngân sách:        85.000.000 đ                   |   |
| |          ABC Cosmetics                                  | | • Đã thanh toán:         42.500.000 đ (Đợt 1)           |   |
| |          [ Xem chi tiết sản phẩm > ]                    | | • Còn lại:               42.500.000 đ (Đợt 2)           |   |
| |                                                         | | • Thời gian đo lường:    14 ngày sau khi đăng           |   |
| | • Gói lượt xem: 500.000 Lượt xem cam kết                | | • Deadline đăng video:   30/08/2025                     |   |
| | • Hình thức:    Trải nghiệm & sử dụng trực tiếp         | | • Trạng thái:            Đang làm video (6/12 nộp nháp) |   |
| +---------------------------------------------------------+ +---------------------------------------------------------+   |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## MÀN 14: Giao diện Phía Creator Nhận Brief & Làm Video (Tham chiếu)
* **Giao diện:** Màn hình Notification & Brief trên Mobile App / Web phía Creator.

### Bố cục giao diện
```text
+-------------------------------------------------------------------------------+
| [ THÔNG BÁO CREATOR APP ]                                                     |
|                                                                               |
| 🎉 BẠN CÓ LỜI MỜI CHIẾN DỊCH MỚI!                                             |
| Chiến dịch: Serum ABC – Review tháng 8                                        |
| Nhãn hàng:  ABC Cosmetics                                                     |
| Thù lao:    4.000.000 đ  |  Target Views: 45.000 Views                        |
|                                                                               |
|                                                          [ Xem chi tiết brief]|
| ───────────────────────────────────────────────────────────────────────────── |
| 📑 BRIEF YÊU CẦU ĐÃ ĐƯỢC GỬI:                                                 |
| [x] Vui lòng làm video theo yêu cầu kịch bản và upload bản nháp trước 30/08.  |
| [x] Địa chỉ nhận hàng mẫu: 45 Lê Văn Lương, Q. Thanh Xuân, Hà Nội.            |
+-------------------------------------------------------------------------------+
```

---

# BẢNG TỔNG KẾT ĐỐI CHIẾU 14 MÀN HÌNH VỚI HỆ THỐNG CODE

| Mã màn | Tên màn hình trên Sơ đồ | Đường dẫn Route thực tế | File Source Code trong `frontend` |
|:---:|---|---|---|
| **Màn 01** | Dashboard Quản lý Chiến dịch | `/creator/campaigns` | `app/creator/campaigns/page.tsx` |
| **Màn 02** | Bước 1 – Thông tin cơ bản chiến dịch | `/creator/campaigns/create` | `app/creator/campaigns/create/page.tsx` |
| **Màn 03** | Bước 2 – Nhập sản phẩm & Tư liệu | `/creator/campaigns/create?step=2` | `app/creator/campaigns/create/page.tsx` |
| **Màn 04** | Bước 3 – Chọn hình thức (Gói A / B) | `/creator/campaigns/create?step=3` | `app/creator/campaigns/create/page.tsx` |
| **Màn 05** | Bước 4 – Chi tiết yêu cầu kịch bản | `/creator/campaigns/create?step=4` | `app/creator/campaigns/create/page.tsx` |
| **Màn 06** | Bước 5 – Chọn gói lượt xem | `/creator/campaigns/create?step=5` | `app/creator/campaigns/create/page.tsx` |
| **Màn 07** | Bước 6 – Báo giá ước tính | `/creator/campaigns/create?step=6` | `app/creator/campaigns/create/page.tsx` |
| **Màn 08** | Bước 7 – Gửi yêu cầu thành công | `/creator/campaigns/create/success`| `app/creator/campaigns/create/success/page.tsx` |
| **Màn 09** | Nhận Báo giá chính thức từ Admin | `/creator/campaigns/[id]/quotation`| `app/creator/campaigns/[id]/quotation/page.tsx` |
| **Màn 10** | Chấp nhận báo giá & Đặt cọc 50% | `/creator/campaigns/[id]/deposit` | `app/creator/campaigns/[id]/deposit/page.tsx` |
| **Màn 11** | Chiến dịch đã kích hoạt thành công | `/creator/campaigns/[id]/activated`| `app/creator/campaigns/[id]/activated/page.tsx`|
| **Màn 12** | Theo dõi tiến độ tuyển Creator | `/creator/campaigns/[id]/recruiting`| `app/creator/campaigns/[id]/recruiting/page.tsx`|
| **Màn 13** | Chi tiết toàn diện chiến dịch (5 Tab) | `/creator/campaigns/[id]` | `app/creator/campaigns/[id]/page.tsx` |
| **Màn 14** | Creator nhận Brief & Làm video | `/creator/campaigns/invitations/[id]`| `app/creator/campaigns/invitations/[id]/page.tsx` |
