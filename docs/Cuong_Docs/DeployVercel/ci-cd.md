# HƯỚNG DẪN THIẾT LẬP AUTO CI/CD GITLAB TO VERCEL

Hệ thống CI/CD đã được cấu hình tự động thông qua file [.gitlab-ci.yml](file:///c:/CONG_VIEC/VNP_BeutyTalent/.gitlab-ci.yml). Khi bạn push code lên:
- Nhánh `cuong`: Sẽ tự động build và deploy lên môi trường **Preview** (Link test).
- Nhánh `main`: Sẽ tự động build và deploy lên môi trường **Production** (Link chạy chính thức).

Để kích hoạt hệ thống này hoạt động, bạn cần cấu hình thông tin kết nối Vercel trên GitLab theo 3 bước chi tiết sau:

---

## BƯỚC 1: LẤY TOKEN CÁ NHÂN TỪ VERCEL

1. Truy cập vào trang cài đặt Vercel: [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Nhấn nút **Create Token**.
3. Điền tên gợi nhớ (Ví dụ: `GitLab CI/CD Token`) và chọn hạn dùng (Scope) phù hợp.
4. Nhấn **Create** và **Copy lại mã Token** vừa tạo (Mã này sẽ bắt đầu bằng `dir_...`). Lưu tạm mã này ra notepad.

---

## BƯỚC 2: LẤY PROJECT ID VÀ ORG ID CỦA DỰ ÁN

Để GitLab biết cần phải đẩy code vào dự án nào trên Vercel, bạn cần lấy mã dự án:

1. Mở Terminal tại thư mục dự án trên máy của bạn và chạy lệnh sau để liên kết (link) dự án:
   ```bash
   npx vercel link
   ```
2. Thực hiện đăng nhập Vercel (nếu được yêu cầu) và làm theo hướng dẫn trên terminal để chọn đúng Project hiện tại của bạn trên Vercel.
3. Sau khi quá trình link dự án hoàn tất thành công, một thư mục ẩn tên `.vercel` sẽ được tạo ra ở thư mục gốc của dự án.
4. Mở file `.vercel/project.json` để lấy thông tin:
   - **`orgId`**: Mã đại diện của tài khoản/team Vercel của bạn.
   - **`projectId`**: Mã đại diện của dự án này trên Vercel.

*(Lưu ý: Thư mục `.vercel` đã được thêm vào `.gitignore` để bảo mật, bạn không cần lo lắng việc bị lộ mã này lên Git).*

---

## BƯỚC 3: CẤU HÌNH BIẾN MÔI TRƯỜNG TRÊN GITLAB (VARIABLES)

Đây là bước cuối cùng để cấp quyền cho GitLab runner chạy tự động:

1. Truy cập vào trang dự án của bạn trên GitLab.
2. Tại thanh menu bên trái, chọn **Settings** -> **CI/CD**.
3. Cuộn xuống phần **Variables** và nhấn **Expand**.
4. Nhấn **Add variable** để thêm lần lượt 3 biến sau:

### Biến thứ 1: VERCEL_TOKEN
- **Key**: `VERCEL_TOKEN`
- **Value**: *(Dán mã Token lấy từ Bước 1)*
- **Type**: `Variable`
- **Protected**: `Checked` *(Nếu bạn muốn bảo vệ)*
- **Masked**: `Checked` *(Quan trọng: Ẩn Token khỏi log build của GitLab)*

### Biến thứ 2: VERCEL_ORG_ID
- **Key**: `VERCEL_ORG_ID`
- **Value**: *(Dán giá trị `orgId` lấy từ Bước 2)*
- **Type**: `Variable`
- **Protected**: `Unchecked`
- **Masked**: `Unchecked`

### Biến thứ 3: VERCEL_PROJECT_ID
- **Key**: `VERCEL_PROJECT_ID`
- **Value**: *(Dán giá trị `projectId` lấy từ Bước 2)*
- **Type**: `Variable`
- **Protected**: `Unchecked`
- **Masked**: `Unchecked`

---

## BƯỚC 4: PUSH CODE & KIỂM TRA PIPELINE

Bây giờ mọi thứ đã sẵn sàng:
1. Bạn commit file cấu hình `.gitlab-ci.yml` này lên nhánh `cuong`:
   ```bash
   git add .gitlab-ci.yml
   git commit -m "ci: add gitlab ci/cd pipeline for vercel"
   git push origin cuong
   ```
2. Truy cập GitLab của bạn -> Menu bên trái chọn **Build** -> **Pipelines** để xem quá trình GitLab Runner tự động cài đặt, build Next.js và deploy lên Vercel trong vài phút.