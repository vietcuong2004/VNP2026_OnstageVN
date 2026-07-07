# Media Upload

## Giới thiệu

Media Upload là module chịu trách nhiệm quản lý toàn bộ hình ảnh và video của Talent.

Module này tiếp nhận dữ liệu từ Zalo Official Account, xử lý ảnh, lưu trữ trên Cloud Storage và chuyển sang AI để phân tích trước khi hiển thị trên Website.

Mọi thao tác Upload đều được thực hiện thông qua **Media Service**, giúp tách biệt việc xử lý Media khỏi Business Logic.

---

# Quy trình tổng thể

```text
Talent

↓

Upload Image / Video

↓

Media Service

↓

Compression

↓

Thumbnail

↓

Cloud Storage

↓

AI Queue

↓

Database

↓

Website
```

---

# Upload

Talent có thể gửi:

* Một ảnh
* Nhiều ảnh cùng lúc
* Video Portfolio

Media Service sẽ:

* Kiểm tra định dạng tệp.
* Kiểm tra dung lượng.
* Sinh mã định danh (Media ID).
* Lưu trạng thái xử lý.

Sau khi tiếp nhận thành công, hệ thống phản hồi ngay cho người dùng và tiếp tục xử lý ở chế độ bất đồng bộ.

---

# Compression

Để tối ưu băng thông và dung lượng lưu trữ, tất cả ảnh đều được nén trước khi lưu.

Quy trình bao gồm:

* Chuẩn hóa định dạng ảnh.
* Giảm kích thước nếu ảnh quá lớn.
* Giữ nguyên tỷ lệ khung hình.
* Tối ưu chất lượng hiển thị.

Ảnh gốc vẫn có thể được lưu để phục vụ các mục đích khác trong tương lai.

---

# Thumbnail

Sau khi nén ảnh, hệ thống tạo thêm Thumbnail để hiển thị nhanh trên Website và Zalo.

Thumbnail giúp:

* Tăng tốc tải Portfolio.
* Giảm dung lượng truyền tải.
* Hiển thị danh sách ảnh mượt hơn.

Mỗi Media sẽ có:

* Ảnh gốc.
* Thumbnail.

---

# AI Queue

Sau khi lưu thành công, Media sẽ được đưa vào hàng đợi AI để xử lý bất đồng bộ.

Các tác vụ AI bao gồm:

* Face Detection.
* Blur Detection.
* Duplicate Detection.
* NSFW Detection.
* Portrait Analysis.

Việc sử dụng Queue giúp quá trình Upload diễn ra nhanh hơn và không làm người dùng phải chờ AI xử lý.

---

# Cloud Storage

Toàn bộ Media được lưu trên dịch vụ lưu trữ đám mây.

Mỗi Media sẽ lưu các thông tin:

* URL ảnh gốc.
* URL Thumbnail.
* Loại Media.
* Kích thước.
* Trạng thái xử lý.

Website chỉ truy cập Media thông qua URL được lưu trong Database.

---

# Avatar Selection

Sau khi AI hoàn tất phân tích, hệ thống sẽ đánh giá chất lượng từng ảnh và đề xuất ảnh đại diện phù hợp.

Các tiêu chí đánh giá bao gồm:

* Khuôn mặt rõ ràng.
* Ảnh sắc nét.
* Không bị mờ.
* Góc chụp phù hợp.
* Chất lượng tổng thể.

Talent có thể:

* Chấp nhận ảnh AI đề xuất.
* Hoặc tự chọn ảnh khác làm Avatar.

---

# Quy trình xử lý

```text
Upload

↓

Validate

↓

Compression

↓

Thumbnail

↓

Cloud Storage

↓

AI Queue

↓

AI Analysis

↓

Update Database

↓

Ready
```
