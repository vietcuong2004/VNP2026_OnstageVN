# 🎯 Thiết kế Tính năng: Talent Manager (Brand Side)

> **Góc nhìn:** **Brand account đồng thời là Manager luôn.** Brand là một thương hiệu kiêm **Agency/Talent Manager** đang quản lý một roster gồm **10 KOL**. Mỗi ngày Brand phải theo dõi: ai đang bận, ai đang rảnh, ai đang trong chiến dịch nào, ai cần được giới thiệu cho khách hàng tiếp theo, và hoa hồng nhận được từ mạng lưới này là bao nhiêu.

---

## 1. 🔑 Insight cốt lõi — "Manager nghĩ gì mỗi buổi sáng?"

Khi mở laptop lúc 8h, một Brand kiêm Manager cần trả lời ngay 5 câu hỏi:

| Câu hỏi | Màn hình cần có |
|---|---|
| **KOL nào đang rảnh hôm nay?** | Roster + trạng thái real-time |
| **KOL nào đang bị trễ tiến độ?** | Campaign progress tracker |
| **Tháng này tôi kiếm được bao nhiêu?** | Revenue & Commission dashboard |
| **Tôi cần giới thiệu KOL nào cho Brand đối tác?** | Quick-match & pitch deck |
| **Mạng lưới affiliate của tôi đang ở đâu?** | Network tree + earnings |

---

## 2. 🗺️ Luồng hoạt động đề xuất

```
BRAND MANAGER FLOW
──────────────────────────────────────────────────────────────────
[1] Đăng nhập Brand Account (đồng thời là Talent Manager)
     └─> Truy cập trực tiếp vào tính năng Quản lý Roster

[2] ADD TALENT VÀO ROSTER
     Brand tìm kiếm KOL trên trang /brand/search hoặc danh sách hệ thống
     → Nhấn "Thêm vào Roster của tôi" (gửi lời mời)
     → KOL nhận notification bên tài khoản của mình, nhấn chấp nhận
     → Trở thành "Managed Talent" chính thức trong roster của Brand đó

[3] QUẢN LÝ HẰNG NGÀY (/brand/my-talents)
     → Xem danh sách KOL, filter theo: rảnh/bận, tier, chuyên môn
     → Xem lịch tổng hợp (ai rảnh ngày nào)
     → Nhắn tin nhóm hoặc cá nhân
     → Giao chiến dịch/Assign KOL vào chiến dịch nhanh (không cần KOL apply)

[4] TUYỂN DỤNG TALENT QUA LINK AFFILIATE
     Brand/Manager có một Affiliate Link tuyển dụng cá nhân
     → Chia sẻ link cho các Talent (KOL/KOC) tiềm năng
     → Talent đăng ký qua link → tự động tham gia vào Roster (F1) của Brand
     → Brand nhận 10% hoa hồng trực tiếp từ thù lao booking mà Talent F1 thực hiện
     
     Ngoài ra, mỗi KOL trong roster của Brand cũng có Referral Code
     → KOL mời KOL khác → Brand (upline) nhận hoa hồng thụ động (F2: 5%, F3: 2%)

[5] NHẬN HOA HỒNG
     Brand Dashboard > Doanh thu & Affiliate
     → Hoa hồng từ Job do KOL trong Roster thực hiện (F1 Roster Jobs): 10%
     → Hoa hồng thụ động từ tuyến dưới của các KOL (F2 & F3 MLM)
     → Tổng ví: Số dư khả dụng + Rút tiền trực tiếp
```

---

## 3. 📐 Cấu trúc trang đề xuất: `/brand/my-talents`

### Tab 1: 📋 Roster (Danh sách KOL)
- Grid cards mỗi KOL: Avatar, tên, tier, followers, chuyên môn, trạng thái
- Badge trạng thái: 🟢 Rảnh / 🔴 Đang bận / 🟡 Đang trong chiến dịch
- Quick actions: Xem hồ sơ, Assign vào Campaign, Nhắn tin, Xem lịch
- Nút **"+ Thêm KOL vào Roster"** (mở modal tìm kiếm để mời)

### Tab 2: 📅 Lịch tổng hợp (Availability Matrix)
- Bảng ngày × KOL: ô màu xanh = rảnh, đỏ = bận
- Click vào ô → xem chi tiết campaign đang làm
- Giúp Manager ghép KOL với campaign mới dễ dàng

### Tab 3: 🚀 Chiến dịch đang chạy
- Tổng quan tất cả campaigns mà KOL của Manager đang tham gia
- Groupby theo Campaign, hiển thị KOL + stage của từng người
- Alert khi có KOL bị stuck ở một stage quá lâu

### Tab 4: 💰 Doanh thu & Affiliate
- **Revenue Summary**: Tổng thu theo tháng / quý / năm
- **Commission Breakdown**:
  - F1 (Roster Jobs): Hoa hồng 10% từ các Job KOL Roster thực hiện (tuyển trực tiếp hoặc qua Link Affiliate)
  - Passive (MLM): Hoa hồng thụ động từ tuyến dưới KOL (F2: 5%, F3: 2%)
- **Affiliate Link** cá nhân của Manager (copy/share)
- **Network Tree**: Sơ đồ mạng lưới (KOL → KOL → Brand)
- **Payout History**: Lịch sử thanh toán

### Tab 5: 🔗 Giới thiệu & Lan rộng mạng lưới
- Trang pitch deck: Manager tạo bộ portfolio tổng hợp KOL để gửi Brand
- Gói "Agency Package": Ghép nhiều KOL thành gói, quote giá tổng
- QR Code affiliate link để dùng offline

---

## 4. 💡 Mô hình hoa hồng (Commission Model)

```
Brand đặt booking KOL A (thù lao: 10.000.000đ)
│
├── Platform fee: 15% → 1.500.000đ (hệ thống)
├── KOL A nhận (F1): 75% → 7.500.000đ  
├── Brand Manager của KOL A (F0): 10% → 1.000.000đ ← BIG WIN
└── Upline của Manager (F2): 5% → 500.000đ
```

---

## 5. 🎨 Thiết kế UI gợi ý

**Card KOL trong Roster:**
```
┌─────────────────────────────────────────────┐
│ [Avatar]  Nguyễn Mai Anh          ● Rảnh   │
│           ⭐ Tier A  │ 520K followers        │
│           KOL Beauty · MC · Event Guest     │
│ 📊 3 campaigns hoàn thành tháng này         │
│ 💰 Hoa hồng tháng này: 2.400.000đ          │
│ [Xem hồ sơ] [Assign] [Nhắn tin] [Lịch]     │
└─────────────────────────────────────────────┘
```

**Affiliate Dashboard:**
```
┌─────────────────────────────────────────────┐
│ 💰 DOANH THU THÁNG 06/2026                  │
│                                             │
│ F1 (Roster Jobs)     24.500.000đ  ████████ │
│ Passive MLM           3.100.000đ  ██       │
│ ─────────────────────────────────────────── │
│ TỔNG                 27.600.000đ            │
│                                             │
│ 🔗 Affiliate Link: onstage.vn/ref/mgr-xxx  │
│ [Copy] [Share QR] [Xem Network Tree]        │
└─────────────────────────────────────────────┘
```

---

## 6. 📌 Phạm vi MVP (nên build trước)

| Ưu tiên | Tính năng | Lý do |
|---|---|---|
| 🔥 P1 | Roster KOL + Trạng thái | Core feature, dễ build |
| 🔥 P1 | Quick-assign KOL vào Campaign | Tích hợp với campaigns đã có |
| 🔥 P1 | Revenue Dashboard (tổng hợp) | Show business value |
| 🟡 P2 | Affiliate Link + Tuyển dụng Talent | Cần backend support |
| 🟡 P2 | Availability Calendar | UX nice-to-have |
| 🟢 P3 | Network Tree (D3.js) | Complex, dùng sau |
| 🟢 P3 | Agency Package (gộp KOL) | Future feature |

---

## 7. 🛣️ Route đề xuất

```
/brand/my-talents          → Trang chính Talent Manager
/brand/my-talents/revenue  → sub-tab Doanh thu & Affiliate
```

---

> **Các quyết định đã thống nhất thiết kế:**
> 1. **Manager là ai?** Brand Account đóng vai trò là Manager luôn, quản lý trực tiếp roster của mình.
> 2. **Tỷ lệ hoa hồng F1 của Brand/Manager là bao nhiêu %?** Mặc định là 10% từ các booking thực hiện bởi KOL trong roster.
> 3. **KOL có cần "chấp nhận" khi được thêm vào Roster không?** Có, lời mời được gửi từ Brand và KOL cần bấm chấp nhận bên trang Roster của tôi (`/talent/roster`) để liên kết chính thức.
> 4. **MVP có cần Network Tree không?** Chưa cần vẽ biểu đồ phức tạp ở MVP, chỉ cần thống kê số lượng và doanh thu ở dạng bảng/card đơn giản.
