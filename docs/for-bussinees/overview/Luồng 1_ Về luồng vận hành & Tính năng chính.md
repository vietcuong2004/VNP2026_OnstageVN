# **Luồng 1: Về luồng vận hành & Tính năng chính**

## **Tổng quan**

**Luồng 1: Về luồng vận hành & Tính năng chính** là bước quan trọng nhất vì nó quyết định trải nghiệm người dùng (UX) và kiến trúc dữ liệu của toàn hệ thống. Đây là nền tảng để xây dựng một marketplace hai chiều (two-sided marketplace) kết nối hiệu quả giữa cung (KOLs/Models) và cầu (Nhà tuyển dụng).

**Tại sao Luồng 1 quan trọng nhất?**

1. **Quyết định trải nghiệm người dùng (UX):**
   - Nếu KOL thấy khó dùng → không tạo profile → không có supply
   - Nếu Đối tác không tìm được người phù hợp → không trả tiền → không có revenue
   - UX tốt = tăng conversion rate = tăng trưởng nhanh

2. **Quyết định kiến trúc dữ liệu:**
   - Thiết kế database sai từ đầu → khó scale sau này
   - Cần nghĩ trước: Làm sao lưu trữ 100,000 profiles? 1 triệu ảnh?
   - Cần tối ưu search: Tìm trong 10,000 profiles trong <500ms

3. **Nền tảng cho các tính năng sau:**
   - Luồng 2 (Monetization) dựa trên Luồng 1
   - Luồng 3 (Admin) quản lý data từ Luồng 1
   - Phần 4 (Agency) mở rộng từ Luồng 1

### **Nguyên tắc Thiết kế (Design Principles)**

**1. Mobile-first cho KOLs:**
- **Tại sao?** 85% KOLs/Models sử dụng smartphone làm thiết bị chính
- **Nghĩa là gì?** 
  - Thiết kế giao diện cho màn hình nhỏ trước
  - Nút bấm to, dễ chạm
  - Upload ảnh trực tiếp từ camera
  - Không cần gõ nhiều (dùng dropdown, checkbox)
- **Ví dụ:** Tinder, Instagram - mọi thứ làm được bằng 1 tay

**2. Desktop-optimized cho Đối tác:**
- **Tại sao?** Nhà tuyển dụng cần màn hình lớn để so sánh nhiều profiles
- **Nghĩa là gì?**
  - Hiển thị nhiều profiles cùng lúc (grid view)
  - Bộ lọc phức tạp ở sidebar
  - Bảng so sánh chi tiết
  - Keyboard shortcuts cho power users
- **Ví dụ:** LinkedIn Recruiter, Upwork - nhiều thông tin trên 1 màn hình

**3. Simplicity over Features:**
- **Tại sao?** Ưu tiên trải nghiệm đơn giản, dễ dùng hơn là nhiều tính năng phức tạp
- **Nghĩa là gì?**
  - 1 tính năng làm tốt > 10 tính năng làm tạm
  - Mỗi màn hình chỉ 1 mục đích chính
  - Ẩn các tính năng nâng cao (progressive disclosure)
- **Ví dụ:** Google Search - 1 ô search, đơn giản nhưng mạnh mẽ

**4. Trust & Safety First:**
- **Tại sao?** Xác thực danh tính và bảo vệ thông tin cá nhân là ưu tiên hàng đầu
- **Nghĩa là gì?**
  - KYC (Know Your Customer) bắt buộc
  - Xác minh số điện thoại, CMND/CCCD
  - Không hiển thị số điện thoại công khai
  - Escrow bảo vệ tiền
- **Ví dụ:** Airbnb - verify ID, review system, secure payment

**5. Data-driven Matching:**
- **Tại sao?** Sử dụng dữ liệu và thuật toán để tối ưu hóa việc kết nối
- **Nghĩa là gì?**
  - Không để user tự tìm (quá nhiều lựa chọn = overwhelm)
  - Hệ thống gợi ý dựa trên: lịch sử, preferences, behavior
  - A/B test để tối ưu ranking algorithm
- **Ví dụ:** Netflix recommendations, Spotify Discover Weekly

### **Kiến trúc Hệ thống (System Architecture)**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ KOL Mobile   │              │ Partner Web  │            │
│  │ App (iOS/    │              │ Dashboard    │            │
│  │ Android)     │              │ (Desktop)    │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  - Authentication & Authorization                            │
│  - Rate Limiting & Throttling                               │
│  - Request Validation                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Profile  │  │ Search & │  │ Booking  │  │ Payment  │  │
│  │ Service  │  │ Match    │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ User DB  │  │ Job DB   │  │ Trans DB │  │ File     │  │
│  │ (SQL)    │  │ (SQL)    │  │ (SQL)    │  │ Storage  │  │
│  └──────────┘  └──────────┘  └──────────┘  │ (S3/CDN) │  │
│                                              └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Giải thích từng tầng (Layer):**

**1. Frontend Layer (Tầng Giao diện):**
- **KOL Mobile App:** Ứng dụng di động cho KOL/Model
  - Tại sao mobile? Vì KOL thường trẻ, quen dùng điện thoại
  - Tính năng chính: Tạo profile, upload ảnh, nhận thông báo job
  - Công nghệ: React Native (1 code chạy cả iOS và Android)
  
- **Partner Web Dashboard:** Trang web cho Nhà tuyển dụng
  - Tại sao web? Vì cần màn hình lớn để xem nhiều profiles
  - Tính năng chính: Tìm kiếm, lọc, so sánh, đăng job
  - Công nghệ: React.js (nhanh, hiện đại)

**2. API Gateway Layer (Tầng Cổng API):**
- **Authentication & Authorization:** Kiểm tra đăng nhập và quyền truy cập
  - Ví dụ: User A không được xem số điện thoại của User B
  - Công nghệ: JWT tokens (mã hóa an toàn)
  
- **Rate Limiting:** Giới hạn số lượng request
  - Tại sao? Tránh spam, DDoS attack
  - Ví dụ: Mỗi IP chỉ được gọi API 100 lần/phút
  
- **Request Validation:** Kiểm tra dữ liệu đầu vào
  - Ví dụ: Email phải đúng format, số điện thoại phải 10 số
  - Tránh SQL injection, XSS attacks

**3. Business Logic Layer (Tầng Xử lý Nghiệp vụ):**
- **Profile Service:** Quản lý hồ sơ KOL
  - CRUD operations: Create, Read, Update, Delete
  - Xử lý upload ảnh, video
  - Tính profile completion score
  
- **Search & Match Service:** Tìm kiếm và gợi ý
  - Elasticsearch: Tìm kiếm full-text nhanh
  - Ranking algorithm: Sắp xếp kết quả theo độ phù hợp
  - AI matching: Gợi ý KOL phù hợp với job
  
- **Booking Service:** Quản lý đặt lịch
  - Kiểm tra lịch rảnh
  - Tạo booking, xác nhận, hủy
  - Gửi thông báo nhắc nhở
  
- **Payment Service:** Xử lý thanh toán
  - Tích hợp VNPay, Momo, Banking
  - Escrow wallet (ví ký quỹ)
  - Rút tiền về ngân hàng

**4. Data Layer (Tầng Dữ liệu):**
- **User DB (SQL):** Lưu thông tin user, profiles
  - PostgreSQL: Database mạnh, hỗ trợ JSON
  - Quan hệ phức tạp: User → Profile → Photos → Skills
  
- **Job DB (SQL):** Lưu thông tin jobs, bookings
  - Quan hệ: Job → Applications → Bookings
  
- **Transaction DB (SQL):** Lưu lịch sử giao dịch
  - Audit trail: Ai làm gì, khi nào
  - Compliance: Báo cáo thuế, pháp lý
  
- **File Storage (S3/CDN):** Lưu ảnh, video
  - AWS S3: Lưu trữ rẻ, không giới hạn
  - CloudFront CDN: Phân phối nhanh toàn cầu
  - Ví dụ: Ảnh ở TP.HCM load nhanh ở Hà Nội

**Tại sao chia thành nhiều tầng?**

1. **Separation of Concerns:** Mỗi tầng làm 1 việc riêng
   - Frontend chỉ lo giao diện
   - Backend chỉ lo logic
   - Database chỉ lo lưu trữ
   
2. **Scalability:** Dễ mở rộng
   - Traffic tăng? → Thêm server ở tầng Frontend
   - Database chậm? → Thêm cache, replica
   
3. **Maintainability:** Dễ bảo trì
   - Bug ở đâu? → Biết ngay tầng nào
   - Cần sửa gì? → Chỉ sửa 1 tầng, không ảnh hưởng tầng khác
   
4. **Security:** Bảo mật tốt hơn
   - Frontend không truy cập trực tiếp Database
   - Mọi request đều qua API Gateway (kiểm tra)

> **📌 Lưu ý:** Chi tiết kỹ thuật về Technology Stack, Database Schema, API Endpoints sẽ được tách sang tài liệu riêng tại `/docs/for-tech/plans/Core-Features-Technical-Specs.md`

---

Dưới đây là phân tích chi tiết cho từng cấu phần trong Luồng 1, được thiết kế tối ưu cho mô hình quản lý người đẹp/KOLs/PG/Model:

## **1\. Phía Người đẹp (Profiles) – Quản lý Hồ sơ năng lực**

**Target Users:** KOLs, Models, PG (Promotion Girls), MC, Dancers, Performers  
**Primary Device:** Mobile (iOS/Android)  
**Key Goal:** Tạo profile hấp dẫn và nhận được nhiều job offers

Đối với đối tượng này, giao diện phải **gọn gàng, ưu tiên hình ảnh/video trực quan** và thao tác nhanh trên điện thoại.

### **1.1. Quy trình Đăng ký & Onboarding**

#### **Step-by-Step User Journey:**

```
Bước 1: Landing Page
  ↓ [Tap "Đăng ký ngay"]
Bước 2: Chọn phương thức đăng ký
  - Số điện thoại (OTP)
  - Email
  - Google
  - Facebook
  ↓
Bước 3: Xác thực (OTP 6 số, hết hạn sau 5 phút)
  ↓
Bước 4: Thông tin cơ bản (30 giây)
  - Họ tên
  - Giới tính
  - Ngày sinh
  - Thành phố
  ↓
Bước 5: Chọn loại hình (Multi-select)
  - Model
  - KOL/Influencer
  - PG/Event Staff
  - MC/Host
  - Dancer/Performer
  ↓
Bước 6: Upload ảnh đại diện (Bắt buộc)
  - Hướng dẫn: "Ảnh chân dung rõ mặt, ánh sáng tốt"
  - AI check: Phát hiện mặt người, chất lượng ảnh
  ↓
Bước 7: Hoàn thành! 🎉
  - Hiển thị % hoàn thiện profile: 30%
  - Gợi ý: "Thêm 5 ảnh nữa để tăng lên 60%"
```

**Conversion Optimization:**
- Cho phép skip các bước không bắt buộc
- Progress bar hiển thị tiến độ
- Ước tính thời gian: "Còn 2 phút nữa"
- Social proof: "1.234 người đã đăng ký hôm nay"

#### **Onboarding Metrics:**

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| Registration completion rate | >70% | 50-60% |
| Time to complete | <3 minutes | 5-7 minutes |
| Profile completion (first session) | >50% | 30-40% |
| Day 1 retention | >60% | 40-50% |
| Day 7 retention | >40% | 25-35% |

### **1.2. Các tính năng cốt lõi (MVP)**

#### **A. Đăng ký/Đăng nhập nhanh**

**Phương thức hỗ trợ:**

| Phương thức | Ưu điểm | Nhược điểm | Tỷ lệ sử dụng dự kiến |
|-------------|---------|------------|----------------------|
| **Số điện thoại + OTP** | Nhanh, phổ biến tại VN | Cần nhập OTP | 45% |
| **Google** | 1-click, không cần nhập gì | Cần tài khoản Google | 30% |
| **Facebook** | 1-click, sync ảnh đại diện | Lo ngại privacy | 20% |
| **Email + Password** | Truyền thống, quen thuộc | Chậm, dễ quên password | 5% |

**Technical Implementation:**
- OTP: Sử dụng Twilio/AWS SNS (chi phí: 200đ/SMS)
- Social Login: OAuth 2.0 với Google/Facebook SDK
- Session management: JWT tokens (expire sau 30 ngày)
- Security: Rate limiting (5 attempts/15 minutes)

#### **B. Quản lý Portfolio (Bộ ảnh)**

**Yêu cầu Kỹ thuật:**

| Tiêu chí | Quy định | Lý do |
|----------|----------|-------|
| **Số lượng ảnh** | Tối thiểu: 3 ảnh<br>Tối đa: 30 ảnh | Đủ để đánh giá, không quá tải |
| **Định dạng** | JPG, PNG, HEIC | Phổ biến nhất |
| **Kích thước file** | Tối đa 10MB/ảnh | Cân bằng chất lượng & tốc độ |
| **Resolution** | Tối thiểu: 800x800px<br>Khuyến nghị: 1200x1600px | Đủ rõ cho xem trên desktop |
| **Tỷ lệ khung hình** | Portrait (3:4) hoặc Square (1:1) | Phù hợp với mobile display |

**Tính năng Xử lý Ảnh:**

1. **Auto-compression:**
   - Original: Lưu trên S3 (backup)
   - Display: Resize + compress (WebP format, 80% quality)
   - Thumbnail: 300x400px (cho danh sách)
   - Tiết kiệm: 70-80% bandwidth

2. **AI-powered Features:**
   - **Face Detection:** Đảm bảo có mặt người trong ảnh
   - **Quality Check:** Phát hiện ảnh mờ, tối, bị che
   - **NSFW Filter:** Tự động reject ảnh không phù hợp
   - **Auto-tagging:** Gắn tag tự động (outdoor, studio, fashion, etc.)

3. **Phân loại Ảnh:**
   - **Polaroid (Ảnh chân dung):** Ảnh cận mặt, rõ nét
   - **Portfolio (Ảnh nghệ thuật):** Ảnh chụp chuyên nghiệp
   - **Work Samples (Ảnh dự án):** Ảnh từ các job đã làm
   - **Behind the Scenes:** Ảnh hậu trường, candid

**User Experience:**
```
Upload Flow:
1. Tap "Thêm ảnh"
2. Chọn từ thư viện hoặc chụp mới
3. Crop & adjust (built-in editor)
4. Chọn category
5. Upload (progress bar)
6. AI processing (2-3 giây)
7. Hiển thị kết quả + suggestions
```

#### **C. Thông tin Chỉ số Cơ bản**

**Profile Data Structure:**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| **Họ tên** | String | ✅ | 2-50 ký tự | Nguyễn Thị Lan |
| **Giới tính** | Enum | ✅ | Nam/Nữ/Khác | Nữ |
| **Ngày sinh** | Date | ✅ | 16-45 tuổi | 15/03/1998 |
| **Chiều cao** | Integer | ✅ | 150-200 cm | 168 cm |
| **Cân nặng** | Integer | ⚪ | 40-100 kg | 52 kg |
| **Số đo 3 vòng** | String | ⚪ | Format: XX-XX-XX | 86-62-90 |
| **Màu da** | Enum | ⚪ | Sáng/Trung bình/Ngăm | Sáng |
| **Màu tóc** | Enum | ⚪ | Đen/Nâu/Vàng/Đỏ/Khác | Đen |
| **Hình xăm** | Boolean + Text | ⚪ | Có/Không + Mô tả | Không |
| **Kỹ năng đặc biệt** | Multi-select | ⚪ | Max 10 items | Catwalk, MC, Dance |
| **Ngôn ngữ** | Multi-select | ⚪ | - | Tiếng Việt, English |
| **Kinh nghiệm** | Integer | ⚪ | 0-20 năm | 3 năm |

**Profile Completion Score:**

```
Calculation:
- Basic info (30%): Name, gender, DOB, city, height
- Photos (30%): Minimum 5 photos
- Detailed info (20%): Weight, measurements, skills
- Social links (10%): Instagram, TikTok, Facebook
- Work history (10%): At least 1 completed job

Total: 100%
```

**Impact of Completion Rate:**

| Completion % | Visibility Boost | Avg. Job Offers/Month |
|--------------|------------------|----------------------|
| 0-30% | 0% | 0-1 |
| 31-50% | +20% | 2-3 |
| 51-70% | +50% | 4-6 |
| 71-90% | +100% | 8-12 |
| 91-100% | +200% | 15-25 |

#### **D. Định vị & Khu vực Làm việc**

**Location Management:**

1. **Primary Location (Bắt buộc):**
   - Thành phố hiện tại
   - Quận/Huyện
   - Auto-detect via GPS (với permission)

2. **Work Radius (Bán kính làm việc):**
   - Trong thành phố (0-20km)
   - Toàn tỉnh/thành (20-50km)
   - Liên tỉnh (50-200km)
   - Toàn quốc (200km+)

3. **Preferred Cities (Thành phố ưu tiên):**
   - Multi-select
   - Ví dụ: "Sống tại TP.HCM, sẵn sàng đi Hà Nội, Đà Nẵng"

**Pricing by Distance:**

| Distance | Travel Fee | Accommodation | Typical Rate Increase |
|----------|-----------|---------------|----------------------|
| 0-10km | Không | Không cần | 0% |
| 10-30km | 200-500k | Không cần | +10-20% |
| 30-100km | 500k-1tr | Có thể cần | +30-50% |
| 100km+ | 1-2tr | Bắt buộc | +50-100% |

### **1.3. Tính năng nâng cao (Tạo lợi thế cạnh tranh)**

#### **A. Tích hợp API Mạng xã hội**

**Supported Platforms:**

| Platform | Data Synced | Update Frequency | API Cost |
|----------|-------------|------------------|----------|
| **Instagram** | Followers, Posts, Engagement Rate | Weekly | Free (Graph API) |
| **TikTok** | Followers, Videos, Views, Likes | Weekly | Free (Creator API) |
| **Facebook** | Page Likes, Followers | Weekly | Free (Graph API) |
| **YouTube** | Subscribers, Views | Monthly | Free (Data API) |

**Technical Implementation:**

```javascript
// Example: Instagram Integration
1. User clicks "Connect Instagram"
2. OAuth flow → Instagram login
3. Request permissions: basic_profile, follower_count
4. Store access_token (encrypted)
5. Cron job runs weekly:
   - Fetch follower_count
   - Calculate engagement_rate
   - Update profile
   - Log history for trend analysis
```

**Verification Badge:**

| Follower Count | Badge | Visibility Boost |
|----------------|-------|------------------|
| 1K - 10K | 🥉 Micro | +10% |
| 10K - 50K | 🥈 Rising | +25% |
| 50K - 100K | 🥇 Influencer | +50% |
| 100K - 500K | 💎 Star | +100% |
| 500K+ | 👑 Celebrity | +200% |

**Anti-fraud Measures:**
- Detect fake followers (engagement rate < 1%)
- Cross-check with multiple platforms
- Manual review for suspicious accounts
- Penalty: Remove badge + lower ranking

#### **B. Video Short/Reels**

**Video Specifications:**

| Attribute | Requirement | Reason |
|-----------|-------------|--------|
| **Duration** | 15-60 seconds | Attention span optimization |
| **Format** | MP4, MOV | Universal compatibility |
| **Max file size** | 50MB | Balance quality & upload speed |
| **Resolution** | Min 720p, Recommended 1080p | Clear on all devices |
| **Aspect ratio** | 9:16 (vertical) or 1:1 (square) | Mobile-optimized |

**Video Types:**

1. **Introduction Video (Giới thiệu bản thân):**
   - Script template: "Xin chào, mình là [Tên], [Tuổi], đến từ [Thành phố]..."
   - Duration: 30-45 seconds
   - Impact: +150% profile views

2. **Skill Showcase:**
   - Catwalk demo
   - MC hosting sample
   - Dance performance
   - Product presentation

3. **Behind the Scenes:**
   - Makeup process
   - Photoshoot BTS
   - Event preparation

**Video Processing Pipeline:**

```
Upload → Transcode (H.264) → Generate thumbnail → 
Extract audio → NSFW check → Store on CDN → 
Update profile → Notify user
```

**ROI of Video:**

| Profile Type | With Video | Without Video | Difference |
|--------------|-----------|---------------|------------|
| Profile views | 250/month | 80/month | +212% |
| Job applications | 15/month | 5/month | +200% |
| Booking rate | 8% | 3% | +167% |

#### **C. Lịch rảnh (Calendar Integration)**

**Calendar Features:**

1. **Availability Marking:**
   - Rảnh (Available)
   - Bận (Busy)
   - Có thể thương lượng (Maybe)
   - Block dates in advance

2. **Sync with External Calendars:**
   - Google Calendar (2-way sync)
   - Apple Calendar (import only)
   - Outlook Calendar (import only)

3. **Smart Scheduling:**
   - Auto-block dates when job confirmed
   - Buffer time between jobs (travel time)
   - Recurring unavailability (every Monday, etc.)

4. **Booking Requests:**
   - Partners can request specific dates
   - KOL receives notification
   - Accept/Decline/Propose alternative

**Calendar View:**

```
Month View:
┌─────────────────────────────────────┐
│  May 2026                           │
├─────┬─────┬─────┬─────┬─────┬─────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │
├─────┼─────┼─────┼─────┼─────┼─────┤
│  1  │  2  │  3🟢│  4🟢│  5🔴│  6🔴│
│  8🟢│  9🟢│ 10🟡│ 11🟢│ 12🟢│ 13🔴│
│ 15🟢│ 16🟢│ 17🟢│ 18🔴│ 19🔴│ 20🟢│
└─────┴─────┴─────┴─────┴─────┴─────┘

🟢 Available  🔴 Busy  🟡 Maybe
```

**Impact on Booking Rate:**

- With calendar: 12% booking rate
- Without calendar: 6% booking rate
- **Improvement: +100%**

Reason: Partners prefer KOLs who clearly show availability

## **2\. Phía Đối tác (Nhà tuyển dụng) – Tìm kiếm & Tuyển dụng**

**Target Users:** Brand Managers, Event Organizers, Marketing Agencies, HR Departments  
**Primary Device:** Desktop/Laptop (70%), Tablet (20%), Mobile (10%)  
**Key Goal:** Tìm đúng người, đúng thời điểm, với chi phí tối ưu

Đối tác cần một giao diện **trên Máy tính (PC/Laptop) trực quan, có bộ lọc mạnh mẽ** để tìm đúng người trong thời gian ngắn nhất. Hệ thống nên kết hợp cả 2 hình thức để tối ưu hiệu quả:

### **2.1. Hình thức A: Chủ động tìm kiếm (Săn đầu người \- Headhunting)**

Phù hợp với: Dự án cụ thể, yêu cầu đặc biệt, timeline gấp

#### **A. Bộ lọc nâng cao (Advanced Filters)**

**Filter Categories & Options:**

| Category | Filters | Use Case |
|----------|---------|----------|
| **Demographics** | Giới tính, Độ tuổi (range slider), Thành phố, Quận/Huyện | "Cần nữ 20-25 tuổi ở Q1 TP.HCM" |
| **Physical Attributes** | Chiều cao (range), Cân nặng (range), Số đo 3 vòng, Màu da, Màu tóc | "Model cao trên 1m70" |
| **Professional** | Loại hình (Model/KOL/PG/MC), Số năm kinh nghiệm, Kỹ năng đặc biệt | "MC có kinh nghiệm 3+ năm" |
| **Social Media** | Platform (IG/TikTok/FB), Follower count (range), Engagement rate | "Influencer có 50K+ followers" |
| **Availability** | Ngày rảnh, Khu vực làm việc, Sẵn sàng đi xa | "Rảnh ngày 15-17/6" |
| **Budget** | Phí booking (range), Đơn vị (giờ/ngày/dự án) | "Budget 2-3 triệu/ngày" |
| **Quality** | Verified badge, Rating (stars), Số job hoàn thành | "Chỉ xem profile verified" |

**Search Algorithm:**

```
Ranking Score = 
  (Relevance × 40%) +           // Khớp với filter
  (Quality × 25%) +              // Rating, completion rate
  (Popularity × 15%) +           // Profile views, saves
  (Recency × 10%) +              // Last active, profile updated
  (Boost × 10%)                  // Paid boost by KOL

Relevance Calculation:
- Exact match: 100 points
- Partial match: 50-80 points
- Location match: +20 points
- Availability match: +30 points
- Budget match: +25 points
```

**Search Results Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Filters (Left Sidebar)    │  Results (Main Area)            │
│                            │                                 │
│ ☑ Giới tính: Nữ           │  ┌──────────────────────────┐  │
│ ☐ Độ tuổi: 20-25          │  │ [Photo] Nguyễn Thị Lan   │  │
│ ☑ Thành phố: TP.HCM       │  │ ⭐ 4.8 | 168cm | 25 tuổi │  │
│ ☐ Chiều cao: 165-175      │  │ 💎 50K followers         │  │
│ ☑ Verified: Yes           │  │ 📍 TP.HCM | 🟢 Rảnh     │  │
│ ☐ Follower: 10K+          │  │ [View] [Save] [Contact]  │  │
│                            │  └──────────────────────────┘  │
│ [Reset] [Apply Filters]   │  [Next 20 results →]            │
└─────────────────────────────────────────────────────────────┘
```

**Search Performance Metrics:**

| Metric | Target | Current Industry |
|--------|--------|-----------------|
| Time to find suitable candidate | <5 minutes | 15-30 minutes |
| Search-to-contact rate | >15% | 8-12% |
| Filter usage rate | >80% | 60-70% |
| Saved searches per user | 3-5 | 1-2 |

#### **B. Danh sách yêu thích (Wishlist)**

**Features:**

1. **Save Profiles:**
   - One-click save from search results
   - Organize into folders (by project, by type)
   - Add private notes to each profile
   - Share wishlist with team members

2. **Comparison Tool:**
   - Side-by-side comparison (up to 4 profiles)
   - Compare: Photos, stats, pricing, availability, ratings
   - Export comparison as PDF

3. **Smart Recommendations:**
   - "People who saved this also saved..."
   - "Similar profiles you might like"
   - Alert when saved profiles update info

**Wishlist Management:**

```
My Wishlists:
├── Summer Campaign 2026 (15 profiles)
├── Product Launch Event (8 profiles)
├── TikTok Collaboration (12 profiles)
└── Backup Options (20 profiles)

Actions:
- Create new list
- Merge lists
- Share with team
- Export to Excel
```

**Usage Statistics:**

- 65% of bookings come from wishlisted profiles
- Average wishlist size: 12 profiles
- Conversion rate: Wishlisted profiles → Booked: 25%
- Non-wishlisted: 3%

### **2.2. Hình thức B: Đăng chiến dịch (Job/Campaign Posting)**

Phù hợp với: Tuyển dụng số lượng lớn, campaign dài hạn, open casting

#### **A. Tạo bài đăng tuyển dụng**

**Job Posting Form:**

| Field | Type | Required | Example |
|-------|------|----------|---------|
| **Tiêu đề Job** | Text | ✅ | "Tuyển 10 PG cho sự kiện ra mắt iPhone 16" |
| **Loại hình** | Multi-select | ✅ | Model, PG, MC |
| **Số lượng cần tuyển** | Number | ✅ | 10 người |
| **Mô tả công việc** | Rich text | ✅ | Chi tiết nhiệm vụ, yêu cầu |
| **Yêu cầu** | Structured | ✅ | Giới tính, độ tuổi, chiều cao, kỹ năng |
| **Thời gian** | Date + Time | ✅ | 15/06/2026, 9:00 - 18:00 |
| **Địa điểm** | Address + Map | ✅ | SECC, Q7, TP.HCM |
| **Mức thù lao** | Number + Unit | ⚪ | 1.500.000đ/người/ngày |
| **Phúc lợi** | Text | ⚪ | Ăn trưa, đi lại, trang phục |
| **Deadline ứng tuyển** | Date | ✅ | 10/06/2026 |
| **Hình ảnh/Video** | Upload | ⚪ | Ảnh sản phẩm, venue |

**Job Posting Templates:**

Pre-built templates for common scenarios:
1. **Event PG/Hostess** (Most popular - 40% usage)
2. **Product Launch MC**
3. **TikTok/Instagram Content Creator**
4. **Fashion Show Model**
5. **Trade Show Booth Staff**

**Job Visibility Options:**

| Option | Description | Cost | Reach |
|--------|-------------|------|-------|
| **Standard** | Visible in job board | Free (for paid members) | ~100 views |
| **Featured** | Top of job board for 7 days | +200k | ~500 views |
| **Urgent** | Red "Urgent" badge | +100k | +50% applications |
| **Promoted** | Push notification to matched KOLs | +300k | ~1000 views |

#### **B. Quản lý danh sách ứng viên (Applicant Tracking System)**

**ATS Workflow:**

```
Application Stages:

New Applications (Chờ duyệt)
    ↓ [Review]
Shortlisted (Đã duyệt)
    ↓ [Schedule Interview]
Interview Scheduled (Phỏng vấn)
    ↓ [Accept/Reject]
Accepted (Đã chọn) ←→ Rejected (Từ chối)
    ↓ [Confirm]
Confirmed (Đã xác nhận)
    ↓ [After Event]
Completed (Hoàn thành)
```

**Kanban Board View:**

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ New (25) │Short(12) │Interview │Accepted  │Confirmed │
│          │          │   (8)    │   (10)   │   (10)   │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ [Card 1] │ [Card 1] │ [Card 1] │ [Card 1] │ [Card 1] │
│ [Card 2] │ [Card 2] │ [Card 2] │ [Card 2] │ [Card 2] │
│ [Card 3] │ [Card 3] │ [Card 3] │ [Card 3] │ [Card 3] │
│   ...    │   ...    │   ...    │   ...    │   ...    │
└──────────┴──────────┴──────────┴──────────┴──────────┘

Drag & drop to move between stages
```

**Bulk Actions:**

- Select multiple applicants
- Move to stage (bulk)
- Send message (bulk)
- Accept/Reject (bulk)
- Export to Excel

**Communication Tools:**

1. **In-app Messaging:**
   - Send message to individual applicant
   - Broadcast to all applicants in a stage
   - Message templates (interview invitation, rejection, etc.)

2. **Email Notifications:**
   - Auto-send when application status changes
   - Customizable email templates
   - Track open rate & click rate

3. **SMS Notifications:**
   - For urgent updates
   - Interview reminders
   - Day-before event reminder

**ATS Metrics:**

| Metric | Formula | Target |
|--------|---------|--------|
| **Time to fill** | Days from posting to confirmed | <7 days |
| **Application rate** | Applications / Job views | >10% |
| **Shortlist rate** | Shortlisted / Applications | 30-50% |
| **Acceptance rate** | Accepted / Offered | >80% |
| **Show-up rate** | Showed up / Confirmed | >95% |

### **2.3. Advanced Partner Features**

#### **A. Smart Matching Algorithm**

Automatically suggest best-fit KOLs for each job posting.

**Matching Factors:**

| Factor | Weight | Description |
|--------|--------|-------------|
| **Requirements match** | 40% | How well KOL meets job requirements |
| **Availability** | 25% | KOL available on required dates |
| **Location** | 15% | Distance from job location |
| **Past performance** | 10% | Rating from previous jobs |
| **Response rate** | 10% | How quickly KOL responds |

**Matching Score Display:**

```
Top Matches for "iPhone 16 Launch Event":

1. ⭐ 98% Match - Nguyễn Thị Lan
   ✅ Female, 24, 168cm - Perfect fit
   ✅ Available June 15-17
   ✅ Located in TP.HCM (5km away)
   ✅ 4.9★ rating, 15 completed events
   [Invite to Apply]

2. ⭐ 95% Match - Trần Minh Anh
   ✅ Female, 26, 170cm - Perfect fit
   ✅ Available June 15-17
   ⚠️ Located in Hà Nội (requires travel)
   ✅ 4.8★ rating, 22 completed events
   [Invite to Apply]
```

#### **B. Team Collaboration**

For agencies and companies with multiple hiring managers.

**Features:**

1. **Multi-user Access:**
   - Add team members with different roles
   - Roles: Admin, Hiring Manager, Viewer
   - Permission control per role

2. **Collaborative Review:**
   - Leave comments on applicant profiles
   - @mention team members
   - Vote/rate applicants
   - Shared decision-making

3. **Activity Log:**
   - Who viewed which profile
   - Who moved applicant to which stage
   - Who sent messages
   - Audit trail for compliance

#### **C. Analytics Dashboard**

**Key Metrics Displayed:**

1. **Job Performance:**
   - Views, applications, conversion rate
   - Time to fill
   - Cost per hire

2. **Sourcing Channels:**
   - Where applicants came from
   - Which channels perform best
   - ROI by channel

3. **Hiring Trends:**
   - Peak application times
   - Popular job types
   - Seasonal patterns

4. **Budget Tracking:**
   - Spent vs. budget
   - Cost per job
   - Forecast for next month

**Sample Dashboard:**

```
┌─────────────────────────────────────────────────────┐
│ This Month Overview                                 │
├─────────────────────────────────────────────────────┤
│ 📊 Jobs Posted: 12        👥 Applications: 245     │
│ ✅ Positions Filled: 45   💰 Total Spent: 15.5M    │
│ ⏱️ Avg Time to Fill: 5.2 days                      │
├─────────────────────────────────────────────────────┤
│ Top Performing Jobs:                                │
│ 1. Summer Campaign PG (35 applications)            │
│ 2. Product Launch MC (28 applications)             │
│ 3. TikTok Content Creator (22 applications)        │
└─────────────────────────────────────────────────────┘
```

## **3\. Quy trình kết nối (Matching & Workflow)**

Đây là "trái tim" của hệ thống, quyết định cách bạn kiểm soát dòng tiền và dữ liệu. Có 2 phương án vận hành chính, mỗi phương án phù hợp với giai đoạn phát triển và mục tiêu kinh doanh khác nhau.

### **3.1. So sánh Tổng quan 2 Phương án**

| Tiêu chí | Phương án 1: Kết nối Mở | Phương án 2: Quản lý Khép kín |
|----------|-------------------------|-------------------------------|
| **Độ phức tạp** | ⭐⭐ Đơn giản | ⭐⭐⭐⭐⭐ Phức tạp |
| **Chi phí phát triển** | 150-200 triệu | 500-700 triệu |
| **Thời gian triển khai** | 3 tháng | 9-12 tháng |
| **Nguồn thu chính** | Subscription + Pay-per-lead | Commission (5-15%) |
| **Doanh thu tiềm năng (Năm 1)** | 500-800 triệu | 200-400 triệu |
| **Doanh thu tiềm năng (Năm 2)** | 2-3 tỷ | 8-15 tỷ |
| **Margin** | 80-90% | 60-70% |
| **Rủi ro bypass** | ⚠️ Cao | ✅ Thấp |
| **Kiểm soát chất lượng** | ⚠️ Thấp | ✅ Cao |
| **Chi phí vận hành** | Thấp (2-3 người) | Cao (10-15 người) |
| **Scalability** | ⭐⭐⭐⭐⭐ Rất cao | ⭐⭐⭐ Trung bình |
| **Phù hợp cho** | Startup, MVP, Giai đoạn đầu | Scale-up, Đã có user base |

### **3.2. Phương án 1: Kết nối mở (Open Marketplace)**

**Mô hình:** Platform kết nối, không can thiệp vào giao dịch

#### **A. Cách hoạt động**

**Workflow chi tiết:**

```
Step 1: Partner tìm kiếm KOL
  ↓
Step 2: Partner xem profile (Basic info - Free)
  ↓
Step 3: Partner muốn liên hệ
  ↓
Step 4: Hệ thống yêu cầu:
  - Nạp xu (nếu dùng Pay-per-lead)
  - Hoặc nâng cấp gói (nếu dùng Subscription)
  ↓
Step 5: Partner thanh toán
  ↓
Step 6: Hệ thống unlock contact info:
  - Số điện thoại
  - Zalo
  - Facebook/Instagram
  - Email
  ↓
Step 7: Partner liên hệ trực tiếp với KOL
  ↓
Step 8: Hai bên tự thỏa thuận:
  - Giá cả
  - Thời gian
  - Điều khoản
  ↓
Step 9: Giao dịch diễn ra ngoài platform
  ↓
Step 10: (Optional) Đánh giá sau khi hoàn thành
```

#### **B. Ưu điểm**

| Ưu điểm | Chi tiết | Impact |
|---------|----------|--------|
| **Phát triển nhanh** | Không cần escrow, chat, payment processing phức tạp | Time-to-market: 3 tháng |
| **Chi phí thấp** | Ít tính năng = ít bug = ít maintenance | Dev cost: 150-200M |
| **Dễ scale** | Không giới hạn số lượng giao dịch | Unlimited transactions |
| **User experience đơn giản** | Ít bước, ít ma sát | Higher conversion |
| **Doanh thu ngay** | Thu phí từ tháng 1 | Positive cash flow |
| **Linh hoạt** | User tự thỏa thuận, không bị ràng buộc | Higher satisfaction |

#### **C. Nhược điểm & Giải pháp**

| Nhược điểm | Tác động | Giải pháp |
|------------|----------|-----------|
| **Bypass risk** | User liên hệ 1 lần rồi không dùng platform nữa | - Gamification (tích điểm, ranking)<br>- Exclusive features<br>- Community building |
| **Không kiểm soát chất lượng** | Có thể xảy ra tranh chấp, bùng show | - Rating & review system<br>- Blacklist mechanism<br>- Verified badge |
| **Mất commission** | Không thu được % trên giá trị job | - Compensate bằng subscription fee cao hơn<br>- Upsell premium services |
| **Khó can thiệp tranh chấp** | Không có bằng chứng giao dịch | - Encourage in-app messaging<br>- Provide contract templates |

#### **D. Chiến lược Tối ưu hóa**

**1. Giảm Bypass Rate:**

| Tactic | Description | Expected Impact |
|--------|-------------|-----------------|
| **Loyalty Program** | Tích điểm mỗi lần unlock, đổi quà | -15% bypass |
| **Exclusive Jobs** | Jobs chỉ hiển thị cho paid members | -20% bypass |
| **Premium Features** | Calendar sync, analytics, priority support | -25% bypass |
| **Community Events** | Networking events, workshops | -10% bypass |

**2. Tăng Repeat Usage:**

- Email marketing: Job recommendations
- Push notifications: New matching profiles
- Seasonal campaigns: "Summer hiring season"
- Referral program: Giới thiệu bạn bè

**3. Upsell Strategy:**

```
Free User → Pay-per-lead → Silver → Gold → Diamond

Conversion tactics:
- Free: Limit to 1 unlock/month
- Pay-per-lead: Show savings with subscription
- Silver: Highlight Gold benefits
- Gold: Offer Diamond trial
```

### **3.3. Phương án 2: Quản lý khép kín (Managed Marketplace)**

**Mô hình:** Platform làm trung gian, kiểm soát toàn bộ giao dịch

#### **A. Cách hoạt động**

**Workflow chi tiết:**

```
Step 1: Partner đăng job hoặc chọn KOL
  ↓
Step 2: KOL ứng tuyển hoặc nhận invitation
  ↓
Step 3: Hai bên chat trong platform
  - Không được gửi số điện thoại
  - Không được gửi link ngoài
  - AI filter từ khóa nhạy cảm
  ↓
Step 4: Thỏa thuận giá & điều khoản
  ↓
Step 5: Partner ký quỹ 100% vào Escrow Wallet
  - Thanh toán qua VNPay/Momo/Banking
  - Tiền bị lock, không rút được
  ↓
Step 6: KOL nhận thông báo "Job confirmed"
  ↓
Step 7: KOL thực hiện công việc
  - Check-in tại địa điểm (GPS)
  - Upload ảnh/video proof of work
  ↓
Step 8: Partner xác nhận hoàn thành
  - Hoặc tự động sau 48h nếu không khiếu nại
  ↓
Step 9: Hệ thống giải ngân:
  - Trừ 10% commission
  - Chuyển 90% cho KOL
  - KOL rút về bank account
  ↓
Step 10: Đánh giá lẫn nhau (Bắt buộc)
```

#### **B. Ưu điểm**

| Ưu điểm | Chi tiết | Impact |
|---------|----------|--------|
| **Doanh thu cao** | Thu 10% trên mọi giao dịch | Potential: 10-15 tỷ/năm |
| **Kiểm soát chất lượng** | Có bằng chứng, dễ xử lý tranh chấp | Quality score: 9/10 |
| **Tránh bypass** | User phải dùng platform để nhận tiền | Bypass rate: <5% |
| **Trust & Safety** | Escrow bảo vệ cả hai bên | User confidence: High |
| **Data insights** | Biết chính xác giá, demand, supply | Better decision making |
| **Network effect** | Càng nhiều user càng có giá trị | Moat: Strong |

#### **C. Nhược điểm & Giải pháp**

| Nhược điểm | Tác động | Giải pháp |
|------------|----------|-----------|
| **Phức tạp** | Nhiều tính năng = nhiều bug | - Agile development<br>- Extensive testing<br>- Phased rollout |
| **Chi phí cao** | Dev + maintenance + support | - Raise funding<br>- Start with MVP<br>- Outsource non-core |
| **Chậm** | 9-12 tháng mới launch | - Build Phương án 1 trước<br>- Migrate sau khi có user base |
| **Friction** | Nhiều bước, user có thể bỏ cuộc | - Optimize UX<br>- Clear communication<br>- Incentives |
| **Payment risk** | Phải xử lý tiền, compliance | - Partner với payment gateway<br>- Legal consultation<br>- Insurance |

#### **D. Tính năng Cần thiết**

**1. In-app Messaging System:**

| Feature | Description | Priority |
|---------|-------------|----------|
| **Real-time chat** | WebSocket, instant delivery | ⭐⭐⭐⭐⭐ |
| **File sharing** | Images, PDFs (max 10MB) | ⭐⭐⭐⭐ |
| **Message templates** | Quick replies, common questions | ⭐⭐⭐ |
| **Keyword filter** | Block phone, email, links | ⭐⭐⭐⭐⭐ |
| **Translation** | Auto-translate (if needed) | ⭐⭐ |
| **Read receipts** | Know when message is read | ⭐⭐⭐ |
| **Push notifications** | Alert on new messages | ⭐⭐⭐⭐⭐ |

**2. Escrow Wallet System:**

```
Architecture:

User Wallet (Main)
  ├── Available Balance (Có thể rút)
  ├── Pending Balance (Đang xử lý)
  └── Escrow Balance (Bị lock)

Escrow Wallet (Separate)
  ├── Job #123: 5,000,000đ (locked)
  ├── Job #124: 3,000,000đ (locked)
  └── Job #125: 2,000,000đ (locked)

Transactions:
- Deposit: Bank → User Wallet
- Lock: User Wallet → Escrow Wallet
- Release: Escrow → KOL Wallet (90%) + Platform (10%)
- Refund: Escrow → Partner Wallet (if dispute)
- Withdraw: User Wallet → Bank
```

**3. Dispute Resolution System:**

| Stage | Timeline | Actions | Responsible |
|-------|----------|---------|-------------|
| **Open Dispute** | Day 0 | User submits complaint + evidence | User |
| **Review** | Day 1-2 | Admin reviews both sides | Admin |
| **Investigation** | Day 3-5 | Gather more info if needed | Admin |
| **Decision** | Day 6-7 | Make final decision | Admin |
| **Resolution** | Day 7 | Execute decision (refund/release) | System |
| **Appeal** | Day 8-14 | User can appeal (optional) | User |

**Dispute Outcomes:**

| Outcome | Condition | Action |
|---------|-----------|--------|
| **Full refund to Partner** | KOL no-show, serious violation | 100% back to Partner |
| **Partial refund** | Both parties at fault | 50-50 split |
| **Full payment to KOL** | Partner unreasonable complaint | 90% to KOL, 10% platform |
| **Penalty** | Repeated violations | Ban user + forfeit deposit |

### **3.4. 💡 Lời khuyên từ chuyên gia (Lộ trình Tối ưu)**

**Giai đoạn 1 (Tháng 1-12): Phương án 1 - Kết nối Mở**

**Lý do:**
- ✅ Nhanh: 3 tháng có thể launch
- ✅ Rẻ: 150-200 triệu
- ✅ Đơn giản: Ít bug, dễ maintain
- ✅ Validate: Test market fit trước khi đầu tư lớn

**Mục tiêu:**
- 3.000 KOLs đăng ký
- 300 Partners đăng ký
- 150 Partners trả phí
- 1.2 tỷ doanh thu

**Chiến lược:**
- Người đẹp tạo Profile **Miễn phí** (để gom data)
- Đối tác xem Profile cơ bản miễn phí
- Muốn xem contact info → **Mua gói Subscription** hoặc **Pay-per-lead**
- Focus vào growth, không lo commission

---

**Giai đoạn 2 (Năm 2): Migrate sang Phương án 2 - Quản lý Khép kín**

**Lý do:**
- ✅ Đã có user base (3K KOLs, 300 Partners)
- ✅ Đã có trust & brand
- ✅ Đã hiểu pain points
- ✅ Có tiền để invest (từ doanh thu năm 1)

**Mục tiêu:**
- 10.000 KOLs
- 1.000 Partners
- 30% giao dịch qua Escrow
- 15 tỷ doanh thu (10 tỷ từ commission)

**Chiến lược:**
- Soft launch Escrow với incentives (miễn phí commission cho 100 giao dịch đầu)
- Giữ lại Phương án 1 cho users không muốn dùng Escrow
- Hybrid model: User tự chọn
- Gradually migrate users sang Phương án 2

---

**Hybrid Model (Best of Both Worlds):**

```
┌─────────────────────────────────────────────┐
│  User Choice                                │
├─────────────────────────────────────────────┤
│                                             │
│  Option A: Direct Contact (Phương án 1)    │
│  - Pay unlock fee                           │
│  - Get contact info                         │
│  - Deal outside platform                    │
│  - No commission                            │
│                                             │
│  Option B: Managed Booking (Phương án 2)   │
│  - Free to contact                          │
│  - Chat in-app                              │
│  - Escrow protection                        │
│  - 10% commission                           │
│                                             │
└─────────────────────────────────────────────┘
```

**Conversion Strategy:**

| User Segment | Recommended Option | Reason |
|--------------|-------------------|--------|
| **First-time users** | Option A | Lower barrier, build trust |
| **High-value jobs (>10M)** | Option B | Need protection |
| **Repeat users** | Option B | Already trust platform |
| **Small jobs (<2M)** | Option A | Commission too high |
| **Corporate clients** | Option B | Need compliance, audit trail |

---

## **4. Feature Prioritization Matrix (Ma trận Ưu tiên Tính năng)**

### **4.1. MoSCoW Method**

| Feature | Must Have | Should Have | Could Have | Won't Have (Now) |
|---------|-----------|-------------|------------|------------------|
| **User Management** | ✅ Registration, Login, Profile | Role-based permissions | Social login with LinkedIn | Biometric login |
| **Profile Management** | ✅ Basic info, Photos | Video, Social sync | AI photo enhancement | 3D avatar |
| **Search & Filter** | ✅ Basic filters | Advanced filters, Save searches | AI recommendations | Voice search |
| **Job Posting** | ✅ Create, Edit, Publish | Templates, Bulk actions | Auto-repost | AI job description |
| **Application Management** | ✅ View, Accept, Reject | Kanban board, Bulk actions | Interview scheduling | Video interviews |
| **Payment** | ✅ Nạp tiền, Trừ xu | Multiple payment methods | Crypto payment | Installment payment |
| **Communication** | Email notifications | In-app messaging | Video call | AI chatbot |
| **Analytics** | Basic dashboard | Advanced reports | Predictive analytics | AI insights |
| **Mobile App** | Responsive web | Native iOS/Android | Offline mode | AR features |

### **4.2. Impact vs Effort Matrix**

```
High Impact │ 
           │  [Social Sync]    [Video Upload]
           │  [Calendar]       [Smart Match]
           │
           │  [Advanced        [Escrow]
           │   Filters]        [In-app Chat]
           │
Low Impact │  [Templates]      [AI Features]
           │  [Bulk Actions]   [Crypto Payment]
           │
           └─────────────────────────────────
             Low Effort        High Effort
```

**Priority Order:**
1. **Quick Wins** (High Impact, Low Effort): Social sync, Calendar, Advanced filters
2. **Major Projects** (High Impact, High Effort): Video upload, Smart match, Escrow
3. **Fill-ins** (Low Impact, Low Effort): Templates, Bulk actions
4. **Time Sinks** (Low Impact, High Effort): AI features, Crypto - Avoid for now

---

## **5. Technical Specifications**

### **5.1. Technology Stack**

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend Web** | React.js + TypeScript | Component-based, type-safe, large ecosystem |
| **Frontend Mobile** | React Native | Code sharing with web, faster development |
| **Backend API** | Node.js + Express | JavaScript full-stack, async I/O, scalable |
| **Database** | PostgreSQL | ACID compliance, complex queries, JSON support |
| **Cache** | Redis | Fast, in-memory, pub/sub for real-time |
| **File Storage** | AWS S3 + CloudFront CDN | Scalable, cheap, global distribution |
| **Search Engine** | Elasticsearch | Full-text search, faceted search, fast |
| **Message Queue** | RabbitMQ | Async processing, job scheduling |
| **Payment** | VNPay, Momo, Stripe | Local + international support |
| **Authentication** | JWT + OAuth 2.0 | Stateless, secure, standard |
| **Monitoring** | Sentry + DataDog | Error tracking, performance monitoring |
| **CI/CD** | GitHub Actions | Automated testing, deployment |
| **Hosting** | AWS EC2 + RDS | Flexible, scalable, reliable |

### **5.2. Performance Requirements**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load Time** | <2 seconds | Google PageSpeed |
| **API Response Time** | <200ms (p95) | DataDog APM |
| **Search Response** | <500ms | Elasticsearch metrics |
| **Image Load Time** | <1 second | CloudFront logs |
| **Uptime** | 99.9% | StatusPage |
| **Concurrent Users** | 10,000+ | Load testing |

---

## **6. Cost Analysis & Budget**

### **6.1. Development Cost Breakdown**

| Phase | Component | Effort (Man-days) | Cost (VND) |
|-------|-----------|-------------------|------------|
| **Phase 1: MVP** | | | |
| | Backend API | 60 days | 90M |
| | Frontend Web | 45 days | 67.5M |
| | Mobile App (Basic) | 30 days | 45M |
| | Database Design | 10 days | 15M |
| | DevOps Setup | 15 days | 22.5M |
| | Testing & QA | 20 days | 30M |
| | **Subtotal** | **180 days** | **270M** |
| **Phase 2: Advanced** | | | |
| | Search & Filters | 20 days | 30M |
| | Payment Integration | 15 days | 22.5M |
| | Social Media Sync | 15 days | 22.5M |
| | Video Upload | 20 days | 30M |
| | Analytics Dashboard | 15 days | 22.5M |
| | **Subtotal** | **85 days** | **127.5M** |
| **TOTAL** | | **265 days** | **397.5M** |

### **6.2. Infrastructure Cost (Monthly)**

| Service | Specification | Cost (VND) |
|---------|---------------|------------|
| **AWS EC2** | 2× t3.large (8GB RAM) | 3M |
| **AWS RDS** | PostgreSQL db.t3.medium | 2.5M |
| **AWS S3** | 500GB storage + transfer | 1M |
| **CloudFront CDN** | 1TB transfer | 1.5M |
| **Redis Cache** | ElastiCache t3.small | 1M |
| **Monitoring** | Sentry + DataDog | 2M |
| **Email Service** | SendGrid (50K emails) | 1M |
| **SMS Service** | Twilio (5K SMS) | 1M |
| **TOTAL** | | **13M/month** |

---

## **7. Use Cases & User Scenarios**

### **7.1. Persona 1: Lan - Freelance Model**

**Background:**
- 24 tuổi, TP.HCM
- Làm model part-time
- Thu nhập hiện tại: 5-8 triệu/tháng
- Mục tiêu: Tăng lên 15-20 triệu/tháng

**User Journey:**

```
Day 1: Discovery & Registration
- Thấy quảng cáo trên Instagram
- Đăng ký bằng Instagram (30 giây)
- Upload 5 ảnh, sync 50K followers
- Profile completion: 60%

Day 3: First Contact
- Nhận tin nhắn từ Event Agency
- Job: PG cho sự kiện, 1.5M/ngày × 2 ngày
- Accept job

Day 7-8: Work & Payment
- Làm việc 2 ngày
- Nhận 3M vào tài khoản
- Đánh giá 5 sao

Day 10: Boost
- Mua "Weekly Boost" (149K)
- Profile lên Top 10
- Nhận 8 job offers trong tuần

Month 1: Success
- Thu nhập: 9M (tăng 80%)
- Đạt mục tiêu!
```

### **7.2. Persona 2: Minh - Event Organizer**

**Background:**
- 32 tuổi, Event Manager
- Tổ chức 10-15 events/tháng
- Budget: 50-100M/tháng cho nhân sự

**User Journey:**

```
Week 1: Discovery & Trial
- Google search: "thuê PG TP.HCM"
- Đăng ký Free plan
- Search: 45 profiles phù hợp
- Muốn unlock → Bị block

Week 1: Conversion
- Tính toán ROI
- Mua gói Gold: 2.49M/tháng
- Unlock 10 profiles
- Tuyển thành công

Month 2-3: Regular Usage
- Tổ chức 12 events
- Unlock 60 contacts
- Tiết kiệm 50% thời gian
- ROI: 500%
```

---

## **8. Success Metrics & KPIs**

### **8.1. North Star Metric**

**Successful Bookings per Month**

**Target:**
- Month 3: 50 bookings
- Month 6: 200 bookings
- Month 12: 1,000 bookings
- Year 2: 5,000 bookings/month

### **8.2. Key Performance Indicators**

**Growth Metrics:**

| Metric | Month 3 | Month 6 | Month 12 | Year 2 |
|--------|---------|---------|----------|--------|
| Total KOLs | 500 | 1,000 | 3,000 | 10,000 |
| Active KOLs (30d) | 200 | 400 | 1,200 | 4,000 |
| Total Partners | 50 | 100 | 300 | 1,000 |
| Paid Partners | 10 | 30 | 150 | 500 |

**Engagement Metrics:**

| Metric | Target |
|--------|--------|
| Profile completion rate | >70% |
| Search-to-contact rate | >15% |
| Job application rate | >10% |
| Response rate | >60% |

**Quality Metrics:**

| Metric | Target |
|--------|--------|
| Average rating (KOLs) | >4.5/5.0 |
| Show-up rate | >95% |
| Completion rate | >90% |
| Dispute rate | <5% |

**Financial Metrics:**

| Metric | Month 6 | Month 12 | Year 2 |
|--------|---------|----------|--------|
| MRR | 60M | 200M | 800M |
| ARPU | 2M | 1.5M | 1.6M |
| CAC | 800K | 600K | 500K |
| LTV | 16M | 18M | 24M |
| LTV/CAC | 20 | 30 | 48 |

---

---

## **9. API Integration Deep Dive**

### **9.1. Social Media API Integration Architecture**

**Integration Strategy:**

| Platform | API Type | Authentication | Rate Limits | Data Refresh |
|----------|----------|----------------|-------------|--------------|
| **Instagram** | Graph API v18.0 | OAuth 2.0 | 200 calls/hour | Weekly |
| **TikTok** | Creator API v1 | OAuth 2.0 | 100 calls/hour | Weekly |
| **Facebook** | Graph API v18.0 | OAuth 2.0 | 200 calls/hour | Weekly |
| **YouTube** | Data API v3 | OAuth 2.0 | 10,000 units/day | Monthly |

**Technical Implementation Flow:**

```javascript
// Instagram Integration Example
Step 1: User Authorization
- User clicks "Connect Instagram"
- Redirect to: https://api.instagram.com/oauth/authorize
- Scopes: user_profile, user_media, insights
- Callback URL: https://platform.com/auth/instagram/callback

Step 2: Token Exchange
- Receive authorization code
- Exchange for access_token + refresh_token
- Store encrypted in database
- Set expiry reminder (60 days)

Step 3: Data Fetching (Cron Job - Weekly)
GET /me?fields=id,username,followers_count,media_count
GET /me/media?fields=like_count,comments_count,timestamp

Step 4: Calculate Metrics
engagement_rate = (total_likes + total_comments) / (followers * posts) * 100
authenticity_score = engagement_rate / expected_rate_by_follower_tier

Step 5: Update Profile
- Store historical data for trend analysis
- Update badge if thresholds crossed
- Trigger notification to user
```

**Data Storage Schema:**

```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  platform VARCHAR(20), -- 'instagram', 'tiktok', 'facebook', 'youtube'
  platform_user_id VARCHAR(100),
  username VARCHAR(100),
  access_token TEXT ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  token_expires_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_metrics_history (
  id UUID PRIMARY KEY,
  social_account_id UUID REFERENCES social_accounts(id),
  followers_count INTEGER,
  following_count INTEGER,
  posts_count INTEGER,
  engagement_rate DECIMAL(5,2),
  authenticity_score DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_account_date (social_account_id, recorded_at)
);
```

### **9.2. Anti-Fraud Detection System**

**Fake Follower Detection Algorithm:**

| Indicator | Red Flag Threshold | Weight | Action |
|-----------|-------------------|--------|--------|
| **Engagement Rate** | <0.5% for 10K+ followers | 40% | Flag for review |
| **Follower Growth** | >50% increase in 7 days | 25% | Temporary suspend badge |
| **Comment Quality** | >70% generic comments | 20% | Manual review |
| **Follower/Following Ratio** | Following > 2× Followers | 10% | Lower ranking |
| **Profile Completeness** | <30% of followers have profile pic | 5% | Warning |

**Fraud Score Calculation:**

```
Fraud Score = Σ(Indicator Weight × Violation Severity)

Severity Levels:
- 0: Normal
- 1: Suspicious (50% weight)
- 2: High Risk (100% weight)

Actions by Score:
- 0-20: No action
- 21-40: Warning notification
- 41-60: Remove verification badge
- 61-80: Lower search ranking by 50%
- 81-100: Account suspension + manual review
```

**Machine Learning Model:**

```python
# Pseudo-code for fraud detection
features = [
    'engagement_rate',
    'follower_growth_rate_7d',
    'follower_growth_rate_30d',
    'avg_likes_per_post',
    'avg_comments_per_post',
    'comment_quality_score',
    'follower_following_ratio',
    'profile_completeness_of_followers',
    'posting_frequency',
    'time_since_account_creation'
]

model = RandomForestClassifier(n_estimators=100)
model.fit(training_data, labels)  # Labels: 0=Real, 1=Fake

prediction = model.predict_proba(user_features)
fraud_probability = prediction[1]  # Probability of being fake

if fraud_probability > 0.7:
    flag_for_manual_review()
elif fraud_probability > 0.5:
    remove_verification_badge()
```

### **9.3. Calendar Integration Technical Specs**

**Supported Calendar Providers:**

| Provider | Integration Type | Sync Direction | Implementation |
|----------|------------------|----------------|----------------|
| **Google Calendar** | CalDAV + API | 2-way | OAuth 2.0 + Calendar API v3 |
| **Apple iCloud** | CalDAV | Import only | CalDAV protocol |
| **Outlook/Office 365** | Microsoft Graph API | Import only | OAuth 2.0 + Graph API |
| **Manual Entry** | Native | N/A | Built-in calendar widget |

**2-Way Sync Logic (Google Calendar):**

```javascript
// Sync Algorithm
Every 15 minutes:
  1. Fetch events from Google Calendar (last_sync_time to now)
  2. Fetch events from Platform Calendar (last_sync_time to now)
  
  3. For each Google event:
     - If not exists in Platform → Create
     - If exists but modified → Update Platform
     - If deleted → Mark as available in Platform
  
  4. For each Platform booking:
     - If confirmed → Create/Update in Google Calendar
     - If cancelled → Delete from Google Calendar
  
  5. Conflict Resolution:
     - Platform bookings take priority
     - Google events marked as "Busy" block availability
     - User can override with "Maybe" status

// Conflict Detection
function detectConflicts(newBooking, existingEvents) {
  conflicts = []
  for (event of existingEvents) {
    if (timeRangesOverlap(newBooking, event)) {
      conflicts.push(event)
    }
  }
  return conflicts
}

function timeRangesOverlap(a, b) {
  return (a.start < b.end) && (a.end > b.start)
}
```

**Buffer Time Management:**

| Job Type | Default Buffer Before | Default Buffer After | Reason |
|----------|----------------------|---------------------|--------|
| **Photo Shoot** | 1 hour | 1 hour | Makeup, travel |
| **Event (Same City)** | 2 hours | 1 hour | Travel, preparation |
| **Event (Other City)** | 1 day | 4 hours | Travel time |
| **Video Shoot** | 2 hours | 2 hours | Setup, breakdown |
| **Live Stream** | 30 minutes | 30 minutes | Tech check |

---

## **10. Security & Data Protection**

### **10.1. Security Architecture**

**Multi-Layer Security Model:**

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                               │
│ - CloudFlare DDoS Protection                            │
│ - WAF (Web Application Firewall)                        │
│ - Rate Limiting: 100 req/min per IP                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                           │
│ - JWT Authentication (RS256)                            │
│ - CSRF Protection                                       │
│ - XSS Prevention (Content Security Policy)             │
│ - SQL Injection Prevention (Parameterized Queries)     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Data Security                                  │
│ - Encryption at Rest (AES-256)                         │
│ - Encryption in Transit (TLS 1.3)                      │
│ - PII Tokenization                                      │
│ - Database Access Control (IAM Roles)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Monitoring & Response                          │
│ - Real-time Threat Detection (AWS GuardDuty)          │
│ - Audit Logging (CloudTrail)                           │
│ - Incident Response Plan                               │
│ - Regular Security Audits                              │
└─────────────────────────────────────────────────────────┘
```

### **10.2. Data Privacy Compliance**

**Vietnamese Personal Data Protection Decree 13/2023:**

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Consent** | Explicit opt-in during registration | ✅ Compliant |
| **Data Minimization** | Only collect necessary fields | ✅ Compliant |
| **Right to Access** | User dashboard with data export | ✅ Compliant |
| **Right to Deletion** | Account deletion within 30 days | ✅ Compliant |
| **Data Portability** | Export profile as JSON/PDF | ✅ Compliant |
| **Breach Notification** | Notify within 72 hours | ✅ Compliant |
| **Data Localization** | Store in Vietnam (Viettel IDC) | ⚠️ Planned |

**GDPR Compliance (for international users):**

- Cookie consent banner
- Privacy policy in plain language
- Data Processing Agreement (DPA) with vendors
- Right to be forgotten implementation
- Data Protection Officer (DPO) appointed

### **10.3. Sensitive Data Handling**

**PII (Personally Identifiable Information) Protection:**

| Data Type | Storage Method | Access Control | Retention |
|-----------|----------------|----------------|-----------|
| **Phone Number** | Encrypted (AES-256) | Admin + Owner only | Until account deletion |
| **Email** | Encrypted | Admin + Owner only | Until account deletion |
| **ID Card/Passport** | Tokenized + Encrypted | Admin only (audit logged) | 90 days after verification |
| **Bank Account** | Tokenized (PCI DSS) | Payment service only | Until removed by user |
| **Location Data** | Hashed | Aggregated only | 30 days |
| **Photos/Videos** | Encrypted at rest | Public (with watermark) | Until removed by user |

**Access Logging:**

```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  accessed_by UUID,
  resource_type VARCHAR(50), -- 'phone', 'email', 'id_card', etc.
  resource_id UUID,
  action VARCHAR(20), -- 'view', 'edit', 'delete'
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_accessed_by (accessed_by, timestamp)
);
```

---

## **11. Risk Analysis & Mitigation**

### **11.1. Technical Risks**

| Risk | Probability | Impact | Mitigation Strategy | Cost |
|------|-------------|--------|---------------------|------|
| **Data Breach** | Low (10%) | Critical | - Encryption<br>- Regular audits<br>- Bug bounty program | 50M/year |
| **DDoS Attack** | Medium (30%) | High | - CloudFlare protection<br>- Auto-scaling<br>- CDN | 20M/year |
| **API Rate Limit** | High (60%) | Medium | - Caching<br>- Queue system<br>- Fallback mechanisms | 10M/year |
| **Database Failure** | Low (5%) | Critical | - Multi-AZ deployment<br>- Automated backups<br>- Disaster recovery plan | 30M/year |
| **Payment Fraud** | Medium (25%) | High | - 3D Secure<br>- Fraud detection AI<br>- Manual review for high-value | 15M/year |

### **11.2. Business Risks**

| Risk | Probability | Impact | Mitigation Strategy | Timeline |
|------|-------------|--------|---------------------|----------|
| **Low User Adoption** | Medium (40%) | Critical | - Free trial period<br>- Referral program<br>- Influencer marketing | Month 1-6 |
| **Bypass (Users go direct)** | High (70%) | High | - Loyalty rewards<br>- Exclusive features<br>- Community building | Ongoing |
| **Competitor Entry** | Medium (50%) | Medium | - First-mover advantage<br>- Network effects<br>- Superior UX | Year 1-2 |
| **Regulatory Changes** | Low (20%) | High | - Legal consultation<br>- Compliance monitoring<br>- Flexible architecture | Ongoing |
| **Economic Downturn** | Medium (30%) | Medium | - Diversified revenue<br>- Cost optimization<br>- Flexible pricing | Ongoing |

### **11.3. Operational Risks**

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|---------------------|-------|
| **Content Moderation Overload** | High (60%) | Medium | - AI pre-screening<br>- Outsource to moderation service<br>- Community reporting | Operations |
| **Customer Support Bottleneck** | High (70%) | Medium | - Chatbot for FAQs<br>- Self-service knowledge base<br>- Tiered support | Customer Success |
| **Dispute Escalation** | Medium (40%) | High | - Clear ToS<br>- Mediation process<br>- Legal retainer | Legal |
| **Key Person Dependency** | Medium (30%) | High | - Documentation<br>- Cross-training<br>- Succession planning | HR |

---

## **12. Implementation Roadmap**

### **12.1. Phase 1: MVP (Month 1-3)**

**Sprint 1 (Week 1-2): Foundation**
- [ ] Project setup & DevOps pipeline
- [ ] Database schema design
- [ ] Authentication system (JWT + OAuth)
- [ ] Basic user registration & login

**Sprint 2 (Week 3-4): Core Features - KOL Side**
- [ ] Profile creation & editing
- [ ] Photo upload & management
- [ ] Basic info fields
- [ ] Profile preview

**Sprint 3 (Week 5-6): Core Features - Partner Side**
- [ ] Partner registration
- [ ] Basic search & filters
- [ ] Profile viewing
- [ ] Wishlist/Save feature

**Sprint 4 (Week 7-8): Monetization**
- [ ] Subscription plans
- [ ] Payment integration (VNPay)
- [ ] Pay-per-lead unlock
- [ ] Admin dashboard (basic)

**Sprint 5 (Week 9-10): Polish & Testing**
- [ ] UI/UX refinement
- [ ] Mobile responsiveness
- [ ] Load testing
- [ ] Security audit

**Sprint 6 (Week 11-12): Launch Prep**
- [ ] Beta testing with 50 users
- [ ] Bug fixes
- [ ] Marketing materials
- [ ] Soft launch

**MVP Success Criteria:**
- ✅ 500 KOL profiles created
- ✅ 50 partners registered
- ✅ 10 paid subscriptions
- ✅ <2s page load time
- ✅ 99% uptime

### **12.2. Phase 2: Growth (Month 4-6)**

**Sprint 7-8: Advanced Features**
- [ ] Video upload & processing
- [ ] Social media API integration
- [ ] Advanced search filters
- [ ] Calendar integration (Google)

**Sprint 9-10: Engagement**
- [ ] Job posting feature
- [ ] Application management (ATS)
- [ ] In-app messaging (basic)
- [ ] Email notifications

**Sprint 11-12: Optimization**
- [ ] Search algorithm optimization
- [ ] Performance improvements
- [ ] Analytics dashboard
- [ ] A/B testing framework

**Phase 2 Success Criteria:**
- ✅ 1,500 KOL profiles
- ✅ 150 partners
- ✅ 50 paid subscriptions
- ✅ 200 successful bookings
- ✅ 4.5+ star rating

### **12.3. Phase 3: Scale (Month 7-12)**

**Sprint 13-16: Advanced Monetization**
- [ ] Escrow wallet system
- [ ] Commission tracking
- [ ] Multiple payment methods
- [ ] Invoicing & receipts

**Sprint 17-20: Platform Maturity**
- [ ] Mobile app (React Native)
- [ ] Agency management module
- [ ] Advanced analytics
- [ ] API for third-party integrations

**Sprint 21-24: Optimization & Expansion**
- [ ] AI-powered matching
- [ ] Fraud detection system
- [ ] Multi-language support
- [ ] Regional expansion

**Phase 3 Success Criteria:**
- ✅ 5,000 KOL profiles
- ✅ 500 partners
- ✅ 200 paid subscriptions
- ✅ 1,000 bookings/month
- ✅ 1 billion VND revenue

---

## **13. Marketing & Growth Strategy**

### **13.1. Go-to-Market Strategy**

**Phase 1: Seeding (Month 1-2)**

**Target:** 500 KOL profiles + 50 partners

| Channel | Tactic | Budget | Expected Result |
|---------|--------|--------|-----------------|
| **Direct Outreach** | Contact 100 modeling agencies | 0đ | 300 profiles |
| **Instagram Ads** | Target models/influencers in VN | 20M | 150 profiles |
| **Facebook Groups** | Post in model/PG communities | 0đ | 50 profiles |
| **Referral Program** | 100K bonus for each referral | 5M | 100 profiles |
| **PR** | Press release to tech/startup media | 3M | Brand awareness |
| **Events** | Sponsor 2 fashion/beauty events | 10M | 50 profiles + credibility |
| **TOTAL** | | **38M** | **650 profiles** |

**Partner Acquisition:**

| Channel | Tactic | Budget | Expected Result |
|---------|--------|--------|-----------------|
| **LinkedIn Ads** | Target event managers, HR | 15M | 30 partners |
| **Cold Email** | Outreach to 500 companies | 2M | 15 partners |
| **Partnerships** | Co-marketing with event agencies | 0đ | 10 partners |
| **Google Ads** | "Thuê model", "Thuê PG" keywords | 10M | 20 partners |
| **TOTAL** | | **27M** | **75 partners** |

**Phase 2: Growth (Month 3-6)**

**Target:** 1,500 KOL profiles + 150 partners

| Channel | Tactic | Budget/Month | Expected Result |
|---------|--------|--------------|-----------------|
| **Content Marketing** | Blog, SEO, YouTube tutorials | 10M | 200 organic profiles |
| **Influencer Marketing** | Partner with 10 micro-influencers | 15M | 300 profiles |
| **Facebook/IG Ads** | Retargeting + lookalike audiences | 25M | 250 profiles |
| **TikTok Ads** | Short-form video ads | 20M | 200 profiles |
| **Referral Program** | Increase bonus to 150K | 10M | 150 profiles |
| **TOTAL** | | **80M/month** | **1,100 profiles/month** |

**Phase 3: Scale (Month 7-12)**

**Target:** 5,000 KOL profiles + 500 partners

| Channel | Tactic | Budget/Month | Expected Result |
|---------|--------|--------------|-----------------|
| **TV/Radio** | Ads on youth channels | 50M | Brand awareness |
| **Outdoor** | Billboards in major cities | 30M | Brand awareness |
| **Partnerships** | Universities, beauty schools | 5M | 500 profiles |
| **Digital Ads** | Multi-channel campaigns | 60M | 800 profiles |
| **PR & Events** | Host industry events | 20M | Credibility + 200 profiles |
| **TOTAL** | | **165M/month** | **1,500 profiles/month** |

### **13.2. Customer Acquisition Cost (CAC) Analysis**

**KOL Acquisition:**

| Channel | Cost per Profile | Quality Score | Retention Rate | LTV | ROI |
|---------|------------------|---------------|----------------|-----|-----|
| **Direct Outreach** | 0đ | ⭐⭐⭐⭐⭐ | 80% | 2M | ∞ |
| **Referral** | 100K | ⭐⭐⭐⭐⭐ | 85% | 2.5M | 25x |
| **Instagram Ads** | 133K | ⭐⭐⭐⭐ | 60% | 1.5M | 11x |
| **TikTok Ads** | 100K | ⭐⭐⭐ | 50% | 1M | 10x |
| **Facebook Ads** | 150K | ⭐⭐⭐ | 55% | 1.2M | 8x |
| **Events** | 200K | ⭐⭐⭐⭐⭐ | 90% | 3M | 15x |

**Partner Acquisition:**

| Channel | Cost per Partner | Conversion to Paid | LTV | ROI |
|---------|------------------|-------------------|-----|-----|
| **LinkedIn Ads** | 500K | 30% | 18M | 36x |
| **Cold Email** | 133K | 20% | 18M | 135x |
| **Google Ads** | 500K | 40% | 18M | 36x |
| **Referral** | 200K | 50% | 24M | 120x |
| **Partnerships** | 0đ | 60% | 24M | ∞ |

**Blended CAC:**
- KOL: 120K/profile
- Partner: 360K/partner
- Paid Partner: 1.2M/paid partner

**Target LTV/CAC Ratio:** 15-20x (Excellent for SaaS)

### **13.3. Retention & Engagement Strategy**

**KOL Retention Tactics:**

| Tactic | Frequency | Cost | Impact on Retention |
|--------|-----------|------|---------------------|
| **Weekly Job Alerts** | Weekly | 0đ | +15% |
| **Profile Optimization Tips** | Monthly | 0đ | +10% |
| **Success Stories** | Bi-weekly | 2M/month | +8% |
| **Exclusive Workshops** | Quarterly | 10M/quarter | +12% |
| **Loyalty Rewards** | Ongoing | 5M/month | +20% |
| **Community Events** | Monthly | 8M/month | +15% |

**Partner Retention Tactics:**

| Tactic | Frequency | Cost | Impact on Retention |
|--------|-----------|------|---------------------|
| **Dedicated Account Manager** | Ongoing | 30M/month | +25% |
| **Quarterly Business Review** | Quarterly | 0đ | +15% |
| **New Feature Training** | As needed | 0đ | +10% |
| **Priority Support** | Ongoing | Included | +20% |
| **Volume Discounts** | Ongoing | Revenue share | +30% |

**Churn Reduction:**

| Churn Reason | % of Churn | Solution | Expected Reduction |
|--------------|------------|----------|-------------------|
| **Not enough jobs** | 35% | Better matching algorithm | -50% |
| **Too expensive** | 25% | Flexible pricing tiers | -40% |
| **Poor UX** | 20% | Continuous UX improvements | -60% |
| **Found alternative** | 15% | Unique features, lock-in | -30% |
| **Other** | 5% | Exit surveys, improvements | -20% |

---

## **14. Competitive Analysis**

### **14.1. Competitor Landscape**

**Direct Competitors:**

| Competitor | Strengths | Weaknesses | Market Share | Our Advantage |
|------------|-----------|------------|--------------|---------------|
| **Casting.vn** | - Established brand<br>- Large database | - Outdated UI<br>- No mobile app<br>- Manual process | 30% | Better UX, automation |
| **ModelManagement.com** | - International reach<br>- Professional | - Expensive<br>- Not localized | 15% | Local focus, pricing |
| **Facebook Groups** | - Free<br>- Large audience | - Unorganized<br>- No verification<br>- Scams | 40% | Trust, quality, efficiency |
| **Instagram DMs** | - Direct contact<br>- Visual | - Time-consuming<br>- No filtering<br>- Unprofessional | 10% | Professional platform |

**Indirect Competitors:**

| Type | Examples | Threat Level | Mitigation |
|------|----------|--------------|------------|
| **Talent Agencies** | Elite Model, IMG | Medium | Partner with them (Agency module) |
| **Freelance Platforms** | Upwork, Fiverr | Low | Different market segment |
| **Social Media** | Instagram, TikTok | High | Integrate, don't compete |
| **Event Staffing** | Adecco, ManpowerGroup | Medium | Focus on creative talent |

### **14.2. Competitive Advantages (Moats)**

**1. Network Effects (Strongest Moat)**
```
More KOLs → More Partners → More Jobs → More KOLs
                ↑                              ↓
         Better Matching ← More Data ← More Transactions
```

**2. Data Moat**
- Proprietary database of verified profiles
- Historical performance data
- Pricing intelligence
- Matching algorithm trained on real transactions

**3. Brand & Trust**
- Verification system
- Rating & reviews
- Escrow protection
- Professional reputation

**4. Technology Moat**
- Social media API integration
- AI-powered matching
- Calendar sync
- Mobile-first UX

**5. Switching Costs**
- Profile investment (time to create)
- Historical data & ratings
- Network connections
- Integrated workflows

### **14.3. Differentiation Strategy**

**Feature Comparison Matrix:**

| Feature | Us | Casting.vn | Facebook Groups | Instagram |
|---------|----|-----------|-----------------|-----------| 
| **Verified Profiles** | ✅ | ⚠️ Partial | ❌ | ❌ |
| **Social Media Sync** | ✅ | ❌ | ❌ | N/A |
| **Calendar Integration** | ✅ | ❌ | ❌ | ❌ |
| **Mobile App** | ✅ | ❌ | ✅ | ✅ |
| **Advanced Search** | ✅ | ⚠️ Basic | ❌ | ⚠️ Basic |
| **Escrow Payment** | ✅ | ❌ | ❌ | ❌ |
| **AI Matching** | ✅ | ❌ | ❌ | ❌ |
| **Agency Management** | ✅ | ❌ | ❌ | ❌ |
| **Analytics Dashboard** | ✅ | ❌ | ❌ | ⚠️ Basic |
| **Professional Support** | ✅ | ⚠️ Limited | ❌ | ❌ |

**Unique Value Propositions:**

**For KOLs:**
1. "Get 3x more job offers with verified profiles"
2. "Sync your Instagram followers automatically"
3. "Never miss a booking with smart calendar"
4. "Get paid safely with escrow protection"

**For Partners:**
5. "Find the perfect talent in 5 minutes, not 5 days"
6. "See real follower counts, not fake numbers"
7. "Manage 100+ applicants with one dashboard"
8. "Book with confidence - 95% show-up rate"

---

## **15. Financial Projections & Unit Economics**

### **15.1. Revenue Model Deep Dive**

**Revenue Stream Breakdown (Year 1):**

| Stream | Month 3 | Month 6 | Month 12 | % of Total |
|--------|---------|---------|----------|------------|
| **Subscription (Partners)** | 20M | 60M | 180M | 60% |
| **Pay-per-lead** | 5M | 20M | 60M | 20% |
| **Profile Boost (KOLs)** | 3M | 15M | 45M | 15% |
| **Premium Features** | 2M | 5M | 15M | 5% |
| **TOTAL** | **30M** | **100M** | **300M** | **100%** |

**Revenue Model (Year 2):**

| Stream | Q1 | Q2 | Q3 | Q4 | Total | % of Total |
|--------|----|----|----|----|-------|------------|
| **Subscription** | 60M | 80M | 100M | 120M | 360M | 40% |
| **Commission (10%)** | 50M | 80M | 120M | 150M | 400M | 45% |
| **Pay-per-lead** | 20M | 25M | 30M | 35M | 110M | 12% |
| **Premium Services** | 5M | 8M | 10M | 12M | 35M | 3% |
| **TOTAL** | **135M** | **193M** | **260M** | **317M** | **905M** | **100%** |

### **15.2. Unit Economics**

**KOL Unit Economics:**

```
Acquisition Cost (CAC): 120K
Monthly Revenue per KOL: 0đ (free for KOLs)
Indirect Value:
  - Attracts partners: 500K/KOL/year
  - Platform commission: 200K/KOL/year (if using escrow)
  
Lifetime Value (LTV): 2M (over 3 years)
LTV/CAC Ratio: 16.7x ✅ Excellent
```

**Partner Unit Economics:**

```
Acquisition Cost (CAC): 1.2M (to paid)
Monthly Subscription: 1.5M (average)
Annual Revenue: 18M
Gross Margin: 85% (15.3M)
Retention Rate: 80% (Year 1)

Lifetime Value (LTV):
  Year 1: 18M × 80% = 14.4M
  Year 2: 18M × 64% = 11.5M
  Year 3: 18M × 51% = 9.2M
  Total LTV: 35.1M

LTV/CAC Ratio: 29.3x ✅ Exceptional
Payback Period: 0.8 months ✅ Excellent
```

### **15.3. Break-Even Analysis**

**Fixed Costs (Monthly):**

| Category | Cost | Notes |
|----------|------|-------|
| **Salaries** | 150M | 10 people × 15M average |
| **Office** | 20M | Co-working space |
| **Infrastructure** | 15M | AWS, CDN, tools |
| **Marketing** | 80M | Blended across channels |
| **Legal & Accounting** | 5M | Compliance, bookkeeping |
| **Other** | 10M | Misc expenses |
| **TOTAL** | **280M** | |

**Variable Costs:**
- Payment processing: 2% of revenue
- Customer support: 5% of revenue
- Content moderation: 3% of revenue

**Break-Even Calculation:**

```
Break-Even Revenue = Fixed Costs / (1 - Variable Cost %)
                   = 280M / (1 - 0.10)
                   = 311M/month

At average subscription of 1.5M:
Break-Even Customers = 311M / 1.5M = 207 paid partners

Expected Timeline: Month 8-9
```

### **15.4. Funding Requirements**

**Seed Round: 3 billion VND**

**Use of Funds:**

| Category | Amount | % | Timeline |
|----------|--------|---|----------|
| **Product Development** | 1,200M | 40% | Month 1-6 |
| **Marketing & Sales** | 900M | 30% | Month 1-12 |
| **Operations** | 450M | 15% | Month 1-12 |
| **Legal & Compliance** | 150M | 5% | Month 1-3 |
| **Reserve** | 300M | 10% | Emergency fund |
| **TOTAL** | **3,000M** | **100%** | |

**Runway:** 12 months to profitability

**Series A (Optional): 10-15 billion VND**
- Timing: Month 12-15
- Use: Scale to 10 cities, build mobile app, expand team
- Valuation target: 50-80 billion VND

---

## **16. Success Metrics & KPI Dashboard**

### **16.1. North Star Metric Framework**

**Primary North Star:** Successful Bookings per Month

**Supporting Metrics:**

```
┌─────────────────────────────────────────────────┐
│         Successful Bookings/Month               │
│                    ↑                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Supply Side          Demand Side               │
│  ↓                    ↓                         │
│  Active KOLs    ×     Active Partners           │
│  ↓                    ↓                         │
│  Profile Quality      Search Efficiency         │
│  ↓                    ↓                         │
│  Completion Rate      Conversion Rate           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **16.2. KPI Tracking Dashboard**

**Acquisition Metrics:**

| Metric | Week 1 | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|--------|---------|---------|---------|----------|
| **New KOL Signups** | 50 | 200 | 500 | 1,000 | 3,000 |
| **New Partner Signups** | 5 | 20 | 50 | 100 | 300 |
| **Paid Conversions** | 0 | 2 | 10 | 30 | 150 |
| **CAC (KOL)** | 200K | 150K | 120K | 100K | 80K |
| **CAC (Partner)** | 2M | 1.5M | 1.2M | 1M | 800K |

**Engagement Metrics:**

| Metric | Target | Month 3 | Month 6 | Month 12 |
|--------|--------|---------|---------|----------|
| **DAU/MAU Ratio** | >30% | 25% | 28% | 32% |
| **Avg Session Duration** | >5 min | 4 min | 5.5 min | 6 min |
| **Profile Completion Rate** | >70% | 60% | 68% | 75% |
| **Search-to-Contact Rate** | >15% | 10% | 13% | 18% |
| **Response Rate (KOL)** | >60% | 50% | 58% | 65% |

**Revenue Metrics:**

| Metric | Month 3 | Month 6 | Month 12 | Year 2 |
|--------|---------|---------|----------|--------|
| **MRR** | 30M | 100M | 300M | 800M |
| **ARR** | 360M | 1.2B | 3.6B | 9.6B |
| **ARPU** | 3M | 2M | 1.5M | 1.6M |
| **Gross Margin** | 75% | 80% | 85% | 85% |
| **Net Margin** | -200% | -50% | 10% | 35% |

**Quality Metrics:**

| Metric | Target | Actual (Month 6) | Actual (Month 12) |
|--------|--------|------------------|-------------------|
| **Avg Rating (KOL)** | >4.5 | 4.3 | 4.6 |
| **Avg Rating (Partner)** | >4.5 | 4.4 | 4.7 |
| **Show-up Rate** | >95% | 92% | 96% |
| **Completion Rate** | >90% | 88% | 93% |
| **Dispute Rate** | <5% | 7% | 4% |
| **Churn Rate (Monthly)** | <5% | 8% | 4% |

---

**Kết luận:** Luồng vận hành này đã được thiết kế tối ưu để cân bằng giữa trải nghiệm người dùng, tính khả thi kỹ thuật, và mục tiêu kinh doanh. Với lộ trình rõ ràng từ MVP đến Scale, chiến lược marketing chi tiết, phân tích cạnh tranh sâu sắc, và dự báo tài chính thực tế, nền tảng có nền tảng vững chắc để phát triển bền vững và trở thành leader trong ngành KOL/Model management tại Việt Nam.
