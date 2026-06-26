# Hướng Dẫn Chi Tiết Cấu Hình Deploy Song Song Nhánh Dev (Local Backend + Vercel qua Ngrok Cố Định)

Tài liệu này ghi lại chi tiết **các bước thực tế đã thực hiện** để phơi API từ Docker local ở máy tính cá nhân lên Internet thông qua Ngrok với Tên miền cố định (Static Domain). Việc này giúp trang web deploy trên Vercel (`https://onstagevn.vercel.app/` nhánh `dev`) có thể kết nối ổn định tới máy tính cá nhân của bạn để test mà không bị đổi URL mỗi khi tắt máy.

---

## 🎯 Mục tiêu
* Chạy frontend nhánh `dev` trên Vercel (`https://onstagevn.vercel.app/`).
* Cho phép thiết bị bên ngoài (như điện thoại) kết nối được tới Backend Laravel đang chạy trong Docker local trên máy tính cá nhân của bạn.
* Sử dụng **tên miền Ngrok cố định** (`https://crispy-prewashed-preformed.ngrok-free.dev`) để tránh việc phải sửa lại cấu hình mỗi khi khởi động lại máy.
* Đảm bảo dữ liệu test tách biệt 100% với server chạy thật (Production).

---

## 📑 BƯỚC 1: CÀI ĐẶT VÀ KHỞI CHẠY NGROK TUNNEL CỐ ĐỊNH TẠI MÁY CÁ NHÂN (WINDOWS)

Mục đích là tạo một đường ống bảo mật HTTPS cố định trỏ trực tiếp từ Internet vào cổng Docker local (`8080`) trên máy tính của bạn.

1. **Tải Ngrok:**
   * File `ngrok.exe` đã được tải về và lưu trực tiếp trong thư mục dự án `frontend/`.
2. **Cấu hình Authtoken (Chỉ cần chạy 1 lần duy nhất):**
   * Mở Powershell tại thư mục `frontend` và chạy lệnh sau để đăng ký token tài khoản của bạn:
     ```powershell
     .\ngrok.exe config add-authtoken <Token của bạn>
     ```
3. **Khởi chạy Tunnel với tên miền cố định:**
   * Mỗi khi bắt đầu buổi làm việc, chạy lệnh sau để mở cổng kết nối:
     ```powershell
     .\ngrok.exe http 8080 --domain=<Tên miền cố định>
     ```
   * **Lưu ý:** Giữ nguyên cửa sổ Powershell này luôn mở khi code. Đường dẫn cố định của bạn sẽ là: `https://crispy-prewashed-preformed.ngrok-free.dev`

---

## ⚙️ BƯỚC 2: CẤU HÌNH BACKEND LOCAL CỦA BẠN (CHỈ LÀM 1 LẦN)

Để Laravel tạo các đường dẫn redirect chính xác (không bị nhảy về `localhost:3000` hoặc `127.0.0.1` sau khi đăng nhập), bạn cần cập nhật file cấu hình môi trường local.

1. Mở file **`C:\CONG_VIEC\VNP_OnstageVN\backend\.env`** bằng VS Code.
2. Cập nhật các biến môi trường sau theo tên miền cố định:
   ```env
   # 1. Domain gốc của Laravel local
   APP_URL=https://crispy-prewashed-preformed.ngrok-free.dev

   # 2. Domain của Frontend Vercel (để Laravel redirect đúng sau khi đăng nhập)
   FRONTEND_URL=https://onstagevn.vercel.app

   # 3. Các link callback đăng nhập Google/Facebook (nếu dùng)
   GOOGLE_REDIRECT_URI=https://crispy-prewashed-preformed.ngrok-free.dev/api/auth/social/google/callback
   FACEBOOK_REDIRECT_URI=https://crispy-prewashed-preformed.ngrok-free.dev/api/auth/social/facebook/callback
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

## 🌐 BƯỚC 3: CẤU HÌNH TRÊN VERCEL DASHBOARD (CHỈ LÀM 1 LẦN)

### A. Gán nhánh `dev` cho domain `onstagevn.vercel.app`
1. Đăng nhập vào **Vercel** -> Chọn dự án của bạn -> tab **Settings** -> chọn **Domains**.
2. Tìm domain `onstagevn.vercel.app` và click **Edit**.
3. Tại ô **Connect to an environment**: chuyển từ `Production` sang **`Preview`**.
4. Tại ô **Git Branch** vừa xuất hiện: nhập vào **`dev`**.
5. Bấm **Save**.

### B. Cập nhật biến môi trường API Dev
1. Vào tab **Settings** của dự án trên Vercel -> chọn mục **Environment Variables**.
2. Tìm biến **`NEXT_PUBLIC_API_URL`** và chỉnh sửa giá trị (Value) của nó thành:
   ```text
   https://crispy-prewashed-preformed.ngrok-free.dev/api
   ```
   *(Lưu ý: Bắt buộc phải có `/api` ở cuối cùng).*
3. Bấm **Save**.

---

## ⚡ BƯỚC 4: TRIGGER VERCEL BUILD LẠI BẢN MỚI
*(Chỉ cần làm 1 lần sau khi thay đổi biến môi trường trên Vercel)*

Vì biến môi trường Next.js phía client chỉ có tác dụng khi ứng dụng được build, bạn cần kích hoạt build lại trên Vercel để nhận giá trị mới:

1. Mở Terminal local tại thư mục `frontend` trên máy của bạn.
2. Chạy lệnh push một commit trống lên nhánh `dev`:
   ```bash
   git commit --allow-empty -m "deploy: update to new local tunnel URL"
   git push origin dev
   ```
3. Chờ Vercel build hoàn tất (khoảng 1-2 phút).

---

## 🚨 LƯU Ý QUAN TRỌNG KHI VẬN HÀNH
* **Không cần sửa lại cấu hình:** Vì đã dùng tên miền Ngrok cố định (`crispy-prewashed-preformed.ngrok-free.dev`), từ nay về sau khi khởi động lại máy, bạn **chỉ cần chạy lệnh mở ngrok ở Bước 1** là xong. Không cần sửa file `.env` hay đổi biến trên Vercel nữa!
* **Đảm bảo Docker Local luôn bật:** Khi bạn dùng điện thoại truy cập test, máy tính cá nhân của bạn phải đang mở, Docker Laravel local phải đang chạy và lệnh `ngrok.exe` phải đang hoạt động.
