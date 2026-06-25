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
| **Professional** | Loại hình (Model/KOL/PG/MC), Kinh nghiệm (năm), Kỹ năng đặc biệt | "MC có kinh nghiệm 3+ năm" |
| **Social Media** | Platform (IG/TikTok/FB), Follower count (range), Engagement rate | "Influencer có 50K+ followers" |
| **Availability** | Ngày rảnh, Khu vực làm việc, Sẵn sàng đi xa | "Rảnh ngày 15-17/6" |
| **Budget** | Mức giá (range), Đơn vị (giờ/ngày/dự án) | "Budget 2-3 triệu/ngày" |
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