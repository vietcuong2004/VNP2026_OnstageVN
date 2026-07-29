# KẾ HOẠCH THIẾT KẾ UI TRANG NHẬP LIỆU V� PREVIEW LANDING PAGE CUỘC THI

## 1. Mục ti�u của m�n h�nh

M�n h�nh n�y phục vụ Brand hoặc Ban tổ chức:

* Tạo một trang Landing Page cho cuộc thi.
* Tận dụng tối đa dữ liệu c� sẵn từ file Excel.
* Hạn chế việc nhập lại lịch tr�nh.
* Cho ph�p kiểm tra dữ liệu trước khi xuất bản.
* Xem Landing Page thay đổi ngay trong qu� tr�nh chỉnh sửa.
* Ph�n biệt r� nội dung c�ng khai v� dữ liệu vận h�nh nội bộ.

Đ�y kh�ng phải c�ng cụ k�o thả thiết kế website.

Người d�ng chỉ nhập dữ liệu; hệ thống tự đưa dữ liệu v�o template Landing Page cố định.

---

# 2. Cấu tr�c tổng thể m�n h�nh

M�n h�nh desktop n�n chia th�nh ba khu vực:

```text
┌─────────────────────────────────────────────────────────────┐
│ Header: T�n cuộc thi | Trạng th�i | Lưu nh�p | Xuất bản     │
├──────────────┬─────────────────────────┬────────────────────┤
│ Menu bước    │ Khu vực nhập dữ liệu    │ Preview Landing    │
│              │                         │ Page               │
│ 1. Tổng quan │                         │                    │
│ 2. Timeline  │                         │                    │
│ 3. Đăng k�   │                         │                    │
│ 4. Nội dung  │                         │                    │
│ 5. Đối t�c   │                         │                    │
│ 6. C�i đặt   │                         │                    │
└──────────────┴─────────────────────────┴────────────────────┘
```

Tỷ lệ đề xuất:

* Menu tr�i: 200�240 px.
* Form nhập liệu: khoảng 45% chiều rộng.
* Preview: khoảng 40�45% chiều rộng.

Preview n�n cố định khi cuộn form.

---

# 3. Header của trang quản trị

## Th�ng tin hiển thị

* N�t quay lại danh s�ch cuộc thi.
* T�n cuộc thi.
* Nh�n trạng th�i:

  * Bản nh�p
  * Chưa đủ dữ liệu
  * Sẵn s�ng xuất bản
  * Đ� xuất bản
* Th�ng b�o lần lưu gần nhất.
* N�t xem Landing Page to�n m�n h�nh.
* N�t lưu nh�p.
* N�t xuất bản.

## V� dụ

```text
← Danh s�ch cuộc thi

Hoa hậu Du lịch Việt Nam 2026
[Bản nh�p]  Đ� lưu l�c 14:35

[Xem to�n m�n h�nh] [Lưu nh�p] [Xuất bản]
```

Nếu dữ liệu chưa đủ, n�t �Xuất bản� vẫn hiển thị nhưng disabled.

Khi hover hoặc bấm v�o, hiển thị:

> Cần bổ sung ảnh b�a, m� tả cuộc thi v� �t nhất một giai đoạn c�ng khai.

---

# 4. Menu điều hướng b�n tr�i

Menu chia theo nh�m dữ liệu, kh�ng chia theo section kỹ thuật của Landing Page.

## C�c bước đề xuất

### 1. Th�ng tin chung

* T�n cuộc thi
* H�nh ảnh
* M� tả
* Đơn vị tổ chức
* Thời gian tổng thể

### 2. Lịch tr�nh

* Tải file Excel
* Danh s�ch giai đoạn
* Hoạt động
* Ph�n loại c�ng khai v� nội bộ

### 3. Đăng k�

* Trạng th�i nhận hồ sơ
* Điều kiện
* Thời hạn
* Link đăng k�
* T�i liệu

### 4. Nội dung c�ng khai

* Th�ng b�o
* Ban gi�m khảo
* Th� sinh
* Kết quả
* Tin tức
* Thư viện

### 5. Đơn vị đồng h�nh

* Ban tổ chức
* Nh� t�i trợ
* Đối t�c

### 6. Li�n hệ v� xuất bản

* Th�ng tin li�n hệ
* Đường dẫn trang
* SEO
* Chế độ hiển thị

## Trạng th�i từng bước

Mỗi mục n�n c� biểu tượng trạng th�i:

* Dấu t�ch: đ� đủ dữ liệu.
* Chấm cam: c�n thiếu dữ liệu.
* Chấm x�m: chưa nhập.
* Cảnh b�o đỏ: dữ liệu lỗi.

V� dụ:

```text
✓ Th�ng tin chung
! Lịch tr�nh
○ Đăng k�
○ Nội dung c�ng khai
✓ Đơn vị đồng h�nh
! Li�n hệ v� xuất bản
```

---

# 5. Khu vực Preview

Preview phải cho người d�ng thấy ch�nh x�c nội dung sẽ xuất hiện tr�n Landing Page.

## Thanh c�ng cụ Preview

Hiển thị ph�a tr�n khung preview:

* Desktop
* Tablet
* Mobile
* L�m mới preview
* Mở to�n m�n h�nh
* Hiển thị dữ liệu thật hoặc dữ liệu mẫu

V� dụ:

```text
Xem trước Landing Page

[Desktop] [Tablet] [Mobile]          [Mở to�n m�n h�nh]
```

## Cơ chế cập nhật

Preview cập nhật ngay sau khi:

* Người d�ng rời khỏi � nhập.
* Người d�ng tải ảnh l�n.
* Người d�ng bật hoặc tắt section.
* Người d�ng thay đổi dữ liệu lịch tr�nh.
* Người d�ng thay đổi trạng th�i c�ng khai.

Kh�ng cần cập nhật sau từng k� tự nếu g�y giật giao diện.

## Li�n kết form với preview

Khi người d�ng chọn một trường trong form:

* Section tương ứng tr�n preview được l�m nổi bật.
* Preview tự cuộn tới section đ�.

Khi người d�ng bấm một section tr�n preview:

* Form b�n tr�i tự chuyển tới nh�m dữ liệu tương ứng.

V� dụ:

* Bấm v�o Hero trong preview → mở �Th�ng tin chung�.
* Bấm v�o timeline → mở �Lịch tr�nh�.
* Bấm v�o n�t đăng k� → mở �Đăng k��.

---

# 6. Bước 1 � Th�ng tin chung

Đ�y l� nh�m dữ liệu d�ng để tạo Header, Hero v� phần giới thiệu.

---

## 6.1. Th�ng tin nhận diện

### Trường nhập

#### T�n cuộc thi

* Kiểu: Text input.
* Bắt buộc.
* V� dụ: Hoa hậu Du lịch Việt Nam 2026.
* Giới hạn đề xuất: 100 k� tự.

### T�n ngắn

* Kiểu: Text input.
* Kh�ng bắt buộc.
* D�ng trong Header hoặc đường dẫn.
* V� dụ: HHDLVN 2026.

### M�a hoặc năm tổ chức

* Kiểu: Text input hoặc select.
* V� dụ: 2026, M�a 3.

### Slogan

* Kiểu: Text input.
* Kh�ng bắt buộc.
* Giới hạn khoảng 120 k� tự.

### Loại cuộc thi

* Kiểu: Select.
* V� dụ:

  * Người mẫu
  * Hoa hậu
  * �m nhạc
  * Diễn xuất
  * Nhảy m�a
  * S�ng tạo nội dung
  * Kh�c

Loại cuộc thi kh�ng nhất thiết hiển thị trực tiếp tr�n Landing Page, nhưng d�ng để ph�n loại trong hệ thống.

---

## Hiển thị tr�n Preview

### Header

* Logo.
* T�n ngắn hoặc t�n cuộc thi.

### Hero

* T�n cuộc thi.
* Năm hoặc m�a tổ chức.
* Slogan.
* Loại cuộc thi nếu template c� nh�n danh mục.

---

## 6.2. H�nh ảnh

### Trường nhập

#### Logo cuộc thi

* Upload PNG, JPG hoặc SVG.
* C� crop.
* C� nền xem trước s�ng v� tối.
* C� n�t d�ng logo đơn vị tổ chức.

#### Ảnh b�a desktop

* Tỷ lệ đề xuất: 16:7 hoặc 16:8.
* C� crop.
* Hiển thị v�ng an to�n cho chữ.

#### Ảnh b�a mobile

* Tỷ lệ đề xuất: 4:5 hoặc 3:4.
* Kh�ng bắt buộc.
* Nếu kh�ng tải l�n, hệ thống tự crop ảnh desktop.

#### Video giới thiệu

* Nhập URL YouTube, Vimeo hoặc upload video.
* Kh�ng bắt buộc.

### Th�ng tin cần hiển thị tại � upload

* K�ch thước đề xuất.
* Dung lượng tối đa.
* Định dạng được hỗ trợ.
* Preview ảnh sau khi tải l�n.

---

## Hiển thị tr�n Preview

* Logo xuất hiện trong Header v� Hero.
* Ảnh b�a xuất hiện ở Hero.
* Ảnh mobile thay đổi khi chọn chế độ preview Mobile.
* Video xuất hiện trong section Giới thiệu nếu c�.

---

## 6.3. M� tả cuộc thi

### Trường nhập

#### M� tả ngắn

* Textarea.
* Bắt buộc.
* Tối đa khoảng 250 k� tự.
* D�ng tr�n Hero.

#### Giới thiệu chi tiết

* Rich text editor.
* D�ng cho section Giới thiệu.
* Hỗ trợ:

  * Ti�u đề nhỏ
  * Đoạn văn
  * Danh s�ch
  * In đậm
  * Ch�n li�n kết

#### Mục ti�u cuộc thi

* Textarea hoặc danh s�ch bullet.
* Kh�ng bắt buộc.

#### Đối tượng tham gia

* Textarea.
* C� thể kế thừa từ phần đăng k�.

#### Phạm vi tổ chức

* Select:

  * To�n quốc
  * Quốc tế
  * Theo khu vực
  * Theo tỉnh th�nh
  * Nội bộ

---

## Hiển thị tr�n Preview

### Hero

* M� tả ngắn.

### Section Giới thiệu

* Giới thiệu chi tiết.
* Mục ti�u.
* Đối tượng tham gia.
* Video hoặc h�nh ảnh giới thiệu.

---

## 6.4. Thời gian v� địa điểm tổng thể

### Trường nhập

#### Ng�y bắt đầu cuộc thi

* Date picker.
* C� thể tự lấy từ ng�y sớm nhất trong Excel.

#### Ng�y kết th�c cuộc thi

* Date picker.
* C� thể tự lấy từ ng�y muộn nhất trong Excel.

#### Địa điểm ch�nh

* Text input hoặc chọn từ c�c địa điểm nhận diện trong Excel.

#### Khu vực tổ chức

* Cho ph�p chọn nhiều:

  * H� Nội
  * TP. Hồ Ch� Minh
  * Thanh H�a
  * Quảng Ninh
  * C�c tỉnh kh�c

#### H�nh thức

* Trực tiếp.
* Trực tuyến.
* Kết hợp.

---

## Hiển thị tr�n Preview

### Hero

* Khoảng thời gian tổng thể.
* Địa điểm ch�nh.
* H�nh thức tổ chức nếu cần.

### Thanh th�ng tin nổi bật

* Ng�y bắt đầu.
* Ng�y kết th�c.
* Số địa điểm.
* Số giai đoạn.

---

# 7. Bước 2 � Nhập v� quản l� lịch tr�nh

Đ�y l� phần quan trọng nhất của trang.

---

## 7.1. Chọn c�ch nhập dữ liệu

Hiển thị hai lựa chọn:

### Tải file Excel

Card ch�nh, được l�m nổi bật:

> Tải l�n timeline c� sẵn. Hệ thống sẽ nhận diện c�c giai đoạn, ng�y giờ, địa điểm v� hoạt động.

N�t:

**Chọn file Excel**

Th�ng tin hỗ trợ:

* Định dạng XLSX, XLS.
* C� thể tải file mẫu.
* C� thể cập nhật bằng file mới sau n�y.

### Nhập thủ c�ng

Card phụ:

> Tạo từng giai đoạn v� hoạt động trực tiếp tr�n hệ thống.

N�t:

**Tạo giai đoạn đầu ti�n**

---

## 7.2. Trạng th�i xử l� file

Sau khi upload, hiển thị tiến tr�nh:

```text
Đang đọc dữ liệu

✓ Đ� nhận diện 8 giai đoạn
✓ Đ� nhận diện 46 hoạt động
✓ Đ� nhận diện 6 địa điểm
! C� 4 nội dung cần kiểm tra
```

Sau khi ho�n tất, hiển thị n�t:

* Xem dữ liệu.
* Thay file.
* Tải lại.
* X�a dữ liệu nhập từ file.

---

## 7.3. Tổng quan dữ liệu được nhận diện

Hiển thị c�c chỉ số:

* Số giai đoạn.
* Số hoạt động.
* Số ng�y tổ chức.
* Số địa điểm.
* Số trường thiếu dữ liệu.
* Số nội dung đang để c�ng khai.
* Số nội dung nội bộ.

V� dụ:

```text
8 giai đoạn
46 hoạt động
6 địa điểm
4 nội dung cần kiểm tra
31 nội dung c�ng khai
15 nội dung nội bộ
```

---

## 7.4. Danh s�ch giai đoạn

Mỗi giai đoạn hiển thị dạng accordion hoặc card thu gọn.

### Th�ng tin hiển thị tr�n card

* Số thứ tự.
* T�n giai đoạn.
* Ng�y bắt đầu v� kết th�c.
* Địa điểm.
* Số hoạt động.
* Trạng th�i.
* Số nội dung c�ng khai.
* Số cảnh b�o.
* N�t bật hoặc tắt hiển thị.

V� dụ:

```text
03. Sơ khảo miền Bắc

25/04/2026 � 26/04/2026
Trung t�m Hội nghị Quốc gia, H� Nội

8 hoạt động � 6 c�ng khai � 2 nội bộ

[Đang hiển thị] [Chỉnh sửa] [⋮]
```

### H�nh động

* Mở chỉnh sửa.
* Nh�n bản.
* Di chuyển l�n hoặc xuống.
* Ẩn khỏi Landing Page.
* X�a.
* Đ�nh dấu giai đoạn nổi bật.

---

## 7.5. Form chỉnh sửa một giai đoạn

Khi mở một giai đoạn, hiển thị:

### T�n giai đoạn

V� dụ: Sơ khảo miền Bắc.

### T�n hiển thị c�ng khai

C� thể kh�c t�n nội bộ.

V� dụ:

* T�n nội bộ: Sơ khảo Bắc � Ng�y 1.
* T�n c�ng khai: V�ng sơ khảo khu vực miền Bắc.

### M� tả ngắn

D�ng tr�n card giai đoạn.

### Ng�y bắt đầu

### Ng�y kết th�c

### Địa điểm

* T�n địa điểm.
* Địa chỉ.
* Link Google Maps.
* Tỉnh hoặc th�nh phố.

### Ảnh đại diện giai đoạn

Kh�ng bắt buộc.

### Trạng th�i

* Sắp diễn ra.
* Đang diễn ra.
* Đ� ho�n th�nh.
* Tạm ho�n.
* Đ� hủy.

C� t�y chọn:

**Tự động cập nhật trạng th�i theo ng�y**

### Phạm vi hiển thị

* C�ng khai.
* Chỉ th� sinh.
* Nội bộ ban tổ chức.
* Ẩn.

### N�t h�nh động li�n quan

* Xem chi tiết.
* Đăng k�.
* Xem kết quả.
* Xem album.
* Kh�ng hiển thị n�t.

---

## Hiển thị tr�n Preview

Mỗi giai đoạn tạo ra:

* Một bước trong thanh tiến tr�nh.
* Một card trong danh s�ch giai đoạn.
* Một nh�m trong lịch tr�nh chi tiết.
* Một mục trong bộ lọc lịch tr�nh.

Chỉ giai đoạn c� trạng th�i �C�ng khai� mới xuất hiện tr�n Landing Page.

---

## 7.6. Danh s�ch hoạt động trong giai đoạn

Hiển thị dạng danh s�ch c� thể sắp xếp.

### Mỗi hoạt động cần hiển thị

* Thời gian.
* T�n hoạt động.
* Địa điểm.
* Phạm vi hiển thị.
* Trạng th�i dữ liệu.
* N�t chỉnh sửa.

V� dụ:

```text
07:30�08:30
Đ�n tiếp v� kiểm tra hồ sơ
Sảnh ch�nh
[C�ng khai]

09:00�12:00
Phỏng vấn th� sinh
Ph�ng Ballroom A
[Nội bộ]
```

### C� thao t�c h�ng loạt

* Chọn nhiều hoạt động.
* Chuyển sang c�ng khai.
* Chuyển sang nội bộ.
* Ẩn.
* X�a.
* Chuyển sang giai đoạn kh�c.

---

## 7.7. Form chỉnh sửa hoạt động

### Trường nhập

* T�n hoạt động.
* Ng�y.
* Giờ bắt đầu.
* Giờ kết th�c.
* Giai đoạn.
* Địa điểm.
* Địa chỉ chi tiết.
* M� tả ngắn.
* H�nh thức:

  * Trực tiếp
  * Trực tuyến
  * Kết hợp
* Link livestream.
* Link bản đồ.
* File đ�nh k�m.
* Hướng dẫn tham dự.
* Trạng th�i:

  * Sắp diễn ra
  * Đang diễn ra
  * Đ� kết th�c
  * Thay đổi
  * Đ� hủy
* Phạm vi hiển thị:

  * C�ng khai
  * Chỉ th� sinh
  * Nội bộ
  * Ẩn

### Dữ liệu nội bộ kh�ng hiển thị tr�n Landing Page

* Người phụ tr�ch.
* Số điện thoại phụ tr�ch.
* Ghi ch� vận h�nh.
* Checklist.
* Y�u cầu thiết bị.
* Th�ng tin di chuyển.
* Th�ng tin ăn ở.
* Ph�n c�ng nh�n sự.

C�c trường n�y c� thể được lưu trong hệ thống, nhưng phải c� nh�n r�:

**Chỉ d�ng nội bộ � kh�ng hiển thị tr�n Landing Page**

---

# 8. Bước 3 � Th�ng tin đăng k�

---

## 8.1. Bật hoặc tắt đăng k�

Toggle:

**Cuộc thi c� nhận đăng k� trực tuyến**

Nếu tắt:

* Ẩn to�n bộ form đăng k�.
* Landing Page kh�ng hiển thị section Đăng k�.

Nếu bật, hiển thị c�c trường b�n dưới.

---

## 8.2. Trạng th�i đăng k�

### C�ch x�c định

* Tự động theo thời gian.
* Chỉnh thủ c�ng.

### C�c trạng th�i

* Chưa mở.
* Đang mở.
* Sắp đ�ng.
* Đ� đ�ng.
* Tạm dừng.

### Trường nhập

* Ng�y mở đăng k�.
* Giờ mở.
* Hạn đăng k�.
* Giờ đ�ng.
* Số lượng hồ sơ tối đa.
* Cho ph�p đăng k� sau hạn hay kh�ng.

---

## Hiển thị tr�n Preview

### Hero

N�t:

* Đăng k� ngay.
* Sắp mở đăng k�.
* Đ� đ�ng đăng k�.

### Thanh th�ng tin nổi bật

* Hạn đăng k�.

### Section đăng k�

* Trạng th�i.
* Ng�y mở.
* Hạn cuối.
* N�t h�nh động.

---

## 8.3. Điều kiện tham gia

### C�ch nhập

Dạng danh s�ch c� thể th�m từng điều kiện.

Mỗi d�ng gồm:

* Ti�u đề ngắn.
* M� tả.
* Bắt buộc hoặc tham khảo.

V� dụ:

```text
Độ tuổi
Từ 18 đến 27 tuổi.

Quốc tịch
L� c�ng d�n Việt Nam.

Chiều cao
Từ 1m65 trở l�n.
```

### Hiển thị tr�n Preview

* Danh s�ch bullet hoặc card.
* Chỉ hiển thị c�c điều kiện được đ�nh dấu c�ng khai.

---

## 8.4. Hồ sơ cần chuẩn bị

### Trường nhập

Mỗi mục gồm:

* T�n giấy tờ hoặc nội dung.
* M� tả.
* Bắt buộc hoặc kh�ng bắt buộc.

V� dụ:

* Ảnh ch�n dung.
* Ảnh to�n th�n.
* Căn cước c�ng d�n.
* Video giới thiệu.
* Th�ng tin c� nh�n.

### Hiển thị tr�n Preview

Danh s�ch checklist trong section Đăng k�.

---

## 8.5. H�nh thức đăng k�

Cho ph�p chọn một trong c�c kiểu:

### Form Onstage

* Người d�ng đăng k� trực tiếp tr�n nền tảng.

### Link b�n ngo�i

* Nhập URL đăng k�.

### QR Code

* Tải ảnh QR hoặc tạo từ URL.

### Đăng k� qua li�n hệ

* Hiển thị hotline hoặc email.

### Trường nhập th�m

* Nội dung n�t.
* Link đăng k�.
* QR.
* Hotline hỗ trợ.
* Email hỗ trợ.
* Hướng dẫn ngắn.

---

## Hiển thị tr�n Preview

* N�t đăng k�.
* QR Code.
* Hotline hỗ trợ.
* Hướng dẫn.
* Trạng th�i nhận hồ sơ.

---

## 8.6. T�i liệu đăng k�

Cho ph�p tải l�n:

* Thể lệ cuộc thi.
* Mẫu đơn đăng k�.
* Quy định h�nh ảnh.
* Ch�nh s�ch bảo mật.
* T�i liệu hướng dẫn.

Mỗi tệp gồm:

* T�n t�i liệu.
* File.
* Loại t�i liệu.
* Trạng th�i c�ng khai.

### Hiển thị tr�n Preview

Danh s�ch n�t tải xuống:

* Xem thể lệ.
* Tải mẫu hồ sơ.
* Xem hướng dẫn đăng k�.

---

# 9. Bước 4 � Nội dung c�ng khai

Nh�m n�y chứa c�c section kh�ng bắt buộc.

Mỗi section c� toggle:

**Hiển thị tr�n Landing Page**

Nếu chưa c� dữ liệu, toggle disabled hoặc hiển thị cảnh b�o.

---

## 9.1. Th�ng b�o

### Trường nhập cho mỗi th�ng b�o

* Ti�u đề.
* Loại th�ng b�o.
* Nội dung t�m tắt.
* Nội dung chi tiết.
* Ng�y c�ng bố.
* Mức độ:

  * Th�ng thường
  * Quan trọng
  * Khẩn cấp
* Giai đoạn li�n quan.
* File đ�nh k�m.
* Trạng th�i c�ng khai.

### Hiển thị tr�n Preview

* Banner cảnh b�o nếu l� th�ng b�o quan trọng.
* Danh s�ch th�ng b�o mới nhất.
* Ng�y c�ng bố.
* N�t xem chi tiết.

---

## 9.2. Ban gi�m khảo

### Trường nhập cho mỗi người

* Ảnh ch�n dung.
* Họ t�n.
* Chức danh.
* Vai tr� trong cuộc thi.
* M� tả ngắn.
* Lĩnh vực chuy�n m�n.
* Giai đoạn tham gia.
* Thứ tự hiển thị.

### Hiển thị tr�n Preview

Card gồm:

* Ảnh.
* Họ t�n.
* Chức danh.
* Vai tr�.

M� tả chi tiết chỉ hiển thị khi bấm xem th�m.

---

## 9.3. Danh s�ch th� sinh

C� hai c�ch nhập:

* Đồng bộ từ hồ sơ đăng k�.
* Import Excel.
* Th�m thủ c�ng.

### Trường dữ liệu c�ng khai

* Ảnh.
* Số b�o danh.
* Họ t�n.
* Năm sinh hoặc tuổi.
* Tỉnh th�nh.
* Nghề nghiệp.
* Chiều cao.
* Giai đoạn hiện tại.
* Trạng th�i.
* B�nh chọn, nếu c�.

### Dữ liệu kh�ng c�ng khai

* Số điện thoại.
* Email.
* Căn cước.
* Địa chỉ chi tiết.
* Hồ sơ giấy tờ.
* Ghi ch� nội bộ.
* Điểm chấm chưa c�ng bố.

### Hiển thị tr�n Preview

* Grid danh s�ch th� sinh.
* Bộ lọc theo v�ng thi.
* T�m kiếm theo t�n hoặc số b�o danh.
* N�t xem hồ sơ.

---

## 9.4. Kết quả

### Trường nhập

* T�n v�ng thi.
* Ng�y c�ng bố.
* Danh s�ch th� sinh đạt kết quả.
* Danh hiệu.
* Thứ hạng.
* Ảnh.
* M� tả.
* Link th�ng b�o ch�nh thức.

### Hiển thị tr�n Preview

* Người chiến thắng hoặc danh hiệu nổi bật.
* Danh s�ch kết quả.
* Link xem th�ng b�o.

---

## 9.5. Tin tức

### Trường nhập mỗi b�i

* Ảnh đại diện.
* Ti�u đề.
* M� tả ngắn.
* Nội dung.
* Ng�y đăng.
* Danh mục.
* T�c giả.
* Giai đoạn li�n quan.

### Hiển thị tr�n Preview

* Tối đa 3 b�i mới nhất tr�n trang ch�nh.
* Ảnh đại diện.
* Ti�u đề.
* Ng�y đăng.
* M� tả ngắn.

---

## 9.6. Thư viện

### Loại nội dung

* Album ảnh.
* Video.
* Livestream.
* Video highlight.

### Trường nhập

* T�n album hoặc video.
* Ảnh b�a.
* File hoặc URL.
* Giai đoạn li�n quan.
* Ng�y.
* M� tả.
* Trạng th�i c�ng khai.

### Hiển thị tr�n Preview

* Grid ảnh.
* Video nổi bật.
* T�n album.
* Số lượng ảnh.
* Giai đoạn li�n quan.

---

# 10. Bước 5 � Ban tổ chức, nh� t�i trợ v� đối t�c

---

## 10.1. Đơn vị tổ chức

Th�ng tin c� thể kế thừa từ hồ sơ Brand.

### Trường nhập

* Logo.
* T�n đơn vị.
* Vai tr�.
* Website.
* M� tả ngắn.
* Thứ tự hiển thị.

### Vai tr�

* Đơn vị tổ chức.
* Đơn vị thực hiện.
* Đơn vị bảo trợ.
* Đối t�c chuy�n m�n.
* Đơn vị đăng cai.

### Hiển thị tr�n Preview

* Logo.
* T�n.
* Vai tr�.
* Link website.

---

## 10.2. Nh� t�i trợ

### Trường nhập

* Logo.
* T�n.
* Cấp t�i trợ.
* Website.
* Thứ tự hiển thị.

### Cấp t�i trợ

* Nh� t�i trợ danh xưng.
* Kim cương.
* V�ng.
* Bạc.
* Đồng.
* Đồng h�nh.

### Hiển thị tr�n Preview

Logo được tự động chia k�ch thước theo cấp t�i trợ.

Người d�ng kh�ng được tự điều chỉnh k�ch thước logo tr�n Landing Page.

---

## 10.3. Đối t�c

### Trường nhập

* Logo.
* T�n.
* Loại đối t�c.
* Website.

### Loại đối t�c

* Truyền th�ng.
* Địa điểm.
* C�ng nghệ.
* Di chuyển.
* Lưu tr�.
* L�m đẹp.
* Trang phục.
* Kh�c.

### Hiển thị tr�n Preview

Logo được nh�m theo loại đối t�c.

---

# 11. Bước 6 � Li�n hệ v� xuất bản

---

## 11.1. Th�ng tin li�n hệ

Th�ng tin c� thể kế thừa từ hồ sơ Brand.

### Trường nhập

* T�n đơn vị li�n hệ.
* Hotline chung.
* Email.
* Website.
* Fanpage.
* Zalo.
* Địa chỉ.
* Thời gian hỗ trợ.
* Bản đồ.
* QR Zalo.

### Nh�m li�n hệ t�y chọn

Cho ph�p tạo nhiều đầu mối:

* Hỗ trợ th� sinh.
* Truyền th�ng.
* T�i trợ.
* Khiếu nại.
* Hỗ trợ kỹ thuật.

Mỗi đầu mối gồm:

* T�n bộ phận.
* Hotline.
* Email.
* Thời gian hỗ trợ.

### Hiển thị tr�n Preview

Section Li�n hệ:

* Hotline.
* Email.
* Website.
* Mạng x� hội.
* Địa chỉ.
* Bản đồ.
* QR li�n hệ.

---

## 11.2. Đường dẫn Landing Page

### Trường nhập

* Slug.
* Đường dẫn xem trước.
* Domain t�y chỉnh nếu c�.

V� dụ:

```text
onstage.vn/cuoc-thi/hoa-hau-du-lich-viet-nam-2026
```

Hiển thị trạng th�i:

* Đường dẫn khả dụng.
* Đường dẫn đ� tồn tại.
* K� tự kh�ng hợp lệ.

---

## 11.3. SEO v� chia sẻ

### Trường nhập

* Ti�u đề SEO.
* M� tả SEO.
* Ảnh chia sẻ.
* Từ kh�a.
* Cho ph�p Google lập chỉ mục.

### Hiển thị Preview ri�ng

Card m� phỏng khi chia sẻ tr�n:

* Facebook.
* Zalo.
* Google.

Th�ng tin gồm:

* Ảnh.
* Ti�u đề.
* M� tả.
* Domain.

---

## 11.4. Chế độ xuất bản

### Lựa chọn

* Lưu bản nh�p.
* Xuất bản ngay.
* L�n lịch xuất bản.
* Trang ri�ng tư c� mật khẩu.
* Chỉ người c� đường dẫn được xem.

### Thời gian xuất bản

* Ng�y.
* Giờ.

### Sau khi xuất bản

Hiển thị:

* URL ch�nh thức.
* N�t sao ch�p.
* QR Landing Page.
* N�t chia sẻ Facebook.
* N�t chia sẻ Zalo.
* N�t mở trang.

---

# 12. Bảng �nh xạ dữ liệu nhập v� dữ liệu hiển thị

| Nh�m nhập liệu  | Trường nhập             | Vị tr� hiển thị tr�n Landing Page      |
| --------------- | ----------------------- | -------------------------------------- |
| Th�ng tin chung | Logo                    | Header, Hero, Footer                   |
| Th�ng tin chung | T�n cuộc thi            | Header, Hero, SEO                      |
| Th�ng tin chung | Slogan                  | Hero                                   |
| Th�ng tin chung | M� tả ngắn              | Hero                                   |
| Th�ng tin chung | Giới thiệu chi tiết     | Section Giới thiệu                     |
| H�nh ảnh        | Ảnh b�a                 | Hero                                   |
| Thời gian       | Ng�y bắt đầu, kết th�c  | Hero, thanh th�ng tin                  |
| Địa điểm        | Địa điểm ch�nh          | Hero, thanh th�ng tin                  |
| Timeline        | Giai đoạn               | Tiến tr�nh, card giai đoạn             |
| Timeline        | Hoạt động               | Lịch tr�nh chi tiết                    |
| Timeline        | Trạng th�i              | Nh�n giai đoạn, hoạt động              |
| Timeline        | Phạm vi hiển thị        | Quyết định c� xuất hiện hay kh�ng      |
| Đăng k�         | Hạn đăng k�             | Hero, thanh th�ng tin, section đăng k� |
| Đăng k�         | Điều kiện               | Section đăng k�                        |
| Đăng k�         | Hồ sơ cần chuẩn bị      | Section đăng k�                        |
| Đăng k�         | Link hoặc QR            | N�t v� QR đăng k�                      |
| Th�ng b�o       | Nội dung th�ng b�o      | Banner, danh s�ch th�ng b�o            |
| Ban gi�m khảo   | Hồ sơ gi�m khảo         | Section Ban gi�m khảo                  |
| Th� sinh        | Hồ sơ c�ng khai         | Section Th� sinh                       |
| Kết quả         | Danh hiệu, thứ hạng     | Section Kết quả                        |
| Tin tức         | B�i viết                | Section Tin tức                        |
| Thư viện        | Ảnh, video              | Section Thư viện                       |
| Nh� t�i trợ     | Logo, cấp t�i trợ       | Section Nh� t�i trợ                    |
| Li�n hệ         | Hotline, email, địa chỉ | Section Li�n hệ, Footer                |
| SEO             | Ti�u đề, m� tả, ảnh     | Google, Facebook, Zalo                 |

---

# 13. Hiển thị trạng th�i dữ liệu trong form

Mỗi trường cần c� một trong c�c trạng th�i:

## Đ� ho�n th�nh

Trường đ� c� dữ liệu hợp lệ.

## Thiếu dữ liệu

Trường bắt buộc nhưng chưa c�.

## Được tự động điền

Dữ liệu lấy từ Excel hoặc hồ sơ Brand.

Hiển thị nh�n:

**Đ� lấy từ file Excel**

## Đ� chỉnh sửa thủ c�ng

Dữ liệu từng lấy từ Excel nhưng đ� được người d�ng thay đổi.

Hiển thị nh�n:

**Đ� chỉnh sửa**

## C� xung đột

File Excel mới c� dữ liệu kh�c dữ liệu đang d�ng.

Hiển thị lựa chọn:

* Giữ dữ liệu hiện tại.
* D�ng dữ liệu từ file.
* So s�nh hai phi�n bản.

---

# 14. Cập nhật lại bằng Excel

Khi người d�ng tải phi�n bản Excel mới, kh�ng n�n ghi đ� ngay.

Hiển thị m�n h�nh so s�nh:

```text
File mới c� 12 thay đổi

3 hoạt động mới
5 hoạt động thay đổi thời gian
2 hoạt động thay đổi địa điểm
2 hoạt động bị x�a
```

Mỗi thay đổi hiển thị:

* Dữ liệu hiện tại.
* Dữ liệu mới.
* N�t giữ bản hiện tại.
* N�t �p dụng bản mới.

C� thao t�c:

* �p dụng tất cả.
* Bỏ qua tất cả.
* Chọn từng thay đổi.

C�c nội dung đ� chỉnh sửa thủ c�ng phải được cảnh b�o trước khi ghi đ�.

---

# 15. Quy tắc hiển thị Preview

## Dữ liệu bắt buộc nhưng chưa nhập

Preview hiển thị placeholder dạng khung n�t đứt:

```text
Chưa c� ảnh b�a
Tải ảnh b�a để ho�n thiện Hero
```

Kh�ng sử dụng nội dung giả khiến người d�ng hiểu nhầm đ� c� dữ liệu.

## Section chưa c� dữ liệu

Trong chế độ chỉnh sửa:

* Hiển thị khung section với th�ng b�o �Chưa c� dữ liệu�.
* C� n�t �Th�m nội dung�.

Trong Landing Page c�ng khai:

* Section tự động ẩn.

## Dữ liệu nội bộ

Kh�ng xuất hiện trong Preview Landing Page.

C� thể bật chế độ:

**Hiển thị vị tr� dữ liệu đ� bị ẩn**

Khi bật, preview hiển thị nh�n quản trị:

> 2 hoạt động nội bộ kh�ng được hiển thị.

---

# 16. Kiểm tra trước khi xuất bản

Khi bấm �Xuất bản�, mở bảng kiểm tra.

## Lỗi bắt buộc phải sửa

* Chưa c� t�n cuộc thi.
* Chưa c� ảnh b�a.
* Chưa c� m� tả.
* Chưa c� đơn vị tổ chức.
* Chưa c� th�ng tin li�n hệ.
* Chưa c� giai đoạn c�ng khai.
* N�t đăng k� kh�ng c� li�n kết.
* Ng�y kết th�c trước ng�y bắt đầu.

## Cảnh b�o nhưng vẫn c� thể xuất bản

* Chưa c� logo.
* Chưa c� video.
* Chưa c� ban gi�m khảo.
* Chưa c� nh� t�i trợ.
* Chưa c� tin tức.
* Một số hoạt động thiếu địa điểm.
* Một số hoạt động chưa ph�n loại c�ng khai hoặc nội bộ.

## Giao diện kiểm tra

```text
Kiểm tra trước khi xuất bản

✓ 18 mục đ� ho�n th�nh
✕ 2 lỗi cần xử l�
! 4 cảnh b�o

[Lỗi]
- Chưa c� email hoặc hotline li�n hệ
- Giai đoạn �B�n kết� chưa c� ng�y tổ chức

[Cảnh b�o]
- Chưa c� ảnh chia sẻ
- Chưa c� ban gi�m khảo
```

N�t:

* Quay lại chỉnh sửa.
* Bỏ qua cảnh b�o v� xuất bản.

---

# 17. Thiết kế tr�n mobile v� tablet

M�n h�nh nhập liệu n�n ưu ti�n desktop, nhưng vẫn hỗ trợ tablet.

## Tablet

* Menu tr�i chuyển th�nh dropdown.
* Form v� preview chia 50/50 hoặc d�ng tab.
* Preview c� thể mở to�n m�n h�nh.

## Mobile

Kh�ng n�n chia đ�i m�n h�nh.

D�ng hai tab:

* Chỉnh sửa.
* Xem trước.

Thanh dưới cố định:

* Lưu nh�p.
* Xem trước.
* Xuất bản.

Form d�i n�n d�ng accordion theo từng nh�m.

---

# 18. Cấu tr�c m�n h�nh đề xuất cuối c�ng

```text
Trang tạo Landing Page cuộc thi

1. Header quản trị
   - T�n cuộc thi
   - Trạng th�i
   - Lưu nh�p
   - Xem trước
   - Xuất bản

2. Sidebar
   - Th�ng tin chung
   - Lịch tr�nh
   - Đăng k�
   - Nội dung c�ng khai
   - Đơn vị đồng h�nh
   - Li�n hệ v� xuất bản

3. Form nhập liệu
   - Hiển thị theo từng nh�m
   - Trường được tự điền từ Excel
   - Trường nhập thủ c�ng
   - Trạng th�i bắt buộc
   - Trạng th�i c�ng khai hoặc nội bộ

4. Preview
   - Desktop, tablet, mobile
   - Tự động cập nhật
   - Bấm section để mở form tương ứng
   - Placeholder khi thiếu dữ liệu

5. Kiểm tra xuất bản
   - Lỗi
   - Cảnh b�o
   - Danh s�ch dữ liệu c�n thiếu
```

---

# 19. Những dữ liệu người d�ng thực sự phải nhập

Để hạn chế nhập liệu tối đa, người d�ng chỉ cần nhập thủ c�ng c�c dữ liệu sau:

## Bắt buộc

* T�n cuộc thi.
* Ảnh b�a.
* M� tả ngắn.
* Giới thiệu cuộc thi.
* Đơn vị tổ chức.
* Hotline hoặc email.
* Link đăng k� hoặc trạng th�i kh�ng nhận đăng k�.
* X�c nhận nội dung n�o trong timeline được c�ng khai.

## C� thể tự động lấy

* Ng�y bắt đầu v� kết th�c.
* C�c giai đoạn.
* Ng�y giờ từng giai đoạn.
* Hoạt động.
* Địa điểm.
* Số lượng giai đoạn.
* Số lượng hoạt động.
* Tiến tr�nh cuộc thi.
* Trạng th�i theo thời gian.
* Th�ng tin Brand.
* Logo Brand.
* Website Brand.
* Mạng x� hội Brand.

## Chỉ nhập khi c� nhu cầu

* Ban gi�m khảo.
* Danh s�ch th� sinh.
* Kết quả.
* Tin tức.
* Thư viện.
* Nh� t�i trợ.
* Video.
* SEO n�ng cao.
* Domain ri�ng.

---

# 20. Luồng thao t�c tối ưu

```text
Tạo Landing Page
→ Nhập t�n v� ảnh b�a
→ Tải file Excel
→ Hệ thống nhận diện timeline
→ Kiểm tra c�c nội dung chưa chắc chắn
→ Chọn nội dung c�ng khai
→ Bổ sung m� tả v� link đăng k�
→ Xem trước Landing Page
→ Sửa lỗi c�n thiếu
→ Xuất bản
```

Mục ti�u l� để người d�ng c� thể tạo một Landing Page cơ bản m� chỉ cần thao t�c tại ba phần ch�nh:

1. Th�ng tin chung.
2. Tải v� kiểm tra timeline.
3. Th�ng tin đăng k�.

C�c phần c�n lại l� t�y chọn v� kh�ng n�n cản trở việc xuất bản.
