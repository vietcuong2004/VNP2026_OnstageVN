# TÀI LIỆU THIẾT KẾ UI/UX
## Talent App & Brand Portal

## 1. Mục tiêu sản phẩm

Dự án được định vị là một nền tảng công nghệ dành cho ngành người đẹp, người mẫu và giải trí. Trọng tâm không phải chỉ là một app thi hoa hậu, mà là hệ thống giúp tài năng xây dựng hồ sơ số, được chấm điểm, được định hướng nghề nghiệp và được kết nối với nhãn hàng để tạo ra doanh thu.

Trong giai đoạn MVP, hệ thống nên tập trung vào 2 nhóm người dùng chính:

1. **Talent**: thí sinh, người đẹp, model, KOL, MC, PG, creator.
2. **Brand**: nhãn hàng, agency, đơn vị tổ chức sự kiện, ekip sản xuất, ban tổ chức cuộc thi.

Admin chỉ nên làm ở mức tối giản để duyệt hồ sơ, quản lý job, xử lý tranh chấp và theo dõi giao dịch.

---

## 2. Nguyên tắc thiết kế tổng thể

### 2.1. Định vị giao diện

Phong cách giao diện nên đi theo hướng:

**Luxury Tech / Beauty SaaS / Futuristic Minimalist**

Tức là kết hợp giữa cảm giác cao cấp của ngành sắc đẹp và sự rõ ràng, chính xác của một nền tảng công nghệ.

Không nên thiết kế quá rực rỡ, quá nhiều hiệu ứng hoa hậu truyền thống. Giao diện cần tạo cảm giác chuyên nghiệp, đáng tin cậy, hiện đại và có khả năng mở rộng thành nền tảng thương mại B2B.

### 2.2. Tông màu đề xuất

| Thành phần | Màu đề xuất | Vai trò |
|---|---|---|
| Nền chính | Deep Navy / Matte Black | Tạo cảm giác cao cấp, công nghệ |
| Màu nhấn chính | Gold Gradient | Đại diện cho sắc đẹp, vương miện, premium |
| Màu phụ | Purple Neon / Cyan Blue | Đại diện cho AI, dữ liệu, matching |
| Text chính | White / Ivory | Dễ đọc trên nền tối |
| Text phụ | Cool Gray | Mô tả, metadata |
| Thành công | Emerald Green | Job hoàn tất, thanh toán thành công |
| Cảnh báo | Amber | Hồ sơ thiếu, chờ xác minh |
| Lỗi | Red / Rose | Tranh chấp, hủy job, chưa đạt điều kiện |

# PHẦN B — BRAND PORTAL

## 11. Chân dung người dùng Brand

### 11.1. Nhóm người dùng chính

Brand Portal phục vụ:

- Local brand thời trang, mỹ phẩm, spa, nha khoa, fitness.
- Luxury brand: xe, trang sức, đồng hồ, bất động sản.
- Event agency.
- Production house.
- E-commerce/livestream agency.
- Ban tổ chức cuộc thi.

### 11.2. Nhu cầu chính của Brand

Brand cần:

1. Tìm Talent phù hợp nhanh.
2. So sánh hồ sơ bằng dữ liệu.
3. Biết rõ giá, lịch trống, chỉ số social.
4. Gửi lời mời hoặc booking ngay.
5. Quản lý nhiều Talent trong một chiến dịch.
6. Ký hợp đồng, đặt cọc, nghiệm thu và thanh toán minh bạch.
7. Theo dõi hiệu quả chiến dịch.
8. Giảm rủi ro hủy show, bùng job, sai cam kết.

### 11.3. Tâm lý người dùng Brand

Brand không muốn “xem ảnh cho đẹp” đơn thuần. Họ cần ra quyết định nhanh dựa trên:

- Fit với chiến dịch.
- Chi phí.
- Độ tin cậy.
- Social metrics.
- Lịch trống.
- Brand safety.
- Lịch sử làm việc.

Vì vậy Brand UI phải giống một SaaS dashboard chuyên nghiệp hơn là một social app.

---

## 12. Brand Portal Flow

## 12.1. Luồng tổng quan

```text
Brand đăng nhập
        ↓
Dashboard
        ↓
Tạo Campaign
        ↓
Nhập yêu cầu Talent
        ↓
AI Matching gợi ý danh sách phù hợp
        ↓
So sánh Talent
        ↓
Gửi lời mời / Book ngay
        ↓
Ký hợp đồng / Đặt cọc
        ↓
Theo dõi thực hiện
        ↓
Nghiệm thu / Thanh toán / Đánh giá
```

---

## 13. Brand Dashboard

### 13.1. Mục tiêu

Brand Dashboard phải trả lời nhanh các câu hỏi:

- Chiến dịch nào đang chạy?
- Đã book bao nhiêu Talent?
- Ngân sách đang ở đâu?
- Job nào chờ xác nhận?
- Talent nào cần phản hồi?
- Hiệu quả chiến dịch ra sao?

### 13.2. Layout đề xuất

```text
Sidebar
- Dashboard
- Campaigns
- Discover Talents
- Bookings
- Contracts & Escrow
- Analytics
- Messages
- Billing

Main Content
- Overview cards
- Active campaigns
- Recommended talents
- Pending actions
- Budget/Escrow summary
```

### 13.3. Overview cards

```text
Active Campaigns: 4
Talents Booked: 28
Escrow Balance: 186.000.000đ
Pending Approval: 6
```

### 13.4. Pending Actions

Ví dụ:

```text
- 3 Talent đang chờ bạn xác nhận booking
- 2 job đã hoàn thành cần nghiệm thu
- 1 tranh chấp cần phản hồi
- 5 Talent mới phù hợp với campaign Beauty Mega Live
```

---

## 14. Create Campaign

### 14.1. Mục tiêu

Brand tạo chiến dịch càng nhanh càng tốt, sau đó hệ thống dùng dữ liệu để match Talent.

### 14.2. Luồng tạo campaign

Nên dùng stepper 5 bước:

```text
Step 1: Campaign Type
Step 2: Talent Requirements
Step 3: Budget & Timeline
Step 4: Content / Job Brief
Step 5: AI Matching Result
```

### 14.3. Step 1 — Campaign Type

Brand chọn loại nhu cầu:

- KOL/Influencer quảng cáo.
- KOC livestream bán hàng.
- Người mẫu lookbook.
- Người mẫu runway.
- MC sự kiện.
- PG/VIP promotion girl.
- Event guest/KOL khách mời.
- Đại sứ thương hiệu dài hạn.
- Diễn viên MV/quảng cáo.
- Travel vlogger.
- Creator tri thức.
- Game/esports ambassador.

UI nên dùng card dạng icon + ảnh minh họa.

### 14.4. Step 2 — Talent Requirements

Các filter:

- Tier mong muốn.
- Giới tính.
- Độ tuổi.
- Chiều cao.
- Khu vực.
- Kỹ năng.
- Social platform.
- Follower.
- Engagement rate.
- Brand safety.
- Ngân sách kỳ vọng.

### 14.5. Step 3 — Budget & Timeline

Các trường:

- Tổng ngân sách.
- Số lượng Talent cần book.
- Thời gian diễn ra.
- Địa điểm.
- Online/offline.
- Có cần travel/hotel không.
- Điều kiện thanh toán.

### 14.6. Step 4 — Job Brief

Brand nhập:

- Mục tiêu chiến dịch.
- Yêu cầu nội dung.
- Dress code.
- Key message.
- Deliverables.
- Lưu ý hình ảnh.
- File đính kèm.

### 14.7. Step 5 — AI Matching Result

Hiển thị danh sách Talent phù hợp:

```text
Top Matches
1. Mai Anh — 94% match — Tier A — Beauty KOL
2. Khánh Linh — 91% match — Tier B — Livestream/KOC
3. Ngọc Hân — 88% match — Tier A — Event/MC
```

Brand có thể:

- Xem profile.
- So sánh.
- Gửi lời mời.
- Book ngay.
- Lưu vào shortlist.

---

## 15. Talent Discovery cho Brand

### 15.1. Mục tiêu

Đây là màn hình tìm kiếm Talent chính.

### 15.2. Layout đề xuất

```text
----------------------------------------------------
Search bar: Tìm Talent, kỹ năng, ngành hàng...
----------------------------------------------------
Left Filter Panel       Talent Grid / Talent Table
----------------------------------------------------
Filter:
- Tier
- Job category
- Location
- Budget
- Height
- Age
- Skill score
- Social metrics
- Availability
- Brand safety
----------------------------------------------------
```

### 15.3. Hai chế độ xem

Brand nên có 2 kiểu hiển thị:

#### Grid View

Phù hợp khi cần xem hình ảnh nhanh.

```text
[Ảnh]
Mai Anh
Tier A | 82/100
Beauty KOL • MC
Followers: 120K
Engagement: 4.8%
Rate: từ 8M
[View] [Shortlist]
```

#### Table View

Phù hợp với agency cần xử lý nhiều Talent.

| Talent | Tier | Score | Location | Skill | Followers | ER | Rate | Availability |
|---|---|---|---|---|---|---|---|---|
| Mai Anh | A | 82 | Hà Nội | KOL/MC | 120K | 4.8% | 8M+ | 24/06 |

### 15.4. Compare Talent

Brand nên có tính năng so sánh 2-4 Talent.

So sánh theo:

- Ảnh đại diện.
- Tier.
- Profile score.
- Match score.
- Giá.
- Lịch trống.
- Social metrics.
- Skill radar.
- Reliability.
- Review.

---

## 16. Talent Profile View cho Brand

Đây là phiên bản Brand xem hồ sơ Talent. Khác với Talent tự xem profile, Brand cần nhiều dữ liệu ra quyết định hơn.

### 16.1. Header

```text
[Cover Image]
Mai Anh
Tier A | Verified | Brand Safe
Beauty KOL • MC • Event Guest
Hà Nội
Match với campaign hiện tại: 91%
[Book Now] [Invite] [Add to Shortlist]
```

### 16.2. Decision Panel

Một panel cố định bên phải:

```text
Booking Estimate
Rate: từ 8.000.000đ
Available: 24, 25, 28/06
Response Time: 2h
Reliability: 96%
Escrow Required: Yes
[Book Now]
```

### 16.3. Data Sections

- Overview.
- Portfolio.
- Social Metrics.
- Skill Radar.
- Rate Card.
- Availability.
- Past Campaigns.
- Reviews.
- Brand Safety.

### 16.4. UX quan trọng

Brand không nên phải nhắn tin hỏi những thông tin cơ bản. Các thông tin quan trọng phải có sẵn:

- Giá từ bao nhiêu.
- Có lịch không.
- Có phù hợp campaign không.
- Độ tin cậy thế nào.
- Đã từng làm job tương tự chưa.

---

## 17. Booking & Escrow Flow

### 17.1. Luồng booking

```text
Brand chọn Talent
        ↓
Chọn campaign hoặc tạo job mới
        ↓
Xác nhận brief, thời gian, địa điểm, cát-xê
        ↓
Gửi lời mời
        ↓
Talent chấp nhận
        ↓
Brand đặt cọc
        ↓
Job bắt đầu
        ↓
Check-in / Upload proof
        ↓
Brand nghiệm thu
        ↓
Giải ngân
        ↓
Đánh giá hai chiều
```

### 17.2. Trạng thái booking

Nên chuẩn hóa status:

| Status | Ý nghĩa |
|---|---|
| Draft | Brand mới tạo job |
| Invited | Đã gửi lời mời Talent |
| Accepted | Talent đã chấp nhận |
| Escrow Pending | Chờ Brand đặt cọc |
| Escrowed | Đã đặt cọc |
| In Progress | Đang thực hiện |
| Pending Review | Chờ nghiệm thu |
| Completed | Hoàn tất |
| Disputed | Có tranh chấp |
| Cancelled | Đã hủy |

### 17.3. UI escrow

Nên có thanh trạng thái:

```text
Booking Created → Talent Accepted → Escrow Paid → Job Done → Released
```

Thông tin cần hiển thị:

- Số tiền đặt cọc.
- Phí nền tảng.
- Số tiền Talent nhận.
- Điều kiện giải ngân.
- Chính sách hủy.
- Nút mở tranh chấp.

---

## 18. Brand Campaign Management

### 18.1. Campaign Detail

Mỗi campaign cần có dashboard riêng.

```text
Campaign: Beauty Mega Live 06/2026
Status: Active
Budget: 200.000.000đ
Booked Talents: 12/15
Total Reach Estimate: 2.4M
Escrowed: 128.000.000đ
Pending Review: 3 jobs
```

### 18.2. Các tab trong campaign

- Overview.
- Talents.
- Brief.
- Schedule.
- Contracts.
- Escrow.
- Performance.
- Files.

### 18.3. Talent pipeline trong campaign

```text
Shortlisted → Invited → Accepted → Escrowed → In Progress → Completed
```

UI có thể dùng Kanban board để Brand kéo thả Talent giữa các trạng thái.

---

## 19. Messaging

### 19.1. Talent side

Talent cần message đơn giản:

- Tin nhắn từ Brand.
- Lời mời job.
- Nhắc lịch.
- Yêu cầu bổ sung thông tin.

### 19.2. Brand side

Brand cần message gắn với campaign/job:

- Chat với Talent.
- Gửi brief.
- Gửi file.
- Xác nhận thay đổi.
- Lưu lịch sử làm bằng chứng nếu tranh chấp.

### 19.3. UX đề xuất

Mỗi conversation nên gắn với một job/campaign cụ thể, tránh chat rời rạc.

---

## 20. Notification System

### 20.1. Talent notifications

- Có job mới phù hợp.
- Brand gửi lời mời.
- Brand đã đặt cọc.
- Sắp đến lịch job.
- Brand đã nghiệm thu.
- Tiền đã giải ngân.
- Hồ sơ cần cập nhật.
- Có cuộc thi phù hợp.

### 20.2. Brand notifications

- Talent đã chấp nhận lời mời.
- Talent từ chối lời mời.
- Đến hạn đặt cọc.
- Job sắp diễn ra.
- Talent đã check-in.
- Job chờ nghiệm thu.
- Có khiếu nại/tranh chấp.
- Có Talent mới phù hợp campaign.

---

# PHẦN C — INFORMATION ARCHITECTURE
## 22. Sitemap Brand

```text
App/Brand
├── Dashboard
├── Campaigns
│   ├── Campaign List
│   ├── Create Campaign
│   ├── Campaign Detail
│   └── Campaign Analytics
├── Discover Talents
│   ├── Search
│   ├── Filter
│   ├── Talent Grid
│   ├── Talent Table
│   └── Compare Talents
├── Talent Profile View
├── Bookings
│   ├── Booking List
│   ├── Booking Detail
│   └── Booking Status
├── Contracts & Escrow
├── Messages
├── Billing
├── Team Members
└── Settings
```

---

# PHẦN D — DESIGN SYSTEM

## 23. Component Library

### 23.1. Common Components

- Button.
- Input.
- Select.
- Multi-select.
- Date picker.
- File upload.
- Modal.
- Drawer.
- Toast.
- Tooltip.
- Badge.
- Tabs.
- Stepper.
- Card.
- Table.
- Empty state.
- Loading skeleton.

### 23.2. Domain Components

- Talent Card.
- Talent Tier Badge.
- Profile Score Ring.
- Skill Radar Chart.
- Match Score Badge.
- Rate Card Block.
- Availability Calendar.
- Campaign Card.
- Booking Status Timeline.
- Escrow Summary Card.
- Crown Funding Progress.
- Social Metric Card.
- Review Summary.
- AI Recommendation Panel.

---

## 24. Navigation Pattern

### 24.1. Talent mobile

Dùng bottom navigation:

```text
Home | Jobs | Crown | Messages | Profile
```

### 24.2. Talent desktop

Có thể dùng sidebar nhẹ hoặc top navigation.

### 24.3. Brand desktop

Brand nên ưu tiên desktop-first, vì Brand/Agency thường thao tác nhiều dữ liệu.

Sidebar đề xuất:

```text
Dashboard
Campaigns
Discover Talents
Bookings
Contracts & Escrow
Analytics
Messages
Billing
Settings
```

### 24.4. Brand mobile

Mobile chỉ cần hỗ trợ các tác vụ nhanh:

- Xem campaign.
- Duyệt Talent.
- Trả lời lời mời.
- Nghiệm thu job.
- Chat.

Không cần nhồi toàn bộ chức năng desktop vào mobile.

---

## 25. UX Writing

### 25.1. Nguyên tắc ngôn ngữ

- Không dùng từ quá kỹ thuật với Talent.
- Với Brand, dùng từ chuyên nghiệp và rõ ràng.
- Với các điểm số nhạy cảm, dùng cách diễn đạt tích cực.

Ví dụ:

Không nên:

```text
Bạn bị loại khỏi nhóm Hoa hậu quốc gia.
```

Nên dùng:

```text
Hồ sơ của bạn phù hợp hơn với nhóm KOL, người mẫu ảnh và các cuộc thi giải trí thế hệ mới.
```

Không nên:

```text
Điểm uy tín thấp.
```

Nên dùng:

```text
Bạn có thể tăng điểm uy tín bằng cách hoàn thành thêm job đúng hạn.
```

---

# PHẦN E — MVP ĐỀ XUẤT

## 26. MVP Talent

Nên làm trước:

1. Đăng ký/đăng nhập Talent.
2. Onboarding hồ sơ cơ bản.
3. Khảo sát định hướng.
4. Kết quả radar chart.
5. Talent Dashboard.
6. Portfolio profile.
7. Danh sách job phù hợp.
8. Job detail.
9. Nhận/từ chối lời mời job.
10. Wallet/thu nhập cơ bản.

Chưa cần làm ngay:

- Crown Funding nâng cao.
- Fan voting.
- Social API tự động.
- AI scoring phức tạp.
- Blockchain/smart contract thật.

## 27. MVP Brand

Nên làm trước:

1. Đăng ký/đăng nhập Brand.
2. Brand Dashboard.
3. Tạo campaign.
4. Talent discovery.
5. Talent profile view.
6. Shortlist Talent.
7. Gửi lời mời booking.
8. Booking detail.
9. Escrow status mô phỏng.
10. Campaign management cơ bản.

Chưa cần làm ngay:

- Analytics nâng cao.
- Team permission phức tạp.
- Hợp đồng điện tử nâng cao.
- Hóa đơn/tax automation.
- QR/GPS check-in.

---

## 28. Thứ tự thiết kế Figma đề xuất

Nên thiết kế theo thứ tự sau:

### Batch 1 — Foundation

1. Design System.
2. Color palette.
3. Typography.
4. Button/input/card/table/badge.
5. Tier badge.
6. Talent card.
7. Campaign card.

### Batch 2 — Talent Core

1. Talent Onboarding.
2. Survey Flow.
3. Result Screen.
4. Talent Dashboard.
5. Portfolio Profile.
6. Job List.
7. Job Detail.

### Batch 3 — Brand Core

1. Brand Dashboard.
2. Create Campaign.
3. Talent Discovery.
4. Talent Profile View.
5. Compare Talent.
6. Booking Flow.
7. Campaign Detail.

### Batch 4 — Transaction & Trust

1. Escrow Status.
2. Booking Timeline.
3. Review/Rating.
4. Message Center.
5. Notification Center.

---

## 29. Kết luận định hướng UI/UX

Talent App nên có cảm giác như một trợ lý phát triển sự nghiệp cá nhân cho người đẹp: đẹp, truyền cảm hứng, có định hướng và giúp họ nhìn thấy cơ hội.

Brand Portal nên có cảm giác như một SaaS tuyển chọn và quản lý Talent chuyên nghiệp: rõ ràng, nhiều dữ liệu, ra quyết định nhanh, giảm rủi ro trong booking.

Hai giao diện dùng chung một design system nhưng khác trọng tâm:

| Nhóm | Trọng tâm UI |
|---|---|
| Talent | Đẹp, cảm hứng, hướng dẫn, cá nhân hóa |
| Brand | Dữ liệu, lọc, so sánh, booking, quản trị |

Nếu thiết kế đúng, hệ thống sẽ không chỉ là nơi đăng hồ sơ người đẹp, mà trở thành một nền tảng thương mại hóa tài năng trong ngành sắc đẹp và giải trí.

