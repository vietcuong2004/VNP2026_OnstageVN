# Thiết kế 2 bảng mở rộng cho Campaign

Tài liệu này mô tả trạng thái CSDL và API backend hiện tại sau khi bổ sung 2 bảng:

- `campaign_events`
- `campaign_positions`

Migration đang dùng:

```text
backend/database/migrations/2026_08_07_000001_create_campaign_events_and_positions_tables.php
backend/database/migrations/2026_08_08_000001_add_location_to_campaign_events_table.php
```

## 1. Mục tiêu

Bảng `campaigns` cũ vẫn giữ một số field legacy:

- `event_name`
- `event_date`
- `talent_quantity`
- `requirements`
- `roles`

Các field này được giữ để tương thích ngược. Nghiệp vụ mới dùng:

- Một campaign có nhiều sự kiện.
- Mỗi sự kiện có thời gian bắt đầu, thời gian kết thúc, địa điểm tổ chức và nội dung riêng.
- Một campaign có nhiều vị trí tuyển dụng.
- Mỗi vị trí có loại talent, số lượng cần tuyển và yêu cầu riêng.
- Nội dung dạng danh sách được lưu bằng JSON để frontend dễ render/chỉnh sửa.

Quan hệ cần triển khai:

```text
campaigns
|
|-- 1:N -- campaign_events
|
`-- 1:N -- campaign_positions
```

## 2. Bảng `campaign_events`

### Mục đích

Lưu danh sách sự kiện thuộc một campaign. Một sự kiện có thể diễn ra qua nhiều ngày, ví dụ từ `08:00 07/08/2026` đến `22:00 09/08/2026`.

`location` là địa điểm tổ chức riêng của từng sự kiện. Field này tách biệt với `campaigns.location`, vì một campaign có thể có nhiều sự kiện ở các địa điểm khác nhau.

### Schema hiện tại

| Trường | Kiểu dữ liệu | Null | Mặc định | Mô tả |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | Auto Increment | ID sự kiện |
| `campaign_id` | `BIGINT UNSIGNED` | No | - | Campaign chứa sự kiện |
| `name` | `VARCHAR(255)` | No | - | Tên sự kiện |
| `start_at` | `DATETIME` | No | - | Ngày giờ bắt đầu |
| `end_at` | `DATETIME` | No | - | Ngày giờ kết thúc |
| `location` | `VARCHAR(255)` | Yes | `NULL` | Địa điểm tổ chức sự kiện |
| `content` | `JSON` | Yes | `NULL` | Danh sách nội dung sự kiện |
| `sort_order` | `SMALLINT UNSIGNED` | No | `0` | Thứ tự hiển thị |
| `created_at` | `TIMESTAMP` | Yes | `NULL` | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Yes | `NULL` | Thời điểm cập nhật |

### SQL tương ứng

```sql
CREATE TABLE campaign_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campaign_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    location VARCHAR(255) NULL,
    content JSON NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign_events_campaign_id (campaign_id),
    INDEX idx_campaign_events_start_at (start_at)
);
```

Với database đã có bảng `campaign_events`, cột `location` được thêm bằng migration riêng:

```php
Schema::table('campaign_events', function (Blueprint $table): void {
    if (! Schema::hasColumn('campaign_events', 'location')) {
        $table->string('location')->nullable()->after('end_at');
    }
});
```

### `content`

`content` là JSON array, mỗi phần tử là một chuỗi mô tả nội dung cần tham gia.

```json
[
  "Đón khách và check-in",
  "Chụp ảnh cùng khách mời",
  "Tham gia phần khai mạc chương trình"
]
```

Quy ước:

- Root luôn là `array`.
- Mỗi phần tử là `string`.
- Không lưu HTML.
- Không có nội dung thì dùng `NULL` hoặc `[]`.

## 3. Bảng `campaign_positions`

### Mục đích

Lưu các vị trí talent mà campaign cần tuyển.

Ví dụ:

```text
Campaign #58

|-- KOL: 3 người
|-- KOC: 2 người
`-- Livestreamer: 1 người
```

### Lưu ý về CSDL hiện tại

Backend hiện tại chưa có bảng danh mục `talent_types`, vì vậy `campaign_positions` đang lưu loại talent bằng field:

```text
talent_type VARCHAR(100)
```

Không dùng `talent_type_id` ở phiên bản hiện tại.

### Schema hiện tại

| Trường | Kiểu dữ liệu | Null | Mặc định | Mô tả |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | Auto Increment | ID vị trí tuyển |
| `campaign_id` | `BIGINT UNSIGNED` | No | - | Campaign chứa vị trí |
| `talent_type` | `VARCHAR(100)` | No | - | Tên loại talent, ví dụ `KOL`, `KOC` |
| `quantity` | `SMALLINT UNSIGNED` | No | `1` | Số lượng cần tuyển |
| `requirements` | `JSON` | Yes | `NULL` | Danh sách yêu cầu riêng |
| `sort_order` | `SMALLINT UNSIGNED` | No | `0` | Thứ tự hiển thị |
| `created_at` | `TIMESTAMP` | Yes | `NULL` | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Yes | `NULL` | Thời điểm cập nhật |

### SQL tương ứng

```sql
CREATE TABLE campaign_positions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campaign_id BIGINT UNSIGNED NOT NULL,
    talent_type VARCHAR(100) NOT NULL,
    quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    requirements JSON NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign_positions_campaign_id (campaign_id),
    INDEX idx_campaign_positions_talent_type (talent_type),
    UNIQUE KEY campaign_positions_campaign_id_talent_type_unique (campaign_id, talent_type)
);
```

`UNIQUE (campaign_id, talent_type)` giúp tránh một campaign có nhiều dòng trùng loại talent.

### `requirements`

`requirements` là JSON array, mỗi phần tử là một yêu cầu riêng của vị trí đó.

```json
[
  "Có tối thiểu 50.000 người theo dõi",
  "Nội dung phù hợp với lĩnh vực làm đẹp",
  "Tỷ lệ tương tác tốt"
]
```

Quy ước:

- Root luôn là `array`.
- Mỗi phần tử là `string`.
- Không lưu HTML.
- Không có yêu cầu riêng thì dùng `NULL` hoặc `[]`.

## 4. Model backend

Các model đã thêm:

```text
backend/app/Models/CampaignEvent.php
backend/app/Models/CampaignPosition.php
```

`CampaignEvent`:

- `belongsTo(Campaign::class)`
- Fillable: `campaign_id`, `name`, `start_at`, `end_at`, `location`, `content`, `sort_order`
- Cast `start_at`, `end_at` sang `datetime`
- Cast `content` sang `array`

`CampaignPosition`:

- `belongsTo(Campaign::class)`
- Cast `requirements` sang `array`
- Có accessor `talent_type_name`, trả về chính `talent_type` để frontend dùng thống nhất.

`Campaign` đã có thêm relation:

```php
public function events(): HasMany
public function positions(): HasMany
```

`Campaign` cũng có appended field:

```text
total_talent_quantity
```

Giá trị này được tính bằng tổng `campaign_positions.quantity`. Nếu campaign chưa có positions thì fallback về `campaigns.talent_quantity`.

## 5. API request

Khi tạo/cập nhật campaign, backend chấp nhận thêm `events` và `positions`.

### `events`

```json
{
  "events": [
    {
      "name": "Ra mắt dòng son Lancôme Absolu Velvet",
      "start_at": "2026-08-07 08:00:00",
      "end_at": "2026-08-09 22:00:00",
      "location": "Studio 102 Nguyễn Huệ, Quận 1, Hồ Chí Minh",
      "content": [
        "Đón khách và check-in",
        "Chụp ảnh cùng khách mời"
      ],
      "sort_order": 0
    }
  ]
}
```

Validation hiện tại:

- `events` là array, tối đa 50 phần tử.
- `events.*.name` bắt buộc khi có `events`.
- `events.*.start_at` bắt buộc khi có `events`, kiểu date.
- `events.*.end_at` bắt buộc khi có `events`, kiểu date.
- `events.*.location` nullable, string, tối đa 255 ký tự.
- `end_at` phải lớn hơn `start_at`.
- `content` là array, mỗi phần tử là string tối đa 1000 ký tự.
- `sort_order` là số nguyên từ 0 đến 65535.

### `positions`

```json
{
  "positions": [
    {
      "talent_type": "KOL",
      "quantity": 3,
      "requirements": [
        "Có tối thiểu 50.000 người theo dõi",
        "Hình ảnh chuyên nghiệp"
      ],
      "sort_order": 0
    }
  ]
}
```

Backend cũng chấp nhận các alias sau để lấy tên loại talent:

- `talent_type`
- `talent_type_name`
- `name`
- `title`
- `role`
- `type`

Validation hiện tại:

- `positions` là array, tối đa 50 phần tử.
- Loại talent bắt buộc, lấy từ một trong các alias bên trên.
- Không được trùng loại talent trong cùng request sau khi normalize chữ thường.
- `quantity` là số nguyên từ 1 đến 1000, mặc định 1.
- `requirements` là array, mỗi phần tử là string tối đa 1000 ký tự.
- `sort_order` là số nguyên từ 0 đến 65535.

## 6. API response

### Brand campaign response

Các API brand trả campaign kèm relation:

- `media`
- `coverMedia`
- `events`
- `positions`

Campaign cũng có:

```text
total_talent_quantity
```

### Public/talent campaign response

API public/talent trả thêm dữ liệu normalize để frontend dễ dùng.

Ví dụ `events`:

```json
[
  {
    "id": 12,
    "name": "Ra mắt dòng son Lancôme Absolu Velvet",
    "title": "Ra mắt dòng son Lancôme Absolu Velvet",
    "event_name": "Ra mắt dòng son Lancôme Absolu Velvet",
    "start_at": "2026-08-07T01:00:00.000000Z",
    "starts_at": "2026-08-07T01:00:00.000000Z",
    "start_date": "2026-08-07",
    "start_time": "08:00",
    "end_at": "2026-08-09T15:00:00.000000Z",
    "ends_at": "2026-08-09T15:00:00.000000Z",
    "end_date": "2026-08-09",
    "end_time": "22:00",
    "location": "Studio 102 Nguyễn Huệ, Quận 1, Hồ Chí Minh",
    "address": "Studio 102 Nguyễn Huệ, Quận 1, Hồ Chí Minh",
    "venue": "Studio 102 Nguyễn Huệ, Quận 1, Hồ Chí Minh",
    "content": [
      "Đón khách và check-in"
    ],
    "note": "Đón khách và check-in",
    "sort_order": 0
  }
]
```

Ví dụ `positions`:

```json
[
  {
    "id": 1,
    "talent_type": "KOL",
    "talent_type_name": "KOL",
    "title": "KOL",
    "name": "KOL",
    "quantity": 3,
    "count": 3,
    "requirements": [
      "Có tối thiểu 50.000 người theo dõi"
    ],
    "sort_order": 0
  }
]
```

## 7. Các field legacy trên `campaigns`

Các field sau vẫn giữ để tương thích:

```text
event_name
event_date
talent_quantity
requirements
roles
```

Quy ước sử dụng:

- `campaign_events` là nguồn dữ liệu chính cho thông tin sự kiện mới.
- `campaign_events.location` là nguồn dữ liệu chính cho địa điểm từng sự kiện.
- `campaign_positions` là nguồn dữ liệu chính cho vị trí tuyển dụng mới.
- `campaigns.location` là địa điểm làm việc/campaign tổng quát, không thay thế địa điểm từng sự kiện.
- `campaigns.talent_quantity` chỉ dùng fallback khi campaign chưa có positions.
- `campaigns.requirements` hiện vẫn giữ theo schema cũ để lưu yêu cầu chung.
- `campaigns.event_name`, `campaigns.event_date`, `campaigns.roles` chỉ nên dùng cho tương thích ngược.

## 8. Backfill dữ liệu cũ

Nếu cần backfill từ campaign cũ:

- `event_name` và `event_date` có thể tạo một record `campaign_events`.
- `campaigns.location` có thể copy sang `campaign_events.location` cho record backfill đầu tiên nếu chưa có địa điểm sự kiện riêng.
- Vì dữ liệu cũ không có đủ giờ bắt đầu/kết thúc, cần admin bổ sung lại `start_at` và `end_at`.
- `roles` và `talent_quantity` không đủ để suy ra số lượng riêng cho từng vị trí, vì vậy không nên tự chia số lượng. Nên để admin nhập lại `campaign_positions`.

## 9. Hướng nâng cấp sau này

Nếu hệ thống cần quản lý danh mục loại talent tập trung, có thể bổ sung bảng:

```text
talent_types
```

Sau đó migrate:

```text
campaign_positions.talent_type -> campaign_positions.talent_type_id
```

Ở thời điểm hiện tại không làm thay đổi này vì CSDL chưa có `talent_types`, và backend đang chạy ổn với `talent_type VARCHAR(100)`.

## 10. Kết luận

Schema hiện tại đã tách đúng 2 quan hệ 1:N chính của campaign:

- `campaign_events`: một campaign có nhiều sự kiện, mỗi sự kiện có thời gian, địa điểm và nội dung riêng.
- `campaign_positions`: một campaign có nhiều vị trí tuyển dụng.

Thiết kế hiện tại ưu tiên tương thích với CSDL đang có, tránh tạo khóa ngoại tới bảng chưa tồn tại, đồng thời vẫn giữ đường nâng cấp rõ ràng nếu sau này cần chuẩn hóa `talent_type` thành bảng danh mục riêng.
