# 👑 VNP BeautyTalent — Nền tảng Quản trị & Kết nối Tài năng Giải trí 4.0

**VNP BeautyTalent** là hệ sinh thái vòng đời (Lifecycle Ecosystem) đồng hành cùng các thí sinh, người mẫu và nghệ sĩ trong ngành sắc đẹp - giải trí từ bước khởi đầu cho đến khi tỏa sáng và khai thác thương mại bền vững.

Hệ thống số hóa quy trình quản trị, tự động chấm điểm xếp hạng tài năng (Talent Tiering), và tạo kênh kết nối trực tiếp (Match-making) giữa nhãn hàng (Brands) và người đẹp bằng các hợp đồng đặt cọc an toàn (Escrow Payment).

## Link deploy UI web: 
https://vnp-beuty-talent-cuong.vercel.app
---

## 💎 Các Giai Đoạn Vòng Đời Hệ Thống (Lifecycle Phases)

1. **Giai đoạn trước cuộc thi (Pre-Pageant / Incubation)**
   * **Khảo sát định hướng AI:** Hệ thống tích hợp bộ câu hỏi trắc nghiệm có trọng số (30 câu hỏi) để định hướng hướng đi tối ưu cho Talent (Hoa hậu/Hoa khôi, Người mẫu sàn diễn, KOL/Lookbook).
   * **Marketplace Dịch vụ phụ trợ (B2B):** Kết nối thí sinh với các đối tác thiết kế trang phục, makeup, học viện đào tạo catwalk và kỹ năng ứng xử.
   * **Tài trợ sớm:** Cho phép nhãn hàng phát hiện và tài trợ cho các gương mặt triển vọng ngay từ giai đoạn đăng ký.

2. **Giai đoạn trong cuộc thi (In-Pageant / Acceleration)**
   * **Quản trị truyền thông số:** Đề xuất kịch bản và kế hoạch đăng bài tự động trên TikTok, Instagram, Facebook giúp tối ưu hóa hình ảnh.
   * **Hệ thống giám sát (QC & Analytics):** Đo lường thời gian thực (Real-time) các chỉ số tăng trưởng tương tác và lượt theo dõi của thí sinh.

3. **Giai đoạn sau cuộc thi (Post-Pageant / Monetization)**
   * **Hệ thống Booking Tự động (Smart Booking Engine):** Nhãn hàng đăng chiến dịch, hệ thống sử dụng thuật toán AI tự động đối sánh và trả về danh sách các Talent phù hợp.
   * **Đặt cọc bảo vệ dòng tiền (Escrow):** Tự động khóa tiền cọc thanh toán để bảo đảm quyền lợi đôi bên, tránh các rủi ro bùng show/bùng tiền.

4. **Quỹ Vương Miện (Crown Funding & Voting)**
   * **Gây quỹ nhân ái:** Nơi fan hâm mộ và doanh nghiệp có thể trực tiếp quyên góp ngân sách cho các dự án cộng đồng/xã hội của thí sinh.
   * **Cổng bình chọn trực tuyến:** Cung cấp giải pháp voting thời gian thực và chia sẻ doanh thu tự động giữa ban tổ chức cuộc thi và nền tảng.

---

## ⚙️ Các Mô-đun Kiến Trúc Cốt Lõi (Architectural Modules)

### 📈 Talent Tiering Engine
Hệ thống Backend chấm điểm dựa trên hệ số 100 điểm với 10 tiêu chí (Hình thể, Danh hiệu, Social Metrics, Học vấn, Kỹ năng, Uy tín, ROI,...) và tự động xếp Talent vào 4 hạng (Tier):
* **HẠNG S (Celeb / Super VIP) [90 - 100đ]:** Hoa hậu Quốc gia, Ngôi sao hạng A+.
* **HẠNG A (High-end Professional) [70 - 89đ]:** Á hậu, Người mẫu sàn diễn chuyên nghiệp, MC song ngữ cao cấp.
* **HẠNG B (Mid-range / Freelance) [45 - 69đ]:** Mẫu ảnh lookbook, KOC/KOL nổi bật.
* **HẠNG C (Entry-level / Newbie) [20 - 44đ]:** Mẫu tự do, PG sự kiện, Talent mới vào nghề.

### 🤝 AI Match-Making B2B
Thuật toán AI tự động lọc và đề xuất danh sách Talent dựa trên tiêu chí chiến dịch của Nhãn hàng (Chiều cao, độ tuổi, định hướng, rating, độ phủ mảng xã hội) giúp tối ưu hóa tỷ lệ chuyển đổi ROI.

### 🔒 Escrow Payment System
Ngân sách thanh toán của nhãn hàng được chuyển vào ví trung gian khóa tạm thời. Tiền được tự động giải ngân cho Talent sau 24h khi có xác nhận nghiệm thu hoặc khi hết thời gian khiếu nại. Trường hợp có tranh chấp, admin hệ thống sẽ đóng vai trò trọng tài xử lý.

---

## 🛠️ Công Nghệ Phát Triển (Technology Stack)

* **Framework:** Next.js (App Router v16)
* **Ngôn ngữ:** TypeScript
* **Styling:** Tailwind CSS + shadcn/ui
* **Thư viện icon:** Lucide React
* **Thiết kế UI/UX:** Phong cách **Luxury Tech / Beauty SaaS / Futuristic Minimalist** (giao diện nền tối sâu, glassmorphic panel bóng bẩy, viền vàng kim, tím và lam neon thời thượng).

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
├── app/
│   ├── admin/             # Portal dành cho Ban quản trị hệ thống
│   ├── brand/             # Portal dành cho Nhãn hàng & Agency
│   ├── talent/            # Portal dành cho Thí sinh & Người mẫu (giao diện chính)
│   │   ├── dashboard/     # Bảng điều khiển phân tích số liệu
│   │   ├── onboarding/    # Bộ câu hỏi khảo sát & Thiết lập hồ sơ số
│   │   ├── portfolio/     # Trang hồ sơ điện tử công khai
│   │   ├── jobs/          # Sàn nhận việc và ứng tuyển chiến dịch nhãn hàng
│   │   └── crown/         # Trang gây quỹ dự án nhân ái (Quỹ Vương Miện)
│   ├── layout.tsx         # Khung giao diện responsive chung (Sidebar & Bottom Navigation)
│   └── globals.css        # Cấu hình màu sắc, glassmorphism & style tokens
├── components/            # Các component dùng chung (BottomNavigation, OnboardingForm...)
└── docs/                  # Tài liệu thiết kế hệ thống và giao diện UI
```

---

## 🚀 Hướng Dẫn Vận Hành & Quản Lý Dự Án

### 💻 Chạy Dự Án Dưới Local

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

2. **Chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   *Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt để kiểm tra.*

3. **Xây dựng phiên bản Production:**
   ```bash
   npm run build
   ```

---

## 🌐 Quản lý CI/CD & Deploy trên Vercel

Dự án được thiết lập quy trình tích hợp và triển khai liên tục (CI/CD) tự động hóa thông qua liên kết giữa repository GitHub và tài khoản Vercel.

* **Link quản lý dự án trên Vercel:** [VNP 2026 Beauty Talent Deployment](https://vercel.com/vietcuong2004s-projects/vnp-2026-beuty-talent)
* **Luồng hoạt động CI/CD:**
  1. Khi nhà phát triển đẩy (push) code mới lên nhánh phát triển/nhánh chính (`cuong` hoặc `main`) trên GitHub.
  2. Vercel sẽ tự động phát hiện thay đổi và kích hoạt tiến trình build kiểm tra lỗi TypeScript/Next.js.
  3. Nếu quá trình kiểm tra thành công, bản dựng mới nhất sẽ tự động được deploy lên môi trường live (môi trường sản phẩm hoặc preview) trong vòng dưới 1 phút.
  4. Trạng thái build và log chi tiết có thể được quản lý trực tiếp trên dashboard của link Vercel phía trên.
