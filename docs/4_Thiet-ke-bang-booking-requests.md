# Thiết kế bảng `booking_requests` cho tính năng Đặt ngay Talent

Tài liệu này mô tả bảng mới để lưu toàn bộ dữ liệu từ luồng:

```text
frontend/app/brand/talents/[id]/booking-talent
```

Các form đã đọc:

- `BookingFlow.tsx`
- `BookingMCForm.tsx`
- `BookingPGForm.tsx`
- `BookingLookbookForm.tsx`
- `BookingContactForm.tsx`
- `BookingTimeFields.tsx`

## 1. Kết luận thiết kế

Nên tạo bảng mới `booking_requests`, không lưu trực tiếp vào `campaigns`.

Lý do:

- `campaigns` là chiến dịch/tin tuyển dụng, có thể tuyển nhiều talent và nhiều vị trí.
- `booking_requests` là yêu cầu đặt ngay một talent cụ thể, có contact, gói giá, đặt cọc, QR chuyển khoản và trạng thái xử lý riêng.
- Guest chưa đăng nhập vẫn có thể tạo request, nên `brand_id` cần nullable.
- Sau này request có thể chuyển thành campaign/job/backend booking chính thức bằng `campaign_id` hoặc `confirmed_booking_id` nullable.

## 2. Phạm vi dữ liệu từ frontend

### Bước chọn loại công việc

`selectedJobType` có 3 giá trị hiện tại:

| Giá trị | Ý nghĩa |
|---|---|
| `mc` | MC / dẫn chương trình |
| `pg` | PG/PB / hỗ trợ sự kiện |
| `lookbook` | Người mẫu chụp ảnh/quay lookbook |

### Bước chọn gói và xem giá

Bước này chỉ hiển thị với user chưa đăng nhập. User đã đăng nhập đi thẳng vào form chi tiết.

Gói hiện tại:

| `package_id` | Tên gói | Thời lượng | Giá |
|---|---|---|---|
| `basic` | Gói cơ bản | 1-2 tiếng | 200000 |
| `standard` | Gói tiêu chuẩn | 2-4 tiếng | 300000 |
| `premium` | Gói nâng cao | 1 ngày | 500000 |

### Các trường dùng chung

Các form đều có:

- `jobName`: tên/tiêu đề công việc, bắt buộc.
- `workDate`: ngày làm việc, một ngày duy nhất.
- `startTime`: giờ bắt đầu.
- `endTime`: giờ kết thúc.
- `extraRequirements`: yêu cầu thêm, không bắt buộc.
- contact name, phone, email.
- payment method: `bank` hoặc `wallet`.
- deposit amount hiện tại: `200000`.
- request code dạng: `#ROLEddmmyy-001`, ví dụ `#MC100826-001`.

### Trường riêng theo loại công việc

MC:

- `mcJobDescription`
- `mcLocation`
- `mcLanguage`
- `mcExperience`

PG/PB:

- `pgJobDescription`
- `pgOutfit`
- `pgSkills`

Lookbook:

- `lookbookTopic`
- `lookbookStyle`
- `lookbookLocation`

## 3. Bảng đề xuất: `booking_requests`

### Mục đích

Lưu một yêu cầu đặt dịch vụ talent từ Brand hoặc guest. Mỗi record đại diện cho một lần bấm "Xác nhận & Đặt cọc" trong luồng booking.

Bảng này giữ dữ liệu dạng snapshot tại thời điểm gửi yêu cầu. Không phụ thuộc vào việc sau này talent đổi tên, gói đổi giá, hoặc thông tin form thay đổi.

### Schema chi tiết

| Trường | Kiểu dữ liệu | Null | Mặc định | Ràng buộc | Mục đích |
|---|---:|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | Auto Increment | Primary key | ID nội bộ của request |
| `request_code` | `VARCHAR(32)` | No | - | Unique | Mã hiển thị cho người dùng, ví dụ `#MC100826-001` |
| `brand_id` | `BIGINT UNSIGNED` | Yes | `NULL` | FK `users.id` | Brand đã đăng nhập tạo request; nullable cho guest |
| `talent_id` | `BIGINT UNSIGNED` | No | - | FK talent/user/profile hiện tại | Talent được đặt ngay |
| `campaign_id` | `BIGINT UNSIGNED` | Yes | `NULL` | FK `campaigns.id` | Liên kết campaign nếu request được chuyển thành campaign/job |
| `job_type` | `VARCHAR(32)` | No | - | Enum app: `mc`, `pg`, `lookbook` | Loại công việc đã chọn |
| `package_id` | `VARCHAR(32)` | Yes | `NULL` | Enum app: `basic`, `standard`, `premium` | Gói user chọn; nullable nếu user đăng nhập không đi qua bước chọn gói |
| `package_name` | `VARCHAR(100)` | Yes | `NULL` | - | Snapshot tên gói tại thời điểm request |
| `package_duration` | `VARCHAR(50)` | Yes | `NULL` | - | Snapshot thời lượng gói |
| `package_price` | `DECIMAL(12,2)` | Yes | `NULL` | `>= 0` | Snapshot giá gói |
| `currency` | `CHAR(3)` | No | `VND` | ISO-like | Đơn vị tiền tệ |
| `job_name` | `VARCHAR(255)` | No | - | Not empty | Tên công việc |
| `job_description` | `TEXT` | Yes | `NULL` | - | Mô tả công việc dùng chung; lấy từ MC/PG hoặc null với Lookbook |
| `work_date` | `DATE` | No | - | - | Ngày làm việc duy nhất |
| `start_time` | `TIME` | No | - | - | Giờ bắt đầu trong ngày |
| `end_time` | `TIME` | No | - | `end_time > start_time` | Giờ kết thúc trong ngày |
| `location` | `TEXT` | Yes | `NULL` | - | Địa điểm làm việc/studio; lấy từ form tương ứng |
| `extra_requirements` | `TEXT` | Yes | `NULL` | - | Yêu cầu thêm |
| `job_details` | `JSON` | Yes | `NULL` | JSON object | Dữ liệu riêng theo từng loại job |
| `contact_name` | `VARCHAR(120)` | No | - | Not empty | Họ tên người liên hệ |
| `contact_phone` | `VARCHAR(30)` | No | - | Not empty | Số điện thoại liên hệ |
| `contact_email` | `VARCHAR(255)` | Yes | `NULL` | Email format | Email liên hệ, không bắt buộc |
| `deposit_amount` | `DECIMAL(12,2)` | No | `200000.00` | `>= 0` | Số tiền đặt cọc |
| `remaining_amount` | `DECIMAL(12,2)` | Yes | `NULL` | `>= 0` | Số tiền còn lại sau đặt cọc, tính từ `package_price - deposit_amount` nếu có package |
| `payment_method` | `VARCHAR(32)` | No | `bank` | Enum app: `bank`, `wallet` | Phương thức thanh toán user chọn |
| `payment_status` | `VARCHAR(32)` | No | `pending` | Enum app | Trạng thái thanh toán đặt cọc |
| `request_status` | `VARCHAR(32)` | No | `deposit_pending` | Enum app | Trạng thái xử lý booking request |
| `deposit_transfer_content` | `VARCHAR(255)` | Yes | `NULL` | - | Nội dung chuyển khoản, ví dụ `ONSTAGE_DEPOC_HOTEN_SODT` |
| `deposit_qr_payload` | `TEXT` | Yes | `NULL` | - | Payload tạo QR tại frontend/backend |
| `deposit_paid_at` | `DATETIME` | Yes | `NULL` | - | Thời điểm xác nhận đã nhận đặt cọc |
| `confirmed_at` | `DATETIME` | Yes | `NULL` | - | Thời điểm admin/talent xác nhận nhận job |
| `cancelled_at` | `DATETIME` | Yes | `NULL` | - | Thời điểm hủy request |
| `cancel_reason` | `TEXT` | Yes | `NULL` | - | Lý do hủy |
| `source` | `VARCHAR(50)` | No | `talent_detail_booking` | - | Nguồn tạo request |
| `metadata` | `JSON` | Yes | `NULL` | JSON object | Dữ liệu mở rộng không cần query thường xuyên |
| `created_at` | `TIMESTAMP` | Yes | `NULL` | - | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Yes | `NULL` | - | Thời điểm cập nhật |

## 4. Enum đề xuất

### `job_type`

```text
mc
pg
lookbook
```

Không dùng label hiển thị làm giá trị DB, vì label có thể đổi từ `PG` sang `PG/PB`.

### `package_id`

```text
basic
standard
premium
```

`package_id` nên nullable vì user đã đăng nhập hiện tại không bắt buộc đi qua bước chọn gói. Nếu sau này muốn tất cả request đều có gói, có thể set default `basic` và đổi cột thành not null.

### `payment_method`

```text
bank
wallet
```

Hiện tại frontend có 2 lựa chọn: chuyển khoản ngân hàng và ví điện tử.

### `payment_status`

```text
pending
awaiting_transfer
paid
failed
refunded
cancelled
```

Ý nghĩa:

| Giá trị | Mục đích |
|---|---|
| `pending` | Mới tạo request, chưa chọn/khởi tạo thanh toán |
| `awaiting_transfer` | Đã hiển thị QR hoặc hướng dẫn chuyển khoản, chờ xác nhận |
| `paid` | Đã nhận đặt cọc |
| `failed` | Thanh toán lỗi |
| `refunded` | Đã hoàn tiền đặt cọc |
| `cancelled` | Payment bị hủy, thường đi kèm request hủy |

### `request_status`

```text
deposit_pending
submitted
reviewing
talent_confirming
confirmed
rejected
cancelled
completed
```

Ý nghĩa:

| Giá trị | Mục đích |
|---|---|
| `deposit_pending` | User đã gửi thông tin, đang ở bước đặt cọc |
| `submitted` | Đã đặt cọc/xác nhận chuyển khoản, request được gửi vào hệ thống |
| `reviewing` | Admin/CS đang kiểm tra |
| `talent_confirming` | Đang chờ talent xác nhận |
| `confirmed` | Talent/brand/admin đã xác nhận booking |
| `rejected` | Talent/admin từ chối |
| `cancelled` | Brand/guest/admin hủy |
| `completed` | Công việc đã hoàn tất |

## 5. Cách map dữ liệu theo form

### MC

| Frontend state | DB field |
|---|---|
| `jobName` | `job_name` |
| `mcJobDescription` | `job_description` |
| `workDate` | `work_date` |
| `startTime` | `start_time` |
| `endTime` | `end_time` |
| `mcLocation` | `location` |
| `extraRequirements` | `extra_requirements` |
| `mcLanguage` | `job_details.language` |
| `mcExperience` | `job_details.experience` |

JSON đề xuất:

```json
{
  "mc": {
    "language": "Tiếng Việt",
    "experience": "Không yêu cầu"
  }
}
```

### PG/PB

| Frontend state | DB field |
|---|---|
| `jobName` | `job_name` |
| `pgJobDescription` | `job_description` |
| `workDate` | `work_date` |
| `startTime` | `start_time` |
| `endTime` | `end_time` |
| `extraRequirements` | `extra_requirements` |
| `pgOutfit` | `job_details.outfit` |
| `pgSkills` | `job_details.skills` |

JSON đề xuất:

```json
{
  "pg": {
    "outfit": "Áo dài / đồng phục Brand",
    "skills": "Giao tiếp tốt, cao 1m68 trở lên"
  }
}
```

### Lookbook

| Frontend state | DB field |
|---|---|
| `jobName` | `job_name` |
| `workDate` | `work_date` |
| `startTime` | `start_time` |
| `endTime` | `end_time` |
| `lookbookLocation` | `location` |
| `extraRequirements` | `extra_requirements` |
| `lookbookTopic` | `job_details.topic` |
| `lookbookStyle` | `job_details.style` |

JSON đề xuất:

```json
{
  "lookbook": {
    "topic": "BST Xuân Hè",
    "style": "Sang trọng & Dạ hội"
  }
}
```

### Thông tin liên hệ

| Frontend state | DB field | Bắt buộc |
|---|---|---|
| `contactName` | `contact_name` | Có |
| `contactPhone` | `contact_phone` | Có |
| `contactEmail` | `contact_email` | Không |

## 6. SQL đề xuất

```sql
CREATE TABLE booking_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(32) NOT NULL,

    brand_id BIGINT UNSIGNED NULL,
    talent_id BIGINT UNSIGNED NOT NULL,
    campaign_id BIGINT UNSIGNED NULL,

    job_type VARCHAR(32) NOT NULL,
    package_id VARCHAR(32) NULL,
    package_name VARCHAR(100) NULL,
    package_duration VARCHAR(50) NULL,
    package_price DECIMAL(12, 2) NULL,
    currency CHAR(3) NOT NULL DEFAULT 'VND',

    job_name VARCHAR(255) NOT NULL,
    job_description TEXT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NULL,
    extra_requirements TEXT NULL,
    job_details JSON NULL,

    contact_name VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    contact_email VARCHAR(255) NULL,

    deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 200000.00,
    remaining_amount DECIMAL(12, 2) NULL,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'bank',
    payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    request_status VARCHAR(32) NOT NULL DEFAULT 'deposit_pending',
    deposit_transfer_content VARCHAR(255) NULL,
    deposit_qr_payload TEXT NULL,
    deposit_paid_at DATETIME NULL,

    confirmed_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    cancel_reason TEXT NULL,

    source VARCHAR(50) NOT NULL DEFAULT 'talent_detail_booking',
    metadata JSON NULL,

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    UNIQUE KEY uq_booking_requests_request_code (request_code),
    INDEX idx_booking_requests_brand_status (brand_id, request_status),
    INDEX idx_booking_requests_talent_status (talent_id, request_status),
    INDEX idx_booking_requests_work_date (work_date),
    INDEX idx_booking_requests_payment_status (payment_status),
    INDEX idx_booking_requests_created_at (created_at)
);
```

Nếu database đang dùng MySQL 8+, nên thêm check constraints:

```sql
ALTER TABLE booking_requests
    ADD CONSTRAINT chk_booking_requests_job_type
    CHECK (job_type IN ('mc', 'pg', 'lookbook')),
    ADD CONSTRAINT chk_booking_requests_package_id
    CHECK (package_id IS NULL OR package_id IN ('basic', 'standard', 'premium')),
    ADD CONSTRAINT chk_booking_requests_payment_method
    CHECK (payment_method IN ('bank', 'wallet')),
    ADD CONSTRAINT chk_booking_requests_payment_status
    CHECK (payment_status IN ('pending', 'awaiting_transfer', 'paid', 'failed', 'refunded', 'cancelled')),
    ADD CONSTRAINT chk_booking_requests_request_status
    CHECK (request_status IN ('deposit_pending', 'submitted', 'reviewing', 'talent_confirming', 'confirmed', 'rejected', 'cancelled', 'completed')),
    ADD CONSTRAINT chk_booking_requests_time_range
    CHECK (end_time > start_time),
    ADD CONSTRAINT chk_booking_requests_amounts
    CHECK (deposit_amount >= 0 AND (package_price IS NULL OR package_price >= 0) AND (remaining_amount IS NULL OR remaining_amount >= 0));
```

Foreign key cần chỉnh theo schema thực tế của backend:

```sql
ALTER TABLE booking_requests
    ADD CONSTRAINT fk_booking_requests_brand_id
    FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_booking_requests_talent_id
    FOREIGN KEY (talent_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_booking_requests_campaign_id
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
```

Nếu talent hiện được lưu ở bảng khác như `talent_profiles`, đổi FK `talent_id` sang bảng đó.

## 7. Quy tắc nghiệp vụ

### Tạo mã yêu cầu

Frontend đang mock:

```text
#ROLEddmmyy-001
```

Backend nên là nguồn tạo mã chính thức để tránh trùng.

Quy tắc đề xuất:

```text
#{JOB_TYPE_UPPER}{DDMMYY}-{sequence 3 digits}
```

Ví dụ:

```text
#MC100826-001
#PG100826-002
#LOOKBOOK100826-003
```

`sequence` nên tăng theo ngày và loại job, hoặc tăng toàn cục theo ngày. Cần unique index trên `request_code`.

### Tính tiền

- `deposit_amount` hiện cố định `200000`.
- `package_price` lưu snapshot từ gói đã chọn.
- `remaining_amount = max(package_price - deposit_amount, 0)` nếu có `package_price`.
- Với user đã đăng nhập không chọn gói, `package_price` và `remaining_amount` có thể null.

### Guest vs logged-in

| Trường hợp | `brand_id` | `package_id` |
|---|---|---|
| Đã đăng nhập | Có user id | Có thể null hoặc default `basic` |
| Chưa đăng nhập | `NULL` | Nên có gói đã chọn |

Với guest, contact name/phone là dữ liệu định danh chính để CS liên hệ.

### Thời gian

Form chỉ cho đặt trong một ngày:

- `work_date`: ngày làm việc.
- `start_time`: giờ bắt đầu.
- `end_time`: giờ kết thúc.

Không dùng `start_at/end_at` trong MVP này trừ khi sau này cần hỗ trợ booking qua nhiều ngày.

## 8. API payload đề xuất

```json
{
  "talent_id": 123,
  "job_type": "mc",
  "package_id": "basic",
  "job_name": "MC khai trương showroom",
  "job_description": "Dẫn chương trình khai trương, giới thiệu khách mời.",
  "work_date": "2026-08-12",
  "start_time": "18:00",
  "end_time": "20:00",
  "location": "Quận 1, TP.HCM",
  "extra_requirements": "Trang phục lịch sự, tone đen.",
  "job_details": {
    "mc": {
      "language": "Tiếng Việt",
      "experience": "1 - 3 năm"
    }
  },
  "contact_name": "Nguyễn Văn A",
  "contact_phone": "0123456789",
  "contact_email": "brand@example.com",
  "payment_method": "bank"
}
```

## 9. Response tạo request đề xuất

```json
{
  "id": 456,
  "request_code": "#MC100826-001",
  "deposit_amount": 200000,
  "remaining_amount": 0,
  "payment_method": "bank",
  "payment_status": "awaiting_transfer",
  "request_status": "deposit_pending",
  "deposit_transfer_content": "ONSTAGE_DEPOC_NGUYENVANA_0123456789",
  "deposit_qr_payload": "ONSTAGE_DEPOC_#MC100826-001_200000_NGUYENVANA_0123456789"
}
```

## 10. Ghi chú triển khai backend

- Validate `contact_name` và `contact_phone` bắt buộc.
- Validate `contact_email` chỉ khi có nhập.
- Trim toàn bộ text field.
- Không lưu HTML từ textarea.
- Không tin `deposit_amount`, `package_price` từ frontend; backend tự map từ cấu hình gói.
- Backend tự tạo `request_code`, `deposit_transfer_content`, `deposit_qr_payload`.
- Nếu sau này có bảng payment/transactions riêng, `booking_requests` chỉ giữ trạng thái tổng quan; chi tiết giao dịch đưa sang bảng `booking_request_payments` hoặc `transactions`.
- Khi `payment_status = paid`, nên set `deposit_paid_at`.
- Khi `request_status = confirmed`, nên set `confirmed_at`.
- Khi `request_status = cancelled`, nên set `cancelled_at` và `cancel_reason` nếu có.

## 11. Có cần tách thêm bảng không?

MVP chỉ cần `booking_requests`.

Sau này nên tách thêm khi phát sinh nhu cầu:

| Bảng | Khi nào cần |
|---|---|
| `booking_request_payments` | Có nhiều lần thanh toán, webhook gateway, refund từng phần |
| `booking_request_status_logs` | Cần audit lịch sử đổi trạng thái |
| `booking_request_messages` | Cần trao đổi giữa CS/brand/talent trong request |
| `bookings` | Khi request được xác nhận thành booking chính thức có lịch làm việc và escrow đầy đủ |

Với trạng thái frontend hiện tại, một bảng `booking_requests` là đủ rõ, đủ mở rộng và không làm bẩn bảng `campaigns`.
