# Chuyển dữ liệu từ `campaigns` sang 2 bảng mới

Tài liệu này mô tả cách chuyển dữ liệu campaign cũ sang 2 bảng mới:

- `campaign_events`
- `campaign_positions`

Tài liệu đã được cập nhật theo đúng CSDL/backend hiện tại.

## 1. Mục tiêu

Sau khi thêm 2 bảng mới, dữ liệu chính nên được đọc từ:

```text
campaign_events
campaign_positions
```

Các field cũ trong `campaigns` vẫn giữ lại để tương thích:

```text
event_name
event_date
start_date
end_date
talent_quantity
requirements
roles
```

Trong giai đoạn đầu:

- Không xóa cột cũ.
- Chỉ copy hoặc sinh dữ liệu sang bảng mới.
- Backend/frontend ưu tiên đọc bảng mới.
- Nếu campaign chưa có dữ liệu mới thì fallback về field cũ.

## 2. Schema hiện tại cần tuân thủ

### `campaign_events`

```text
id
campaign_id
name
start_at       DATETIME NOT NULL
end_at         DATETIME NOT NULL
content        JSON NULL
sort_order     SMALLINT UNSIGNED DEFAULT 0
created_at
updated_at
```

Lưu ý quan trọng:

- `start_at` không được `NULL`.
- `end_at` không được `NULL`.
- `end_at` phải lớn hơn `start_at`.

### `campaign_positions`

```text
id
campaign_id
talent_type    VARCHAR(100) NOT NULL
quantity       SMALLINT UNSIGNED NOT NULL DEFAULT 1
requirements   JSON NULL
sort_order     SMALLINT UNSIGNED DEFAULT 0
created_at
updated_at
```

Lưu ý quan trọng:

- Hiện tại không có `talent_type_id`.
- Backend đang dùng `talent_type` dạng string, ví dụ `KOL`, `KOC`, `Livestreamer`.
- `quantity` không được `NULL`, mặc định là `1`.
- Không được trùng `talent_type` trong cùng một campaign.

## 3. Mapping dữ liệu sự kiện

### Dữ liệu cũ

```text
campaigns.event_name
campaigns.event_date
campaigns.start_date
campaigns.end_date
campaigns.location
campaigns.contact_note
```

### Dữ liệu mới

```text
campaign_events.campaign_id
campaign_events.name
campaign_events.start_at
campaign_events.end_at
campaign_events.content
campaign_events.sort_order
```

### Quy tắc migrate

| Field mới | Giá trị đề xuất |
|---|---|
| `campaign_id` | `campaigns.id` |
| `name` | `campaigns.event_name` nếu có, nếu không dùng `campaigns.title` |
| `start_at` | Ngày sự kiện + `08:00:00` |
| `end_at` | Ngày sự kiện + `22:00:00` |
| `content` | Mảng lấy từ ghi chú/nội dung nếu có, không có thì `[]` |
| `sort_order` | `0` |

Ngày sự kiện ưu tiên lấy theo thứ tự:

1. `campaigns.event_date`
2. `campaigns.start_date`
3. `campaigns.created_at`

Vì schema hiện tại không cho phép `end_at = NULL`, không được migrate theo kiểu để trống giờ kết thúc. Nếu dữ liệu cũ chỉ có ngày, dùng khung giờ mặc định:

```text
start_at = YYYY-MM-DD 08:00:00
end_at   = YYYY-MM-DD 22:00:00
```

Sau khi brand/admin mở campaign cũ, họ có thể cập nhật lại giờ chính xác.

### Ví dụ

Dữ liệu cũ:

```text
campaigns.id = 25
campaigns.title = "Tuyển KOL cho Toyota"
campaigns.event_name = "Chiến dịch quảng bá thương hiệu Toyota"
campaigns.event_date = "2026-08-07"
campaigns.contact_note = "Ứng viên vui lòng đính kèm link portfolio."
```

Dữ liệu mới:

```text
campaign_events.campaign_id = 25
campaign_events.name = "Chiến dịch quảng bá thương hiệu Toyota"
campaign_events.start_at = "2026-08-07 08:00:00"
campaign_events.end_at = "2026-08-07 22:00:00"
campaign_events.content = [
  "Ứng viên vui lòng đính kèm link portfolio."
]
campaign_events.sort_order = 0
```

## 4. Mapping dữ liệu vị trí tuyển dụng

### Dữ liệu cũ

```json
{
  "roles": ["KOL", "KOC", "MC"],
  "talent_quantity": 5,
  "requirements": "Có thái độ chuyên nghiệp, đúng giờ."
}
```

### Dữ liệu mới

```text
campaign_positions.talent_type
campaign_positions.quantity
campaign_positions.requirements
```

### Quy tắc migrate

Với mỗi phần tử trong `campaigns.roles`, tạo một record trong `campaign_positions`.

| Field mới | Giá trị đề xuất |
|---|---|
| `campaign_id` | `campaigns.id` |
| `talent_type` | Giá trị từng phần tử trong `roles` |
| `quantity` | Xem quy tắc bên dưới |
| `requirements` | `[]` |
| `sort_order` | Index của role trong mảng, bắt đầu từ `0` |

### Quy tắc `quantity`

Không thể tự chia `campaigns.talent_quantity` cho nhiều role vì dữ liệu cũ không nói rõ mỗi role cần bao nhiêu người.

Quy tắc an toàn:

- Nếu campaign chỉ có 1 role: dùng `campaigns.talent_quantity`.
- Nếu campaign có nhiều role: đặt mỗi position `quantity = 1`, giữ `campaigns.talent_quantity` làm fallback/tổng cũ để admin cập nhật lại sau.
- Nếu không có `talent_quantity`: dùng `1`.

Không được dùng `NULL` vì schema hiện tại không cho phép.

Ví dụ 1 role:

```text
roles = ["KOL"]
talent_quantity = 5
```

Sinh:

```text
KOL | quantity = 5
```

Ví dụ nhiều role:

```text
roles = ["KOL", "KOC", "MC"]
talent_quantity = 5
```

Sinh:

```text
KOL | quantity = 1
KOC | quantity = 1
MC  | quantity = 1
```

Admin cần cập nhật lại:

```text
KOL = 2
KOC = 2
MC  = 1
```

### Vì sao không copy `requirements` chung vào từng position

`campaigns.requirements` là yêu cầu chung của toàn job/campaign, không phải yêu cầu riêng của từng vị trí.

Nếu copy sang từng position sẽ tạo dữ liệu trùng và dễ sai nghĩa.

Quy ước hiện tại:

- `campaigns.requirements`: yêu cầu chung.
- `campaign_positions.requirements`: yêu cầu riêng từng vị trí, khởi tạo `[]` khi migrate.

## 5. Trường hợp campaign không có `roles`

Nếu campaign cũ không có `roles`, có thể tạo một position mặc định từ `job_type` hoặc nhãn chung.

Quy tắc đề xuất:

1. Nếu có `campaigns.job_type`, dùng làm `talent_type`.
2. Nếu không có `job_type`, dùng `Talent`.
3. `quantity` dùng `campaigns.talent_quantity` nếu có, không có thì `1`.

Ví dụ:

```text
job_type = "Tuyển đại sứ"
talent_quantity = 3
```

Sinh:

```text
talent_type = "Tuyển đại sứ"
quantity = 3
requirements = []
```

## 6. Chống tạo trùng dữ liệu

Khi chạy data migration/backfill, cần tránh tạo lại events/positions nếu campaign đã có dữ liệu mới.

Quy tắc:

- Chỉ tạo `campaign_events` nếu campaign chưa có event nào.
- Chỉ tạo `campaign_positions` nếu campaign chưa có position nào.
- Với positions, normalize `talent_type` trước khi insert để tránh trùng kiểu `KOL` và `kol`.

## 7. Pseudo code backfill

```php
Campaign::query()
    ->with(['events', 'positions'])
    ->chunkById(100, function ($campaigns) {
        foreach ($campaigns as $campaign) {
            DB::transaction(function () use ($campaign) {
                if ($campaign->events->isEmpty()) {
                    $eventDate = $campaign->event_date
                        ?? $campaign->start_date
                        ?? $campaign->created_at;

                    $startAt = Carbon::parse($eventDate)->setTime(8, 0);
                    $endAt = Carbon::parse($eventDate)->setTime(22, 0);

                    $campaign->events()->create([
                        'name' => $campaign->event_name ?: $campaign->title,
                        'start_at' => $startAt,
                        'end_at' => $endAt,
                        'content' => $campaign->contact_note ? [$campaign->contact_note] : [],
                        'sort_order' => 0,
                    ]);
                }

                if ($campaign->positions->isEmpty()) {
                    $roles = collect($campaign->roles ?: [])
                        ->filter()
                        ->map(fn ($role) => trim((string) $role))
                        ->filter()
                        ->unique(fn ($role) => mb_strtolower($role))
                        ->values();

                    if ($roles->isEmpty()) {
                        $roles = collect([$campaign->job_type ?: 'Talent']);
                    }

                    $singleRole = $roles->count() === 1;

                    foreach ($roles as $index => $role) {
                        $campaign->positions()->create([
                            'talent_type' => $role,
                            'quantity' => $singleRole ? max(1, (int) $campaign->talent_quantity) : 1,
                            'requirements' => [],
                            'sort_order' => $index,
                        ]);
                    }
                }
            });
        }
    });
```

## 8. API sau migration

Backend hiện đã load kèm:

```text
events
positions
```

Ở brand API, campaign trả trực tiếp relation `events`, `positions`.

Ở public/talent API, backend normalize thêm alias để frontend dễ dùng:

```text
events.name
events.title
events.event_name
events.start_at
events.starts_at
events.start_date
events.start_time
events.end_at
events.ends_at
events.end_date
events.end_time
events.content
events.note

positions.talent_type
positions.talent_type_name
positions.title
positions.name
positions.quantity
positions.count
positions.requirements
```

## 9. Kiểm tra sau migration

Cần kiểm tra:

- Mỗi campaign cũ có ít nhất một event nếu có dữ liệu ngày/tên sự kiện.
- Không có `campaign_events.end_at <= campaign_events.start_at`.
- Không có `campaign_positions.quantity < 1`.
- Không có duplicate `(campaign_id, talent_type)`.
- `total_talent_quantity` hiển thị đúng:
  - Sum positions nếu có positions.
  - Fallback `campaigns.talent_quantity` nếu chưa có positions.

SQL kiểm tra nhanh:

```sql
SELECT *
FROM campaign_events
WHERE end_at <= start_at;
```

```sql
SELECT campaign_id, LOWER(talent_type), COUNT(*)
FROM campaign_positions
GROUP BY campaign_id, LOWER(talent_type)
HAVING COUNT(*) > 1;
```

```sql
SELECT *
FROM campaign_positions
WHERE quantity < 1;
```

## 10. Điều kiện xóa field cũ

Chỉ nên xóa field cũ sau khi:

- Toàn bộ API đã đọc schema mới.
- Toàn bộ frontend đã dùng `events` và `positions`.
- Campaign cũ đã được brand/admin cập nhật đầy đủ giờ sự kiện và số lượng từng vị trí.
- Không còn báo cáo, dashboard hoặc job nào phụ thuộc trực tiếp field cũ.

Các field có thể deprecated sau:

```text
event_name
event_date
roles
talent_quantity
```

Riêng `requirements` nên giữ nếu vẫn cần lưu yêu cầu chung của job/campaign.

## 11. Kết luận

Backfill chỉ nên tạo dữ liệu nền để campaign cũ không bị trống khi frontend chuyển sang schema mới.

Không tự suy diễn dữ liệu không có trong schema cũ:

- Không để `end_at = NULL`.
- Không để `quantity = NULL`.
- Không tự chia `talent_quantity` cho nhiều role.
- Không copy yêu cầu chung vào yêu cầu riêng của từng vị trí.

Sau backfill, brand/admin vẫn cần rà soát lại campaign cũ để cập nhật giờ sự kiện, số lượng tuyển theo từng vị trí và yêu cầu riêng nếu cần.
