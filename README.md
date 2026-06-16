# 👑 VNP BeautyTalent — Nền tảng Quản trị & Kết nối Tài năng Giải trí 4.0

**VNP BeautyTalent** là hệ sinh thái vòng đời (Lifecycle Ecosystem) đồng hành cùng các thí sinh, người mẫu và nghệ sĩ trong ngành sắc đẹp - giải trí từ bước khởi đầu cho đến khi tỏa sáng và khai thác thương mại bền vững.

Hệ thống số hóa quy trình quản trị, tự động chấm điểm xếp hạng tài năng (Talent Tiering), và tạo kênh kết nối trực tiếp (Match-making) giữa nhãn hàng (Brands) và người đẹp bằng các hợp đồng đặt cọc an toàn (Escrow Payment).

## Link deploy UI web: 
https://vnp-2026-beuty-talent.vercel.app/
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
## 💻 Hướng dẫn cập nhật code mới (push code lên main rồi chạy các lệnh dưới đây)
### Cách nhanh:
**1. Truy cập vào server:**
```bash
ssh ssh_code@118.70.132.119 -p 4522
```
**2. Truy cập thư mục code trên server:**
```bash
cd /var/www/manager-kol-model/web-main/current
```

**3.Chạy script:**
```bash
./deploy.sh
```

### Cách thủ công:
**1. Truy cập vào server:**
```bash
ssh ssh_code@118.70.132.119 -p 4522
```
**2. Truy cập thư mục code trên server:**
```bash
cd /var/www/manager-kol-model/web-main/current
```

**3. Kéo code mới nhất từ nhánh main trên GitHub về server:**
```bash
git pull origin main
```

**4. Cài đặt thư viện mới (nếu có cập nhật package.json):**
```bash
npm install
```

**5. Xây dựng (Build) lại dự án Next.js:**
```bash
npm run build
```

### 5. Khởi động lại tiến trình PM2 để áp dụng code mới
```bash
pm2 restart onstage-web --update-env
```

## 🌐 Hướng Dẫn Deploy & Vận Hành Hệ Thống

Dự án hỗ trợ song song hai môi trường triển khai:

### 1. Triển khai Preview/UI trên Vercel (Môi trường test nhanh)
Quy trình tích hợp và triển khai liên tục (CI/CD) tự động hóa thông qua liên kết giữa repository GitHub và tài khoản Vercel.
* **Link quản lý dự án trên Vercel:** [VNP 2026 Beauty Talent Deployment](https://vercel.com/vietcuong2004s-projects/vnp-2026-beuty-talent)
* **Link ứng dụng Vercel:** [https://vnp-2026-beuty-talent.vercel.app/](https://vnp-2026-beuty-talent.vercel.app/)
* **Luồng hoạt động:**
  1. Khi đẩy (push) code mới lên nhánh chính (`cuong` hoặc `main`) trên GitHub.
  2. Vercel tự động phát hiện, chạy tiến trình build và kiểm tra lỗi Next.js/TypeScript.
  3. Bản dựng mới sẽ tự động cập nhật lên link môi trường live trong vòng dưới 1 phút.

### 2. Triển khai Production trên Server riêng (Self-Hosted VPS với PM2 & Nginx)
Ứng dụng chính thức chạy trên máy chủ VPS tự quản lý, cấu hình tại tên miền: **[https://onstage.freeroute.store/](https://onstage.freeroute.store/)**

#### 📄 Các File Cấu Hình Quan Trọng
* **`pm2.yml`**: Định nghĩa tiến trình PM2 chạy Next.js (tên tiến trình: `onstage-web`, chạy ở `fork` mode).
* **`.env.production`**: Cấu hình địa chỉ API Backend Production:
  ```env
  NEXT_PUBLIC_API_URL=https://onstage.freeroute.store/api
  ```

#### 🛠️ Các Bước Triển Khai trên VPS
Khi SSH vào máy chủ VPS (`ssh ssh_code@118.70.132.119 -p 4522`), thực hiện các bước sau để cập nhật ứng dụng:

1. **Truy cập thư mục chứa mã nguồn:**
   ```bash
   cd /var/www/manager-kol-model/web-main/current
   ```
2. **Cập nhật mã nguồn mới nhất:**
   ```bash
   git pull origin dev # Hoặc main tùy thuộc vào nhánh deploy
   ```
3. **Cài đặt thư viện & chuẩn bị Node.js:**
   * *Yêu cầu*: Node.js >= v20.9.0 (Có thể dùng NVM: `nvm use 20` để nâng cấp/chuyển đổi phiên bản).
   ```bash
   npm install
   ```
4. **Build ứng dụng:**
   ```bash
   npm run build
   ```
5. **Khởi chạy hoặc khởi động lại bằng PM2:**
   * Nếu khởi chạy lần đầu:
     ```bash
     npm install -g pm2
     pm2 start pm2.yml
     ```
   * Nếu cập nhật phiên bản mới:
     ```bash
     pm2 restart onstage-web --update-env
     ```

#### 🔀 Cấu Hình Nginx Reverse Proxy (Tham khảo)
Để ánh xạ tên miền `onstage.freeroute.store` vào cổng `3000` của Next.js, sử dụng cấu hình block server sau:
```nginx
server {
    listen 80;
    server_name onstage.freeroute.store;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Lệnh deploy:
./vendor/bin/dep deploy:onstage.vn onstage.vn:frontend-server-local-45 -vvv

---

## 🚀 Quy Trình Deploy Sau Khi Sửa Code

Sau khi chỉnh sửa code frontend, có **2 cách** để deploy lên server production (`onstage.vn`):

---

### ⚡ Cách 1 — Tự Động bằng Deployer (Khuyến nghị)

Hệ thống sử dụng [Deployer PHP](https://deployer.org/) để tự động hoá toàn bộ quy trình.

> **Yêu cầu trước:** Có PHP cài sẵn trên máy local & đã clone repo `deploy` về máy.

**Bước 1 — Push code lên nhánh `main` (GitLab):**
```bash
git add .
git commit -m "feat: mô tả thay đổi"
git push origin main
```

**Bước 2 — Chạy lệnh deploy từ thư mục `deploy/` trên máy local:**
```bash
cd C:\CONG_VIEC\VNP_OnstageVN\deploy

# Cài đặt Deployer lần đầu (chỉ cần chạy 1 lần):
composer install

# Deploy lên server production:
./vendor/bin/dep deploy:onstage.vn onstage.vn:frontend-server-local-45 -vvv
```

**Những gì Deployer tự động làm:**

| Bước | Mô tả |
|------|--------|
| `deploy:update_code` | Pull code mới nhất từ nhánh `main` trên GitLab |
| `upload` | Upload file `.env` và `pm2.yml` lên server |
| `npm:frontend` | Chạy `npm install && npm run build` (dùng Node.js v22 qua NVM) |
| `deploy:symlink` | Symlink `current/` sang release mới |
| `pm2:restart` | Chạy `pm2 flush && pm2 restart pm2.yml` để áp dụng code mới |

**Thông tin server (được cấu hình sẵn trong `deploy/`):**

| Thông số | Giá trị |
|----------|---------|
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
