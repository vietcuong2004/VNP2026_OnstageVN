# Hướng Dẫn Thiết Lập Backend Dev Chạy 24/7 trên VPS (Hướng B)
### 1 Repo Git Duy Nhất — Deploy 2 Nhánh Khác Nhau Trên VPS

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường **Backend Dev chạy 24/7 trên VPS** từ cùng một Repository Git duy nhất của backend, giúp tách biệt hoàn toàn cơ sở dữ liệu thử nghiệm và cơ sở dữ liệu thật (Production) mà không làm phức tạp hóa quy trình quản lý code của nhóm phát triển.

---

## 🗺️ Ý Tưởng Hoạt Động

* **Tại máy local của các Dev:** Bạn và dev kia vẫn code chung trên **1 Repository Backend duy nhất**, chia làm 2 nhánh Git:
  * Nhánh `dev`: Chứa các tính năng đang phát triển, thử nghiệm.
  * Nhánh `main`: Chứa code chạy ổn định đã được kiểm duyệt.
* **Tại server VPS (`118.70.132.119`):** Chúng ta sẽ tạo ra 2 thư mục chạy độc lập từ cùng repo Git này:
  * Thư mục `/var/www/manager-kol-model/api-admin/current` (Production): Chạy code nhánh `main` (cổng `8080`).
  * Thư mục `/var/www/manager-kol-model/api-dev` (Dev/Staging): Chạy code nhánh `dev` (cổng `8090`).

---

## 🛠️ BƯỚC 1: THIẾT LẬP THƯ MỤC BACKEND DEV TRÊN VPS (Chỉ làm 1 lần duy nhất)

SSH vào server VPS của bạn: `ssh ssh_code@118.70.132.119 -p 4522`. Sau đó thực hiện các bước sau:

1. **Clone repo backend về thư mục dev riêng biệt:**
   ```bash
   cd /var/www/manager-kol-model
   git clone git@gitlab.com:vnp-ai-first/backend.git api-dev
   ```

2. **Di chuyển vào thư mục dev mới tạo và chuyển sang nhánh `dev`:**
   ```bash
   cd api-dev
   git checkout dev
   ```

3. **Tạo file cấu hình môi trường `.env` cho bản Dev:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Chỉnh sửa các dòng cấu hình cổng mạng và tên dự án trong `.env` để tránh xung đột với bản Production:*
   ```env
   # 1. Đặt tên project Docker riêng để cô lập Database dev
   COMPOSE_PROJECT_NAME=api-manager-kols-dev

   # 2. Đổi cổng HTTP Web sang 8090 (Production đang dùng 8080)
   APP_HTTP_PORT=8090

   # 3. Đổi cổng kết nối Database ngoài sang 33063 (Production đang dùng 33062)
   DB_FORWARD_PORT=33063

   # 4. Đổi tên Database Dev (Ví dụ thêm chữ _dev ở cuối)
   DB_DATABASE=api_manager_kols_dev
   ```
   *(Bấm `Ctrl + O` $\rightarrow$ `Enter` để lưu, và `Ctrl + X` để thoát).*

4. **Khởi chạy Docker Compose cho bản Dev:**
   ```bash
   docker compose up -d --build
   ```

5. **Sinh App Key, chạy database migration và nạp dữ liệu test cho bản Dev:**
   ```bash
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate --force
   docker compose exec app php artisan db:seed --force
   ```
   *Lúc này, Backend Dev chạy độc lập trên cổng `8090` của VPS đã sẵn sàng.*

---

## 🌐 BƯỚC 2: CẤU HÌNH CLOUDFLARE TUNNEL CHẠY NGẦM 24/7 QUA PM2

Để bản frontend dev trên Vercel có thể gọi được API cổng `8090` trên server dưới dạng HTTPS (không cần sếp cấp subdomain Cloudflare):

1. **Khởi chạy Tunnel chạy ngầm thông qua PM2:**
   Chạy lệnh sau trên terminal server:
   ```bash
   pm2 start "/home/ssh_code/cloudflared tunnel --url http://localhost:8090" --name "cf-tunnel-dev"
   ```
   *PM2 sẽ tự động duy trì đường hầm này hoạt động 24/7 kể cả khi bạn ngắt kết nối SSH.*

2. **Lấy URL Tunnel được sinh ra:**
   Chạy lệnh xem log của PM2:
   ```bash
   pm2 logs cf-tunnel-dev --lines 50
   ```
   Tìm dòng log dạng:
   > `Your quick Tunnel has been created! Visit it at: https://[your-dev-domain].trycloudflare.com`
   
   Hãy copy đường dẫn `https://[your-dev-domain].trycloudflare.com` này.

3. **Cập nhật URL Tunnel mới vào file `.env` dev trên VPS:**
   ```bash
   nano /var/www/manager-kol-model/api-dev/.env
   ```
   Sửa dòng `APP_URL`:
   ```env
   APP_URL=https://[your-dev-domain].trycloudflare.com
   ```
   *Khởi động lại docker dev và clear cache:*
   ```bash
   docker compose up -d --force-recreate app nginx
   docker compose exec app php artisan optimize:clear
   docker compose exec app php artisan opcache:clear
   ```

4. **Cập nhật lên Vercel Settings:**
   * Vào **Vercel Settings** -> **Environment Variables**.
   * Cập nhật biến **`NEXT_PUBLIC_API_URL`** với giá trị là: `https://[your-dev-domain].trycloudflare.com/api` (phải có `/api` ở cuối).
   * Bấm **Save**.
   * Push commit trống ở nhánh `dev` từ máy local để Vercel build lại.

---

## 🔄 BƯỚC 3: QUY TRÌNH PHÁT TRIỂN & DEPLOY HÀNG NGÀY CHO DEV

Từ những lần sau, khi bạn và dev kia làm việc, quy trình code và deploy sẽ diễn ra như sau:

### 1. Khi viết code tính năng mới:
* Cả hai dev đều làm việc trên nhánh `dev`.
* Khi sửa giao diện frontend: commit và push lên nhánh `dev` của frontend $\rightarrow$ Vercel tự động deploy lên `onstagevn.vercel.app`.
* Khi sửa logic backend: commit và push lên nhánh `dev` của backend.

### 2. Khi muốn cập nhật code Backend Dev mới lên VPS:
Khi có tính năng backend mới trên nhánh `dev` cần đưa lên server test:
1. SSH vào server: `ssh ssh_code@118.70.132.119 -p 4522`.
2. Di chuyển vào thư mục backend dev:
   ```bash
   cd /var/www/manager-kol-model/api-dev
   ```
3. Kéo code dev mới nhất về:
   ```bash
   git pull origin dev
   ```
4. Nếu có file cấu hình hoặc Dockerfile thay đổi, build lại container:
   ```bash
   docker compose up -d --build
   ```
5. Chạy database migration (nếu tính năng mới có thêm bảng/cột database):
   ```bash
   docker compose exec app php artisan migrate --force
   ```
6. Clear cache Laravel Dev:
   ```bash
   docker compose exec app php artisan optimize:clear
   docker compose exec app php artisan opcache:clear
   ```

### 3. Khi merge lên Production (Chạy thật):
Sau khi test mọi thứ trên trang `onstagevn.vercel.app` đã chạy mượt mà:
1. Merge nhánh `dev` sang `main` trên cả Frontend và Backend.
2. Deploy frontend main lên server qua script Deployer (`./vendor/bin/dep deploy...`).
3. Kéo code backend main mới nhất về thư mục production (`/var/www/manager-kol-model/api-admin/current`) và chạy migration cho database production.
