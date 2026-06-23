# Tài liệu Thiết kế Hệ thống 4 Luồng Gọi Vốn Cộng Đồng (Crowdfunding Flows) - OnstageVN

Tài liệu này chi tiết hóa cách thức tích hợp và vận hành **4 hình thức Crowdfunding (Gọi vốn cộng đồng)** vào hệ sinh thái của **OnstageVN** (Nền tảng Quản trị & Kết nối Tài năng Giải trí 4.0). Nhằm mục đích hỗ trợ thí sinh/KOLs/Models tối ưu hóa nguồn lực tài chính ở mọi giai đoạn vòng đời (Lifecycle Phases), đồng thời giải quyết triệt để các rào cản pháp lý và tính minh bạch tại thị trường Việt Nam.

Toàn bộ 4 luồng này được quy hoạch tập trung vào một trang **"Crownfunding" (Quỹ Vương Miện)** duy nhất ở cả hai phân hệ **Talent** và **Brand**, được phân tách thành các Tab con chuyên biệt để tối giản hóa sơ đồ điều hướng và tập trung dòng tiền.

---

## 1. Bản Đồ Tổng Quan Quy Hoạch Tab Trên Trang Crownfunding

| Tab con | Tên nghiệp vụ | Vai trò trong Hệ sinh thái OnstageVN | Đối tượng Ủng hộ/Đầu tư | Rào cản & Hướng giải quyết pháp lý |
| :--- | :--- | :--- | :--- | :--- |
| **Tab 1** | **Quyên Góp Nhân Ái (Donate)** | Gây quỹ dự án xã hội/cộng đồng của thí sinh trong cuộc thi (Pre & In-Pageant). | Cộng đồng Fans, Doanh nghiệp (Brands), Nhà hảo tâm. | Rào cản giải trình sao kê dòng tiền. <br/>**Giải pháp:** Tích hợp ví Bảo Kim trung gian nhận tiền, hiển thị Sao kê đầu vào và chứng từ giải ngân đầu ra thời gian thực công khai. |
| **Tab 2** | **Quà Tri Ân (Reward-Based)** | Tài trợ chi phí đi thi hoặc làm sản phẩm nghệ thuật của Talent. Đổi lại các vật phẩm/đặc quyền thương mại. | Fans trung thành, Nhãn hàng cần quảng bá diện rộng. | Rủi ro bùng quà/chậm tiến độ. <br/>**Giải pháp:** Tạm khóa tiền thanh toán của Brand trong ví **Escrow OnstageVN** qua Bảo Kim, giải ngân sau khi Talent gửi quà đi và người ủng hộ xác nhận hoặc check chéo mã vận đơn. |
| **Tab 3** | **Cho Vay Đầu Tư (Lending - P2P/ISA)** | Talent vay vốn để trang trải chi phí học tập/trang phục. Trả dần từ thu nhập booking trong tương lai. | Fans lớn, Quỹ đầu tư cá nhân, Talent VIP muốn sinh lời. | Rủi ro nợ xấu cực kỳ cao.<br/>**Giải pháp:** Hợp đồng chia sẻ thu nhập tương lai (ISA). Hệ thống tự động trích nợ `25%` từ cát-xê của mọi job B2B phát sinh trên app của Talent gửi về nhà đầu tư. |
| **Tab 4** | **Góp Vốn Thiên Thần (Equity/BCC)** | Nhãn hàng/Agencies đầu tư gói tài chính lớn cho Talent hạng A/S để đồng hành thương mại dài hạn. | Agencies giải trí, Nhãn hàng lớn (Luxury Brands). | Chưa có khung pháp lý phát hành cổ phiếu trực tuyến.<br/>**Giải pháp:** Sử dụng Hợp đồng Hợp tác Kinh doanh (BCC) điện tử. Hệ thống tự động phân chia doanh thu (Smart Revenue Splitter) trích % cố định từ mọi job booking của Talent lâu dài. |

---

## 2. Thiết Kế Bản Đồ Trang Crownfunding (Page Layout & Navigation Map)

### 2.1. Phía Talent (Tài năng / Thí sinh)
*   **Trang chạy:** [app/talent/crownfunding/page.tsx](file:///c:/CONG_VIEC/VNP_OnstageVN/frontend/app/talent/crownfunding/page.tsx)
*   **Layout:** Sidebar chung của hệ thống, khu vực nội dung chính hiển thị Banner Quỹ Vương Miện, bên dưới là hệ thống Tabs chia thành 4 phân hệ quản trị:
    1.  **Tab 1 (Quyên Góp):** Hiển thị thống kê tổng tiền quyên góp được cho dự án từ thiện cá nhân, thanh tiến độ, quản lý mốc giải ngân (nơi gửi chứng từ/ảnh nghiệm thu thực tế để rút tiền).
    2.  **Tab 2 (Quà Tri Ân):** Form thiết lập các gói quà (giá bán, số lượng, ngày giao hàng dự kiến) và trình quản lý vận đơn gửi quà (nhập mã Tracking Code bưu cục).
    3.  **Tab 3 (Vay Vốn):** Hiển thị điểm uy tín tín dụng, hạn mức vay khả dụng dựa trên phân hạng Tier (Hạng S/A/B/C), gửi yêu cầu vay vốn và theo dõi số dư nợ còn lại đang được trích tự động 25% từ cát-xê.
    4.  **Tab 4 (Cổ Phần):** Đăng tải hồ sơ Pitching dự án nghệ thuật cá nhân để chào mời đầu tư dài hạn, quản lý hợp đồng BCC điện tử đã ký, xem lịch sử chia sẻ doanh thu thực tế.

### 2.2. Phía Brand (Doanh nghiệp / Nhà tài trợ)
*   **Trang chạy:** `app/brand/crownfunding/page.tsx`
*   **Layout:** Sidebar dành cho doanh nghiệp, Header tổng hợp và hệ thống Tabs khám phá/đầu tư:
    1.  **Tab 1 (Đồng Hành Nhân Ái):** Xem danh sách tất cả các dự án cộng đồng đang mở đơn của thí sinh. Click vào xem chi tiết, bảng danh dự các nhà tài trợ, báo cáo sao kê thu chi và mở cổng quyên góp qua mã QR Bảo Kim.
    2.  **Tab 2 (Gói Quà Tri Ân):** Xem các dự án nghệ thuật của Talent, chọn mua các gói quà tương ứng, điền địa chỉ giao nhận, quét mã QR Bảo Kim thanh toán, theo dõi mã vận đơn thực tế và bấm xác nhận đã nhận quà.
    3.  **Tab 3 (Đầu Tư Cát-Xê):** Xem danh sách hồ sơ vay vốn đi thi của Talent, đối soát điểm tín dụng/Tiering của họ để đánh giá rủi ro, thực hiện rót tiền cho vay đầu tư (P2P/ISA).
    4.  **Tab 4 (Đầu Tư Thiên Thần):** Khám phá hồ sơ gọi vốn phát triển thương hiệu dài hạn của Talent hạng VIP (S/A), xem mức tỷ lệ chia sẻ doanh thu (Revenue Share) cam kết, thực hiện ký kết hợp đồng BCC điện tử và chuyển tiền đầu tư thương mại.

---

## 3. Chi Tiết Vận Hành Nghiệp Vụ Của Từng Luồng (Cập nhật Bảo Kim)

### LUỒNG 1: DONATE (QUYÊN GÓP TỪ THIỆN / QUỸ NHÂN ÁI)
*   **Thanh toán:** Qua cổng Bảo Kim sinh mã QR động (VietQR).
*   **Dòng tiền:** Tiền chuyển về ví Bảo Kim trung gian nhận quyên góp của OnstageVN. Giải ngân từng mốc (50% đợt 1 để thi công, 50% đợt 2 sau khi có báo cáo nghiệm thu thực địa có xác nhận của địa phương).
*   **Minh bạch:** Auto-Statement hiển thị live-feed các giao dịch thành công trên Tab 1 phía Brand xem.

### LUỒNG 2: REWARD-BASED (ỦNG HỘ NHẬN QUÀ TRI ÂN)
*   **Thanh toán:** Qua cổng Bảo Kim.
*   **Dòng tiền:** Chuyển vào trạng thái **Ký quỹ Escrow (Tạm khóa)** trong tài khoản OnstageVN.
*   **Giải ngân:** Chỉ chuyển tiền từ Escrow sang ví khả dụng của Talent sau khi Talent cập nhật mã vận đơn bưu cục và Brand bấm nút **"Xác nhận đã nhận quà"** hoặc hệ thống tự động xác nhận sau 10 ngày (trừ đi 10% phí sàn).

### LUỒNG 3: LENDING (CHO VAY NGANG HÀNG - P2P / ISA)
*   **Giải ngân vốn:** Tiền từ nhà đầu tư cho vay không chuyển tiền mặt cho Talent mà thanh toán trực tiếp cho các nhà cung cấp dịch vụ (trang phục, makeup, học viện catwalk) trên B2B Marketplace của OnstageVN.
*   **Thu hồi nợ:** Backend tự động trích `25%` cát-xê từ mọi giao dịch booking của Talent trên hệ thống để chuyển trả về ví của nhà đầu tư cho đến khi hoàn nợ (gồm gốc + lãi).

### LUỒNG 4: EQUITY (GÓP VỐN ĐẦU TƯ DÀI HẠN / REVENUE-SHARING)
*   **Cơ sở pháp lý:** Ký kết Hợp đồng Hợp tác Kinh doanh (BCC) điện tử qua e-KYC.
*   **Phân chia doanh thu:** Lõi Backend tự động cắt một tỷ lệ phần trăm cố định (ví dụ: `20%`) từ mọi job booking của Talent trong vòng 1-3 năm cam kết, chuyển thẳng về ví của Nhà đầu tư.

---

## 4. Đặc Tả Dữ Liệu Kỹ Thuật (Database Schema & API Routes)

Để phục vụ cho trang Crownfunding hợp nhất 4 tab, cơ sở dữ liệu được thiết kế mở rộng:

```sql
-- 1. Bảng chiến dịch gây quỹ trung tâm (Quỹ Vương Miện)
CREATE TABLE crowdfunding_campaigns (
    id VARCHAR(36) PRIMARY KEY,
    talent_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL, -- donate, reward, lending, equity
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(15, 2) NOT NULL,
    raised_amount DECIMAL(15, 2) DEFAULT 0.00,
    supporters_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending_review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng lưu trữ gói quà tri ân (Chỉ dùng cho Type = reward)
CREATE TABLE crowdfunding_rewards (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    pledge_amount DECIMAL(15, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    limit_quantity INT NULL,
    claimed_count INT DEFAULT 0,
    estimated_delivery DATE NOT NULL
);

-- 3. Bảng quản lý đơn hàng mua quà (Type = reward)
CREATE TABLE reward_orders (
    id VARCHAR(36) PRIMARY KEY,
    reward_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NULL, -- ID Brand/Fan mua quà
    amount DECIMAL(15, 2) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    mrc_order_id VARCHAR(100) UNIQUE,
    baokim_txn_id VARCHAR(100) NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, escrowed, released, refunded
    shipping_status VARCHAR(50) DEFAULT 'processing', -- processing, shipped, delivered, disputed
    carrier_name VARCHAR(100) NULL,
    tracking_code VARCHAR(100) NULL,
    shipped_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);

-- 4. Bảng quản lý lịch sử quyên góp từ thiện (Type = donate)
CREATE TABLE donate_transactions (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NULL, -- ID Brand/Fan ủng hộ
    donor_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    message VARCHAR(255) NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    mrc_order_id VARCHAR(100) UNIQUE,
    baokim_txn_id VARCHAR(100) NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed
    completed_at TIMESTAMP NULL
);

-- 5. Bảng hợp đồng chia sẻ thu nhập (Type = lending hoặc equity)
CREATE TABLE isa_contracts (
    id VARCHAR(36) PRIMARY KEY,
    talent_id VARCHAR(36) NOT NULL,
    investor_id VARCHAR(36) NOT NULL,
    campaign_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL, -- lending, equity
    investment_amount DECIMAL(15, 2) NOT NULL,
    share_rate DECIMAL(5, 2) NOT NULL, -- Tỷ lệ chia sẻ cát-xê (ví dụ: 25.00%)
    cap_amount DECIMAL(15, 2) NULL, -- Ngưỡng tối đa thu hồi (cho Lending)
    accumulated_repaid DECIMAL(15, 2) DEFAULT 0.00,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Các Endpoint API cốt lõi:
*   `POST /api/crowdfunding/donate/baokim/initiate` - Khởi tạo quyên góp qua Bảo Kim (Tab 1 Brand).
*   `POST /api/crowdfunding/rewards/buy` - Chọn mua gói quà tri ân qua Bảo Kim (Tab 2 Brand).
*   `POST /api/crowdfunding/rewards/ship` - Cập nhật mã vận đơn bưu cục giao quà (Tab 2 Talent).
*   `POST /api/crowdfunding/rewards/order/{id}/confirm` - Brand xác nhận nhận được quà để giải ngân Escrow.
*   `POST /api/crowdfunding/lending/request` - Tạo đề án vay vốn đi thi (Tab 3 Talent).
*   `POST /api/crowdfunding/lending/lend` - Rót tiền cho Talent vay (Tab 3 Brand).
*   `POST /api/crowdfunding/equity/pitch` - Tạo hồ sơ gọi vốn thương hiệu (Tab 4 Talent).
*   `POST /api/crowdfunding/equity/invest` - Đầu tư mua cổ phần BCC (Tab 4 Brand).
