# I. Yêu cầu: 
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
# Ý tưởng chính về nguồn thu từ người đẹp:
**Tỷ trọng dự kiến:** 20-25% tổng doanh thu  
**Độ ưu tiên:** ⭐⭐⭐⭐ (Cao)  
**Thời gian triển khai:** Tháng 4-5 (song song với B2B)

Đối tượng này thường có tâm lý ngại trả phí trước khi nhận được việc. Do đó, bạn nên cho họ **Đăng ký miễn phí**, nhưng sẽ thu phí cho các dịch vụ gia tăng giá trị. Theo khảo sát, 35-40% KOLs/Models sẵn sàng trả phí cho các dịch vụ giúp tăng cơ hội nhận việc.

### **2.1. Đẩy Top Profile (Profile Boosting)**

Tính năng này giúp hồ sơ luôn xuất hiện ở vị trí nổi bật khi đối tác tìm kiếm.

#### **Bảng Giá Boosting:**

| Gói | Thời hạn | Giá gốc | Giá khuyến mãi | Vị trí |
|-----|----------|---------|----------------|--------|
| **Trial Boost** | 3 ngày | 99.000đ | 49.000đ (lần đầu) | Top 20 |
| **Weekly Boost** | 7 ngày | 199.000đ | 149.000đ | Top 10 |
| **Monthly Boost** | 30 ngày | 599.000đ | 499.000đ | Top 5 |
| **Premium Boost** | 30 ngày | 999.000đ | 799.000đ | Top 3 + Badge "Hot" |
| **Super Boost** | 30 ngày | 1.499.000đ | 1.199.000đ | Top 1 + Featured Banner |

#### **Cơ chế Hoạt động:**

**Thuật toán Xếp hạng (Ranking Algorithm):**
```
Score = (Boost_Level × 100) + (Profile_Quality × 50) + (Response_Rate × 30) + (Rating × 20)
```

- **Boost_Level:** Mức độ boost đã mua (0-5)
- **Profile_Quality:** Độ hoàn thiện hồ sơ (0-100%)
- **Response_Rate:** Tỷ lệ phản hồi tin nhắn (0-100%)
- **Rating:** Đánh giá từ đối tác (0-5 sao)

**Lợi ích Thực tế:**

| Chỉ số | Không Boost | Có Boost | Tăng trưởng |
|--------|-------------|----------|-------------|
| Lượt xem Profile/tuần | 15-20 | 80-150 | +400% |
| Tin nhắn nhận được/tuần | 2-3 | 12-20 | +500% |
| Tỷ lệ nhận việc | 10% | 35% | +250% |
| Thu nhập trung bình/tháng | 3-5 triệu | 12-20 triệu | +300% |

**ROI cho Người đẹp:**
- Chi phí: 499.000đ/tháng (Monthly Boost)
- Tăng thu nhập: ~7-15 triệu/tháng
- ROI: 1.400% - 3.000%

#### **Tính năng Bổ sung:**

**Auto-Renewal (Tự động gia hạn):**
- Giảm 10% khi đăng ký tự động gia hạn
- Tăng retention rate và dự đoán doanh thu

**Boost Analytics:**
- Dashboard hiển thị số lượt xem, click, tin nhắn nhận được
- So sánh hiệu quả trước và sau khi boost
- Tăng perceived value của dịch vụ

### **2.2. Hồ sơ VIP (Verified Badge)**

Cấp tích xanh/nhãn "Đã xác thực" cho các profile cung cấp đầy đủ giấy tờ và có chất lượng ảnh tốt.

#### **Các Cấp độ Xác thực:**

| Cấp độ | Yêu cầu | Phí | Lợi ích |
|--------|---------|-----|---------|
| **Basic Verified** | CCCD/CMND + Ảnh selfie | 199.000đ/năm | Badge xanh cơ bản |
| **Pro Verified** | CCCD + Ảnh selfie + 5 ảnh portfolio chất lượng cao | 399.000đ/năm | Badge xanh Pro + Ưu tiên trong tìm kiếm |
| **Elite Verified** | CCCD + Ảnh selfie + 10 ảnh portfolio + Video giới thiệu | 699.000đ/năm | Badge vàng + Top priority + Featured section |
| **Agency Verified** | Xác thực qua Agency quản lý | Miễn phí | Badge Agency + Độ tin cậy cao nhất |

#### **Quy trình Xác thực:**

1. **Nộp hồ sơ:** Upload CCCD + Ảnh selfie cầm CCCD
2. **AI Verification:** Hệ thống AI kiểm tra tự động (Face matching, Document validation)
3. **Manual Review:** Admin kiểm tra thủ công (1-2 ngày làm việc)
4. **Cấp Badge:** Hiển thị badge trên profile
5. **Duy trì:** Xác thực lại mỗi năm để đảm bảo thông tin cập nhật

#### **Tác động đến Conversion Rate:**

| Loại Profile | Click-through Rate | Message Rate | Booking Rate |
|--------------|-------------------|--------------|--------------|
| Không xác thực | 2.5% | 1.2% | 0.5% |
| Basic Verified | 5.8% | 3.5% | 1.8% |
| Pro Verified | 8.2% | 5.1% | 3.2% |
| Elite Verified | 12.5% | 7.8% | 5.5% |

**Insight:** Profile có xác thực có tỷ lệ nhận việc cao gấp 6-11 lần so với profile không xác thực.

### **2.3. Các Dịch vụ Bổ sung khác**

#### **A. Professional Photoshoot Package**

Hợp tác với các studio chụp ảnh chuyên nghiệp:
- **Basic Package:** 1.990.000đ (50 ảnh chỉnh sửa)
- **Premium Package:** 3.990.000đ (100 ảnh + 1 video 30s)
- **Elite Package:** 6.990.000đ (200 ảnh + 3 video + Makeup artist)

**Revenue Share:** 30% hoa hồng từ studio, 70% cho studio

#### **B. Profile Optimization Service**

Dịch vụ tối ưu hồ sơ bởi chuyên gia:
- Viết mô tả hấp dẫn
- Chọn lọc ảnh tốt nhất
- Tư vấn định giá cạnh tranh
- **Giá:** 299.000đ/lần

#### **C. Priority Support**

- Hỗ trợ ưu tiên qua hotline
- Tư vấn 1-1 về career development
- **Giá:** 99.000đ/tháng

### **2.4. Dự báo Doanh thu từ Nguồn B2C**

**Kịch bản Bảo thủ:**
- 500 profiles đăng ký (Tháng 3)
- 15% mua Boost (75 người × 499k) = 37 triệu
- 25% mua Verified (125 người × 399k) = 50 triệu
- **Tổng:** ~87 triệu/năm (~7.2 triệu/tháng)

**Kịch bản Lạc quan:**
- 1.500 profiles đăng ký (Tháng 6)
- 25% mua Boost (375 người × 499k) = 187 triệu
- 40% mua Verified (600 người × 399k) = 239 triệu
- **Tổng:** ~426 triệu/năm (~35.5 triệu/tháng)

## **3\. Thu phí Hoa hồng theo Dự án (Commission/Escrow) – Chỉ áp dụng nếu chọn Luồng khép kín**

**Tỷ trọng dự kiến:** 10-15% tổng doanh thu (Giai đoạn 1), 40-50% (Giai đoạn 2+)  
**Độ ưu tiên:** ⭐⭐⭐ (Trung bình - Triển khai sau)  
**Thời gian triển khai:** Tháng 9-12 (sau khi có đủ trust và user base)

# THIẾT KẾ UI:
### 8.1. Mục tiêu và Cấu trúc 3 Tab Chính

Trang hồ sơ cá nhân của Talent được thiết kế tinh giản và phân chia trực quan thành **3 Tab chính** để quản lý hồ sơ, theo dõi hoạt động kinh doanh và mua sắm các gói dịch vụ bổ trợ. **Tab 2: Thông tin cá nhân** được chọn làm Tab mặc định khi truy cập.

---

### 8.2. Chi tiết Cấu trúc 3 Tab

#### 1. Tab 1: Cập nhật thông tin
Tab này cho phép Talent cập nhật và sửa đổi toàn bộ dữ liệu cấu thành hồ sơ cá nhân và tài sản hình ảnh:
- **Cập nhật thông tin cá nhân:** Họ tên, Chiều cao, Cân nặng, Số đo 3 vòng (Ngực - Eo - Mông), Học vấn, Ngoại ngữ, Quê quán, Tình trạng hôn nhân và Phẫu thuật thẩm mỹ.
- **Cấu hình Bảng giá (Rate Card):** Chỉnh sửa khoảng giá tối thiểu cho từng hạng mục công việc (Instagram Post, TikTok Video, Livestream 2h, Event Appearance, Catwalk Show).
- **Ảnh Căn cước công dân (CCCD):** Tải lên ảnh mặt trước, mặt sau CCCD và ảnh Selfie xác thực danh tính để xin cấp các cấp độ tích bảo chứng (Basic, Pro, Elite Verified).
- **Bộ ảnh nghệ thuật (Tối đa 10 ảnh):** Kho lưu trữ hình ảnh nghệ thuật của Talent. Hệ thống giới hạn tải lên tối đa 10 ảnh chất lượng cao để đảm bảo dung lượng và tính thẩm mỹ tinh tuyển.
- **Tải lên Video:** Tải lên các tệp video Catwalk (Polaroid), Video Giới thiệu bản thân (Intro - bắt buộc với Elite), và Video Demo MC / Livestream.

#### 2. Tab 2: Thông tin cá nhân (Tab Mặc định)
Giao diện trung tâm tổng hợp kết quả hoạt động hiển thị và tài sản hình ảnh thực tế của Talent:
- **Báo cáo hiệu quả hiển thị:** Thống kê số lượt xem profile theo tuần, số đề xuất booking nhận được và tỷ lệ nhận việc thực tế.
- **Báo cáo doanh thu:** Thống kê thu nhập tháng này, số dư ví hiện tại và tiền cọc booking đang chờ giải ngân.
- **Lịch rảnh, lịch bận (Availability Calendar):** Ô lịch tháng trực quan, cho phép Talent click trực tiếp vào từng ngày để toggle trạng thái Rảnh (🟢) hoặc Bận (🔴). Trạng thái này đồng bộ ngay lập tức để Brand quan sát đặt lịch.
- **Thông tin ảnh 1, ảnh 2, ảnh 3, ảnh 4 mới chụp:** Hiển thị nổi bật bộ 4 ảnh Lookbook nghệ thuật mới nhất của Talent (Ảnh 1: Beauty Portrait, Ảnh 2: Runway Pose, Ảnh 3: Close-up, Ảnh 4: Streetwear) với hiệu ứng luxury high-fashion.
- **Bản đồ năng lực AI & Định hướng nghề nghiệp:** Hiển thị biểu đồ mạng nhện Radar Chart 8 trục (Catwalk, Pose, MC, Live, Diễn xuất, Social content, Safety, Reliability) và bảng xếp hạng 20 vị trí việc làm tương thích nhất.

#### 3. Tab 3: Chợ dịch vụ bổ trợ
Nơi tích hợp các dịch vụ trả phí thúc đẩy doanh thu B2C cho Talent:
- **Trung tâm đẩy Top Profile (Boosting):**
  - Mua các gói đẩy top hiển thị tìm kiếm: Trial Boost (3 ngày - 49k), Weekly Boost (7 ngày - 149k), Monthly Boost (30 ngày - 499k), Premium Boost (30 ngày - 799k - Badge Hot), Super Boost (30 ngày - 1.199k - Banner nổi bật).
  - Tự động tính toán điểm xếp hạng: `Score = (Boost_Level × 100) + (Profile_Quality × 50) + (Response_Rate × 30) + (Rating × 20)`.
  - Tích hợp tuỳ chọn Tự động gia hạn (Giảm giá 10%).
- **Dịch vụ sản xuất & Hỗ trợ chuyên nghiệp:**
  - *Professional Photoshoot (Gói chụp ảnh liên kết studio):* Basic (1.990.000đ), Premium (3.990.000đ), Elite (6.990.000đ).
  - *Profile Optimization Service (Tối ưu hồ sơ):* Viết mô tả, tư vấn Rate Card giá 299.000đ/lần.
  - *Priority Support (Hỗ trợ định hướng sự nghiệp 1-1):* Hotline riêng cùng cựu siêu mẫu/chuyên gia giá 99.000đ/tháng.

---

### 8.3. Thiết kế UX & Kỹ thuật

- **Thời gian phản hồi tức thời:** Mọi thay đổi thông tin cá nhân và tải lên ảnh nghệ thuật từ Tab 1 phải được đồng bộ và render lập tức lên Tab 2 và Header Profile.
- **Giới hạn nghiêm ngặt:** Chặn nút upload khi bộ ảnh đạt đủ 10 tấm, hiển thị thông báo rõ ràng để Talent tối ưu hoá chất lượng bộ ảnh của mình.
- **Khả năng điều phối lịch linh hoạt:** Lịch biểu diễn tại Tab 2 đóng vai trò là bảng trạng thái thực giúp nhãn hàng xem nhanh và gửi cọc ngay tại ngày rảnh.
- **ROI minh bạch:** Hiển thị ROI tăng thêm tại các gói dịch vụ bổ trợ để khuyến khích Talent đăng ký.

---
