# ONSTAGE VN – TÀI LIỆU THIẾT KẾ MÀN HÌNH BRAND PORTAL CHO CREATOR DATA & INTELLIGENCE

**Phiên bản:** 2.0  
**Đối tượng:** Brand / Agency / UI-UX Team  
**Tài liệu tham chiếu:** [`Onstage-Intelligence-Phan-tich-nghiep-vu.md`](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/docs/creator/Onstage-Intelligence-Phan-tich-nghiep-vu.md), [`Onstage-Data-Intelligence-Metrics-Collection-Spec.md`](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/docs/creator/Onstage-Data-Intelligence-Metrics-Collection-Spec.md)  
**Mục đích:** Đặc tả chi tiết sitemap, cấu trúc menu sidebar, đường dẫn route, giao diện và logic tương tác của các màn hình phía Brand Portal.

---

# 1. CẤU TRÚC MENU SIDEBAR & BẢN ĐỒ ROUTE (SITEMAP)

Hệ thống điều hướng phía Brand Portal được chuẩn hóa trực tiếp theo cấu trúc thanh Sidebar như sau:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ONSTAGE BRAND PORTAL                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
  │
  ├── 🏠 DÀNH CHO CREATOR
  │   ├── 🕒 Tổng quan                      ──► Route: /creator/overview
  │   ├── 👥 Danh sách Creator              ──► Route: /creator/creators
  │   │   └── 📄 Chi tiết Creator           ──► Route: /creator/creators/[id]
  │   ├── 🔖 Creator đã lưu                 ──► Route: /creator/saved
  │   ├── 📦 Sản phẩm                       ──► Route: /creator/products
  │   │   └── 📄 Chi tiết Sản phẩm          ──► Route: /creator/products/[id]
  │   ├── 🛡️ Thương hiệu                     ──► Route: /creator/brands
  │   │   └── 📄 Chi tiết Thương hiệu       ──► Route: /creator/brands/[id]
  │   └── 🏷️ Ngành hàng                     ──► Route: /creator/categories
  │       └── 📄 Chi tiết Ngành hàng        ──► Route: /creator/categories/[id]
  │
  ├── 🎬 CHIẾN DỊCH CREATOR
  │   ├── 📋 Danh sách chiến dịch           ──► Route: /creator/campaigns
  │   ├── ➕ Tạo chiến dịch mới              ──► Route: /creator/campaigns/create
  │   ├── 💡 Gợi ý Creator (Wizard Step)    ──► Route: /creator/campaigns/create/recommendations
  │   └── 📊 Chi tiết chiến dịch            ──► Route: /creator/campaigns/[id]
  │
  └── ⚙️ TÀI KHOẢN & HỆ THỐNG
      ├── 👤 Hồ sơ cá nhân                  ──► Route: /account/profile
      ├── ✨ Đăng ký nhanh                  ──► Route: /account/quick-register
      ├── ℹ️ Về chúng tôi                    ──► Route: /about
      ├── ⚙️ Cài đặt                         ──► Route: /settings
      └── 🚪 Đăng xuất                      ──► Action: /logout
```

---

# 2. BẢNG DANH MỤC CÁC MÀN HÌNH VÀ ĐƯỜNG DẪN ROUTE

| Mã màn | Nhóm Sidebar | Tên màn hình trên Sidebar | Đường dẫn Route | Vị trí file trong dự án |
|---|---|---|---|---|
| **MÀN 01** | `DÀNH CHO CREATOR` | **Tổng quan** | `/creator/overview` | `frontend/app/creator/overview/page.tsx` |
| **MÀN 02** | `DÀNH CHO CREATOR` | **Danh sách Creator** | `/creator/creators` | `frontend/app/creator/creators/page.tsx` |
| **MÀN 03** | `DÀNH CHO CREATOR` | *(Chi tiết Creator)* | `/creator/creators/[id]` | `frontend/app/creator/creators/[id]/page.tsx` |
| **MÀN 04** | `DÀNH CHO CREATOR` | **Creator đã lưu** | `/creator/saved` | `frontend/app/creator/saved/page.tsx` |
| **MÀN 05** | `DÀNH CHO CREATOR` | **Sản phẩm** | `/creator/products` | `frontend/app/creator/products/page.tsx` |
| **MÀN 06** | `DÀNH CHO CREATOR` | *(Chi tiết Sản phẩm)* | `/creator/products/[id]` | `frontend/app/creator/products/[id]/page.tsx` |
| **MÀN 07** | `DÀNH CHO CREATOR` | **Thương hiệu** | `/creator/brands` | `frontend/app/creator/brands/page.tsx` |
| **MÀN 08** | `DÀNH CHO CREATOR` | *(Chi tiết Thương hiệu)* | `/creator/brands/[id]` | `frontend/app/creator/brands/[id]/page.tsx` |
| **MÀN 09** | `DÀNH CHO CREATOR` | **Ngành hàng** | `/creator/categories` | `frontend/app/creator/categories/page.tsx` |
| **MÀN 10** | `DÀNH CHO CREATOR` | *(Chi tiết Ngành hàng)* | `/creator/categories/[id]` | `frontend/app/creator/categories/[id]/page.tsx` |
| **MÀN 11** | `CHIẾN DỊCH CREATOR` | **Danh sách chiến dịch** | `/creator/campaigns` | `frontend/app/creator/campaigns/page.tsx` |
| **MÀN 12** | `CHIẾN DỊCH CREATOR` | **Tạo chiến dịch mới** | `/creator/campaigns/create` | `frontend/app/creator/campaigns/create/page.tsx` |
| **MÀN 13** | `CHIẾN DỊCH CREATOR` | **Gợi ý Creator cho Camp** | `/creator/campaigns/create/recommendations` | `frontend/app/creator/campaigns/create/recommendations/page.tsx` |
| **MÀN 14** | `CHIẾN DỊCH CREATOR` | **Chi tiết chiến dịch** | `/creator/campaigns/[id]` | `frontend/app/creator/campaigns/[id]/page.tsx` |

---

# 3. NGUYÊN TẮC THIẾT KẾ UX & HÀNH ĐỘNG XUYÊN SUỐT (CTA)

Mọi màn hình phân tích dữ liệu đều phải gắn liền với hành động chuyển đổi kinh doanh, không chỉ để xem báo cáo thuần túy:

```text
Khám phá dữ liệu (Tổng quan / Ngành / SP / Brand)
       ↓
Chọn lọc & Đánh giá Creator (Danh sách / Chi tiết Creator)
       ↓
Lưu trữ vào Talent Pool (Creator đã lưu)
       ↓
Tạo & Khởi chạy Chiến dịch (Danh sách chiến dịch / Wizard tạo camp)
       ↓
Theo dõi & Nghiệm thu Hiệu suất (Chi tiết chiến dịch)
```

**Các nút hành động chính (CTA):**
- `[ Xem chi tiết ]` / `[ Xem Creator ]`
- `[ Bookmark ★ Lưu Creator ]`
- `[ + Thêm vào Chiến dịch ]`
- `[ Tạo Chiến dịch mới (Nút đỏ #C72524) ]`
- `[ Tạo Chiến dịch tương tự ]`

---

# 4. CHI TIẾT THIẾT KẾ TỪNG MÀN HÌNH

---

## 4.1. MÀN 01: DÀNH CHO CREATOR / Tổng quan
* **Mã màn:** `MÀN 01`
* **Vị trí trên Sidebar:** Nhóm `DÀNH CHO CREATOR` ──► Menu `Tổng quan`
* **Đường dẫn Route:** `/creator/overview` (hoặc `/creator/analytics`)
* **Vị trí file:** `frontend/app/creator/overview/page.tsx`
* **Mục đích:** Bảng tổng quan thị trường Creator Marketing và sức khỏe chiến dịch của chính Brand.

### 1. Bố cục Header & Bộ lọc
```text
Dữ liệu & Phân tích Creator
Phân tích hiệu suất Creator, sản phẩm và ngành hàng từ dữ liệu chiến dịch trên Onstage.
[ Bộ lọc: 30 ngày qua ▼ ]  [ Nền tảng: Tất cả (TikTok, Reels, Shorts) ▼ ]  [ Ngành: Mỹ phẩm ▼ ]
```

### 2. Bộ 4 Thẻ KPI của Brand
- **Creator đã hợp tác:** `128 Creator` (Tỷ lệ hoàn thành: 96%)
- **Chiến dịch hoàn thành:** `24 Chiến dịch`
- **Tổng lượt xem xác thực:** `18.4M Views`
- **CPV trung bình & Tỷ lệ đạt KPI:** `62 đ / View` | `84% Đạt KPI`

### 3. Các khối phân tích
- **Biểu đồ xu hướng (Chart):** Lượt xem và CPV biến động theo thời gian.
- **Top Creator nổi bật với Brand:** Danh sách Creator có CPV tốt nhất và tỷ lệ đạt KPI cao.
- **Ngành hàng đáng chú ý:** Benchmark CPV, Median Views theo ngành.
- **Phím tắt điều hướng nhanh (Quick Entry Cards):** 4 thẻ dẫn tới `Danh sách Creator`, `Sản phẩm`, `Thương hiệu`, `Ngành hàng`.

---

## 4.2. MÀN 02: DÀNH CHO CREATOR / Danh sách Creator
* **Mã màn:** `MÀN 02`
* **Vị trí trên Sidebar:** Nhóm `DÀNH CHO CREATOR` ──► Menu `Danh sách Creator`
* **Đường dẫn Route:** `/creator/creators`
* **Vị trí file:** `frontend/app/creator/creators/page.tsx`
* **Mục đích:** Bảng phân tích & xếp hạng Nhà sáng tạo chuyên sâu (chuẩn theo mô hình Kalodata), kết hợp giữa dữ liệu thương mại điện tử thực tế và hiệu suất chiến dịch Onstage.

### 1. Thanh tìm kiếm & Bộ lọc nhanh
```text
Tìm theo tên / username / ID Creator...
[ Kỳ: 30 ngày qua ▼ ] [ Ngành: Mỹ phẩm, Thời trang... ▼ ] [ Follower: 100K-500K ▼ ] [ Doanh thu: > 50M ▼ ]
```

### 2. Bảng Phân Tích Nhà Sáng Tạo (Creator Intelligence Table - 14 Cột)
| STT | Cột hiển thị | Nội dung & Định dạng dữ liệu | Ý nghĩa nghiệp vụ |
|:---:|---|---|---|
| **1** | **Thông tin nhà sáng tạo** | Avatar + Tên hiển thị + Username (`@...`) + Huy hiệu xác minh + Thẻ ngành hàng | Nhận diện Creator, phân loại phong cách & ngành nội dung chính. |
| **2** | **Doanh thu** | Tổng doanh số bán ra (Net GMV) trong kỳ đo lường (VD: `₫45.59t` / `142.8M đ`) | Thước đo giá trị bằng tiền thực tế Creator tạo ra. |
| **3** | **Doanh số bán ra** | Tổng số lượng sản phẩm (Units Sold) giao dịch thành công (VD: `70.36k sp`) | Đánh giá năng lực chốt đơn & sản lượng hàng bán ra. |
| **4** | **Người theo dõi** | Tổng số Follower hiện tại trên kênh chính (VD: `269k`, `7.6tr`) | Quy mô tệp người hâm mộ của Creator. |
| **5** | **Thay đổi người theo dõi** | Tăng/giảm Follower trong kỳ (VD: `+32.4k` màu xanh) | Đo lường độ "nóng" và tốc độ phát triển của kênh. |
| **6** | **Sản phẩm bán chạy nhất** | Cụm 3 thumbnail ảnh sản phẩm Creator bán được nhiều tiền nhất | Cho Brand thấy ngay Creator có phù hợp với dòng sản phẩm của mình hay không. |
| **7** | **Xu hướng Doanh thu** | Biểu đồ đường sóng Sparkline xu hướng doanh thu theo ngày | Biết được doanh thu tăng đều đặn hay bùng nổ đột biến theo từng đợt video/livestream. |
| **8** | **Lượt xem nội dung** | Tổng lượt xem video (Content Views) trong kỳ (VD: `23.35tr views`) | Tổng độ phủ nội dung tiếp cận đến người dùng. |
| **9** | **Xu hướng lượt xem** | Biểu đồ đường sóng Sparkline xu hướng lượt xem theo ngày | Đánh giá độ ổn định của lượt view, phát hiện view đột biến hoặc bị bóp tương tác. |
| **10** | **Thời gian phát hành lần đầu**| Ngày bắt đầu hoạt động / phát hành nội dung đầu tiên | Đánh giá thâm niên và độ chín của Creator. |
| **11** | **Đơn giá bình quân** | Giá bán trung bình của các sản phẩm Creator bán (Avg. Unit Price, VD: `₫647.47k`)| Xác định phân khúc giá (bình dân, tầm trung, cao cấp) mà tệp fan Creator sẵn sàng chi trả. |
| **12** | **Tỷ lệ tương tác** | Tỷ lệ tương tác trung bình (Engagement Rate, VD: `1.08%`, `3.5%`) | Đánh giá chất lượng tệp fan (thực tế hay tương tác ảo). |
| **13** | **Hiệu suất Onstage** | Số Camp đã chạy • Tỷ lệ đạt KPI % • Chi phí CPV (VD: `8 Camp • 92% KPI • 38đ CPV`)| Lịch sử đối soát uy tín từ các chiến dịch thực tế trên Onstage. |
| **14** | **Thao tác** | Icon lưu (Bookmark ★) + Nút màu đỏ `[ Xem chi tiết ]` + `[ + Mời vào Campaign ]` | Thao tác khám phá sâu hoặc thêm trực tiếp vào danh sách mời chiến dịch. |

*Sort mặc định: `Doanh thu ↓` hoặc `KPI đạt ↓` (Không sort theo Follower).*

---

## 4.3. MÀN 03: Chi tiết Creator
* **Mã màn:** `MÀN 03`
* **Vị trí trên Sidebar:** Màn hình con đi từ `Danh sách Creator`
* **Đường dẫn Route:** `/creator/creators/[id]`
* **Vị trí file:** `frontend/app/creator/creators/[id]/page.tsx`
* **Mục đích:** Hồ sơ phân tích 360 độ về năng lực sản xuất nội dung, độ ổn định view và lịch sử chiến dịch của một Creator.

### 1. Header Creator
```text
[Avatar]  Nguyễn Minh Anh (@minhanh_beauty)   [ Thẻ: Beauty • Lifestyle ] [ TP.HCM ]
186K Followers  •  4.2M Onstage Views  •  92% KPI Success Rate
[ ★ Lưu Creator ]              [ + Thêm vào Chiến dịch (Nút đỏ #C72524) ]
```

### 2. Hệ thống 5 Tab chi tiết
- **Tab 1: Tổng quan & Phân phối View (View Distribution):**
  - KPI: Followers, Median Views, Engagement Rate, Total Campaigns, Average CPV, On-time Rate (94%), Brand Rehire Rate (65%).
  - Phân phối View đa tầng: Average View, Median View, P25 (đáy an toàn), P75, P90 (tiềm năng viral), View Stability (Độ ổn định).
  - Điểm mạnh & Khuyến nghị của hệ thống (AI Insights).
- **Tab 2: Hiệu suất theo Ngành hàng (Category Performance):**
  - Bảng so sánh kết quả chạy Campaign của Creator trong từng ngành: `Ngành hàng | Số Camp | Số Video | Tổng Views | Median View | CPV | Tỷ lệ đạt KPI %`.
- **Tab 3: Lịch sử Chiến dịch Onstage (Campaign History):**
  - Danh sách các chiến dịch đã tham gia, sản phẩm quảng bá, KPI cam kết vs Kết quả thực tế đạt được.
- **Tab 4: Thư viện Video & Tương tác (Content Grid):**
  - Lưới video kèm Views, Likes, Comments, Shares, View Velocity (Tốc độ tăng view 24h/48h).
- **Tab 5: Thương hiệu đã từng hợp tác:**
  - Danh sách Brand, số lần hợp tác, tổng view tạo ra.

---

## 4.4. MÀN 04: DÀNH CHO CREATOR / Creator đã lưu
* **Mã màn:** `MÀN 04`
* **Vị trí trên Sidebar:** Nhóm `DÀNH CHO CREATOR` ──► Menu `Creator đã lưu`
* **Đường dẫn Route:** `/creator/saved`
* **Vị trí file:** `frontend/app/creator/saved/page.tsx`
* **Mục đích:** Quản lý danh sách Creator tiềm năng (Talent Pool cá nhân hóa của Brand) theo từng bộ sưu tập (Collection).

### Bố cục giao diện
- **Danh sách Bộ sưu tập (Collections):** `Tất cả`, `Beauty Q4`, `Creator Livestream`, `Creator CPV thấp`, `Đã hợp tác tốt`.
- **Bảng danh sách Creator trong collection:**
  - `Creator | Collection | Ghi chú cá nhân | Followers | Median View | CPV | KPI đạt % | Chiến dịch gần nhất | Thao tác [Xóa / Thêm vào Camp]`.

---

## 4.5. MÀN 05: DÀNH CHO CREATOR / Sản phẩm
* **Mã màn:** `MÀN 05`
* **Vị trí trên Sidebar:** Nhóm `DÀNH CHO CREATOR` ──► Menu `Sản phẩm`
* **Đường dẫn Route:** `/creator/products`
* **Vị trí file:** `frontend/app/creator/products/page.tsx`
* **Mục đích:** Khám phá danh mục các sản phẩm đang chạy Creator Marketing hiệu quả trên thị trường.

### 1. Bố cục Header, Tìm kiếm & Bộ lọc
```text
[ Tab Sản phẩm ]  [ Ô tìm kiếm: Tìm kiếm tên sản phẩm (hỗ trợ dạng ngôn ngữ tự nhiên) 🔍 ]  [ Icon Camera tìm bằng ảnh 📷 ]  [ Nút: 📥 Tải xuống ]
[ Bộ lọc nhanh: Thời gian 30 ngày trước ▼ ]  [ Sắp xếp theo: Doanh thu cao nhất ▼ ]  [ Ngành hàng: Tất cả ▼ ]
```

### 2. Bảng Phân Tích Chỉ Số Sản Phẩm (Product Commerce Intelligence Table - 18 Cột)

| STT | Cột hiển thị | Nội dung & Định dạng dữ liệu | Ý nghĩa nghiệp vụ |
|:---:|---|---|---|
| **1** | **STT** | Số thứ tự xếp hạng (1, 2, 3...) | Xếp hạng sản phẩm theo tiêu chí sort. |
| **2** | **Thông tin sản phẩm** | Ảnh thumbnail vuông + Tên đầy đủ sản phẩm + Khoảng giá niêm yết (VD: `₫1.39tr - ₫1.49tr`) + Mã SKU | Nhận diện sản phẩm, khoảng giá niêm yết trên sàn. |
| **3** | **Doanh thu** | Tổng doanh số bán ra (Net GMV) trong kỳ đo lường (VD: `₫22.38t` / `₫15.77t`) kèm tooltip | Thước đo giá trị bằng tiền thực tế sản phẩm tạo ra. |
| **4** | **Xu hướng Doanh thu** | Biểu đồ đường mini (Sparkline) thể hiện biến động doanh thu 30 ngày qua (29/07 – 27/08) | Nhận biết doanh số tăng đều hay bùng nổ đột biến theo từng đợt video/livestream. |
| **5** | **Tỉ lệ tăng trưởng doanh thu** | Tỷ lệ % tăng trưởng so với kỳ trước (VD: `+93.8%`, `+37.5%`, `+65.5%`) | Đánh giá sức bật bán hàng của sản phẩm khi có Creator thúc đẩy. |
| **6** | **Doanh số bán ra** | Tổng số lượng sản phẩm (Units Sold) giao dịch thành công (VD: `23.28k`, `335.4k sp`) | Đánh giá dung lượng tiêu thụ và sản lượng bán thực tế. |
| **7** | **Video có doanh thu cao nhất** | Cụm 1–3 thumbnail video đạt doanh thu cao nhất (hover xem trước, click mở video) | Cho Brand biết dạng video / KOC nào bán sản phẩm này chạy nhất. |
| **8** | **Đánh giá sản phẩm** | Điểm sao đánh giá của khách hàng (Rating, VD: `★ 3.4`, `★ 4.9`) | Chất lượng sản phẩm thực tế và độ hài lòng của người mua. |
| **9** | **Đơn giá bình quân** | Mức giá trung bình thực tế khách chi trả sau khuyến mãi (Avg. Unit Price, VD: `₫1.37tr`, `₫47.01k`) | Xác định mức chi trả thực tế của người tiêu dùng. |
| **10** | **Phí vận chuyển** | Phí ship trung bình của sản phẩm (Shipping Fee, VD: `₫0.00`, `₫18.67k`) | Đánh giá chính sách freeship ảnh hưởng đến chuyển đổi. |
| **11** | **Tỉ lệ hoa hồng** | Tỷ lệ hoa hồng thỏa thuận cho Creator (Commission Rate, VD: `7%`, `10%`) | Mức hấp dẫn về quyền lợi để thu hút KOC nhận quảng bá. |
| **12** | **Số lượng người nhà sáng tạo**| Tổng số lượng Creator tham gia gắn link/bán sản phẩm (Creator Count, VD: `2`, `3.95k`) | Đo lường độ phủ của đội ngũ KOC đang quảng bá sản phẩm. |
| **13** | **Ngày đăng tải** | Ngày phát hành hoặc bắt đầu mở bán sản phẩm trên sàn (VD: `08/08/2025`, `02/07/2025`) | Phân biệt sản phẩm mới ra mắt (New Launch) vs sản phẩm lâu năm. |
| **14** | **Tỷ lệ chuyển đổi của nhà sáng tạo**| Tỷ lệ Creator phát sinh đơn trên tổng Creator nhận hàng (Creator CR %, VD: `100%`, `62.11%`)| Đánh giá mức độ "dễ bán" của sản phẩm khi đưa cho nhiều Creator. |
| **15** | **Doanh thu LIVE** | Doanh số phát sinh trực tiếp từ các phiên Livestream (Live Revenue, VD: `₫7.74t`, `₫2.67t`) | Đánh giá hiệu quả bán hàng qua Livestream. |
| **16** | **Doanh thu từ video** | Doanh số phát sinh trực tiếp từ video ngắn (Video Revenue, VD: `₫1.25tr`, `₫13.10t`) | Đánh giá sức mạnh chuyển đổi trực tiếp của nội dung video ngắn. |
| **17** | **Doanh số sản phẩm từ cửa hàng**| Doanh số qua thẻ sản phẩm, gian hàng, link bio (Product Card Revenue, VD: `₫24.34t`) | Đánh giá độ lan tỏa tự nhiên sau khi người xem tiếp cận nội dung. |
| **18** | **Thao tác** | Icon lưu yêu thích (Bookmark ★) + Nút màu đỏ `[ Xem chi tiết ]` | Lưu vào danh sách theo dõi hoặc mở màn hình phân tích sâu (Màn 06). |

---

## 4.6. MÀN 06: DÀNH CHO CREATOR / Sản phẩm / Chi tiết Sản phẩm
* **Mã màn:** `MÀN 06`
* **Vị trí trên Sidebar:** Màn hình con đi từ `Sản phẩm` (hoặc từ Bảng sản phẩm Màn 05)
* **Đường dẫn Route:** `/creator/products/[id]`
* **Vị trí file:** `frontend/app/creator/products/[id]/page.tsx`
* **Mục đích:** Bảng phân tích 360 độ toàn diện về doanh thu, lượt bán, chiến lược bán hàng, đánh giá và danh sách Creator, Video, Livestream mang lại hiệu quả cho một sản phẩm cụ thể.

---

### 1. Bố cục Header Thông Tin Sản Phẩm (Product Header & Quick Actions)
```text
Breadcrumb: Sản phẩm / Chi tiết sản phẩm                                                                    [ ▷ Video hướng dẫn ]
+-------------------------------------------------------------------------------------------------------------------------------+
| [ Gallery Ảnh ]  N11 ** Nước hoa Hoàng gia VIP Sul.tann G...  [📋 Copy] [⭐ Theo dõi]     | Thông tin cửa hàng     [Chi tiết >]|
| [Ảnh lớn 180px]  [📍 Gửi hàng nội địa]                                                    | [Logo Shop] Thom Dai Shop          |
| [Th1][Th2][Th3]  Ngành hàng: Đồ gia dụng > Đồ gia dụng > Nước hoa để phòng                | [ 🏠 Cửa hàng bản địa ]            |
| [<]        [>]   Giá bán: ₫1,39tr - ₫1,49tr ⓘ               Tỉ lệ hoa hồng: - / 10%        | Thời gian thu thập: 08/08/2026 ⓘ   |
|                  Xếp hạng: ★ 3.4 / 5 ⓘ  [📝 Đánh giá SP ▶]  Phí vận chuyển: ₫0,00 (Freeship)|                                    |
|                  [ 🗃️ SKU sản phẩm (1) > ]  [ 📑 Mô tả sản phẩm > ]  [ 🎵 Xem trên TikTok ↗ 📱]  [ 🎬 + Tạo Chiến Dịch (Nút Đỏ) ]|
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

### 2. Bộ Lọc Thời Gian (Time Range Toolbar)
```text
[ 29/07/2026 ──► 27/08/2026 📅 ]   [ Hôm qua ] [ 7 ngày trước ] [ ★ 30 ngày trước (Active) ] [ 90 ngày trước ] [ 180 ngày ] [ 365 ngày ]
```

---

### 3. Khối Chỉ Số Cốt Lõi & Biểu Đồ Xu Hướng (Key Metrics & Trend Chart)
*Chế độ hiển thị:* `[ ★ Chế độ mặc định (Active) ]` | `[ Chế độ tương tác ]`

```text
+---------------------------------------------------------------------------------------+---------------------------------------+
| BỘ 8 THẺ CHỈ SỐ CỐT LÕI (30 ngày: 29/07 ~ 27/08):                                      | BIỂU ĐỒ ĐƯỜNG XU HƯỚNG DOANH THU:     |
| +-------------------------+ +-------------------------+ +-------------------------+   | • Doanh thu theo ngày                 |
| | 📊 Doanh thu            | | 📦 Lượt bán             | | 🏷️ Đơn giá bình quân    |   | 20ti ┤                                |
| | ₫32,08 tỉ               | | 23,39k                  | | ₫1,37tr                 |   |      │         /\                     |
| | (₫8,02ti Mỗi ngày)      | | (5,85k Mỗi ngày)        | |                         |   | 10ti ┤        /  \    /\              |
| +-------------------------+ +-------------------------+ +-------------------------+   |      │       /    \  /  \             |
| +-------------------------+ +-------------------------+ +-------------------------+   |   0  └──────┴──────┴──────┴───────►   |
| | 🔴 Doanh thu LIVE       | | 🎬 Doanh thu từ video   | | 🛍️ Sản phẩm (Cửa hàng)  |   |        29/07 08/08  13/08  18/08 27/08|
| | ₫7,74 tỉ (24.1%)        | | ₫1,25tr (0.0%)          | | ₫24,34 tỉ (75.9%)       |   |                                       |
| | (₫1,94ti Mỗi ngày)      | | (₫312,60k Mỗi ngày)     | | (₫6,08ti Mỗi ngày)      |   |                                       |
| +-------------------------+ +-------------------------+ +-------------------------+   |                                       |
| +-----------------------------------------------------+ +-------------------------+   |                                       |
| | 👥 Tỷ lệ chuyển đổi của Nhà sáng tạo                | | 🎯 Độ tập trung doanh số|   |                                       |
| | 100.00% (2/2 Creator bán được hàng)                 | | 24.1%                   |   |                                       |
| +-----------------------------------------------------+ +-------------------------+   |                                       |
+---------------------------------------------------------------------------------------+---------------------------------------+
```

---

### 4. Menu Điều Hướng Chi Tiết Dọc & Nội Dung 5 Tab (Vertical Sub-Menu Tabs)

Giao diện gồm cột menu dọc bên trái và khối nội dung phân tích chi tiết bên phải:

```text
[ MENU DỌC BÊN TRÁI ] ──► [ NỘI DUNG CHI TIẾT BÊN PHẢI ]
├── 📊 Tổng quan
├── ⭐ Đánh giá sản phẩm
├── 👥 Nhà sáng tạo
├── 🎬 Video & Quảng cáo
└── 🔴 Live
```

---

#### Tab 1: 📊 Tổng quan (Overview & Strategy)
1. **Chiến lược bán hàng (Bóc tách cấu trúc doanh thu):**
   - Công thức trực quan: `₫32,08 tỉ` = `Live: ₫7,74 tỉ (24.14%) [Thanh xanh dương]` + `Video: ₫1,25tr (0.00%) [Thanh xanh lá]` + `Sản phẩm / Cửa hàng: ₫24,34 tỉ (75.86%) [Thanh tím]`.
2. **Chi tiết sản phẩm & Điểm nổi bật (Product USP & AI Highlights):**
   - Bảng thuộc tính sản phẩm, chất liệu, xuất xứ, đối tượng khách hàng mục tiêu và các điểm bán hàng cốt lõi (Selling Points).

---

#### Tab 2: ⭐ Đánh giá sản phẩm (Ratings & Reviews)
- **Điểm đánh giá trung bình:** `3.4 / 5.0 ★`.
- **Phân bổ cảm xúc khách hàng:** Tỷ lệ Đánh giá Tích cực (Positive Rate) vs Đánh giá Tiêu cực (Negative Rate).
- **Tóm tắt phản hồi:** Tổng hợp các lý do khen/chê phổ biến từ người mua trên sàn để định hướng kịch bản video cho Creator.

---

#### Tab 3: 👥 Nhà sáng tạo (Creators Leaderboard for this Product)
*Tiêu đề:* `Nhà sáng tạo (2 sản phẩm) • Tỷ lệ chuyển đổi Creator: 100%` | `[ 📥 Tải xuống Excel ]`

| STT | Thông tin Nhà sáng tạo | Doanh thu | Lượt bán | Doanh thu từ Video | Doanh thu LIVE | Thao tác |
|:---:|---|---|---|---|---|:---:|
| **1** | **[Avatar] @trannmyy.mukbbang91**<br>`265k Người theo dõi` | **₫7,74 tỉ** | `6,19k` | `₫0,00` | `₫7,74 tỉ` | `[Xem KOC ↗]` |
| **2** | **[Avatar] @caitiemtumlum93**<br>`1,14k Người theo dõi` | **₫1,25tr** | `1` | `₫1,25tr` | `₫0,00` | `[Xem KOC ↗]` |

---

#### Tab 4: 🎬 Video & Quảng cáo (Top Selling Videos for this Product)
*Tiêu đề:* `Video & Quảng cáo (1 video phát sinh doanh số)` | `[ 📥 Tải xuống Excel ]`

| STT | Nội dung Video Clip | Doanh thu | Lượt xem | Lượt bán | Ngày đăng tải | Thao tác |
|:---:|---|---|---|---|---|:---:|
| **1** | **[Thumbnail dọc 10s]**<br>`Lụm lẹ nhen, bán chạy 🔥 #topbanchay #tiktokshop`<br>*Creator: @caitiemtumlum93* | **₫1,25tr** | `186 views` | `1 sp` | `12/08/2026` | `[Mở video gốc ↗]` |

---

#### Tab 5: 🔴 Live (Top Livestream Sessions for this Product)
*Tiêu đề:* `Live (1 phiên phát sinh doanh số)` | `[ 📥 Tải xuống Excel ]`

| STT | Nội dung Phiên Livestream | Thời gian Livestream | Doanh thu | Lượt bán | Đơn giá bình quân | Thao tác |
|:---:|---|---|---|---|---|:---:|
| **1** | **[Thumbnail Live]**<br>`Mukkbang tặng quà nè ❤️`<br>*Host: @trannmyy.mukbbang91* | `12/08 11:48 ~ 14:50`<br>*(Thời lượng: 3h 1m)* | **₫7,74 tỉ** | `6,19k` | `₫1,25tr` | `[Xem chi tiết]` |

---


## 4.7. MÀN 07: DÀNH CHO CREATOR / Thương hiệu
* **Mã màn:** `MÀN 07`
* **Vị trí trên Sidebar:** Nhóm `DÀNH CHO CREATOR` ──► Menu `Thương hiệu`
* **Đường dẫn Route:** `/creator/brands`
* **Vị trí file:** `frontend/app/creator/brands/page.tsx`
* **Mục đích:** Khám phá hoạt động Creator Marketing theo từng nhãn hàng (dựa trên dữ liệu được phép hiển thị).

### Bảng phân tích Thương hiệu
- **Cột dữ liệu:** `Logo + Tên Thương hiệu | Ngành hàng chính | Số Sản phẩm | Số Chiến dịch | Số Creator đã book | Tổng Lượt xem | Median CPV | Tỷ lệ đạt KPI | Top Creator nổi bật | Thao tác [Xem chi tiết]`.

---

## 4.8. MÀN 08: Chi tiết Thương hiệu
* **Mã màn:** `MÀN 08`
* **Vị trí trên Sidebar:** Màn hình con đi từ `Thương hiệu`
* **Đường dẫn Route:** `/creator/brands/[id]`
* **Vị trí file:** `frontend/app/creator/brands/[id]/page.tsx`
* **Mục đích:** Xem chiến lược Creator Marketing của thương hiệu (nếu là chính Brand mình: hiển thị đầy đủ chi phí/hiệu suất; nếu là Brand khác: chỉ hiển thị benchmark công khai).

### Bố cục giao diện
- **Tổng quan:** Logo, Ngành hàng, Số chiến dịch đã triển khai.
- **Chiến lược phân bổ Creator (Creator Tier Distribution):** Biểu đồ tỷ lệ `% Nano (25%) • % Micro (48%) • % Mid-tier (20%) • % Macro (7%)`.
- **Bảng xếp hạng Sản phẩm của Thương hiệu:** Xếp hạng theo Views và tỷ lệ đạt KPI.
- **Đội ngũ Creator thân thiết (Top Repeat Creators):** Danh sách KOC hợp tác nhiều lần nhất.

---

## 4.9. MÀN 09: DÀNH CHO CREATOR / Ngành hàng
* **Mã màn:** `MÀN 09`
* **Vị trí trên Sidebar:** Nhóm `DÀNH CHO CREATOR` ──► Menu `Ngành hàng`
* **Đường dẫn Route:** `/creator/categories`
* **Vị trí file:** `frontend/app/creator/categories/page.tsx`
* **Mục đích:** Bảng chuẩn đo lường (Benchmark Table) của tất cả ngành hàng trên Onstage.

### Bảng Benchmark Ngành hàng
- **Cột dữ liệu:**
  - `Ngành hàng (Category)` (Mỹ phẩm, Thời trang, Ẩm thực, Mẹ & Bé...)
  - `Số Creator đang hoạt động (Creator Active)`
  - `Số Campaign đã chạy`
  - `Tổng số Video`
  - `Tổng Lượt xem toàn ngành`
  - `Median Views / Video`
  - `Median CPV ngành`
  - `Tỷ lệ đạt KPI chuẩn ngành %`
  - `Cấp bậc Creator hiệu quả nhất (Top Tier)`
  - `Thao tác: [Xem chi tiết]`

---

## 4.10. MÀN 10: Chi tiết Ngành hàng
* **Mã màn:** `MÀN 10`
* **Vị trí trên Sidebar:** Màn hình con đi từ `Ngành hàng`
* **Đường dẫn Route:** `/creator/categories/[id]`
* **Vị trí file:** `frontend/app/creator/categories/[id]/page.tsx`
* **Mục đích:** Báo cáo chi tiết benchmark sâu của một ngành hàng cụ thể (VD: `Beauty > Skincare`).

### Bố cục giao diện
- **Header:** Tên ngành hàng, Cây phân cấp (Breadcrumb), Nút `[ Tìm Creator trong ngành này (Nút đỏ) ]`.
- **KPI ngành:** Active Creators, Tổng Campaign, Tổng Views, Median CPV (`67đ`), KPI Success Rate (`74%`).
- **Creator Tier Benchmark Table:** So sánh trực quan giữa các tier trong ngành:
  - `Nano: Median View 21K | Median CPV 51đ | KPI Success 69%`
  - `Micro: Median View 82K | Median CPV 58đ | KPI Success 81% (Tối ưu nhất)`
  - `Mid-tier: Median View 240K | Median CPV 76đ | KPI Success 79%`
  - `Macro: Median View 710K | Median CPV 104đ | KPI Success 72%`
- **Top Creator & Top Sản phẩm trong ngành.**

---

## 4.11. MÀN 11: CHIẾN DỊCH CREATOR / Danh sách chiến dịch
* **Mã màn:** `MÀN 11`
* **Vị trí trên Sidebar:** Nhóm `CHIẾN DỊCH CREATOR` ──► Menu `Danh sách chiến dịch`
* **Đường dẫn Route:** `/creator/campaigns`
* **Vị trí file:** `frontend/app/creator/campaigns/page.tsx`
* **Mục đích:** Màn hình quản lý vận hành toàn bộ các chiến dịch Creator của Brand (đang chạy, chờ duyệt, hoàn tất).

### Bố cục giao diện
- **Header:** Tiêu đề "Danh sách chiến dịch", Ô tìm kiếm, Nút `[ + Tạo chiến dịch mới (Nút đỏ #C72524) ]`.
- **Hệ thống Tab trạng thái:** `Tất cả`, `Đang chạy`, `Chờ duyệt`, `Hoàn tất`.
- **Bảng danh sách Chiến dịch:**
  - `Chiến dịch / Sản phẩm`
  - `Hình thức hợp tác` (Gói A: Tư liệu Drive / Gói B: Gửi hàng mẫu)
  - `Tiến độ Lượt xem` (`388.420 / 500.000 Views - 78%`)
  - `Tiến độ Creator` (`18/20 Creator đã đăng video`)
  - `CPV hiện tại` (`64đ`)
  - `Ngân sách`
  - `Trạng thái`
  - `Thao tác: [Xem chi tiết]`

---

## 4.12. MÀN 12: CHIẾN DỊCH CREATOR / Tạo chiến dịch mới
* **Mã màn:** `MÀN 12`
* **Vị trí trên Sidebar:** Màn hình wizard đi từ nút `Tạo chiến dịch mới`
* **Đường dẫn Route:** `/creator/campaigns/create`
* **Vị trí file:** `frontend/app/creator/campaigns/create/page.tsx`
* **Mục đích:** Wizard 4 bước tạo chiến dịch có tích hợp dữ liệu Intelligence.

### 4 Bước tạo chiến dịch:
- **Bước 1: Chọn / Tạo Sản phẩm:** Nhập thông tin sản phẩm, SKU, giá, chọn Ngành hàng (Category taxonomy).
- **Bước 2: Mục tiêu & KPI Chiến dịch:** Nhập Mục tiêu Views cam kết, Ngân sách dự kiến, Thời hạn, Nền tảng.
- **Bước 3: Chiến lược Creator (Creator Strategy):** Hệ thống hiển thị đối chiếu Benchmark ngành tương ứng (Median CPV, Median Views, gợi ý cơ cấu Micro/Mid Creator).
- **Bước 4: Xác nhận & Đặt cọc:** Kiểm tra ngân sách và hoàn tất khởi tạo.

---

## 4.13. MÀN 13: CHIẾN DỊCH CREATOR / Gợi ý Creator cho Campaign
* **Mã màn:** `MÀN 13`
* **Vị trí trên Sidebar:** Màn hình con trong luồng tạo chiến dịch
* **Đường dẫn Route:** `/creator/campaigns/create/recommendations`
* **Vị trí file:** `frontend/app/creator/campaigns/create/recommendations/page.tsx`
* **Mục đích:** Động cơ gợi ý (Recommendation Engine) tự động đề xuất danh sách Creator tối ưu dựa trên KPI và Budget của Brand.

### Bố cục giao diện
- **Tóm tắt yêu cầu:** Sản phẩm: `Serum ABC` | Ngành: `Beauty > Skincare` | Target: `3.000.000 Views` | Budget: `200.000.000 đ`.
- **Bảng danh sách Creator đề xuất:**
  - `Creator | Độ phù hợp ngành (Category Fit) | Median View | CPV | Tỷ lệ đạt KPI % | Thù lao dự kiến | [ Checkbox Chọn ]`.
- **Sticky Summary Panel (Bên phải):**
  - `Đã chọn: 24 Creator`
  - `Tổng chi phí ước tính: 182.000.000 đ`
  - `Tổng lượt xem dự kiến: 3.200.000 Views`
  - `CPV ước tính: 57 đ/view`
  - Nút `[ Tiếp tục với 24 Creator đã chọn (Nút đỏ) ]`.

---

## 4.14. MÀN 14: CHIẾN DỊCH CREATOR / Chi tiết Chiến dịch
* **Mã màn:** `MÀN 14`
* **Vị trí trên Sidebar:** Màn hình con đi từ `Danh sách chiến dịch`
* **Đường dẫn Route:** `/creator/campaigns/[id]`
* **Vị trí file:** `frontend/app/creator/campaigns/[id]/page.tsx`
* **Mục đích:** Bảng điều khiển quản lý tiến độ, duyệt video, theo dõi lượt xem và đo lường doanh số của một chiến dịch đang diễn ra.

### 3 Tab quản lý chính:
- **Tab 1: Tiến độ & Video (Module 2):** Quản lý trạng thái kịch bản, video duyệt, link video đã đăng, số lượt xem tích lũy thực tế đối chiếu với mốc cam kết.
- **Tab 2: Chỉ số Mua hàng & Doanh số (Module 3):** Bảng phân tích sản phẩm chuẩn Kalodata (Doanh thu Net GMV, Sparkline xu hướng, Tăng trưởng, Số lượng bán, Top Video bán chạy, Doanh thu / 1.000 Views).
- **Tab 3: Thông tin & Hợp đồng Chiến dịch:** Chi tiết sản phẩm, điều khoản KPI, ngân sách, hợp đồng và lịch sử đối soát thanh toán.
