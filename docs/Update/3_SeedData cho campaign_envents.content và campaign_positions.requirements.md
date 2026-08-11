# Seed data cho `campaign_events.content` và `campaign_positions.requirements`

Tài liệu này hướng dẫn seed dữ liệu demo/nền cho production sau khi đã có 2 bảng mới:

- `campaign_events`
- `campaign_positions`

> Lưu ý: tên bảng đúng là `campaign_events`. Trong tên file doc hiện có chữ `campaign_envents` theo yêu cầu đặt file, nhưng khi chạy lệnh/backend luôn dùng `campaign_events`.

## 1. Migration liên quan

### Migration tạo bảng

File tạo 2 bảng mới:

```text
backend/database/migrations/2026_08_07_000001_create_campaign_events_and_positions_tables.php
```

Migration này tạo:

```text
campaign_events
campaign_positions
```

### Migration backfill dữ liệu từ `campaigns`

File chuyển dữ liệu campaign cũ sang 2 bảng mới:

```text
backend/database/migrations/2026_08_07_000002_backfill_campaign_events_and_positions.php
```

Migration này:

- Tạo `campaign_events` mặc định từ `campaigns.event_name`, `campaigns.event_date`, `campaigns.start_date`.
- Tạo `campaign_positions` từ `campaigns.roles`.
- Không tự chia `campaigns.talent_quantity` cho nhiều role.
- Không copy `campaigns.requirements` vào từng `campaign_positions.requirements`.

## 2. Seeder liên quan

### Seed `campaign_events.content`

File seeder:

```text
backend/database/seeders/CampaignEventContentSeeder.php
```

Seeder này:

- Tạo event mặc định cho campaign chưa có event.
- Ghi nội dung vào `campaign_events.content`.
- `content` là JSON array.

Ví dụ dữ liệu:

```json
[
  "Chụp ảnh sản phẩm, ảnh nhóm và nội dung truyền thông theo concept của thương hiệu.",
  "Giao lưu cùng khán giả, chia sẻ trải nghiệm sản phẩm và ghi hình nội dung hậu sự kiện."
]
```

### Seed `campaign_positions.requirements`

File seeder:

```text
backend/database/seeders/CampaignPositionRequirementsSeeder.php
```

Seeder này:

- Đọc `campaign_positions.talent_type`.
- Map requirements theo loại talent: Model, KOL, KOC, Livestreamer, MC, PG/PB, Hoa hậu.
- Ghi vào `campaign_positions.requirements`.
- `requirements` là JSON array.

Ví dụ dữ liệu:

```json
[
  "Có tối thiểu 50.000 người theo dõi trên nền tảng mạng xã hội",
  "Tỷ lệ tương tác tốt và tệp người theo dõi phù hợp với sản phẩm",
  "Có kinh nghiệm hợp tác với thương hiệu là một lợi thế"
]
```

## 3. Thứ tự chạy trên production

Chạy theo thứ tự này:

```text
1. migrate schema
2. migrate backfill
3. seed campaign event content
4. seed campaign position requirements
```

Lệnh đề xuất:

```bash
php artisan migrate --force
php artisan db:seed --class=CampaignEventContentSeeder --force
php artisan db:seed --class=CampaignPositionRequirementsSeeder --force
```

Nếu production chạy trong Docker container app/backend, chạy lệnh bên trong container, ví dụ:

```bash
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --class=CampaignEventContentSeeder --force
docker compose exec app php artisan db:seed --class=CampaignPositionRequirementsSeeder --force
```

## 4. Kiểm tra sau khi seed

Kiểm tra số event có content:

```sql
SELECT COUNT(*) AS total_events
FROM campaign_events;
```

```sql
SELECT COUNT(*) AS events_with_content
FROM campaign_events
WHERE content IS NOT NULL
  AND JSON_LENGTH(content) > 0;
```

Kiểm tra số position có requirements:

```sql
SELECT COUNT(*) AS total_positions
FROM campaign_positions;
```

```sql
SELECT COUNT(*) AS positions_with_requirements
FROM campaign_positions
WHERE requirements IS NOT NULL
  AND JSON_LENGTH(requirements) > 0;
```

Kiểm tra mẫu dữ liệu:

```sql
SELECT id, campaign_id, name, content
FROM campaign_events
WHERE content IS NOT NULL
LIMIT 5;
```

```sql
SELECT id, campaign_id, talent_type, requirements
FROM campaign_positions
WHERE requirements IS NOT NULL
LIMIT 10;
```

## 5. Lưu ý khi chạy prod

- Chỉ chạy sau khi migration tạo bảng đã chạy thành công.
- `CampaignEventContentSeeder` hiện cập nhật lại `content` theo preset mỗi lần chạy.
- `CampaignPositionRequirementsSeeder` hiện cập nhật lại `requirements` theo `talent_type` mỗi lần chạy.
- Nếu production đã có content/requirements được admin chỉnh thủ công, cần cân nhắc trước khi chạy lại seeder vì dữ liệu có thể bị ghi đè.
- Nếu muốn seed một lần rồi không ghi đè dữ liệu admin, cần chỉnh seeder để chỉ update các record đang `NULL` hoặc `[]`.

## 6. Checklist deploy nhanh

```text
[ ] Pull code mới lên prod
[ ] Backup database production
[ ] Chạy php artisan migrate --force
[ ] Chạy CampaignEventContentSeeder
[ ] Chạy CampaignPositionRequirementsSeeder
[ ] Kiểm tra số lượng event có content
[ ] Kiểm tra số lượng position có requirements
[ ] Mở frontend trang chi tiết job để kiểm tra hiển thị
```
