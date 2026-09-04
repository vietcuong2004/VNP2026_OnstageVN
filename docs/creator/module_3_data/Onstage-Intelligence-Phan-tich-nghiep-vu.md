        # ONSTAGE.VN – TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ DATA & CREATOR INTELLIGENCE

**Phiên bản:** 2.0  
**Đối tượng:** Business Analyst, Product Owner, Engineering Team  
**Phạm vi nghiệp vụ:** Phân tích dữ liệu hiệu suất Creator, Sản phẩm, Thương hiệu và Ngành hàng (Creator, Product, Brand & Category Intelligence)  
**Tài liệu liên quan:**  
- Thiết kế giao diện Brand: [`Onstage-Brand-Portal-Data-Intelligence-UI-Screen-Spec.md`](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/docs/creator/Onstage-Brand-Portal-Data-Intelligence-UI-Screen-Spec.md)  
- Đặc tả phương pháp thu thập chỉ số: [`Onstage-Data-Intelligence-Metrics-Collection-Spec.md`](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/docs/creator/Onstage-Data-Intelligence-Metrics-Collection-Spec.md)  

---

# MỤC LỤC

1. [Bối cảnh & Vấn đề nghiệp vụ cốt lõi](#1-bối-cảnh--vấn-đề-nghiệp-vụ-cốt-lõi)
2. [Định hướng sản phẩm & Chuỗi giá trị dữ liệu](#2-định-hướng-sản-phẩm--chuỗi-giá-trị-dữ-liệu)
3. [Mô hình Dữ liệu Nghiệp vụ Tổng thể (The Data Graph)](#3-mô-hình-dữ-liệu-nghiệp-vụ-tổng-thể-the-data-graph)
4. [Quy tắc Phân tích Hiệu suất Đa chiều](#4-quy-tắc-phân-tích-hiệu-suất-đa-chiều)
   - [4.1. Creator Intelligence (Hiệu suất Nhà sáng tạo)](#41-creator-intelligence-hiệu-suất-nhà-sáng-tạo)
   - [4.2. Creator × Category Performance (Hiệu suất theo Ngành hàng)](#42-creator--category-performance-hiệu-suất-theo-ngành-hàng)
   - [4.3. Creator × Brand & Product Performance (Lịch sử hợp tác)](#43-creator--brand--product-performance-lịch-sử-hợp-tác)
   - [4.4. Product & Brand Intelligence (Hiệu suất Sản phẩm & Thương hiệu)](#44-product--brand-intelligence-hiệu-suất-sản-phẩm--thương-hiệu)
   - [4.5. Category Benchmark (Chuẩn đo lường ngành hàng)](#45-category-benchmark-chuẩn-đo-lường-ngành-hàng)
5. [Quy chuẩn Công thức Tính toán Nghiệp vụ](#5-quy-chuẩn-công-thức-tính-toán-nghiệp-vụ)
6. [Logic Nghiệp vụ Động cơ Gợi ý Creator (Recommendation Engine)](#6-logic-nghiệp-vụ-động-cơ-gợi-ý-creator-recommendation-engine)
7. [Quy tắc Nghiệp vụ về Dữ liệu, Kiểm toán & Phân quyền](#7-quy-tắc-nghiệp-vụ-về-dữ-liệu-kiểm-toán--phân-quyền)

---

# 1. BỐI CẢNH & VẤN ĐỀ NGHIỆP VỤ CỐT LÕI

## 1.1. Thực trạng & Hạn chế của Social Metrics truyền thống
Trên các nền tảng booking truyền thống, Brand chỉ có thể chọn Creator dựa trên các thuộc tính bề nổi:
- Số lượng Follower.
- Lượt xem trung bình (Average View) tự khai báo.
- Tỷ lệ tương tác tổng thể (Engagement Rate).

**Hạn chế thực tế:**
1. **Lượt xem trung bình bị méo mó (Average View Bias):** 1 clip may mắn đạt triệu view ("Viral ảo") sẽ kéo trung bình cả kênh lên cao, dù 90% các video còn lại chỉ đạt 10.000 views.
2. **Không đo được độ ổn định (View Stability):** Brand không biết Creator có khả năng đạt cam kết KPI đều tay hay là dạng "hên xui".
3. **Không phản ánh tính phù hợp theo ngành (Category Bias):** Một Creator làm nội dung Đồ ăn (Food) rất viral nhưng khi nhận job Mỹ phẩm (Beauty) thì flop hoàn toàn.
4. **Không gắn với chi phí và chuyển đổi thực tế (CPV & Commerce):** Không biết chi phí thực sự để mua 1 lượt xem hợp lệ là bao nhiêu và Creator đó có bán được hàng hay không.

## 1.2. Nhiệm vụ của Onstage Intelligence
Onstage Intelligence được xây dựng để trả lời câu hỏi nghiệp vụ trọng tâm:
> **"Với một sản phẩm, ngành hàng, ngân sách và mục tiêu KPI lượt xem/doanh số cụ thể, Creator nào hoặc cơ cấu Creator nào có xác suất thành công cao nhất và tối ưu chi phí nhất?"**

---

# 2. ĐỊNH HƯỚNG SẢN PHẨM & CHUỖI GIÁ TRỊ DỮ LIỆU

Onstage Intelligence không phải là hệ thống dashboard xem số độc lập. Đây là **Lớp dữ liệu thông minh (Intelligence Layer) nằm xuyên suốt vòng đời vận hành chiến dịch**:

```text
       ┌───────────────────────────────────────────────────────────┐
       │             CHUỖI GIÁ TRỊ DỮ LIỆU ONSTAGE                 │
       └───────────────────────────────────────────────────────────┘
                                     │
      [1. DỮ LIỆU THỰC] ─────────────┴──────────► Dữ liệu booking, video duyệt, view thật
             │
      [2. INSIGHT PHÂN TÍCH] ───────────────────► CPV thực tế, KPI đạt %, Độ ổn định view
             │
      [3. RA QUYẾT ĐỊNH] ───────────────────────► Chọn Creator chuẩn, phân bổ ngân sách tối ưu
             │
      [4. THỰC THI CHIẾN DỊCH] ─────────────────► Sản xuất video, kiểm duyệt, theo dõi view
             │
      [5. NGHIỆM THU & ĐỐI SOÁT] ───────────────► Chốt số liệu, thanh toán, trừ đơn hủy/hoàn
             │
      [6. LÀM GIÀU DỮ LIỆU MỚI (FLYWEEL)] ──────► Dữ liệu mới nuôi dưỡng chiến dịch tiếp theo
             │
             └───────────────────────↺ (Vòng lặp tự gia tốc)
```

---

# 3. MÔ HÌNH DỮ LIỆU NGHIỆP VỤ TỔNG THỂ (THE DATA GRAPH)

Bốn thực thể: **Category (Ngành hàng)**, **Brand (Thương hiệu)**, **Product (Sản phẩm)** và **Creator (Nhà sáng tạo)** kết nối chặt chẽ với nhau thông qua thực thể trung tâm là **Campaign (Chiến dịch)**:

```text
CATEGORY (Ngành hàng)
   │
   └── BRAND (Thương hiệu)
        │
        └── PRODUCT (Sản phẩm / SKU)
             │
             └── CAMPAIGN (Chiến dịch Onstage)
                  │
                  ├── CREATOR A ──► Video ──► Views + Clicks + Sales
                  ├── CREATOR B ──► Video ──► Views + Clicks + Sales
                  └── CREATOR C ──► Video ──► Views + Clicks + Sales
```

Từ mỗi Campaign hoàn thành, hệ thống tự động trích xuất và cập nhật dữ liệu cho:
1. **Creator Performance History:** Lịch sử hoàn thành công việc của KOC.
2. **Product & Brand Intelligence:** Sức hút và hiệu quả thương mại của sản phẩm.
3. **Category Benchmark:** Mặt bằng giá CPV và lượng view chuẩn của toàn ngành.
4. **Ma trận tương quan:** `Creator × Category`, `Creator × Brand`, `Creator × Product`.

---

# 4. QUY TẮC PHÂN TÍCH HIỆU SUẤT ĐA CHIỀU

---

## 4.1. Creator Intelligence (Hiệu suất Nhà sáng tạo)

Đánh giá Creator dựa trên **7 trụ cột dữ liệu thực tế** (loại bỏ hoàn toàn điểm số Score chung chung):

1. **Lượt xem trung vị (Median Views) & Phân vị (P25 / P75 / P90):** 
   - Không dùng trung bình cộng (Average).
   - Phân vị P25 thể hiện mức view an toàn tối thiểu; Median View thể hiện mức view phổ biến nhất; P90 thể hiện tiềm năng viral.
2. **Tỷ lệ hoàn thành KPI (KPI Success Rate %):** Tỷ lệ % số chiến dịch Creator đạt hoặc vượt mốc lượt xem cam kết trong hợp đồng.
3. **Chi phí trên 1 view thực tế (Average CPV):** Chi phí thực tế Brand chi trả chia cho số lượt xem hợp lệ nhận về.
4. **Độ ổn định lượt xem (View Stability):** Đánh giá mức độ đồng đều giữa các video qua hệ số biến thiên lượt xem.
5. **Tỷ lệ đúng hạn (On-time Delivery Rate %):** Đánh giá tính kỷ luật và chuyên nghiệp trong việc nộp kịch bản, video nháp và đăng video chính thức.
6. **Tỷ lệ nhãn hàng book lại (Brand Rehire Rate %):** Thước đo mức độ hài lòng của nhãn hàng sau khi hợp tác.
7. **Năng lực thương mại (Commerce Conversion):** Doanh thu tạo ra trên 1.000 lượt xem (`GMV / 1.000 Views`) và Tỷ lệ chuyển đổi bán hàng (CR).

---

## 4.2. Creator × Category Performance (Hiệu suất theo Ngành hàng)

Một Creator không có hiệu suất giống nhau trên mọi ngành. Hệ thống bắt buộc phải bóc tách dữ liệu theo từng ngành:

*Ví dụ quy tắc phân tích:*
```text
Creator A:
├── Ngành Mỹ phẩm (Beauty):    12 Campaign | Avg Views: 184K | CPV: 48đ | KPI Success: 88% ──► (Phù hợp cao)
└── Ngành Thời trang (Fashion):  5 Campaign | Avg Views:  72K | CPV: 105đ| KPI Success: 60% ──► (Hiệu quả thấp)
```

**Quy tắc gợi ý:** Khi Brand tạo Campaign ngành Mỹ phẩm, hệ thống chỉ lấy chỉ số trong ngành Mỹ phẩm của Creator để tính toán và xếp hạng, không lấy dữ liệu ngành khác kéo điểm.

---

## 4.3. Creator × Brand & Product Performance (Lịch sử hợp tác)

- **Creator × Brand:** Đánh giá Creator đã chạy bao nhiêu chiến dịch cho chính Brand này, mức độ quen thuộc với định vị thương hiệu và tỷ lệ đạt KPI trong quá khứ.
- **Creator × Product:** Đo lường độ nhạy của Creator đối với một dòng sản phẩm cụ thể (VD: Chuyên serum trị mụn hay chuyên kem chống nắng).

---

## 4.4. Product & Brand Intelligence (Hiệu suất Sản phẩm & Thương hiệu)

- **Product Intelligence:**
  - Sản phẩm (SKU) đã chạy bao nhiêu chiến dịch?
  - Cần bao nhiêu Creator để đạt 1 triệu lượt xem?
  - Dòng sản phẩm này phù hợp với dạng video nào (Review trải nghiệm, Unboxing hay Hướng dẫn sử dụng)?
  - CPV benchmark của sản phẩm là bao nhiêu so với mức trung bình ngành?
- **Brand Intelligence:**
  - Cơ cấu phân bổ Creator theo cấp bậc (Tỷ lệ ngân sách dành cho Nano vs Micro vs Mid-tier vs Macro).
  - Tỷ lệ Creator thân thiết (Repeat Creators).

---

## 4.5. Category Benchmark (Chuẩn đo lường ngành hàng)

Category Benchmark là tiêu chuẩn tham chiếu nội bộ được tổng hợp từ toàn bộ dữ liệu thực tế trên Onstage:

| Chỉ số Benchmark | Ý nghĩa nghiệp vụ đối với Brand |
|---|---|
| **Median CPV ngành** | Giúp Brand biết mức chi phí trên 1 view hợp lý khi lên dự toán ngân sách. |
| **Median Views/Video ngành** | Căn cứ để giao chỉ tiêu KPI lượt xem thực tế cho từng Creator. |
| **KPI Success Rate ngành** | Cảnh báo mức độ rủi ro của ngành hàng để có phương án dự phòng bù view. |
| **Creator Tier Benchmark** | So sánh hiệu quả chi phí giữa các cấp bậc (Nano, Micro, Mid, Macro) trong cùng một ngành hàng. |

---

# 5. QUY CHUẨN CÔNG THỨC TÍNH TOÁN NGHIỆP VỤ

### 1. Chi phí trên mỗi lượt xem (CPV)
$$\text{CPV} = \frac{\text{Tổng thù lao chi trả cho Creator}}{\text{Tổng lượt xem hợp lệ được xác thực}}$$

### 2. Tỷ lệ hoàn thành cam kết lượt xem (KPI Achievement %)
$$\text{KPI Achievement \%} = \frac{\text{Lượt xem hợp lệ thực tế}}{\text{Lượt xem cam kết trong hợp đồng}} \times 100\%$$

### 3. Tỷ lệ đạt KPI của Creator (KPI Success Rate %)
$$\text{KPI Success Rate \%} = \frac{\text{Số hợp đồng Creator hoàn thành } \ge 100\% \text{ Target Views}}{\text{Tổng số hợp đồng đủ điều kiện đánh giá}} \times 100\%$$
*(Không tính các hợp đồng bị Hủy do lỗi từ phía Nhãn hàng hoặc chưa hết kỳ đo lường).*

### 4. Doanh thu trên 1.000 lượt xem (GMV / 1.000 Views - Chỉ số vàng)
$$\text{GMV / 1.000 Views} = \frac{\text{Tổng Doanh thu thuần (Net GMV)}}{\text{Tổng Lượt xem hợp lệ}} \times 1.000$$

### 5. Tỷ lệ nhãn hàng thuê lại (Brand Rehire Rate %)
$$\text{Brand Rehire Rate \%} = \frac{\text{Số Nhãn hàng hợp tác từ 2 chiến dịch trở lên}}{\text{Tổng số Nhãn hàng từng làm việc}} \times 100\%$$

### 6. Độ ổn định lượt xem (View Stability)
$$\text{View Stability} = 1 - \frac{\sigma}{\mu}$$
*(Trong đó $\sigma$ là độ lệch chuẩn và $\mu$ là lượt xem trung bình của 20 video gần nhất).*

---

# 6. LOGIC NGHIỆP VỤ ĐỘNG CƠ GỢI Ý CREATOR (RECOMMENDATION ENGINE)

Khi Brand nhập yêu cầu chiến dịch (Sản phẩm, Ngành hàng, Mục tiêu Views, Ngân sách), hệ thống thực hiện thuật toán lọc và phân bổ 5 bước:

```text
[BƯỚC 1: KHỞI TẠO TẬP ỨNG VIÊN (ELIGIBILITY)]
Lọc Creator thuộc ngành hàng phù hợp, tài khoản active và không có cảnh báo vi phạm.
                     │
                     ▼
[BƯỚC 2: ĐÁNH GIÁ ĐỘ PHÙ HỢP NGÀNH (CATEGORY FIT)]
Ưu tiên Creator có lịch sử chạy Campaign thành công trong đúng Category này (KPI đạt > 80%).
                     │
                     ▼
[BƯỚC 3: TỐI ƯU HÓA DANH MỤC (CREATOR MIX & PORTFOLIO OPTIMIZATION)]
Thuật toán phân bổ số lượng Creator theo cơ cấu tối ưu:
• 60% Ngân sách cho Micro Creator (Đạt CPV tối ưu nhất).
• 25% Ngân sách cho Mid-tier Creator (Tạo uy tín và độ phủ).
• 15% Ngân sách cho Nano Creator (Tạo hiệu ứng đám đông).
                     │
                     ▼
[BƯỚC 4: DỰ TOÁN HIỆU SUẤT & NGÂN SÁCH (FORECASTING)]
Tổng hợp: Số lượng Creator cần mời • Lượt xem dự kiến • Tổng chi phí dự toán • CPV kỳ vọng.
                     │
                     ▼
[BƯỚC 5: XUẤT DANH SÁCH ĐỀ XUẤT CHO BRAND LỰA CHỌN]
Brand duyệt danh sách gợi ý, có thể thay thế từng KOC trước khi gửi lời mời hàng loạt.
```

---

# 7. QUY TẮC NGHIỆP VỤ VỀ DỮ LIỆU, KIỂM TOÁN & PHÂN QUYỀN

## 7.1. Quy tắc chốt số liệu & Tính hợp lệ của Lượt xem
1. **Thời điểm chốt lượt xem (Cut-off Time):** Lượt xem chính thức được chốt sau **14 ngày** kể từ thời điểm video được đăng công khai.
2. **Xử lý Video bị xóa / ẩn (Private):** Nếu Creator tự ý xóa hoặc ẩn video trong vòng 30 ngày sau khi đăng, chiến dịch bị đánh giá `Không đạt KPI (Failed)` và xử lý theo chế tài hợp đồng.
3. **Lọc View ảo & Gian lận:** Hệ thống chỉ ghi nhận lượt xem tự nhiên (Organic Views) hoặc lượt xem từ mã quảng cáo ủy quyền chính thức (Spark Ads). Lượt xem tăng đột biến bất thường do mua bot sẽ bị loại trừ qua thuật toán kiểm toán gian lận.

## 7.2. Nguyên tắc Bảo mật & Phân quyền Dữ liệu (Data Governance)
- **Quyền của Brand:**
  - Được xem toàn bộ dữ liệu chi tiết của các chiến dịch do chính mình triển khai.
  - Được xem hồ sơ năng lực, lịch sử hiệu suất công khai và benchmark ngành.
  - **Tuyệt đối không được xem:** Chi phí thù lao riêng, hợp đồng riêng hoặc dữ liệu doanh số nội bộ của các Brand đối thủ.
- **Quyền của Creator:**
  - Được xem toàn bộ lịch sử hiệu suất, tỷ lệ đạt KPI, thù lao và tiến độ thanh toán của chính mình.
- **Quyền của Onstage Admin:**
  - Toàn quyền đối soát, xác thực lượt xem, xử lý tranh chấp và khóa sổ dữ liệu (Snapshot).
