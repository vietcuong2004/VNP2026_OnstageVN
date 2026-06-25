# Kế hoạch và Hướng dẫn Deploy Nhánh Dev (Hướng B - Dữ liệu độc lập)

Tài liệu này hướng dẫn chi tiết từng bước cấu hình để deploy song song nhánh `dev` của frontend lên Vercel (`https://vnp-2026-beuty-talent.vercel.app/` hoặc `onstagevn.vercel.app`) và kết nối độc lập với cơ sở dữ liệu Test/Dev trên server `118.70.132.119`.

---

## BƯỚC 1: CẤU HÌNH TRÊN VERCEL DASHBOARD

### A. Gán nhánh `dev` cho Domain Vercel
1. Truy cập vào **Vercel Dashboard** -> Chọn dự án của bạn (ví dụ: `vnp-2026-onstagevn` hoặc `vnp-2026-beuty-talent`).
2. Vào tab **Settings** (ở thanh menu ngang phía trên) -> Chọn mục **Domains** ở menu bên trái.
3. Tìm domain chính của dự án (ví dụ `onstagevn.vercel.app` hoặc `vnp-2026-beuty-talent.vercel.app`) và bấm nút **Edit**.
4. Tại dòng **Connect to an environment**:
   * Click vào ô đang chọn **`Production`** và chuyển nó thành **`Preview`**.
5. Ngay lập tức một ô nhập liệu mới tên là **`Git Branch`** sẽ xuất hiện bên dưới:
   * Hãy nhập tên nhánh: **`dev`**
6. Click nút **`Save`** màu đen để lưu cấu hình.
   * *Từ bây giờ, domain này sẽ luôn trỏ về bản deploy mới nhất của nhánh `dev` mỗi khi bạn push code lên GitHub.*

### B. Cấu hình biến môi trường API Dev
1. Vẫn ở trang **Settings** của dự án trên Vercel -> Chọn mục **Environment Variables** ở menu bên trái.
2. Thêm một biến mới với cấu hình như sau:
   * **Key:** `NEXT_PUBLIC_API_URL`
   * **Value:** `https://api-dev.onstage.vn/api`
3. Tích chọn áp dụng cho cả 3 môi trường: **Production**, **Preview**, và **Development**.
4. Nhấn **Save**.

### C. Build lại (Redeploy) để Next.js nhận API URL mới
1. Chuyển sang tab **Deployments** (ở thanh menu ngang phía trên Vercel).
2. Tìm bản deploy mới nhất của nhánh `dev`.
3. Bấm vào biểu tượng **dấu 3 chấm** ở bên phải bản deploy đó -> Chọn **Redeploy**.
4. Chờ Vercel build xong (khoảng 1-2 phút) để cập nhật code client-side với API URL mới.

---

## BƯỚC 2: CẤU HÌNH DNS SUBDOMAIN TRÊN CLOUDFLARE

Để domain của bạn kết nối được tới VPS của bạn, bạn cần tạo subdomain trỏ về IP của server:

1. Đăng nhập vào trình quản lý DNS của domain `onstage.vn` (ví dụ trên Cloudflare).
2. Thêm một bản ghi (Record) mới:
   * **Type (Loại):** `A`
   * **Name (Tên):** `api-dev`
   * **IPv4 address:** `118.70.132.119`
   * **Proxy status:** Bật đám mây màu cam (**`Proxied`**). 
     * *Lưu ý: Việc bật Proxied giúp Cloudflare tự động xử lý chứng chỉ bảo mật SSL (HTTPS) cho subdomain `api-dev.onstage.vn` của bạn, tránh lỗi chặn kết nối không an toàn.*

---

## BƯỚC 3: CẤU HÌNH NGINX PROXY TRÊN SERVER (118.70.132.119)

Bạn cần cấu hình Nginx để đón nhận yêu cầu gửi tới `api-dev.onstage.vn` và chuyển tiếp vào cổng `8080` (Docker backend dev đang chạy).

1. Mở Terminal/Powershell trên máy tính của bạn và SSH vào server:
   ```bash
   ssh ssh_code@118.70.132.119 -p 4522
   ```
2. Tạo file cấu hình Nginx mới cho domain `api-dev`:
   ```bash
   sudo nano /etc/nginx/sites-available/api-dev.onstage.vn
   ```
3. Copy và Paste đoạn cấu hình sau vào file:
   ```nginx
   server {
       listen 80;
       server_name api-dev.onstage.vn;

       client_max_body_size 100M;

       location / {
           proxy_pass http://127.0.0.1:8080; # Cổng Docker Backend Dev
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # Hỗ trợ Websocket cho Laravel Reverb (Realtime chat)
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
       }
   }
   ```
   *(Nhấn `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát editor).*

4. Kích hoạt file cấu hình mới này bằng cách tạo liên kết link:
   ```bash
   sudo ln -s /etc/nginx/sites-available/api-dev.onstage.vn /etc/nginx/sites-enabled/
   ```
5. Kiểm tra lỗi cú pháp Nginx:
   ```bash
   sudo nginx -t
   ```
   *Nếu kết quả trả về `nginx: configuration file ... test is successful` thì cú pháp cấu hình đã chính xác.*
6. Tải lại cấu hình Nginx để áp dụng:
   ```bash
   sudo systemctl reload nginx
   ```

---

## BƯỚC 4: CẬP NHẬT .ENV CỦA BACKEND DEV TRÊN SERVER

Để Laravel tạo các link phản hồi và callback URL đúng với domain mới:

1. Di chuyển vào thư mục backend dev trên server:
   ```bash
   cd ~/api-manager-kols-test
   ```
2. Mở file `.env` bằng editor:
   ```bash
   nano .env
   ```
3. Tìm dòng `APP_URL` và sửa lại thành:
   ```env
   APP_URL=https://api-dev.onstage.vn
   ```
   *(Lưu lại bằng `Ctrl + O` -> `Enter` và thoát bằng `Ctrl + X`).*

4. Khởi động lại các container để Laravel nhận cấu hình môi trường mới:
   ```bash
   docker compose up -d --force-recreate app nginx
   ```
5. Clear cache ứng dụng Laravel:
   ```bash
   docker compose exec app php artisan optimize:clear
   ```
   ```bash
   docker compose exec app php artisan opcache:clear
   ```

---
**Chúc mừng!** Sau khi hoàn thành 4 bước trên, trang web trên điện thoại của bạn sẽ tự động kết nối hoàn hảo với API và Database của nhánh dev hoàn toàn độc lập với môi trường chạy thật (Production).
