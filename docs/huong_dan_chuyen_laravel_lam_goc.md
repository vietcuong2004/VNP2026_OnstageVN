# Hướng Dẫn Chi Tiết: Chuyển Laravel Làm Thư Mục Gốc & Next.js Vào Thư Mục Riêng (`frontend`)

Tài liệu này hướng dẫn bạn cách tái cấu trúc dự án hiện tại để **Laravel đóng vai trò là thư mục gốc (root)**, còn dự án **Next.js (Frontend) sẽ được đưa vào một thư mục con riêng biệt** (ví dụ: `frontend/`). 

Cấu trúc này giúp bạn quản lý dự án dễ dàng hơn nếu muốn dùng chung một Git Repository (Monorepo đơn giản) nhưng vẫn giữ Laravel làm trung tâm để dễ triển khai (deploy) lên các hosting/server hỗ trợ Laravel truyền thống.

---

## 1. So Sánh Cấu Trúc Thư Mục

### Cấu trúc hiện tại (Next.js làm gốc, Laravel lồng bên trong)
```text
VNP_BeutyTalent/  <-- Gốc là Next.js
├── app/ (Next.js)
├── components/ (Next.js)
├── public/ (Next.js)
├── package.json (Next.js)
├── tsconfig.json (Next.js)
├── backend/  <-- Thư mục con chứa Laravel
│   ├── app/ (Laravel)
│   ├── bootstrap/
│   ├── config/
│   ├── public/ (Laravel)
│   ├── artisan
│   └── composer.json
└── node_modules/ (Next.js)
```

### Cấu trúc mới (Laravel làm gốc, Next.js nằm trong thư mục `frontend/`)
```text
VNP_BeutyTalent/  <-- Gốc là Laravel
├── app/ (Laravel)
├── bootstrap/ (Laravel)
├── config/ (Laravel)
├── database/ (Laravel)
├── public/ (Laravel - Chứa index.php của Laravel)
├── resources/ (Laravel)
├── routes/ (Laravel)
├── storage/ (Laravel)
├── tests/ (Laravel)
├── artisan (Laravel)
├── composer.json (Laravel)
├── .env (Laravel)
├── .gitignore (Laravel - Cấu hình bỏ qua vendor, storage...)
├── frontend/  <-- Thư mục con chứa Next.js
│   ├── app/ (Next.js)
│   ├── components/ (Next.js)
│   ├── public/ (Next.js)
│   ├── package.json (Next.js)
│   ├── tsconfig.json (Next.js)
│   ├── .env.local (Next.js)
│   └── .gitignore (Next.js - Chỉ ignore .next, node_modules của frontend)
└── node_modules/ (Laravel - Nếu có dùng Vite/npm trong Laravel)
```

---

## 2. Các Bước Thực Hiện Tách Và Cấu Trúc Lại

Do cả Laravel và Next.js đều có các thư mục trùng tên (như `app/`, `public/`, `node_modules/`, `package.json`), bạn cần thực hiện theo đúng thứ tự dưới đây để tránh ghi đè làm mất code.

> [!WARNING]
> Trước khi thực hiện, hãy đảm bảo bạn đã commit toàn bộ code hiện tại hoặc tạo một bản sao dự phòng (backup) của thư mục dự án để phòng trường hợp thao tác nhầm lẫn.

### Bước 1: Thu dọn và di chuyển Next.js vào thư mục `frontend`

1. **Xóa các thư mục tạm thời của Next.js để di chuyển nhanh hơn:**
   * Mở terminal tại thư mục gốc và chạy lệnh xóa `node_modules` và `.next` (những thư mục này có thể cài đặt và sinh lại dễ dàng):
     ```powershell
     Remove-Item -Recurse -Force node_modules
     Remove-Item -Recurse -Force .next
     ```
2. **Tạo thư mục `frontend` mới:**
   * Tạo thư mục `frontend` ngay tại thư mục gốc:
     ```powershell
     New-Item -ItemType Directory -Path frontend
     ```
3. **Di chuyển toàn bộ các file/thư mục của Next.js vào `frontend/`:**
   * Di chuyển các thư mục sau vào `frontend`: `app`, `components`, `public`, `styles`, `lib`, `hooks` (và bất kỳ thư mục code Next.js nào khác).
   * Di chuyển các file cấu hình của Next.js vào `frontend`: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts` (nếu có), `eslint.config.mjs`, `components.json`, `.env.local`.
   * *Lưu ý:* Không di chuyển thư mục `backend` và thư mục `.git`.

   **Lệnh PowerShell nhanh để di chuyển:**
   ```powershell
   Move-Item -Path app, components, public, styles, lib, hooks, package.json, package-lock.json, tsconfig.json, next.config.mjs, postcss.config.mjs, eslint.config.mjs, components.json, .env.local -Destination frontend/ -ErrorAction SilentlyContinue
   ```

### Bước 2: Đưa dự án Laravel từ thư mục `backend` ra ngoài thư mục gốc

Sau khi đã dọn sạch thư mục gốc (chỉ còn thư mục `.git`, `backend`, và `frontend`), bạn tiến hành đưa Laravel ra ngoài:

1. **Di chuyển tất cả file và thư mục con trong `backend` ra ngoài gốc:**
   ```powershell
   # Di chuyển toàn bộ file và thư mục ẩn/hiện từ backend ra ngoài
   Get-ChildItem -Path backend -Recurse -Depth 0 | Move-Item -Destination .
   # Di chuyển các file ẩn như .env, .gitignore, .editorconfig
   Move-Item -Path backend\.env, backend\.gitignore, backend\.editorconfig, backend\.gitattributes -Destination . -ErrorAction SilentlyContinue
   ```
2. **Xóa thư mục `backend` (lúc này đã trống):**
   ```powershell
   Remove-Item -Path backend -Force
   ```

---

## 3. Cập Nhật Cấu Hinh Sau Khi Tái Cấu Trúc

### Bước 1: Cấu hình lại Git (.gitignore)

Bây giờ bạn sẽ có **2 file `.gitignore`** độc lập:

1. **File `.gitignore` ở thư mục gốc (dành cho Laravel):**
   Đảm bảo file `.gitignore` ở gốc chứa các dòng sau để không đưa file build/vendor của Laravel lên Git, đồng thời bỏ qua cả `node_modules` và `.next` của dự án frontend:
   ```gitignore
   /node_modules
   /vendor
   /.env
   /.env.backup
   /public/hot
   /public/storage
   /storage/*.key
   /storage/framework/cache/data/*
   /storage/framework/sessions/*
   /storage/framework/testing/*
   /storage/framework/views/*
   /storage/logs/*
   .phpunit.result.cache
   
   # Thêm dòng này để ignore node_modules và build của frontend nếu chưa có
   /frontend/node_modules/
   /frontend/.next/
   /frontend/.env.local
   ```

2. **File `.gitignore` bên trong thư mục `frontend/` (dành cho Next.js):**
   Đảm bảo có file `frontend/.gitignore` để quản lý riêng cho dự án Next.js:
   ```gitignore
   node_modules
   .next
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   ```

---

### Bước 2: Cài đặt lại các dependencies và kiểm tra hoạt động

1. **Với Frontend (Next.js):**
   * Di chuyển vào thư mục `frontend`:
     ```powershell
     cd frontend
     ```
   * Cài đặt lại thư viện:
     ```powershell
     npm install
     ```
   * Khởi chạy thử Frontend:
     ```powershell
     npm run dev
     ```
     *(Ứng dụng Next.js của bạn sẽ chạy tại http://localhost:3000)*

2. **Với Backend (Laravel):**
   * Mở một tab terminal mới tại thư mục gốc (`VNP_BeutyTalent`).
   * Chạy composer install nếu cần cập nhật thư viện (thường thư mục `vendor` đã được di chuyển ra ngoài nên không cần chạy lại nếu đã có sẵn):
     ```powershell
     composer install
     ```
   * Chạy server Laravel:
     ```powershell
     php artisan serve --port=8000
     ```
     *(Laravel API sẽ chạy tại http://localhost:8000)*

---

### Bước 3: Cấu hình CORS để Next.js gọi vào Laravel API

Vì Next.js đã chuyển vào thư mục `frontend`, cấu hình kết nối API vẫn tương tự như hướng dẫn trước:

1. **Cấu hình CORS trong Laravel (`config/cors.php`):**
   Đảm bảo cho phép cổng chạy Next.js (thường là `http://localhost:3000`):
   ```php
   'allowed_origins' => ['http://localhost:3000'],
   ```

2. **Cấu hình biến môi trường trong Next.js (`frontend/.env.local`):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

---

## 4. Đánh Giá Ưu & Nhược Điểm Của Cấu Trúc Này

| Tiêu chí | Cấu trúc Laravel làm gốc + Thư mục `frontend/` (Monorepo đơn giản) | Cấu trúc 2 Repository riêng biệt |
| :--- | :--- | :--- |
| **Quản lý Git** | **Dễ dàng hơn:** Chỉ cần 1 repository để quản lý cả code Frontend và Backend. Thích hợp cho đội nhóm nhỏ hoặc làm việc cá nhân. | **Phức tạp hơn:** Phải push/pull trên 2 repo khác nhau, quản lý phân quyền riêng. |
| **Quy trình Deploy** | **Bình thường:** Khi deploy lên các VPS/Server, bạn trỏ Domain API vào thư mục gốc (Laravel). Domain Frontend có thể trỏ vào thư mục `frontend/` (nếu deploy Vercel bằng cách chọn root directory là `frontend`). | **Tối ưu nhất:** Độc lập hoàn toàn, không sợ deploy nhầm lẫn, CI/CD cấu hình cực kỳ gọn gàng. |
| **Độ sạch của Code** | **Tương đối:** Các file cấu hình của Laravel sẽ nằm ở gốc, dễ bị nhầm lẫn nếu không cấu hình tốt editor. | **Rất sạch:** Folder nào chỉ chứa code của công nghệ đó, không bị lẫn lộn file cấu hình. |

> [!TIP]
> Nếu bạn phát triển dự án một mình hoặc đội nhóm nhỏ, cấu trúc **Laravel làm gốc và có thư mục `frontend/`** là lựa chọn vô cùng tiện lợi vì toàn bộ dự án nằm chung một nơi, dễ theo dõi sự thay đổi của cả API lẫn Giao diện trong mỗi commit Git.
