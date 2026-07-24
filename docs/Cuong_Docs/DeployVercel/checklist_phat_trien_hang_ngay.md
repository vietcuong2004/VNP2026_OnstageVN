# Quy Trình Lập Trình và Deploy Hàng Ngày (Môi trường Dev & Production)

Tài liệu này cung cấp **Checklist các bước thực hiện hàng ngày** mỗi khi bạn bắt đầu viết code (chỉnh sửa giao diện, cập nhật tính năng, sửa API) cho đến lúc đưa code lên chạy thực tế. 

Bạn hãy làm theo quy trình dưới đây để đảm bảo việc phát triển diễn ra mượt mà và an toàn.

---

## 📅 PHẦN 1: KHI BẮT ĐẦU BUỔI CODE (Chuẩn bị Môi trường)

Mỗi ngày khi bắt đầu code, bạn cần khởi động các công cụ thử nghiệm cục bộ:

- [ ] **Bật Docker Backend Local:**
  * Mở Docker Desktop.
  * Mở Terminal local tại thư mục `backend` và chạy:
    ```bash
    docker compose up -d
    ```

- [ ] **Khởi chạy Serveo Tunnel cố định:**
  * Mở cửa sổ Terminal/Powershell tại thư mục `backend` và chạy lệnh sau để mở cổng kết nối từ local ra internet qua Serveo:
    ```bash
    cd backend
    ssh -R onstage-dev-cuong:80:localhost:8080 serveo.net
    ```
  * *Lưu ý: Giữ nguyên cửa sổ Terminal này để duy trì kết nối. Dữ liệu và API local sẽ được expose qua tên miền cố định `https://onstage-dev-cuong.serveo.net` để Vercel Dev gọi về mà không cần phải thay đổi biến môi trường.*

---

## 💻 PHẦN 2: QUY TRÌNH VIẾT CODE & THỬ NGHIỆM (Nhánh `dev`)

- [ ] **Đảm bảo đang ở nhánh `dev`:**
  * Trước khi bắt đầu gõ code, hãy kiểm tra chắc chắn bạn đang ở nhánh `dev`:
    ```bash
    git checkout dev
    git pull origin dev
    ```

- [ ] **Viết code và kiểm tra ở Local:**
  * Tiến hành chỉnh sửa UI, viết API mới...
  * Mở trình duyệt trên máy tính cá nhân truy cập `http://localhost:3000` để code và xem trước.

- [ ] **Khi có chỉnh sửa code ở backend thì build lại:**
```bash
docker compose up -d --build        
docker compose exec app php artisan migrate --force                     
docker compose exec app php artisan db:seed --force
```
- [ ] **Khi chỉ chỉnh sửa frontend:**
```bash
    docker compose up -d --build frontend
```

- [ ] **Đẩy code lên để test trên máy khác (Deploy Staging):**
  * Sau khi code xong một phần tính năng, push code lên Git nhánh `dev`:
    ```bash
    git add .
    git commit -m "feat: mô tả tính năng bạn vừa viết"
    git push origin dev
    ```
  * Vercel sẽ tự động phát hiện code mới ở nhánh `dev` và build lại.
  * Mở máy khác truy cập [https://onstagevn.vercel.app/](https://onstagevn.vercel.app/) để test trực tiếp giao diện và các API (dữ liệu lúc này sẽ chạy thẳng vào máy tính cá nhân của bạn).

---

## 🚀 PHẦN 3: QUY TRÌNH ĐƯA LÊN CHẠY THẬT (Nhánh `main` - Production)

Khi các tính năng trên nhánh `dev` đã hoạt động hoàn hảo và bạn muốn đưa lên cho khách hàng sử dụng trên domain `onstage.vn`:

- [ ] **Merge code từ `dev` vào `main`:**
  * Chuyển sang nhánh `main`, kéo code mới nhất và gộp nhánh `dev` vào:
    ```bash
    git checkout main
    git pull origin main
    git merge dev
    git push origin main
    ```

- [ ] **Deploy Frontend lên Production Server:**
  * Mở Terminal local tại thư mục `deploy` và chạy lệnh Deployer:
    ```bash
    cd C:\CONG_VIEC\VNP_OnstageVN\deploy
    ./vendor/bin/dep deploy onstage.vn:frontend-server-local-45 -vvv
    ```
  * *Lệnh này sẽ tự động deploy code nhánh `main` mới nhất lên server VPS và tự động reset pm2 của production.*

- [ ] **Cập nhật Database của Production (Nếu có thay đổi database):**
  * Nếu tính năng mới có thêm bảng dữ liệu hoặc cột mới trong database (migration), bạn phải chạy lệnh migrate trên server:
    1. SSH vào server:
       ```bash
       ssh ssh_code@118.70.132.119 -p 4522
       ```
    2. Đi tới thư mục backend production và chạy migrate + clear cache:
       ```bash
       cd /var/www/manager-kol-model/api-admin/current
       docker compose exec app php artisan migrate --force
       docker compose exec app php artisan optimize:clear
       docker compose exec app php artisan opcache:clear
       ```

---
**💡 MẸO NHỎ:** Hãy đánh dấu bookmark tài liệu này trong VS Code để mỗi khi bắt đầu một ngày làm việc mới, bạn chỉ việc check theo danh sách này là có thể tự tin lập trình và deploy mà không sợ lỗi hệ thống!
