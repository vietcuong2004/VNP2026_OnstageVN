# 👑 OnstageVN — Nền tảng Quản trị & Kết nối Tài năng Giải trí 4.0

**OnstageVN** là hệ sinh thái vòng đời (Lifecycle Ecosystem) đồng hành cùng các thí sinh, người mẫu và nghệ sĩ trong ngành sắc đẹp - giải trí từ bước khởi đầu cho đến khi tỏa sáng và khai thác thương mại bền vững.

Hệ thống số hóa quy trình quản trị, tự động chấm điểm xếp hạng tài năng (Talent Tiering), và tạo kênh kết nối trực tiếp (Match-making) giữa nhãn hàng (Brands) và người đẹp bằng các hợp đồng đặt cọc an toàn (Escrow Payment).

## Link deploy UI web: 
https://onstagevn.vercel.app/
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
│   ├── brand/             # Portal dành cho Nhãn hàng & Agency (Brand Portal)
│   │   ├── dashboard/     # Bảng điều khiển phân tích tổng quan
│   │   ├── search/        # Tìm kiếm, lọc và phân loại tài năng (Hạng S/A/B/C)
│   │   ├── talents/       # Trang chi tiết tài năng, xem hồ sơ, chat trực tiếp, thêm vào chiến dịch
│   │   ├── campaigns/     # Quản lý chiến dịch tuyển chọn & booking của brand
│   │   ├── shortlists/    # Danh sách lưu trữ tài năng theo phân hạng Hạng S/A/B/C
│   │   ├── messages/      # Kênh chat trao đổi trực tiếp với Talent
│   │   └── notifications/ # Nhận thông báo hoạt động của nhãn hàng
│   ├── talent/            # Portal dành cho Thí sinh & Người mẫu (giao diện chính)
│   │   ├── dashboard/     # Bảng điều khiển phân tích số liệu
│   │   ├── onboarding/    # Bộ câu hỏi khảo sát & Thiết lập hồ sơ số
│   │   ├── portfolio/     # Trang hồ sơ điện tử công khai (PersonalInfoTab.tsx)
│   │   ├── jobs/          # Sàn nhận việc và ứng tuyển chiến dịch nhãn hàng
│   │   └── crownfunding/  # Trang gây quỹ dự án nhân ái (Quỹ Vương Miện)
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
   *Truy cập [http://localhost:3001](http://localhost:3001) trên trình duyệt để kiểm tra.*

## 🌐 Hướng Dẫn Deploy & Vận Hành Hệ Thống

Dự án hỗ trợ chạy song song hai môi trường độc lập hoàn toàn để đảm bảo an toàn dữ liệu và thuận tiện trong quá trình phát triển:

### 1. Môi trường Test/Staging (Vercel — Nhánh `dev`)
* **Mục đích:** Dành cho lập trình viên kiểm tra giao diện và tính năng mới trên các thiết bị khác nhau (như điện thoại) trước khi merge lên production.
* **Link ứng dụng:** [https://onstagevn.vercel.app/](https://onstagevn.vercel.app/)
* **Nhánh deploy:** `dev` (Vercel tự động build và cập nhật mỗi khi có code mới push lên nhánh `dev`).
* **Cơ chế hoạt động:**
  * Frontend trên Vercel gọi API dev thông qua URL Cloudflare Tunnel trỏ thẳng về máy tính cá nhân của lập trình viên (dữ liệu test local, không ảnh hưởng tới database thật).
  * Chi tiết cách cấu hình và chạy xem ở mục: **[HƯỚNG DẪN TEST REAL-TIME TRÊN ĐIỆN THOẠI](#-huong-dan-test-real-time-tren-dien-thoai-qua-cloudflare-tunnel)**.

### 2. Môi trường Production (Server riêng — Nhánh `main`)
* **Mục đích:** Bản chạy chính thức ổn định dành cho khách hàng thật sử dụng.
* **Link ứng dụng:** [https://onstage.vn](https://onstage.vn)
* **Link API:** `https://onstage.vn/api`
* **Nhánh deploy:** `main` (Deploy thủ công bằng script Deployer từ máy local của lập trình viên).
* **Hạ tầng:** VPS Ubuntu `118.70.132.119` (cổng `4522`), tiến trình quản lý bằng PM2 (`onstage-web`) và proxy ngược qua Nginx.

---

## ⚡ Quy Trình Deploy Lên Production (Nhánh `main`)

Sau khi code đã được kiểm tra chạy ổn định trên nhánh `dev`, thực hiện các bước sau để deploy lên server chạy thật:

### Bước 1 — Merge code dev vào main và push lên Git:
```bash
git checkout main
git merge dev
git push origin main
```

### Bước 2 — Chạy Deployer script từ local (Khuyên dùng):
Chạy lệnh deploy từ thư mục `deploy/` trên máy tính local của bạn (yêu cầu máy có cài sẵn PHP và Composer):
```bash
cd C:\CONG_VIEC\VNP_OnstageVN\deploy

# Cài đặt Deployer lần đầu (chỉ cần chạy 1 lần):
composer install

| Host | `118.70.132.119` |
| Port SSH | `4522` |
| User | `ssh_code` |
| Nhánh deploy | `main` |
| Thư mục gốc | `/var/www/manager-kol-model/web-main` |
| Code chạy tại | `/var/www/manager-kol-model/web-main/current` |
| URL production | `https://onstage.vn` |
| Node.js (trên server) | v22.22.3 (qua NVM) |

---

### 🔧 Cách 2 — Thủ Công qua SSH

Dùng khi cần can thiệp trực tiếp vào server.

**Bước 1 — Push code lên GitLab trước:**
```bash
git add .
git commit -m "feat: mô tả thay đổi"
git push origin main
```

**Bước 2 — SSH vào server:**
```bash
ssh ssh_code@118.70.132.119 -p 4522
```

**Bước 3 — Đến thư mục code:**
```bash
cd /var/www/manager-kol-model/web-main/current
```

**Bước 4 — Kéo code mới:**
```bash
git pull origin main
```

**Bước 5 — Cài đặt thư viện (nếu có thay đổi `package.json`):**
```bash
nvm use 22
npm install
```

**Bước 6 — Build lại Next.js:**
```bash
npm run build
```

**Bước 7 — Khởi động lại PM2:**
```bash
# Nếu PM2 chưa chạy (lần đầu):
pm2 start pm2.yml

# Nếu đã chạy rồi (cập nhật):
pm2 flush
pm2 restart pm2.yml
```

---

### 📋 Cấu Hình PM2 (`pm2.yml`)

```yaml
apps:
  - name: 'onstage-web'
    script: 'npm'
    args: 'start'
    instances: 1
    exec_mode: fork
    cwd: /var/www/manager-kol-model/web-main/current
    autorestart: true
    restart_delay: 30000
    log_date_format: MM.DD.HH.mm
```

### 🌍 Biến Môi Trường Production (`.env`)

```env
NEXT_PUBLIC_API_URL=https://onstage.vn/api
```

> **Lưu ý:** File `.env` production được upload tự động lên server bởi Deployer (từ `deploy/domains/onstage.vn/stages/frontend-server-local-45/.env`). Không commit file này lên Git.
