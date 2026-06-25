# Hướng Dẫn Chi Tiết Cấu Hình Deploy Song Song Nhánh Dev (Local Backend + Vercel)

Tài liệu này ghi lại chi tiết **các bước thực tế đã thực hiện** để phơi API từ Docker local ở máy tính cá nhân lên Internet thông qua Cloudflare Tunnel, giúp trang web deploy trên Vercel (`https://onstagevn.vercel.app/` nhánh `dev`) có thể kết nối và đăng nhập/đăng ký thành công từ điện thoại hoặc thiết bị khác.

---

## 🎯 Mục tiêu
* Chạy frontend nhánh `dev` trên Vercel (`https://onstagevn.vercel.app/`).
* Cho phép thiết bị bên ngoài (như điện thoại) kết nối được tới Backend Laravel đang chạy trong Docker local trên máy tính cá nhân của bạn.
* Đảm bảo dữ liệu test tách biệt 100% với server chạy thật (Production).

---

## 📑 BƯỚC 1: KHỞI CHẠY CLOUDFLARE TUNNEL TẠI MÁY CÁ NHÂN (WINDOWS)

Mục đích là tạo một đường ống bảo mật HTTPS miễn phí trỏ trực tiếp từ Internet vào cổng Docker local (`8080`) trên máy tính của bạn.

1. **Mở Powershell** trên máy tính cá nhân của bạn (Cục bộ).
2. **Tải công cụ `cloudflared.exe`** về thư mục dự án (chỉ cần chạy 1 lần duy nhất):
   ```powershell
   Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
   ```
3. **Khởi chạy Tunnel:**
   Chạy lệnh sau để phơi cổng `8080` ra ngoài internet:
   ```powershell
   .\cloudflared.exe tunnel --url http://localhost:8080
   ```
4. **Lấy URL Tunnel:**
   * Hãy giữ cho cửa sổ Powershell này luôn mở.
   * Tìm dòng log có dạng:
     > `Your quick Tunnel has been created! Visit it at: https://[domain-ngau-nhien].trycloudflare.com`
   * Copy lại link `https://[domain-ngau-nhien].trycloudflare.com` này.

---

## ⚙️ BƯỚC 2: CẬP NHẬT CẤU HÌNH BACKEND LOCAL CỦA BẠN

Để Laravel tạo các đường dẫn redirect chính xác (không bị nhảy về `localhost:3000` hoặc `127.0.0.1` sau khi đăng nhập), bạn cần cập nhật file cấu hình môi trường local.

1. Mở file **`C:\CONG_VIEC\VNP_OnstageVN\backend\.env`** bằng VS Code.
2. Tìm và cập nhật lại 3 biến môi trường sau theo URL Tunnel bạn vừa lấy ở **Bước 1**:
   ```env
   # 1. Domain gốc của Laravel
   APP_URL=https://[domain-ngau-nhien].trycloudflare.com

   # 2. Domain của Frontend Vercel (để Laravel redirect đúng sau khi đăng nhập)
   FRONTEND_URL=https://onstagevn.vercel.app

   # 3. Các link callback đăng nhập Google/Facebook (nếu dùng)
   GOOGLE_REDIRECT_URI=https://[domain-ngau-nhien].trycloudflare.com/api/auth/social/google/callback
   FACEBOOK_REDIRECT_URI=https://[domain-ngau-nhien].trycloudflare.com/api/auth/social/facebook/callback
   ```
3. **Khởi động lại các container Docker local** và xóa cache Laravel:
   Mở một tab terminal local mới (ở thư mục `backend`) và chạy:
   ```bash
   # Khởi động lại container app và nginx
   docker compose up -d --force-recreate app nginx

   # Xóa sạch cache Laravel để nhận cấu hình mới
   docker compose exec app php artisan optimize:clear
   docker compose exec app php artisan opcache:clear
   ```

---

## 🌐 BƯỚC 3: CẤU HÌNH TRÊN VERCEL DASHBOARD

### A. Gán nhánh `dev` cho domain `onstagevn.vercel.app`
1. Đăng nhập vào **Vercel** -> Chọn dự án của bạn $\rightarrow$ tab **Settings** $\rightarrow$ chọn **Domains**.
2. Tìm domain `onstagevn.vercel.app` và click **Edit**.
3. Tại ô **Connect to an environment**: chuyển từ `Production` sang **`Preview`**.
4. Tại ô **Git Branch** vừa xuất hiện: nhập vào **`dev`**.
5. Bấm **Save**.

### B. Cập nhật biến môi trường API Dev
1. Vào tab **Settings** của dự án trên Vercel $\rightarrow$ chọn mục **Environment Variables**.
2. Tìm biến **`NEXT_PUBLIC_API_URL`** và chỉnh sửa giá trị (Value) của nó thành:
   ```text
   https://[domain-ngau-nhien].trycloudflare.com/api
   ```
   *(Lưu ý: Bắt buộc phải có `/api` ở cuối cùng).*
3. Bấm **Save**.

---

## ⚡ BƯỚC 4: TRIGGER VERCEL BUILD LẠI BẢN MỚI

Vì biến môi trường Next.js phía client chỉ có tác dụng khi ứng dụng được build, bạn cần kích hoạt build lại trên Vercel:

1. Mở Terminal local tại thư mục `frontend` trên máy của bạn.
2. Chạy lệnh push một commit trống lên nhánh `dev`:
   ```bash
   git commit --allow-empty -m "deploy: update to new local tunnel URL"
   git push origin dev
   ```
3. Chờ Vercel build hoàn tất (khoảng 1-2 phút).

---

## 🚨 LƯU Ý QUAN TRỌNG KHI VẬN HÀNH
* **Khi tắt máy tính hoặc tắt Tunnel:** URL ngẫu nhiên `https://[ngau-nhien].trycloudflare.com` sẽ bị mất. Lần sau khi bạn mở máy code tiếp, bạn cần chạy lại lệnh ở **Bước 1**, lấy URL mới và cập nhật lại vào file `backend/.env` (Bước 2) + cập nhật trên Vercel (Bước 3) rồi chạy lệnh trigger build ở **Bước 4**.
* **Đảm bảo Docker Local luôn bật:** Khi bạn dùng điện thoại truy cập test, máy tính cá nhân của bạn phải đang mở, Docker Laravel local phải đang chạy và lệnh `cloudflared` phải đang hoạt động.
