# ONSTAGE.VN – TÀI LIỆU ĐẶC TẢ DANH MỤC CHỈ SỐ & PHƯƠNG PHÁP THU THẬP DỮ LIỆU
## PHÂN HỆ DATA & CREATOR INTELLIGENCE

> **Mục tiêu tài liệu:** Định nghĩa chi tiết toàn bộ các chỉ số xuất hiện trong tài liệu thiết kế màn hình [`frontend/docs/creator/Onstage-Brand-Portal-Data-Intelligence-UI-Screen-Spec.md`](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/docs/creator/Onstage-Brand-Portal-Data-Intelligence-UI-Screen-Spec.md).  
> **Cấu trúc bảng đặc tả:** Mỗi chỉ số gồm: `Tên chỉ số`, `Giải thích ý nghĩa & Mục đích sử dụng`, `Công thức / Định nghĩa kỹ thuật`, `Nguồn & Cách thu thập về Onstage (API, Database nội bộ, Crawler hoặc Batch Processing)`.

---

# MỤC LỤC

1. [Tổng quan về 5 Nhóm Dữ liệu Nguồn của Onstage Intelligence](#1-tổng-quan-về-5-nhóm-dữ-liệu-nguồn-của-onstage-intelligence)
2. [BẢNG 1: Nhóm Chỉ số Kênh & Mạng Xã Hội (Social Platform Metrics)](#bảng-1-nhóm-chỉ-số-kênh--mạng-xã-hội-social-platform-metrics)
3. [BẢNG 2: Nhóm Chỉ số Thương mại & Bán hàng (E-Commerce & Sales Metrics)](#bảng-2-nhóm-chỉ-số-thương-mại--bán-hàng-e-commerce--sales-metrics)
4. [BẢNG 3: Nhóm Chỉ số Vận hành Chiến dịch Nội bộ (Onstage First-Party Metrics)](#bảng-3-nhóm-chỉ-số-vận-hành-chiến-dịch-nội-bộ-onstage-first-party-metrics)
5. [BẢNG 4: Nhóm Chỉ số Thống kê & Phân tích Tính toán (Derived & Intelligence Metrics)](#bảng-4-nhóm-chỉ-số-thống-kê--phân-tích-tính-toán-derived--intelligence-metrics)
6. [BẢNG 5: Nhóm Chỉ số Benchmark & Chuẩn Ngành (Category Benchmark Metrics)](#bảng-5-nhóm-chỉ-số-benchmark--chuẩn-ngành-category-benchmark-metrics)
7. [Sơ đồ Kiến trúc Thu thập & Xử lý Dữ liệu (Data Collection Architecture)](#7-sơ-đồ-kiến-trúc-thu-thập--xử-lý-dữ-liệu-data-collection-architecture)

---

# 1. TỔNG QUAN VỀ 5 NHÓM DỮ LIỆU NGUỒN CỦA ONSTAGE INTELLIGENCE

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                HỆ THỐNG ONSTAGE INTELLIGENCE                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
       ▲                              ▲                             ▲
       │                              │                             │
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│  NHÓM 1 & 2  │              │    NHÓM 3    │              │  NHÓM 4 & 5  │
│  DỮ LIỆU     │              │  DỮ LIỆU     │              │  DỮ LIỆU     │
│  BÊN NGOÀI   │              │  NỘI BỘ      │              │  TÍNH TOÁN   │
│ (External)   │              │ (First-Party)│              │  (Derived)   │
└──────────────┘              └──────────────┘              └──────────────┘
 ├── Social APIs               ├── Campaign DB               ├── Statistical Engine
 │   (TikTok, Meta, YT)        ├── Video Reviews             │   (Median, P25/P90, Trend)
 └── E-com APIs                ├── Payouts/Base fee          ├── Intelligence Algorithms
     (TikTok Shop, Shopee)     └── Validation logs           └── Category Aggregator
```

---

# BẢNG 1: NHÓM CHỈ SỐ KÊNH & MẠNG XÃ HỘI (SOCIAL PLATFORM METRICS)

*Các chỉ số đo lường quy mô và độ tương tác công khai của tài khoản Creator trên các nền tảng mạng xã hội (TikTok, Facebook Reels, Instagram, YouTube Shorts).*

| STT | Tên chỉ số | Giải thích & Mục đích sử dụng | Công thức / Định dạng | Cách thu thập về Onstage VN |
|:---:|---|---|---|---|
| **1.1** | **Người theo dõi (Followers)** | Đo lường độ phủ và quy mô tệp khán giả đăng ký theo dõi Creator trên nền tảng. Giúp phân loại Creator tier (Nano, Micro, Mid, Macro). | Số nguyên (VD: `269.000` hoặc `7.6M`) | **1. OAuth API:** Kết nối Creator OAuth qua **TikTok Login Kit / TikTok Display API** (`/v2/user/info/`) hoặc **Meta Graph API** (`GET /{instagram-user-id}?fields=followers_count`).<br>**2. Scraping Service:** Worker định kỳ cập nhật số liệu công khai từ URL profile nếu Creator chưa ủy quyền OAuth. |
| **1.2** | **Thay đổi người theo dõi (Follower Growth)** | Tốc độ tăng hoặc giảm Follower trong kỳ đo lường (7 ngày / 30 ngày). Nhận diện kênh đang tăng trưởng nóng ("Viral") hay chững lại. | `Followers(t) - Followers(t-N)` (VD: `+32.4K`) | **Time-series Snapshot:** Hệ thống lưu bảng `creator_metric_snapshots` theo ngày/tuần. Worker tự động so sánh bản ghi hiện tại với bản ghi $N$ ngày trước đó. |
| **1.3** | **Lượt xem nội dung (Content Views)** | Tổng lượt xem từ tất cả video mà Creator phát hành công khai trong một khoảng thời gian xác định. | Tổng Views toàn kênh trong kỳ (VD: `23.35M`) | **1. Platform Webhook / API:** Gọi API thống kê video của tài khoản (VD: TikTok API `/v2/video/list/` lấy trường `view_count`).<br>**2. Public Sync:** Bộ thu thập dữ liệu định kỳ quét danh sách video mới nhất của Creator. |
| **1.4** | **Xu hướng lượt xem (Views Trend)** | Biểu đồ đường mini (Sparkline) thể hiện biến động view hàng ngày. Phát hiện Creator có lượt xem ổn định hay bấp bênh. | Chuỗi mảng số nguyên 14–30 ngày `[v1, v2, ..., vn]` | **Daily Cron Job:** Worker chạy lúc 00:05 mỗi ngày để ghi lại tổng số view mới sinh ra trong 24 giờ của Creator vào bảng lịch sử theo thời gian. |
| **1.5** | **Tỷ lệ tương tác (Engagement Rate - ER)** | Đo lường mức độ tương tác tích cực của người xem. Giúp lọc bỏ Creator có view ảo hoặc fan không tương tác. | `(Likes + Comments + Shares) / Total Views × 100%` | Lấy các trường `like_count`, `comment_count`, `share_count` từ TikTok API (`/v2/video/list/`) hoặc Meta API và tính trung bình cho 10–20 video gần nhất. |
| **1.6** | **Thời gian phát hành lần đầu (First Active Date)** | Ngày phát hành video đầu tiên của Creator. Đánh giá thâm niên sáng tạo nội dung và độ uy tín của kênh. | `YYYY-MM-DD` | Lấy trường `create_time` của video cũ nhất trên kênh thông qua Video List API. |
| **1.7** | **Lượt tương tác chi tiết (Likes, Comments, Shares)** | Bóc tách cụ thể từng hành động của người xem trên từng video clip. | Số lượng cụ thể của từng hành vi | Đồng bộ trực tiếp từ Video Metadata API của nền tảng (TikTok Video Info API, Meta Graph API Insights). |

---

# BẢNG 2: NHÓM CHỈ SỐ THƯƠNG MẠI & BÁN HÀNG (E-COMMERCE & SALES METRICS)

*Các chỉ số đo lường hiệu quả chuyển đổi đơn hàng và doanh số bán lẻ (phong cách Kalodata / FastMoss).*

| STT | Tên chỉ số | Giải thích & Mục đích sử dụng | Công thức / Định dạng | Cách thu thập về Onstage VN |
|:---:|---|---|---|---|
| **2.1** | **Tổng doanh thu thực tế (Net GMV / Revenue)** | Tổng giá trị hàng bán được qua nội dung Creator sau khi đã trừ đơn bị hủy hoặc hoàn tiền. Đây là thước đo giá trị kinh tế trực tiếp cho Brand. | `Gross GMV - Đơn Hủy/Hoàn` (VNĐ, VD: `142.800.000 đ`) | **1. TikTok Shop Open API:** Kết nối API TikTok Shop Affiliate/Seller (`/affiliate/orders` hoặc `/orders/search`) qua App Partner của Onstage.<br>**2. Shopee Open API:** Lấy qua Shopee Affiliate Open API.<br>**3. Batch Ingestion:** Brand/Admin upload file Excel xuất đơn có mã tracking. |
| **2.2** | **Doanh số bán ra (Units Sold / Items Sold)** | Tổng số lượng sản phẩm (SKU) giao dịch thành công. Đánh giá sản lượng tiêu thụ thực tế. | Tổng số lượng sản phẩm (VD: `1.020 sp` hoặc `70.36K`) | Bóc tách trường `quantity` của các line item hợp lệ trong đơn hàng từ API Sàn TMĐT hoặc file đối soát. |
| **2.3** | **Xu hướng Doanh thu (Revenue Trend)** | Biểu đồ đường Sparkline thể hiện doanh số theo từng ngày. Cho biết doanh thu bùng nổ vào ngày nào (ngay khi đăng video hay sau đó). | Chuỗi giá trị GMV 14–30 ngày `[gmv1, gmv2, ..., gmvn]` | Bộ tính toán thống kê (Aggregation Worker) quét bảng `order_items` và tính tổng doanh thu theo ngày gán với từng Creator/Sản phẩm. |
| **2.4** | **Tốc độ tăng trưởng doanh thu (Growth Rate)** | So sánh % tăng trưởng doanh số của sản phẩm/Creator so với chu kỳ trước đó (7 ngày trước hoặc trước khi chạy chiến dịch). | `(Doanh thu kỳ này - Kỳ trước) / Kỳ trước × 100%` | Tính toán tự động bởi Analytics Service trên cơ sở so sánh 2 snapshot doanh thu. |
| **2.5** | **Sản phẩm bán chạy nhất (Top Selling Products)** | Hiển thị 2–3 hình ảnh sản phẩm mang lại nhiều doanh thu nhất cho Creator. Giúp Brand kiểm tra độ tương thích ngành hàng. | Danh sách `[Product_ID, Image, SKU, GMV]` | Query `GROUP BY product_id ORDER BY SUM(net_gmv) DESC LIMIT 3` trên tập đơn hàng gán nguồn cho Creator. |
| **2.6** | **Top Video Doanh thu cao nhất (Highest Revenue Videos)** | Cụm 2–3 thumbnail video tạo ra nhiều tiền nhất. Cho Brand biết format/kịch bản nào thúc đẩy khách hàng chốt đơn tốt nhất. | Danh sách `[Video_ID, Thumbnail, GMV]` | Query `GROUP BY video_id ORDER BY SUM(net_gmv) DESC LIMIT 3` từ bảng Attribution/Tracking. |
| **2.7** | **Đơn giá bình quân (Avg. Unit Price)** | Mức giá trung bình của các sản phẩm Creator bán được. Cho biết phân khúc chi trả của tệp fan (bình dân, tầm trung hay cao cấp). | `Tổng Net GMV / Tổng số lượng bán` (VNĐ) | Tính trực tiếp từ tổng doanh thu chia cho tổng số lượng đơn vị hàng bán được của Creator. |
| **2.8** | **Tỷ lệ chuyển đổi Creator (Creator Conversion Rate)** | Tỷ lệ Creator bán ra được đơn hàng trên tổng số Creator nhận sản phẩm/chạy chiến dịch. Đánh giá độ "dễ bán" của sản phẩm. | `(Số Creator có đơn / Tổng Creator tham gia) × 100%` | Đếm số lượng Creator có ít nhất 1 đơn hợp lệ chia cho tổng số Creator trong chiến dịch từ database Onstage. |
| **2.9** | **Doanh thu từ Video vs Thẻ sản phẩm** | Bóc tách nguồn tiền đến trực tiếp từ clip ngắn (Video Revenue) hay qua link bio/gian hàng (Product Card Revenue). | Số tiền và tỷ trọng % cho từng nguồn | Dựa vào trường `traffic_source_type` từ TikTok Shop Affiliate API (`VIDEO_ANCHOR` vs `PRODUCT_CARD` vs `SHOWCASE`). |
| **2.10** | **Đánh giá sản phẩm (Product Rating)** | Điểm sao đánh giá của người mua sản phẩm trên sàn (Rating). | Số thực 1 chữ số thập phân (VD: `★ 4.9`) | Lấy trường `rating_star` từ Product Detail API của sàn TMĐT. |
| **2.11** | **Phí vận chuyển (Shipping Fee)** | Mức phí vận chuyển trung bình của sản phẩm trên sàn. | VNĐ (VD: `₫0.00` hoặc `₫18.67k`) | Lấy trường `shipping_fee` từ Product / Logistics API của sàn. |
| **2.12** | **Tỉ lệ hoa hồng (Commission Rate)** | Tỷ lệ hoa hồng thỏa thuận chi trả cho Creator khi bán sản phẩm. | Tỷ lệ % (VD: `7%`, `10%`) | Lấy trường `commission_rate` từ Affiliate Campaign Config hoặc TikTok Shop Affiliate Plan. |
| **2.13** | **Ngày đăng tải / Ra mắt (Launch Date)** | Ngày sản phẩm bắt đầu được mở bán hoặc chạy chiến dịch đầu tiên. | `YYYY-MM-DD` | Lấy trường `create_time` của sản phẩm từ Product API sàn TMĐT. |
| **2.14** | **Doanh thu LIVE (Live Revenue)** | Doanh số bán hàng phát sinh trực tiếp từ các phiên phát trực tiếp (Livestream). | VNĐ (VD: `₫7.74t`) | Bóc tách trường `traffic_source_type = 'LIVE_STREAM'` từ TikTok Shop Order API. |

---

# BẢNG 3: NHÓM CHỈ SỐ VẬN HÀNH CHIẾN DỊCH NỘI BỘ (ONSTAGE FIRST-PARTY METRICS)

*Dữ liệu phát sinh trực tiếp từ hoạt động booking, nghiệm thu và giải ngân thực tế trên nền tảng Onstage VN.*

| STT | Tên chỉ số | Giải thích & Mục đích sử dụng | Công thức / Định dạng | Cách thu thập về Onstage VN |
|:---:|---|---|---|---|
| **3.1** | **Số chiến dịch tham gia (Campaign Count)** | Tổng số chiến dịch Onstage mà Creator đã nhận lời mời và tham gia hợp tác. | Số nguyên đếm được (VD: `12 chiến dịch`) | Query từ bảng nội bộ `campaign_creators` với điều kiện `invitation_status = 'ACCEPTED'`. |
| **3.2** | **Chiến dịch hoàn thành (Completed Campaigns)** | Số chiến dịch Creator đã hoàn thành 100% nghĩa vụ (sản xuất, duyệt, đăng video và theo dõi view). | Số nguyên (VD: `11 hoàn thành`) | Query từ bảng `campaign_creators` với `status = 'COMPLETED'`. |
| **3.3** | **Tổng lượt xem Onstage (Total Onstage Views)** | Tổng số lượt xem được hệ thống Onstage đo lường và xác thực qua các chiến dịch chính thức (không tính view trôi nổi bên ngoài). | Tổng Views có kiểm duyệt (VD: `4.200.000 Views`) | Tổng hợp từ bảng `campaign_videos` (trường `actual_valid_views` đã được hệ thống Onstage xác thực). |
| **3.4** | **Tỷ lệ hoàn thành KPI (KPI Success Rate %)** | Tỷ lệ số lần Creator đạt hoặc vượt mốc lượt xem cam kết trong hợp đồng. Đây là thước đo uy tín hàng đầu để Brand chọn mặt gửi vàng. | `(Số Job đạt KPI / Tổng Job nhận) × 100%` | So sánh `actual_valid_views >= target_views` trong bảng `campaign_creators`. |
| **3.5** | **Tỷ lệ đúng hạn (On-time Delivery Rate %)** | Tỷ lệ nộp bản nháp kịch bản/video và đăng video đúng theo thời hạn (deadline) quy định. Đánh giá tính chuyên nghiệp. | `(Số lần đúng hạn / Tổng số lần giao việc) × 100%` | So sánh timestamp `submitted_at <= deadline` và `published_at <= publish_deadline` trên hệ thống Onstage. |
| **3.6** | **Tỷ lệ nhãn hàng thuê lại (Brand Rehire Rate %)** | Tỷ lệ các nhãn hàng sau khi làm việc lần đầu tiếp tục book lại Creator này trong các chiến dịch tiếp theo. | `(Số Brand book ≥ 2 lần / Tổng Brand hợp tác) × 100%` | Query lịch sử `campaigns` gom nhóm theo `brand_id` và `creator_id`. |
| **3.7** | **Chi phí hợp tác Creator (Creator Cost / Agreed Fee)** | Khoản thù lao chi trả cho Creator bao gồm thù lao cố định (Base Fee) và thưởng vượt view (Bonus) nếu có. | VNĐ (VD: `3.500.000 đ`) | Lấy từ bảng tài chính nội bộ `creator_payouts` hoặc `campaign_creators.agreed_fee`. |

---

# BẢNG 4: NHÓM CHỈ SỐ THỐNG KÊ & PHÂN TÍCH TÍNH TOÁN (DERIVED & INTELLIGENCE METRICS)

*Các chỉ số thông minh được động cơ phân tích (Intelligence Engine) của Onstage tính toán từ First-party Data và Social Data.*

| STT | Tên chỉ số | Giải thích & Mục đích sử dụng | Công thức / Định nghĩa | Cách thu thập / Tính toán trong Onstage |
|:---:|---|---|---|---|
| **4.1** | **Chi phí trên mỗi lượt xem (Average CPV)** | Chi phí thực tế mà Brand/Onstage phải trả cho mỗi 1 lượt xem hợp lệ. Giúp so sánh hiệu quả chi phí giữa các Creator. | `Tổng Chi Phí Trả Creator / Tổng Views Hợp Lệ` (VNĐ, VD: `48 đ/view`) | Backend Onstage tự động tính toán sau khi chốt nghiệm thu lượt xem chiến dịch (`total_payout / actual_valid_views`). |
| **4.2** | **Lượt xem trung vị (Median Views)** | Giá trị lượt xem ở vị trí chính giữa khi sắp xếp các video từ thấp đến cao. **Đáng tin cậy hơn Average View** vì không bị méo mó bởi 1 clip cực kỳ viral hoặc clip bị flop. | Giá trị trung vị của phân phối mẫu view 20–30 video gần nhất | Thuật toán Backend tính `PERCENTILE_CONT(0.5)` trên mảng lượt xem video của Creator. |
| **4.3** | **Lượt xem phân vị P25 / P75 / P90** | • **P25:** Mức view đáy an toàn (75% video đạt mốc này trở lên).<br>• **P75:** Mức view kỳ vọng tốt.<br>• **P90:** Tiềm năng bùng nổ viral của Creator. | Phân vị thứ 25%, 75%, 90% trong chuỗi view | Hàm thống kê SQL / Python Service tính phân vị trên tập dữ liệu lịch sử video. |
| **4.4** | **Độ ổn định lượt xem (View Stability)** | Đánh giá Creator có lượng view đều tay hay thất thường (hên xui). Giúp Brand quản trị rủi ro khi cam kết KPI. | `1 - (Độ lệch chuẩn σ / Lượt xem trung bình μ)` | Service tính độ lệch chuẩn (Standard Deviation) và hệ số biến thiên (Coefficient of Variation) của lượt xem. |
| **4.5** | **Doanh thu trên 1.000 lượt xem (GMV / 1.000 Views)** | **Chỉ số vàng chuẩn hóa:** Cho biết cứ 1.000 lượt xem Creator tạo ra thì thu về bao nhiêu tiền doanh số bán hàng. Giúp so sánh Creator view khủng vs Creator view vừa nhưng bán hàng giỏi. | `(Tổng Net GMV / Tổng Lượt xem) × 1.000` (VNĐ, VD: `274.600 đ / 1K Views`) | Analytics Engine kết nối dữ liệu từ Module 2 (Views) và Module 3 (Doanh số) để chia và chuẩn hóa theo hệ số 1.000. |
| **4.6** | **Tỷ lệ bấm link (Click-Through-Rate - CTR)** | Đo lường mức độ kích thích tò mò và khả năng điều hướng người xem bấm vào link mua sản phẩm. | `(Tổng Lượt Click / Tổng Lượt Xem) × 100%` | Lấy số sự kiện click từ máy chủ rút gọn link Onstage (`click_events`) chia cho tổng view video. |
| **4.7** | **Tỷ lệ mua hàng trên click (Conversion Rate - CR)** | Đo lường khả năng chốt đơn của trang đích / sản phẩm sau khi khách hàng đã bấm vào link. | `(Số Đơn Hàng Thành Công / Tổng Lượt Click) × 100%` | Lấy số đơn hàng đối soát hợp lệ chia cho tổng số click ghi nhận được. |
| **4.8** | **Tốc độ tăng view (View Velocity)** | Tốc độ tích lũy lượt xem trong 24h, 48h, 72h đầu tiên sau khi đăng video. Dự báo sớm video có đạt KPI hay không. | `Lượt xem tại thời điểm T / T (giờ)` (VD: `15.000 views/giờ`) | Cron job theo dõi mốc 6h, 12h, 24h, 48h của video trong bảng `video_metric_snapshots`. |

---

# BẢNG 5: NHÓM CHỈ SỐ BENCHMARK & CHUẨN NGÀNH (CATEGORY BENCHMARK METRICS)

*Các chỉ số tiêu chuẩn thị trường nội bộ được Onstage tổng hợp và ẩn danh từ hàng ngàn chiến dịch theo từng ngành hàng (Mỹ phẩm, Thời trang, Ẩm thực, Mẹ & Bé...).*

| STT | Tên chỉ số | Giải thích & Mục đích sử dụng | Công thức / Định nghĩa | Cách thu thập / Tính toán trong Onstage |
|:---:|---|---|---|---|
| **5.1** | **CPV trung vị ngành (Category Median CPV)** | Mức chi phí trên 1 view phổ biến nhất của một ngành hàng. Giúp Brand biết mình đang book Creator giá đắt hay rẻ so với mặt bằng chung. | Trung vị CPV của toàn bộ Creator hoàn thành chiến dịch trong Category | Aggregate Engine chạy định kỳ hàng tuần trên toàn bộ chiến dịch đã nghiệm thu thuộc Category đó. |
| **5.2** | **Lượt xem trung vị ngành (Category Median Views)** | Lượng view bình quân chuẩn mực của một video trong ngành hàng. Làm căn cứ đặt KPI thực tế cho chiến dịch mới. | Trung vị lượt xem của tất cả video đã duyệt trong ngành | Tính toán trên tập hợp tất cả video đã đăng thuộc ngành hàng trong 90 ngày gần nhất. |
| **5.3** | **Tỷ lệ đạt KPI chuẩn ngành (Category KPI Success Rate)** | Tỷ lệ thành công chung của các chiến dịch trong ngành. Ngành nào có tỷ lệ thấp cảnh báo Brand cần đặt KPI thận trọng hơn. | `(Tổng Job đạt KPI trong ngành / Tổng Job trong ngành) × 100%` | Tổng hợp từ toàn bộ dữ liệu lịch sử các chiến dịch thuộc Category. |
| **5.4** | **Benchmark theo Creator Tier (Nano, Micro, Mid, Macro)** | Bảng so sánh chi tiết giữa các cấp bậc Creator trong cùng một ngành hàng (CPV của Micro vs CPV của Macro). | Bảng phân nhóm theo tier: `Followers < 50K` (Nano), `50K-200K` (Micro), `200K-1M` (Mid), `>1M` (Macro) | Aggregation Service phân cụm dữ liệu Creator theo khoảng follower và tính các chỉ số Median View, Median CPV, KPI Success riêng cho từng cụm. |
| **5.5** | **Cơ cấu phân bổ Creator đề xuất (Suggested Creator Mix)** | Tỷ lệ số lượng Creator (bao nhiêu Nano, bao nhiêu Micro, bao nhiêu Mid) tối ưu để đạt mục tiêu tổng view với ngân sách cho trước. | Thuật toán tối ưu hóa danh mục (Portfolio Optimization) | Recommendation Engine chạy thuật toán phân bổ ngân sách dựa trên hàm hồi quy CPV và tỷ lệ đạt KPI lịch sử của từng tier. |

---

# 7. SƠ ĐỒ KIẾN TRÚC THU THẬP & XỬ LÝ DỮ LIỆU (DATA COLLECTION ARCHITECTURE)

```text
+-------------------------------------------------------------------------------------------------------------------------+
|                                             CÁC NGUỒN DỮ LIỆU ĐẦU VÀO (DATA INGESTION)                                   |
+-------------------------------------------------------------------------------------------------------------------------+
| [1. Nền tảng Mạng xã hội]        [2. Sàn Thương mại Điện tử]      [3. Dữ liệu Vận hành Onstage]   [4. File Import Đối soát]|
| • TikTok Display / Video API     • TikTok Shop Open API           • Database Chiến dịch & Video   • Excel/CSV xuất từ sàn  |
| • Meta Graph API (Reels/IG)      • Shopee Open Platform API       • Dữ liệu Thanh toán & Payout   • Webhook đơn hàng Web   |
| • YouTube Data API v3            • Mã Voucher / Affiliate Tag     • Bảng chấm deadline & KPI      • Báo cáo GMV từ Brand   |
+-------------------------------------------------------------------------------------------------------------------------+
                                                              │
                                                              ▼
+-------------------------------------------------------------------------------------------------------------------------+
|                                    TẦNG XỬ LÝ & LÀM SẠCH DỮ LIỆU (ETL & PIPELINE WORKER)                                 |
+-------------------------------------------------------------------------------------------------------------------------+
| • Data Cleaning: Chuẩn hóa tên sản phẩm, lọc video trùng lặp, định dạng tiền tệ và timezone                             |
| • Fraud Detection: Loại bỏ view ảo, click spam, đơn hàng hủy/hoàn tiền ảo                                               |
| • Time-series Ingestion: Lưu Snapshot lượt view và follower theo từng mốc 24h, 7 ngày, 30 ngày                          |
+-------------------------------------------------------------------------------------------------------------------------+
                                                              │
                                                              ▼
+-------------------------------------------------------------------------------------------------------------------------+
|                                 ĐỘNG CƠ PHÂN TÍCH & TỔNG HỢP (ANALYTICS & INTELLIGENCE ENGINE)                          |
+-------------------------------------------------------------------------------------------------------------------------+
| • Thống kê phân vị: Tính Median, P25, P75, P90, View Stability, Hệ số biến thiên                                       |
| • Đo lường chuyển đổi: Tính CTR, CR, CPV thực tế, GMV / 1.000 Views                                                     |
| • Động cơ Benchmark: Gom cụm theo Ngành hàng (Category) & Cấp bậc Creator (Tier)                                       |
| • Recommendation Engine: Thuật toán gợi ý danh sách Creator phù hợp dựa trên lịch sử Campaign thực tế                   |
+-------------------------------------------------------------------------------------------------------------------------+
                                                              │
                                                              ▼
+-------------------------------------------------------------------------------------------------------------------------+
|                                     HIỂN THỊ LÊN CÁC MÀN HÌNH BRAND PORTAL (MODULE 4)                                   |
+-------------------------------------------------------------------------------------------------------------------------+
| [Màn 01: Tổng quan]     [Màn 02: Bảng Creator]   [Màn 03: Chi tiết Creator]   [Màn 05-10: Sản phẩm & Brand & Ngành]     |
| [Màn 11-12: Gợi ý KOC]  [Màn 13-14: Chiến dịch & Báo cáo Performance]                                                   |
+-------------------------------------------------------------------------------------------------------------------------+
```
