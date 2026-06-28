# Thiết kế Backend: Managed Account cho Talent do Agency tạo

# Mục tiêu

Cho phép Agency/Brand tạo nhanh Talent mới mà không yêu cầu Talent tự đăng ký trước, đồng thời đảm bảo sau này Talent có thể nhận quyền sở hữu tài khoản mà không mất dữ liệu.

---

# Ý tưởng cốt lõi

**Mỗi Talent luôn tương ứng với một bản ghi trong bảng `users`.**

Tuy nhiên sẽ tồn tại hai loại tài khoản:

| Loại            | Mô tả                                                            |
| --------------- | ---------------------------------------------------------------- |
| Active Account  | Người dùng tự đăng ký, đã có email và thông tin đăng nhập đầy đủ |
| Managed Account | Được Agency tạo hộ, chưa được Talent kích hoạt                   |

Điều này giúp toàn bộ hệ thống (booking, chat, campaign, payment, notification...) chỉ cần tham chiếu đến `user_id`, không phải xử lý thêm một loại thực thể riêng.

---

# Cấu trúc dữ liệu đề xuất

## Bảng `users`

```sql
users
-----------------------------
id BIGINT PRIMARY KEY

email VARCHAR(255) NULL

password_hash VARCHAR(255) NULL

login_status ENUM(
    'managed',
    'active'
)

owner_brand_id BIGINT NULL

display_name VARCHAR(255)

phone VARCHAR(30)

date_of_birth DATE NULL

city VARCHAR(255)

created_at

updated_at
```

Trong đó:

* `managed`

  * Chưa có thông tin đăng nhập.
  * Chưa thuộc quyền sử dụng của Talent.
  * Được Agency quản lý hoàn toàn.

* `active`

  * Đã có email thật.
  * Đã có mật khẩu hoặc liên kết Google.
  * Talent có thể đăng nhập bình thường.

---

# Quy trình tạo Managed Account

## Bước 1

Agency bấm:

```
+ Thêm Talent mới
```

---

## Bước 2

Điền thông tin cơ bản:

* Họ tên
* Ngày sinh / Tuổi
* Số điện thoại
* Địa chỉ
* Nghề nghiệp
* Ảnh đại diện

---

## Bước 3

Backend tạo một bản ghi trong bảng `users`.

Ví dụ:

```text
id = 84521

email = NULL

password_hash = NULL

login_status = managed

owner_brand_id = 18

display_name = "Linh Chi"

phone = "0988888888"
```

Không cần tạo email giả.

Không cần tạo mật khẩu ngẫu nhiên.

Không cần gửi email.

---

# Vì sao không nên tạo email giả?

Ví dụ:

```
linhchi@brandabc.com
```

hoặc

```
linhchi_123@onstage.local
```

Các vấn đề phát sinh:

* Không xác thực được email.
* Không reset mật khẩu được.
* Không gửi OTP được.
* Không thể dùng làm danh tính thật của người dùng.
* Dễ gây nhầm lẫn khi Talent muốn sử dụng email cá nhân.

Do đó nên để:

```
email = NULL
```

cho đến khi Talent thực sự kích hoạt tài khoản.

---

# Kích hoạt tài khoản sau này

Khi Agency muốn bàn giao tài khoản cho Talent:

```
Managed Account
        │
        ▼
Gửi lời mời kích hoạt
        │
        ▼
Talent mở trang kích hoạt
```

Talent nhập:

* Email thật
* Mật khẩu

hoặc

* Đăng nhập bằng Google

Sau đó backend cập nhật:

```text
email = "linhchi@gmail.com"

password_hash = "..."

login_status = active
```

`user_id` vẫn giữ nguyên.

---

# Lợi ích của việc giữ nguyên user_id

Ví dụ trước khi kích hoạt:

```
Booking
-----------------

booking_id = 888

talent_id = 84521
```

Sau khi Talent kích hoạt:

```
users.id = 84521

email = linhchi@gmail.com

status = active
```

Không cần migrate dữ liệu.

Không cần đổi khóa ngoại.

Không cần cập nhật booking, chat, campaign hay lịch sử hoạt động.

---

# Hỗ trợ đăng nhập Google

Sau khi kích hoạt:

```
users
----------------------------

id = 84521

email = linhchi@gmail.com

google_id = xxxxxxxxx

login_status = active
```

Tài khoản Google chỉ là một phương thức đăng nhập bổ sung.

Danh tính thực tế của Talent vẫn được định nghĩa bởi `users.id`.

---

# Quyền quản lý

## Khi ở trạng thái `managed`

Agency có quyền:

* Chỉnh sửa hồ sơ.
* Đổi ảnh đại diện.
* Cập nhật thông tin.
* Quản lý booking.
* Quản lý campaign.
* Quản lý lịch.

Talent chưa thể đăng nhập.

---

## Sau khi chuyển sang `active`

Talent có thể:

* Đăng nhập.
* Cập nhật thông tin cá nhân.
* Liên kết Google.
* Đổi mật khẩu.
* Sử dụng các tính năng của hệ thống.

Agency vẫn giữ quyền quản lý roster nếu chưa hủy liên kết.

---

# Kết luận

**Khuyến nghị kiến trúc cuối cùng:**

* Backend **luôn tạo một bản ghi trong bảng `users`** ngay khi Agency thêm Talent.
* **Không tạo email giả, không sinh mật khẩu ngẫu nhiên.**
* Đánh dấu tài khoản bằng trạng thái `managed`.
* Khi Talent muốn sử dụng hệ thống, chỉ cần cập nhật bản ghi hiện có thành `active` bằng cách bổ sung email thật và phương thức đăng nhập.
* Toàn bộ các module khác (booking, campaign, chat, payment, notification...) chỉ cần tham chiếu đến `users.id`, giúp kiến trúc đơn giản, nhất quán và dễ mở rộng trong tương lai.


# TRIỂN KHAI

## Mục tiêu

Cho phép Brand tạo nhanh Talent có sẵn trong đội của mình mà không bắt Talent phải tự đăng ký tài khoản trước.

Talent được tạo theo cách này vẫn phải có dữ liệu thật trong hệ thống để có thể tham gia roster, campaign, booking, lịch trình, chat và các nghiệp vụ khác. Sau này, khi Talent muốn tự đăng nhập và quản lý tài khoản, họ sẽ claim lại chính bản ghi đã được tạo sẵn. Toàn bộ dữ liệu cũ vẫn giữ nguyên.

## Nguyên tắc chốt

Mỗi Talent trong hệ thống vẫn nên có:

- Một bản ghi `users`.
- Một bản ghi `profiles`.
- Một liên kết roster trong `brand_talents` nếu Talent thuộc mạng lưới của Brand.

Không tạo một loại thực thể riêng kiểu `temporary_talents`, vì như vậy sẽ làm phức tạp các module đã có như campaign, chat, booking, lịch trình và thông báo.

## Trạng thái tài khoản

Project hiện tại đã có cột `users.is_ghost`, nên dùng cột này thay vì thêm `login_status`.

| Trạng thái | Cách lưu | Ý nghĩa |
| --- | --- | --- |
| Managed Talent | `is_ghost = true` | Brand tạo hộ, Talent chưa claim và chưa đăng nhập được |
| Active Talent | `is_ghost = false` | Talent đã có email/mật khẩu hoặc social login và có thể đăng nhập |

Không cần thêm `owner_brand_id` vào `users`. Quan hệ Brand - Talent đã nằm đúng chỗ ở bảng `brand_talents`.

## Cấu trúc dữ liệu đề xuất

### Bảng `users`

Dùng các cột hiện có:

```text
id
name
email nullable
phone nullable
password nullable
type = talent
status = active
is_ghost = true/false
external_avatar_url nullable
```

Với Managed Talent:

```text
email = null
password = null
type = talent
status = active
is_ghost = true
```

Không tạo email giả. Không sinh mật khẩu ngẫu nhiên. Không để Brand nhập mật khẩu thay Talent.

### Bảng `profiles`

Thông tin hồ sơ Talent nên lưu vào `profiles`, không đẩy hết vào `users`.

Ví dụ:

```text
user_id
stage_name / display_name
city
category
bio
height_cm
weight_kg
skills
```

Nếu form tạo nhanh chỉ cần bản tối thiểu, có thể tạo trước các trường:

- Họ tên hiển thị.
- Số điện thoại.
- Thành phố.
- Nhóm nghề nghiệp.
- Mô tả ngắn.
- Ảnh đại diện nếu có.

### Bảng `brand_talents`

Sau khi tạo `users` và `profiles`, backend tạo liên kết roster:

```text
brand_user_id = Brand đang thao tác
talent_profile_id = profile vừa tạo
status = active
source = brand_created
joined_at = now()
```

Bảng này là nơi thể hiện Talent đang nằm dưới mạng lưới của Brand nào.

## Luồng tạo Talent nhanh

1. Brand vào màn hình quản lý Talent.
2. Chọn `Thêm Talent nhanh`.
3. Nhập thông tin cơ bản của Talent.
4. Backend validate trùng lặp theo phone/email nếu có.
5. Backend tạo `users` với `is_ghost = true`.
6. Backend tạo `profiles` cho user vừa tạo.
7. Backend tạo `brand_talents` với `status = active`.
8. Trả về roster item mới để FE hiện ngay trong danh sách Talent của Brand.

## Xử lý trùng lặp

Cần tránh việc Brand tạo nhiều bản ghi cho cùng một người.

Backend nên kiểm tra:

- Nếu email được nhập và đã tồn tại trong `users`, không tạo ghost user mới.
- Nếu phone đã tồn tại, nên báo cảnh báo hoặc cho Brand chọn dùng user/profile đã có.
- Nếu profile đã nằm trong roster của Brand, trả về lỗi "Talent đã nằm trong danh sách quản lý".

Nếu email thuộc một Talent đang hoạt động, luồng đúng nên là mời/gắn vào roster, không phải tạo managed account mới.

## Luồng claim tài khoản

Khi Brand muốn bàn giao tài khoản cho Talent:

1. Brand bấm `Gửi lời mời kích hoạt`.
2. Backend tạo claim token dùng một lần, có thời hạn.
3. Talent mở link claim.
4. Talent nhập email và mật khẩu, hoặc đăng nhập Google.
5. Backend cập nhật chính user cũ:

```text
email = email thật của Talent
password = mật khẩu đã hash nếu dùng password login
social_provider/social_id = thông tin social nếu dùng Google/Facebook
is_ghost = false
email_verified_at = thời điểm xác thực nếu có
```

`users.id` và `profiles.id` không đổi, nên booking, campaign, chat, lịch trình và lịch sử hoạt động không cần migrate.

## Bảo mật và phân quyền

### Khi còn là Managed Talent

Brand có thể:

- Sửa thông tin hồ sơ cơ bản.
- Cập nhật ảnh đại diện/ảnh hồ sơ.
- Thêm Talent vào campaign.
- Tạo booking, lịch trình, ghi chú nội bộ.
- Nhắn tin theo ngữ cảnh Brand quản lý nếu sản phẩm yêu cầu.

Talent chưa thể đăng nhập vì chưa có email/mật khẩu hợp lệ.

### Sau khi Talent claim

Talent có thể:

- Đăng nhập.
- Đổi email/mật khẩu.
- Cập nhật hồ sơ cá nhân.
- Liên kết social login.

Brand vẫn quản lý mối quan hệ roster/campaign, nhưng không nên tự do sửa mọi thông tin cá nhân của Talent nếu không có quy tắc rõ ràng.

## API nên có

MVP có thể gồm:

```text
POST /api/brand/talents/quick-create
```

Tạo managed talent và thêm vào roster của Brand hiện tại.

Sau đó thêm:

```text
POST /api/brand/talents/{brandTalent}/send-claim-invite
GET  /api/talent-claim/{token}
POST /api/talent-claim/{token}
```

Để gửi link và kích hoạt tài khoản.

## Admin và audit

Admin nên có:

- Bộ lọc Talent managed/active bằng `is_ghost`.
- Hiển thị Brand nào đang quản lý Talent trong roster.
- Log hành động tạo managed talent.
- Log hành động gửi claim invite.
- Log hành động claim thành công.

Nếu sau này cần merge dữ liệu, admin nên có công cụ riêng, không làm ngầm trong luồng tạo nhanh.

## Kết luận

Hướng nên làm:

- Tạo user thật ngay từ đầu, nhưng đánh dấu `is_ghost = true`.
- Lưu thông tin hồ sơ vào `profiles`.
- Lưu quan hệ với Brand vào `brand_talents`.
- Không tạo email giả.
- Không để Brand nhập mật khẩu hộ Talent.
- Khi Talent claim, cập nhật chính user cũ thành tài khoản đăng nhập thật.

Kiến trúc này hợp với BE hiện tại, giữ được khóa ngoại ổn định và không làm vỡ các module đã nối như campaign, booking, chat, lịch trình, notification và activity log.
