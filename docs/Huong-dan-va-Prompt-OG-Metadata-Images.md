# 🎨 Hướng Dẫn & Bộ Prompt Tạo Ảnh Preview (Open Graph / Metadata Images)

Tài liệu này lưu trữ đầy đủ bộ **Prompt gen ảnh bằng ChatGPT (DALL-E 3)** cho **tất cả các mục trên Sidebar** của hệ thống **Onstage VN**.

---

## 💎 1. Bộ Quy Chuẩn Thiết Kế & Nhận Diện (Brand Aesthetics)

> **Mục tiêu:** Ảnh nhìn vào là **hiểu ngay tính năng/nội dung trang**, hình tượng trực quan, sinh động.
> 
> **Phong cách:** Hiện đại, sáng sủa, thời trang & giải trí cao cấp (High-end Fashion & KOL Platform).

### 🎨 Bảng màu chuẩn Onstage:
* **70% Trắng sứ & Trắng ngọc trai (Porcelain White / Bright Clean Studio):** Nền chính tinh khôi, tạo cảm giác sạch sẽ, sang trọng chuẩn tạp chí Vogue/sàn diễn thời trang.
* **20% Đỏ Ruby / Đỏ nhung (Velvet Ruby Red):** Nút bấm, dải ruy băng, thẻ trạng thái, icon nổi bật.
* **10% Viền Champagne Gold mảnh (Subtle Gold Trim):** Chỉ viền nhẹ ở các chi tiết kim loại, không lạm dụng để tránh cảm giác casino.

### 📐 Thông số kích thước:
* **Tỷ lệ chuẩn:** **16:9** (hoặc `1200 x 630 px`).
* **Lệnh kích thước cho ChatGPT:** Chọn chế độ **Wide** (`1792 x 1024`).

---

## 📋 2. Trọn Bộ Prompt Cho Toàn Bộ Sidebar (13 Trang)

---

### 🌟 NHÓM 1: KHÁM PHÁ & BOOKING

#### 1. 🔍 Tìm kiếm Idol (`/brand/search`)
* **Ý nghĩa:** Ma trận hàng chục thẻ hồ sơ (profile cards) 3D của các nữ người mẫu, KOL, Idol xinh đẹp với thanh tìm kiếm nổi và tag danh mục.
* **Prompt ChatGPT:**
```text
A vibrant, modern 3D widescreen banner (16:9) showcasing an elite Model & KOL Discovery platform. A dynamic curved gallery wall displaying dozens of glowing, floating glass cards featuring attractive Asian female fashion models, beauty influencers, and idol headshots. In the foreground, a sleek minimalist white search bar floating with a magnifying glass icon and subtle ruby red category filter tags ('KOL', 'Model', 'Livestream'). Bright porcelain-white studio background with soft glowing rim lights and delicate red silk ribbon accents. Clear visual of an idol search directory, 8k resolution, crisp photorealistic details, no distorted text.
```

---

#### 2. 📅 Booking (`/booking`)
* **Ý nghĩa:** Quy trình đặt lịch với Idol — thẻ hồ sơ người mẫu được liên kết với biểu tượng lịch hẹn VIP (Calendar date), bút ký cao cấp và nút "ĐẶT NGAY" màu đỏ.
* **Prompt ChatGPT:**
```text
An ultra-clear, high-end 3D widescreen banner (16:9) illustrating a seamless celebrity and model booking process. In the center, a floating luxury 3D card of a gorgeous Asian fashion model connected via a glowing light beam to an interactive white-and-ruby-red VIP calendar interface with confirmed date marks. A sleek metallic stylus pen rests on a pristine white marble surface beside a glossy ruby red 'Book Now' button pill. Clean, bright pearl-white aesthetic with subtle red velvet ribbon accents. Direct and obvious visual representation of appointment scheduling, photorealistic, 8k, modern UX/UI 3D concept, no gibberish text.
```

---

#### 3. 💼 Cơ hội việc làm (`/talent/jobs`)
* **Ý nghĩa:** Bảng tin việc làm thời trang & giải trí — các thẻ Job tuyển dụng casting người mẫu cho TVC quảng cáo, chụp lookbook, livestream, sự kiện thảm đỏ.
* **Prompt ChatGPT:**
```text
A commercial job opportunities and casting board widescreen banner (16:9). A bright, stylish creative office setup featuring floating 3D Job Cards for fashion casting calls, luxury TVC shoots, brand ambassador roles, and high-paying livestream campaigns. Beside the cards are a stylish film clapperboard and a miniature runway stage icon with glowing salary badges in ruby red. Porcelain white background with soft studio lighting and elegant red satin ribbons. Visually unmistakable representation of career and casting opportunities for models, 8k resolution, photorealistic.
```

---

#### 4. ❤️ Idol đã lưu / Shortlist (`/brand/shortlists`)
* **Ý nghĩa:** Bộ sưu tập yêu thích của nhãn hàng — các thẻ ảnh Idol được đính kèm icon trái tim đỏ 3D phát sáng, xếp gọn gàng trong album VIP.
* **Prompt ChatGPT:**
```text
A high-fashion favorites and talent shortlist collection widescreen banner (16:9). A pristine white gallery table featuring a curated collection of glowing 3D profile cards of top Asian fashion models and KOLs, each adorned with a glossy 3D ruby-red heart bookmark icon floating above it. An open luxury white leather portfolio binder holds selected idol comp-cards. Soft, warm beauty lighting over a clean pearl-white background with graceful red velvet ribbon details. Unmistakable visual of saved favorite talents and bookmarks, 8k resolution, photorealistic.
```

---

#### 5. 📑 Việc làm đã lưu (`/talent/jobs/saved-jobs`)
* **Ý nghĩa:** Danh sách các công việc/chiến dịch mà người mẫu đã bookmark để nộp hồ sơ, đính kèm biểu tượng Bookmark đỏ và hồ sơ CV người mẫu.
* **Prompt ChatGPT:**
```text
A saved jobs and bookmarked casting opportunities widescreen banner (16:9). A pristine white aesthetic desk featuring a neat stack of luxury job contract folders and project briefs, each tagged with a prominent glossy ruby-red 3D bookmark ribbon badge. A digital tablet beside them shows an active checklist of saved audition casting calls. Clean porcelain white environment with soft warm morning light and subtle champagne gold pen details. Clear visual of saved job applications and bookmarks, photorealistic 8k, modern clean composition.
```

---

### 🏢 NHÓM 2: QUẢN LÝ & HỢP TÁC

#### 6. 📋 Yêu cầu của tôi / Quản lý Booking (`/brand/my-bookings`)
* **Ý nghĩa:** Bảng theo dõi tiến độ và trạng thái các yêu cầu đặt lịch (Đã duyệt, Đang chờ, Hoàn thành) với timeline và dấu mộc xác nhận.
* **Prompt ChatGPT:**
```text
A transparent and organized booking management dashboard widescreen banner (16:9). Floating 3D status cards displaying model booking requests with clear progress indicators, green verified checkmarks, and ruby-red 'Confirmed' badge stamps. A sleek digital timeline connects model avatars to scheduled event dates. Pristine porcelain-white background, soft ambient studio lighting, conveying order, transparency, and professional schedule tracking. 8k resolution, high-end 3D UX visualization.
```

---

#### 7. ➕ Tạo Job / Đăng tuyển dụng (`/brand/manage-jobs`)
* **Ý nghĩa:** Form tạo dự án/chiến dịch mới của doanh nghiệp — bảng phác thảo kịch bản TVC, micro phát sóng livestream, tài liệu dự án và nút "Tạo chiến dịch".
* **Prompt ChatGPT:**
```text
An inspiring creative campaign creation and job posting widescreen banner (16:9). A modern creative director workspace with a glowing 3D digital form popping out with a prominent ruby-red 'Create Job' plus icon. Surrounding the form are creative concept sketches, a miniature studio microphone, camera lenses, and a budget allocation briefcase on a glossy white desk. Pure porcelain-white background with clean red accent ribbons, symbolizing launching new commercial campaigns and casting calls. 8k, crisp 3D octane render.
```

---

#### 8. 👥 Quản lý Idol / Danh sách đội ngũ (`/brand/my-talents`)
* **Ý nghĩa:** Quản lý đội ngũ người mẫu và influencer độc quyền của nhãn hàng — nhóm thẻ Idol xếp thành đội ngũ chuyên nghiệp với số liệu hiệu suất.
* **Prompt ChatGPT:**
```text
A talent roster and agency management widescreen banner (16:9). A sleek, elevated white podium showcasing an elite group lineup of 3D cards of diverse Asian fashion models and content creators, connected by subtle golden network lines. Floating KPI badges and star rating badges hover gracefully above the group. Bright, prestigious agency office atmosphere with clean white walls and ruby red trim lines. Clearly represents talent roster management and team agency, 8k resolution, photorealistic.
```

---

#### 9. 🤝 Hợp tác nhãn hàng (`/talent/brands`)
* **Ý nghĩa:** Không gian kết nối đối tác chiến lược giữa các Thương hiệu thời trang/mỹ phẩm lớn và Nghệ sĩ — biểu tượng bắt tay hợp tác và logo thương hiệu.
* **Prompt ChatGPT:**
```text
An exclusive corporate partnership and brand collaboration widescreen banner (16:9). Two stylish executives (a brand manager and a talent agent) shaking hands across a polished white marble conference table. Floating behind them are elegant 3D glass display shields representing luxury cosmetics, fashion apparel, and jewelry brand partnerships, surrounded by smooth ruby red ribbon waves. Bright, prestigious, professional business ambiance on a porcelain white background, 8k resolution, photorealistic.
```

---

### ⚙️ NHÓM 3: TÀI KHOẢN & HỆ THỐNG

#### 10. 👤 Hồ sơ cá nhân / Profile Model (`/talent/profile`)
* **Ý nghĩa:** Bộ hồ sơ comp-card thời trang chuyên nghiệp — ảnh chân dung chất lượng cao, số đo 3 vòng, danh sách kinh nghiệm diễn xuất và huy hiệu vinh danh.
* **Prompt ChatGPT:**
```text
A high-fashion model comp-card and official talent profile widescreen banner (16:9). A glamorous 3D presentation of an open luxury white portfolio folder displaying high-resolution editorial portrait photos of a stunning Asian female model, accompanied by neat statistic badges (height, measurements, skills) and a verified gold badge. Soft beauty lighting, pearl-white backdrop with silky ruby red ribbons draping gracefully. Clear visual representation of a professional model profile and portfolio, 8k resolution, Vogue quality.
```

#### 11. ✨ Đăng ký hồ sơ & Portfolio nhanh (`/talent/survey`)
* **Ý nghĩa:** Cổng đăng ký gia nhập Onstage dành cho Model & Idol — form điền thông tin nhanh, khu vực upload ảnh lookbook/portfolio thời trang sắc nét, thẻ ID nghệ sĩ và nút "Gửi hồ sơ" đỏ ruby.
* **Prompt ChatGPT:**
```text
A sleek, modern 3D widescreen banner (16:9) representing a Fast Talent & Model Onboarding and Portfolio Registration portal. In the center, an interactive floating white-and-ruby-red digital form featuring a quick profile setup: an image upload dropzone with high-resolution fashion model portrait photos snapping into place, a personalized VIP Talent ID badge, and a glowing ruby-red 'Submit Portfolio' button. Pure porcelain-white studio background with soft lighting, delicate curved red ribbons, and subtle champagne gold metallic trims. Crystal-clear visual of registering a model profile and uploading lookbook portfolios, 8k resolution, photorealistic 3D UI render, no gibberish text.
```

#### 12. 📖 Về chúng tôi / Giới thiệu Onstage (`/about`)
* **Ý nghĩa:** Tầm nhìn và sứ mệnh bệ phóng tài năng — cổng vòm Onstage trắng sứ lộng lẫy với dải lụa đỏ uốn lượn và cúp vinh danh nghệ thuật.
* **Prompt ChatGPT:**
```text
An inspiring and artistic luxury gallery widescreen banner (16:9). A magnificent grand arch structure sculpted from pure white porcelain and frosted glass, accented by sweeping ruby-red silk ribbons flowing through the air. In the center, a warm, clean spotlight illuminates the Onstage trophy pedestal. Serene, visionary, and elegant high-fashion agency heritage, bright studio lighting, photorealistic 8k render, no text.
```

#### 13. ⚙️ Cài đặt hệ thống (`/settings`)
* **Ý nghĩa:** Trung tâm thiết lập tài khoản & bảo mật — các bánh răng cơ khí kim loại trắng-đỏ sang trọng, ổ khóa bảo mật VIP và công tắc tùy chỉnh giao diện.
* **Prompt ChatGPT:**
```text
A sleek, modern account settings and security console widescreen banner (16:9). A floating minimalist white control panel with polished white ceramic and ruby-red toggle switches, subtle champagne-gold micro gears, and a glowing shield lock icon in the center. Pure white background with soft ambient shadows, conveying privacy, customizable preferences, and system management. Clean, high-tech, luxury minimalism, 8k render, no clutter.
```

---

## 🛠️ 3. Đường Dẫn File Sau Khi Tải Ảnh Về

Sau khi gen xong ảnh, bạn đổi tên thành `opengraph-image.png` và đặt vào đúng thư mục tương ứng trong dự án:

| Tên mục Sidebar | Đường dẫn trang | Thư mục đặt file ảnh `opengraph-image.png` |
| :--- | :--- | :--- |
| **Tìm kiếm Idol** | `/brand/search` | `frontend/app/brand/search/opengraph-image.png` |
| **Booking** | `/booking` | `frontend/app/booking/opengraph-image.png` |
| **Cơ hội việc làm** | `/talent/jobs` | `frontend/app/talent/jobs/opengraph-image.png` |
| **Idol đã lưu** | `/brand/shortlists` | `frontend/app/brand/shortlists/opengraph-image.png` |
| **Việc làm đã lưu** | `/talent/jobs/saved-jobs` | `frontend/app/talent/jobs/saved-jobs/opengraph-image.png` |
| **Yêu cầu của tôi** | `/brand/my-bookings` | `frontend/app/brand/my-bookings/opengraph-image.png` |
| **Tạo Job** | `/brand/manage-jobs` | `frontend/app/brand/manage-jobs/opengraph-image.png` |
| **Quản lý Idol** | `/brand/my-talents` | `frontend/app/brand/my-talents/opengraph-image.png` |
| **Hợp tác** | `/talent/brands` | `frontend/app/talent/brands/opengraph-image.png` |
| **Hồ sơ cá nhân** | `/talent/profile` | `frontend/app/talent/profile/opengraph-image.png` |
| **Khảo sát** | `/talent/survey` | `frontend/app/talent/survey/opengraph-image.png` |
| **Về chúng tôi** | `/about` | `frontend/app/about/opengraph-image.png` |
| **Cài đặt** | `/settings` | `frontend/app/settings/opengraph-image.png` |
| **Trang chủ** | `/` | `frontend/app/opengraph-image.png` |
