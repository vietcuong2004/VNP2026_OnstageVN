# 🚀 Hướng Dẫn Chạy Dự Án VNP BeautyTalent (Local)

## Cấu trúc dự án

```
C:\CONG_VIEC\
├── api-manager-kols\        ← Backend Laravel (chạy qua Docker)
└── VNP_BeutyTalent\         ← Frontend Next.js
```

---

## ✅ Yêu cầu cài đặt (Chỉ cần làm 1 lần)

| Phần mềm | Trạng thái | Ghi chú |
|----------|-----------|---------|
| **Docker Desktop** | ✅ Đã cài | Cần đang chạy khi làm việc |
| **Node.js** | ✅ Đã cài | Phiên bản 18+ |
| **Git** | ✅ Đã cài | |

---

## ⚙️ Cấu hình 1 lần (Chỉ làm lần đầu)

### 1. Backend — file `.env`

File `C:\CONG_VIEC\api-manager-kols\.env` đã được cấu hình sẵn.

> ⚠️ **Quan trọng:** `DB_FORWARD_PORT=33062` (không phải 33060 mặc định)  
> Vì máy đã có MySQL native đang dùng port 33060.

### 2. Frontend — file `.env.local`

File `C:\CONG_VIEC\VNP_BeutyTalent\.env.local` phải có dòng:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080/api
```

---

## 🟢 Mỗi ngày làm việc — Thứ tự khởi động

### Bước 1 — Khởi động Docker Desktop

Mở **Docker Desktop** từ Start Menu và chờ cho đến khi icon Docker ở taskbar chuyển sang màu trắng (không còn loading).

---

### Bước 2 — Khởi động Backend Laravel

Mở **Git Bash** hoặc **PowerShell**, chạy:

```bash
cd C:\CONG_VIEC\api-manager-kols
docker compose up -d
```

Đợi khoảng **30-60 giây** để MySQL khởi động xong. Kiểm tra bằng cách mở trình duyệt:

```
http://127.0.0.1:8080/api/health
```

→ Nếu thấy `{"status":"ok","app":"Laravel"}` là backend đã sẵn sàng ✅

Kiểm tra database:
```
http://127.0.0.1:8080/api/health/db
```
→ Nếu thấy `"has_users_table":true` là DB đã OK ✅

---

### Bước 3 — Khởi động Frontend Next.js

Mở **Git Bash** hoặc **PowerShell** mới (không đóng cửa sổ trên):

```bash
cd C:\CONG_VIEC\VNP_BeutyTalent
npm run dev
```

Vào trình duyệt: **http://localhost:3000**

---

## 🔴 Dừng dự án khi xong việc

```bash
# Dừng Next.js: Ctrl+C trong terminal đang chạy npm run dev

# Dừng backend Docker:
cd C:\CONG_VIEC\api-manager-kols
docker compose down
```

---

## 🛠️ Xử lý sự cố thường gặp

### ❌ Lỗi "Cannot connect to backend" hoặc "Server error"

**Nguyên nhân:** Docker containers chưa chạy hoặc MySQL chưa healthy.

**Cách fix:**
```bash
cd C:\CONG_VIEC\api-manager-kols
docker compose down
docker compose up -d
```
Chờ 30-60 giây rồi thử lại.

---

### ❌ Lỗi MySQL không start — "port 33060 already in use"

**Nguyên nhân:** MySQL native trên máy đang chiếm port 33060.

**Cách fix:** Kiểm tra file `C:\CONG_VIEC\api-manager-kols\.env`:
```env
DB_FORWARD_PORT=33062   ← phải là 33062, không phải 33060
```
Sau đó chạy lại `docker compose up -d`.

---

### ❌ Frontend không nhận API mới (vẫn báo lỗi sau khi sửa .env.local)

**Nguyên nhân:** Next.js cần restart để đọc biến môi trường mới.

**Cách fix:** Ctrl+C terminal `npm run dev`, rồi chạy lại `npm run dev`.

---

### ❌ Lần đầu chạy — DB trống, không có dữ liệu

**Chỉ làm 1 lần duy nhất khi reset database:**

```bash
cd C:\CONG_VIEC\api-manager-kols
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
```

---

## 🌐 Các địa chỉ quan trọng

| Dịch vụ | URL | Ghi chú |
|---------|-----|---------|
| Frontend (Next.js) | http://localhost:3000 | Trang chủ |
| Trang đăng ký | http://localhost:3000/auth/register | |
| Trang đăng nhập | http://localhost:3000/auth/login | |
| API Health | http://127.0.0.1:8080/api/health | Kiểm tra backend |
| API DB Health | http://127.0.0.1:8080/api/health/db | Kiểm tra database |
| Filament Admin | http://127.0.0.1:8080/admin | Admin panel |
| MinIO Console | http://127.0.0.1:9001 | Quản lý file ảnh |

### Tài khoản Admin (demo)
```
Email:    admin@example.com
Password: password123
```

### MinIO Storage
```
User:     minioadmin
Password: minioadmin
```

---

## 📋 Quy trình làm việc hàng ngày (Tóm tắt nhanh)

```
1. Mở Docker Desktop → chờ load xong
2. cd C:\CONG_VIEC\api-manager-kols  →  docker compose up -d
3. cd C:\CONG_VIEC\VNP_BeutyTalent   →  npm run dev
4. Mở http://localhost:3000
```

---

*Cập nhật lần cuối: 09/06/2026*
