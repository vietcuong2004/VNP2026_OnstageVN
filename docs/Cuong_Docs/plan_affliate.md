# Kế hoạch thiết kế tính năng Affiliate Invitation cho Brand

## Mục tiêu

Cho phép Brand chia sẻ một liên kết (Affiliate/Invitation Link) để mời Talent tham gia hệ thống và gia nhập trực tiếp vào Brand sau khi hoàn tất quá trình xác thực.

Ví dụ:

```
https://domain.com/ref/creator-vnp
```

Người dùng truy cập liên kết sẽ được chuyển đến một trang Landing Page giới thiệu Brand, sau đó có thể lựa chọn tham gia hoặc từ chối.

---

# Mục tiêu UX

* Tăng tỷ lệ chuyển đổi từ link mời.
* Tạo cảm giác tin tưởng trước khi người dùng tham gia.
* Không bắt người dùng đăng nhập ngay khi mở link.
* Nếu người dùng chưa có tài khoản thì chỉ cần đăng ký một lần và hệ thống tự động tiếp tục luồng tham gia.
* Sau khi hoàn tất, Talent được thêm trực tiếp vào Brand.

---

# Luồng hoạt động tổng thể

```
Brand tạo link mời
        │
        ▼
https://domain.com/ref/creator-vnp
        │
        ▼
Landing Page giới thiệu Brand
        │
        ├──────────────┐
        ▼              ▼
   Từ chối         Chấp nhận tham gia
                          │
                          ▼
                Kiểm tra trạng thái đăng nhập
                  ├─────────────┐
                  ▼             ▼
          Đã đăng nhập     Chưa đăng nhập
                  │             │
                  │      Login / Register
                  │             │
                  └──────┬──────┘
                         ▼
           Xác nhận tham gia Agency/Brand
                         │
                         ▼
            Tự động thêm Talent vào Brand
                         │
                         ▼
               Hiển thị màn hình thành công
```

---

# Thiết kế URL

## URL chia sẻ

```
/ref/:inviteCode
```

Ví dụ:

```
/ref/creator-vnp
/ref/nike-kol
/ref/apple-vietnam
```

Có thể mở rộng:

```
/ref/creator-vnp?utm=tiktok
/ref/creator-vnp?campaign=summer
```

---

# Thiết kế Landing Page

## Hero Section

Hiển thị:

* Logo Brand
* Banner
* Tên Brand
* Badge xác minh (Verified)
* Mô tả ngắn
* CTA nổi bật

Ví dụ:

```
Creator VNP

Đối tác đã xác minh

Đang tuyển Creator/KOL tham gia hệ thống quản lý chính thức.

[ Tham gia ngay ]
```

---

# Thông tin Brand

Hiển thị đầy đủ:

* Logo
* Banner
* Tên
* Mô tả
* Website
* Lĩnh vực
* Địa chỉ
* Năm thành lập
* Trạng thái xác minh
* Số lượng Talent đang quản lý
* Rating (nếu có)

---

# Quyền lợi khi tham gia

Hiển thị dưới dạng card:

* Nhận campaign trực tiếp
* Được Agency hỗ trợ thương lượng
* Quản lý booking tập trung
* Hỗ trợ pháp lý
* Ưu tiên job lớn
* Được quản lý lịch làm việc

---

# Quyền truy cập sau khi tham gia

Thông báo minh bạch cho Talent:

Sau khi tham gia:

* Brand có thể xem hồ sơ của bạn.
* Brand có thể gửi lời mời tham gia campaign.
* Brand có thể quản lý booking theo chính sách hệ thống.
* Bạn vẫn có thể rời Agency theo quy trình cho phép.

---

# Khu vực hành động

Primary Button

```
Chấp nhận tham gia
```

Secondary Button

```
Không, cảm ơn
```

---

# Luồng khi bấm "Chấp nhận"

## Trường hợp đã đăng nhập

Hiển thị dialog xác nhận:

```
Bạn chuẩn bị tham gia:

Creator VNP

Sau khi xác nhận:

✓ Hồ sơ sẽ được liên kết với Brand
✓ Bạn có thể nhận campaign
✓ Bạn có thể quản lý công việc trên hệ thống

[Xác nhận]
```

Sau khi xác nhận:

```
POST /invite/accept
```

và chuyển sang trang thành công.

---

## Trường hợp chưa đăng nhập

Hiển thị lựa chọn:

```
Để tham gia Brand này,
bạn cần đăng nhập hoặc tạo tài khoản.

[Đăng nhập]

----------------

Chưa có tài khoản?

[Tạo tài khoản]
```

---

# Lưu trạng thái lời mời

Khi người dùng chưa đăng nhập:

```
pendingInvite = creator-vnp
```

Có thể lưu:

* Cookie
* Session
* Local Storage
* Server Session

---

# Sau khi đăng ký hoặc đăng nhập

Hệ thống tự động kiểm tra:

```
pendingInvite != null
```

Nếu tồn tại:

```
consumeInvite()
```

Sau đó:

```
addTalentToBrand()
```

Người dùng không cần mở lại link.

---

# Màn hình thành công

Hiển thị:

```
🎉 Chúc mừng!

Bạn đã tham gia

Creator VNP

✓ Có thể nhận campaign
✓ Có thể chat với Agency
✓ Có thể cập nhật hồ sơ

[Đi tới Dashboard]
```

Có thể thêm hiệu ứng Confetti.

---

# Các trường hợp đặc biệt

## Đã là thành viên

```
Bạn đã là thành viên của Creator VNP.

[Đi tới Workspace]
```

---

## Link hết hạn

```
Link mời đã hết hạn.

Vui lòng liên hệ Brand để nhận liên kết mới.
```

---

## Link không tồn tại

```
Không tìm thấy lời mời.
```

---

## Brand ngừng tuyển

```
Hiện tại Brand chưa nhận thêm Talent mới.
```

---

## Người dùng bị chặn

```
Bạn không đủ điều kiện tham gia Brand này.
```

---

# Cấu trúc route đề xuất

```
app/
└── ref/
    └── [inviteCode]/
        ├── page.tsx
        ├── loading.tsx
        ├── not-found.tsx
        ├── success/
        │   └── page.tsx
        └── _components/
            ├── brand-hero.tsx
            ├── brand-summary.tsx
            ├── benefit-list.tsx
            ├── permission-card.tsx
            ├── join-actions.tsx
            ├── join-confirm-dialog.tsx
            └── invite-status.tsx
```

---

# Cấu trúc dữ liệu Invite

```ts
InviteLink {
  id: string
  code: string
  brandId: string

  status: "active" | "expired" | "disabled"

  createdBy: string

  expiresAt: Date | null

  maxUses: number | null

  usedCount: number

  createdAt: Date
}
```

---

# API đề xuất

## Lấy thông tin lời mời

```
GET /api/invite/:code
```

Trả về:

* Brand
* Logo
* Banner
* Description
* Statistics
* Invite Status

---

## Chấp nhận lời mời

```
POST /api/invite/accept
```

Body:

```
{
  inviteCode
}
```

---

## Tiêu thụ lời mời sau đăng nhập

```
POST /api/invite/consume
```

---

# Kiểm tra hợp lệ

Trước khi cho tham gia cần kiểm tra:

* Link tồn tại.
* Link chưa hết hạn.
* Brand đang hoạt động.
* Chưa vượt số lượt sử dụng tối đa.
* User chưa thuộc Brand.
* User không bị cấm tham gia.

---

# Thiết kế UI ưu tiên

Landing Page nên hiển thị theo thứ tự:

1. Banner + Logo
2. Tên Brand
3. Badge Verified
4. Mô tả
5. Thống kê
6. Quyền lợi khi tham gia
7. Quyền truy cập sau khi tham gia
8. Nút "Chấp nhận tham gia"
9. Nút "Không, cảm ơn"

CTA chính luôn được cố định ở cuối màn hình trên mobile để tăng tỷ lệ chuyển đổi.

---

# Khuyến nghị UX cuối cùng

Không nên tự động thêm người dùng vào Brand ngay sau khi đăng nhập.

Quy trình tối ưu:

```
Mở link
    ↓
Đọc thông tin Brand
    ↓
Nhấn "Chấp nhận tham gia"
    ↓
Đăng nhập hoặc đăng ký (nếu cần)
    ↓
Hiển thị hộp thoại xác nhận cuối cùng
    ↓
Nhấn "Xác nhận tham gia"
    ↓
Thêm Talent vào Brand
    ↓
Hiển thị màn hình thành công
```

Cách làm này giúp:

* Tránh tham gia ngoài ý muốn.
* Minh bạch về quyền truy cập.
* Giảm khiếu nại do bấm nhầm liên kết.
* Dễ mở rộng cho các cơ chế phê duyệt hoặc quản lý Agency trong tương lai.
