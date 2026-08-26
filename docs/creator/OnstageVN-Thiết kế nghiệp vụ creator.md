# ONSTAGE.VN – THIẾT KẾ NGHIỆP VỤ CHIẾN DỊCH NỘI DUNG VỚI CREATOR

> Tài liệu này tập trung vào **Nghiệp vụ, Mô hình kinh doanh, Chính sách cam kết & Định giá**.  

# 1. Tổng quan

### 1.1. Mục tiêu

Tính năng **Chiến dịch nội dung với Creator** cho phép Nhãn hàng gửi sản phẩm và yêu cầu Onstage.vn tổ chức một chiến dịch sử dụng KOL/KOC/Creator để sản xuất nội dung, đăng tải lên nền tảng mạng xã hội và đạt một lượng lượt xem mục tiêu.

Khác với luồng đặt thuê nhân sự/Talent hiện tại, Nhãn hàng không nhất thiết mua một Creator cụ thể mà mua một **kết quả đầu ra**:

- Số lượng nội dung cần sản xuất
- Hình thức xuất hiện của sản phẩm
- Tổng số lượt xem mục tiêu
- Khoảng thời gian đo lượt xem
- Các yêu cầu bắt buộc về nội dung
- Quyền sử dụng lại nội dung
- Các yêu cầu bổ sung khác

Onstage.vn đứng giữa và chịu trách nhiệm:

1. Tiếp nhận yêu cầu sản phẩm
2. Kiểm duyệt sản phẩm
3. Xây dựng báo giá
4. Chốt ngân sách với Nhãn hàng
5. Chọn Creator phù hợp
6. Mời Creator tham gia
7. Điều phối giao sản phẩm nếu cần
8. Kiểm duyệt nội dung
9. Theo dõi lượt xem
10. Bổ sung Creator/nội dung khi thiếu lượt xem
11. Tính thanh toán cho Creator
12. Trả báo cáo cuối chiến dịch cho Nhãn hàng

---

# 2. Định vị sản phẩm

## 2.1. Nhãn hàng đang mua gì?

Không nên định vị sản phẩm dưới dạng:

> 1 Creator = X tiền / 1 video

Thay vào đó nên định vị:

> **Loại nội dung + Mục tiêu lượt xem + mức độ tương tác với sản phẩm + quyền sử dụng nội dung + Hạng mục bổ sung**

Ví dụ:

- Sản phẩm: Kem chống nắng ABC
- Nền tảng: TikTok
- Hình thức: Creator trực tiếp sử dụng sản phẩm
- Mục tiêu lượt xem: 500.000
- Hạn hoàn thành: 30 ngày
- Thời gian tính lượt xem: 14 ngày/video
- Quyền sử dụng nội dung: 30 ngày

Onstage báo giá toàn chiến dịch và chịu trách nhiệm phân bổ Creator phía sau.

---

# 3. Các loại Chiến dịch

Nên chia chiến dịch thành 2 loại chính.

## 3.1. Loại A – Xuất hiện sản phẩm / Nhắc đến sản phẩm

Creator không bắt buộc phải nhận hoặc trực tiếp sử dụng sản phẩm.

Các hình thức:

- Xuất hiện logo
- Xuất hiện hình ảnh sản phẩm
- Nhắc tên Nhãn hàng
- Nhắc tên sản phẩm
- Chèn tệp hình ảnh/video của sản phẩm
- Nhắc tên trong phần mô tả
- Gắn thẻ hashtag
- Chèn lời kêu gọi hành động

### Đặc điểm

- Không phát sinh giao nhận sản phẩm
- Không cần lấy địa chỉ Creator
- Có thể triển khai nhanh
- Phù hợp với chiến dịch cần phủ nhận diện

### Sơ đồ luồng

```mermaid
swimlane-beta TB
  subgraph Nhãn hàng
    b1["1. Tạo chiến dịch và Nạp link Drive"]
    b2["6. Xem video nháp"]
    b3["10. Nhận báo cáo nghiệm thu"]
  end

  subgraph Quản trị viên Onstage
    a1["2. Thẩm định chiến dịch và Báo giá"]
    a2["3. Phân bổ và Mời Creator"]
    a3["7. Kiểm duyệt và Phản hồi nháp"]
    a4["9. Đối soát KPI và Thanh toán"]
  end

  subgraph Creator
    c1["4. Xác nhận nhận job"]
    c2["5. Tải Drive và Dựng video nháp"]
    c3["8. Đăng video chính thức và Dán link"]
  end

  subgraph Hệ thống Onstage
    s1["Mở quyền truy cập Drive tư liệu"]
    s2["Tự động đo lường lượt xem 14 ngày"]
  end

  b1 --> a1 --> a2 --> c1
  c1 --> s1 --> c2
  c2 --> b2 --> a3
  a3 --> c3
  c3 --> s2 --> a4 --> b3
```

---

## 3.2. Loại B – Trải nghiệm sản phẩm 

Creator phải trực tiếp nhận và sử dụng sản phẩm.

Các hình thức:

- Mở hộp
- Minh họa sử dụng
- Trải nghiệm thực tế
- Hướng dẫn sử dụng
- Test sản phẩm
- So sánh sản phẩm

### Đặc điểm

Phát sinh thêm:

- Danh sách Creator nhận hàng
- Địa chỉ giao hàng
- Số điện thoại nhận hàng
- Số lượng sản phẩm
- Đơn vị vận chuyển
- Mã vận đơn

### Sơ đồ luồng

```mermaid
swimlane-beta TB
  subgraph Nhãn hàng
    bb1["1. Tạo chiến dịch Gói B"]
    bb2["4. Gửi hàng mẫu và Nhập Mã Vận Đơn"]
    bb3["8. Xem video nháp"]
    bb4["12. Nhận báo cáo nghiệm thu"]
  end

  subgraph Quản trị viên Onstage
    ba1["2. Thẩm định và Báo giá"]
    ba2["3. Phân bổ và Mời Creator"]
    ba3["9. Kiểm duyệt và Phản hồi video"]
    ba4["11. Đối soát KPI và Thanh toán"]
  end

  subgraph Creator
    bc1["3.1. Nhận job và Xác nhận địa chỉ"]
    bc2["5. Nhận hàng và Bấm xác nhận"]
    bc3["7. Dùng thử và Dựng video nháp"]
    bc4["10. Đăng video chính thức và Dán link"]
  end

  subgraph Hệ thống Onstage
    bs1["Chuyển địa chỉ Creator cho Brand"]
    bs2["Kích hoạt hạn nộp video sau khi nhận hàng"]
    bs3["Tự động đo lường lượt xem 14 ngày"]
  end

  bb1 --> ba1 --> ba2 --> bc1
  bc1 --> bs1 --> bb2
  bb2 --> bc2 --> bs2 --> bc3
  bc3 --> bb3 --> ba3
  ba3 --> bc4
  bc4 --> bs3 --> ba4 --> bb4
```

---

# 4. Luồng tổng thể

### Sơ đồ luồng

```mermaid
swimlane-beta TB
  subgraph Nhãn hàng
    b1["1. Tạo yêu cầu chiến dịch"]
    b2["3. Duyệt báo giá và Đặt cọc đợt 1"]
    b3["7. Xem và Duyệt video nháp"]
    b4["11. Thanh toán đợt 2 và Nhận báo cáo"]
  end

  subgraph Quản trị viên Onstage
    a1["2. Thẩm định chiến dịch và Gửi báo giá"]
    a2["4. Chọn lọc và Gửi lời mời Creator"]
    a3["8. Kiểm duyệt và Phê duyệt video"]
    a4["10. Đối soát KPI và Chốt kết quả"]
  end

  subgraph Creator
    c1["5. Đồng ý nhận job"]
    c2["6. Nhận tư liệu hoặc mẫu và Dựng video"]
    c3["9. Đăng clip chính thức và Dán link"]
    c4["12. Nhận thù lao làm video"]
  end

  subgraph Hệ thống Onstage
    s1["Tự động đo lường lượt xem 14 ngày"]
    s2["Kích hoạt cơ chế bù nếu thiếu views"]
  end

  b1 --> a1 --> b2 --> a2 --> c1
  c1 --> c2 --> b3 --> a3
  a3 --> c3 --> s1 --> a4
  a4 --> s2
  a4 --> b4
  a4 --> c4
```

---

# 5. Bảng giá chi tiết và Cách tính giá chiến dịch

## 5.1. Nguyên tắc định giá theo Gói Lượt xem Cam kết (CPM Model)

Onstage **không bán Creator lẻ theo giá booking cá nhân**, mà bán **Gói Kết quả Truyền thông theo Tổng Lượt xem Cam kết (View Guarantee)**.

Giá trọn gói một chiến dịch được cấu thành từ 5 thành phần:
```text
Tổng giá chiến dịch 
= [Phí sản xuất nội dung của Creator] 
+ [Quỹ thưởng hiệu quả theo lượt xem] 
+ [Chi phí vận chuyển & Hàng mẫu (nếu có)] 
+ [Quỹ dự phòng bù lượt xem (10–15%)] 
+ [Phí bản quyền & Quyền chạy quảng cáo (nếu chọn)] 
+ [Lợi nhuận gộp Onstage (25–35%)]
```

---

## 5.2. Bảng giá các Gói Lượt xem chính thức (Đề xuất thử nghiệm)

### Gói A: Không cần gửi hàng thật (Mức 1 & Mức 2)
*Áp dụng khi:* Nhãn hàng gửi link Drive chứa ảnh đẹp, video quay sẵn 3–5s, logo để Creator chèn vào clip, hoặc Creator chỉ cần nhắc tên và gắn link mua hàng ở mô tả/bio.

| Gói Lượt xem cam kết | Giá bán Nhãn hàng (VND) | Đơn giá / 1.000 Views (CPM) | Số Creator dự kiến | Thời gian đo views |
|---:|---:|---:|---:|:---:|
| **50.000 Views** | **8.000.000 – 12.000.000 đ** | 160.000 – 240.000 đ | 3 – 5 Creator | 14 ngày/video |
| **100.000 Views** | **15.000.000 – 22.000.000 đ** | 150.000 – 220.000 đ | 5 – 10 Creator | 14 ngày/video |
| **300.000 Views** | **39.000.000 – 57.000.000 đ** | 130.000 – 190.000 đ | 10 – 20 Creator | 14 ngày/video |
| **500.000 Views** | **60.000.000 – 85.000.000 đ** | 120.000 – 170.000 đ | 15 – 30 Creator | 14 ngày/video |
| **1.000.000 Views** | **110.000.000 – 150.000.000 đ** | 110.000 – 150.000 đ | 25 – 50 Creator | 14 ngày/video |
| **2.000.000 Views** | **200.000.000 – 280.000.000 đ** | 100.000 – 140.000 đ | 50 – 90 Creator | 14 ngày/video |

---

### Gói B: Có gửi sản phẩm thật – Mở hộp & Trải nghiệm thực tế (Mức 3 & Mức 4)
*Áp dụng khi:* Nhãn hàng gửi sản phẩm thật đến nhà Creator để mở hộp bóc seal, cầm trên tay, thoa lên da, ăn/uống thử, kiểm tra công năng thực tế hoặc Creator đến trực tiếp cửa hàng/showroom trải nghiệm.

| Gói Lượt xem cam kết | Giá bán Nhãn hàng (VND) | Đơn giá / 1.000 Views (CPM) | Số Creator dự kiến | Ghi chú vận hành |
|---:|---:|---:|---:|:---|
| **50.000 Views** | **12.000.000 – 18.000.000 đ** | 240.000 – 360.000 đ | 3 – 5 Creator | Nhãn hàng cung cấp 3–5 sản phẩm mẫu |
| **100.000 Views** | **20.000.000 – 30.000.000 đ** | 200.000 – 300.000 đ | 5 – 10 Creator | Nhãn hàng cung cấp 5–10 sản phẩm mẫu |
| **300.000 Views** | **50.000.000 – 75.000.000 đ** | 166.000 – 250.000 đ | 10 – 20 Creator | Bao gồm chi phí bù Creator dự phòng |
| **500.000 Views** | **75.000.000 – 110.000.000 đ** | 150.000 – 220.000 đ | 15 – 30 Creator | Đội ngũ Onstage hỗ trợ kiểm duyệt video |
| **1.000.000 Views** | **135.000.000 – 200.000.000 đ** | 135.000 – 200.000 đ | 25 – 50 Creator | Gói tối ưu cho chiến dịch ra mắt sản phẩm |
| **2.000.000 Views** | **250.000.000 – 360.000.000 đ** | 125.000 – 180.000 đ | 50 – 90 Creator | Chiến dịch quy mô lớn phủ sóng toàn diện |

*Lưu ý:* Giá trị sản phẩm mẫu do Nhãn hàng tự chi trả/cung cấp. Tiền cước vận chuyển bưu điện nếu Nhãn hàng tự gửi sẽ do Nhãn hàng thanh toán trực tiếp với bưu điện.


---

## 5.3. Bảng phụ phí tùy chọn (Add-on Services)

Nếu Nhãn hàng có các yêu cầu bổ sung ngoài gói tiêu chuẩn, phụ phí sẽ được tính thêm như sau:

| Hạng mục phụ phí | Mức phí cộng thêm | Diễn giải chi tiết |
|:---|:---:|:---|
| **Đăng lại video trên Fanpage/TikTok của Brand** | **+10% – 15%** giá gói | Nhãn hàng được tải video về đăng lại trên các kênh chính thức của mình trong vòng 30 ngày. |
| **Quyền chạy quảng cáo (Mã Spark Ads / Whitelist)** | **+20% – 35%** giá gói | Creator cấp mã ủy quyền để Nhãn hàng nạp tiền chạy quảng cáo trực tiếp trên video của Creator (thời hạn 30 ngày). |
| **Yêu cầu độc quyền ngành hàng (30 ngày)** | **+20% – 40%** giá gói | Creator cam kết không nhận quảng cáo sản phẩm của đối thủ cạnh tranh trong vòng 30 ngày sau khi đăng clip. |
| **Thời hạn đo views mở rộng (30 ngày thay vì 14 ngày)** | **+10%** giá gói | Phù hợp với các sản phẩm có độ ngấm lâu hoặc video lên xu hướng chậm. |
| **Giao hàng hỏa tốc trong 24 giờ** | **+10% – 15%** giá gói | Áp dụng cho đồ ăn tươi, bánh kem, hoặc chiến dịch cần lên video gấp trong 24–48h. |
| **Lựa chọn đích danh Creator chuyên môn cao** | **Báo giá riêng** | Dành cho Bác sĩ da liễu, Dược sĩ, Chuyên gia công nghệ, Reviewer nổi tiếng top đầu. |

---

## 5.4. Cơ chế phân bổ chi phí trả cho Creator (Cố định + Thưởng hiệu quả)

Onstage áp dụng cơ chế thanh toán thông minh cho Creator: **Phí dựng video cố định (Base Fee) + Thưởng theo mốc lượt xem (Performance Bonus)** để kích thích Creator đầu tư nội dung viral.

### A. Phí cố định làm 1 video (Base Fee)
| Nhóm Creator | Lượng người theo dõi | Lượt xem trung bình/video | Mức trả cố định / 1 video |
|:---|:---:|:---:|:---:|
| **Nano Creator** | 5.000 – 20.000 | 5.000 – 20.000 views | 300.000 – 800.000 đ |
| **Micro Creator** | 20.000 – 100.000 | 20.000 – 60.000 views | 1.000.000 – 3.000.000 đ |
| **Mid-tier Creator** | 100.000 – 300.000 | 60.000 – 150.000 views | 3.500.000 – 8.000.000 đ |
| **Macro Creator** | Trên 300.000 | Trên 150.000 views | Từ 10.000.000 đ trở lên |

### B. Quỹ thưởng hiệu quả khi video lên xu hướng (Bonus)
Sau 14 ngày đo lường, nếu video của Creator đạt các mốc views cao:
* **Từ 30.000 – 50.000 views:** Thưởng thêm `+300.000 đ`
* **Từ 50.000 – 100.000 views:** Thưởng thêm `+600.000 đ`
* **Từ 100.000 – 300.000 views:** Thưởng thêm `+1.500.000 đ`
* **Trên 300.000 views:** Thưởng thêm `+3.000.000 đ`

---

## 5.5. Ví dụ bóc tách chi phí & Lợi nhuận thực tế (P&L Minh họa)

### 📌 Ví dụ 1: Chiến dịch 500.000 Views – Gói B (Review trực tiếp sản phẩm)
* **Quy mô:** Cam kết 500.000 views trong 14 ngày, phân bổ cho **20 Creator** (15 Micro + 5 Nano).
* **Giá bán cho Nhãn hàng:** **85.000.000 đ**

| Khoản mục chi phí nội bộ | Số lượng / Đơn giá | Thành tiền | Tỷ trọng |
|:---|:---|---:|---:|
| **1. Phí làm video trả cứng cho 20 Creator** | 15 Micro (2.2tr) + 5 Nano (800k) | 37.000.000 đ | 43,5% |
| **2. Quỹ thưởng hiệu quả cho các clip viral** | Dự kiến 4 clip vượt mốc 50k–100k views | 6.000.000 đ | 7,1% |
| **3. Phí đóng gói & ship bưu điện** | 20 gói x 50.000 đ | 1.000.000 đ | 1,2% |
| **4. Quỹ dự phòng bù views** | Dự phòng book thêm 2–3 Creator nếu thiếu view | 9.000.000 đ | 10,6% |
| **5. Chi phí vận hành & nhân sự Onstage** | Kiểm duyệt video, đối soát, hỗ trợ kỹ thuật | 5.000.000 đ | 5,9% |
| **TỔNG CHI PHÍ DỰ KIẾN** | | **58.000.000 đ** | **68,2%** |
| **LỢI NHUẬN GỘP ONSTAGE (Gross Profit)** | | **27.000.000 đ** | **31,8%** |

---

### 📌 Ví dụ 2: Chiến dịch 1.000.000 Views – Gói A (Chèn ảnh & Video tư liệu số từ Drive)
* **Quy mô:** Cam kết 1.000.000 views trong 14 ngày, phân bổ cho **35 Creator** (không cần ship hàng).
* **Giá bán cho Nhãn hàng:** **130.000.000 đ**

| Khoản mục chi phí nội bộ | Số lượng / Đơn giá | Thành tiền | Tỷ trọng |
|:---|:---|---:|---:|
| **1. Phí làm video trả cứng cho 35 Creator** | 20 Micro (2.0tr) + 15 Nano (700k) | 50.500.000 đ | 38,8% |
| **2. Quỹ thưởng hiệu quả** | Dự kiến 6 clip đạt mốc xu hướng lớn | 12.000.000 đ | 9,2% |
| **3. Phí giao nhận hàng** | 0 đ (Dùng kho tư liệu số qua Drive) | 0 đ | 0,0% |
| **4. Quỹ dự phòng bù views (Buffer)** | Dự phòng book thêm 4 Creator nếu thiếu view | 15.000.000 đ | 11,5% |
| **5. Chi phí vận hành Onstage** | Quản lý chiến dịch & theo dõi lượt xem | 8.500.000 đ | 6,5% |
| **TỔNG CHI PHÍ DỰ KIẾN** | | **86.000.000 đ** | **66,2%** |
| **LỢI NHUẬN GỘP ONSTAGE (Gross Profit)** | | **44.000.000 đ** | **33,8%** |

---

## 5.6. Chính sách Cam kết Lượt xem & Phương án xử lý khi không đủ KPI

Sau 14 ngày kể từ khi video cuối cùng được đăng, hệ thống tự động tổng hợp tổng lượt xem:

```text
Tổng Lượt Xem Đạt Được >= Mục Tiêu Cam Kết?
  ├── ĐẠT (>= 100%) ──► Nghiệm thu 100% chiến dịch ──► Xuất Báo cáo & Thanh toán Creator.
  └── CHƯA ĐẠT (< 100%) ──► Áp dụng 1 trong 3 chính sách bù:
         ├── Lựa chọn 1: Bù thêm Creator mới từ Quỹ Dự Phòng để quay thêm video cho đủ views.
         ├── Lựa chọn 2: Kéo dài thêm 7–14 ngày thời gian đo để video tích lũy thêm views tự nhiên.
         └── Lựa chọn 3: Hoàn tiền tương ứng phần trăm lượt xem còn thiếu cho Nhãn hàng.
```

---

# 6. Cam kết lượt xem

## 6.1. Định nghĩa

Khuyến nghị:

> Nhãn hàng mua **Tổng lượt xem cam kết của toàn chiến dịch**

Không nên mặc định bảo đảm mỗi Creator đạt một mức lượt xem riêng.

Ví dụ:

- Mục tiêu chiến dịch: 500K
- 15 Creator
- Creator A: 120K
- Creator B: 80K
- Creator C: 20K
- Creator D: 160K
- Các Creator khác cộng lại: 120K

Tổng = 500K → Chiến dịch đạt mục tiêu.

---

## 6.2. Thời gian tính lượt xem

Phải cấu hình rõ thời gian đo lượt xem.

Ví dụ:

- 7 ngày
- 14 ngày
- 30 ngày

Khuyến nghị mặc định bản tối thiểu:

> **14 ngày kể từ thời điểm mỗi video được đăng**

Các lượt xem ngoài Thời gian tính lượt xem không tính vào cam kết.

---

## 6.3. Vượt mục tiêu

Ví dụ:

- Mục tiêu: 500K
- Thực tế: 750K

Khuyến nghị:

- Nhãn hàng không phải trả thêm nếu hợp đồng không có điều khoản thưởng
- Onstage ghi nhận phần hiệu quả vượt mục tiêu
- Dữ liệu được dùng cho Điểm Creator

---

## 6.4. Không đạt mục tiêu

Ví dụ:

- Mục tiêu: 500K
- Thực tế: 370K
- Còn thiếu: 130K

Quản trị viên được phép:

1. Thêm Creator
2. Thêm video
3. Kéo dài thời gian tính lượt xem
4. Chạy phương án bù lượt xem
5. Hoàn tiền phần lượt xem thiếu theo chính sách

---

# 7. Cơ chế trả tiền cho Creator & Bài toán Đảm bảo Lợi nhuận cho Onstage

## 7.1. Nguyên tắc cốt lõi: Chia sẻ rủi ro và Kích thích hiệu quả

* **Không trả 100% theo lượt xem:** Nếu chỉ trả tiền theo lượt xem thì Creator sẽ từ chối nhận job vì rủi ro thuật toán nền tảng (TikTok/Reels) bóp tương tác.
* **Không trả 100% theo giá booking cố định:** Nếu trả hết 100% giá cố định mà không gắn với kết quả thì Onstage chịu toàn bộ rủi ro khi clip bị xịt, dẫn đến thua lỗ.
* **Mô hình Onstage áp dụng:** **Phí sản xuất cố định (Base Fee) + Thưởng hiệu quả theo mốc lượt xem (Bonus Pool)**.

```text
Tổng tiền Creator nhận 
= [Phí làm video cố định] + [Tiền thưởng thêm khi video đạt mốc Views cao]
```

---

## 7.2. Tỷ lệ Phân bổ Ngân sách (Unit Economics) để Đảm bảo Lợi nhuận Onstage

Từ **100% tổng tiền thu từ Nhãn hàng**, Onstage đóng khung ngân sách chi tiêu tối đa (Cost Ceiling) theo tỷ lệ vàng:

```text
┌────────────────────────────────────────────────────────┬─────────────┐
│ Hạng mục phân bổ ngân sách                            │ Tỷ lệ (%)   │
├────────────────────────────────────────────────────────┼─────────────┤
│ 1. Phí làm video cố định trả Creator (Base Fee)        │ 40% – 45%   │
│ 2. Quỹ thưởng hiệu quả khi video lên xu hướng (Bonus) │ 8% – 10%    │
│ 3. Quỹ dự phòng rủi ro bù lượt xem (Buffer Pool)      │ 10% – 12%   │
│ 4. Chi phí giao nhận bưu điện & Vận hành hệ thống     │ 3% – 5%     │
│ 5. LỢI NHUẬN GỘP ONSTAGE (Gross Profit)               │ 30% – 35%   │
└────────────────────────────────────────────────────────┴─────────────┘
```

---

## 7.3. Khung thù lao trả Creator đồng bộ với Bảng giá thu của Nhãn hàng

### A. Mức phí cố định trả Creator cho 1 video (Base Fee)
| Nhóm Creator | Tiêu chuẩn kênh | Thù lao cố định / 1 video | Dự kiến lượt xem đóng góp |
|:---|:---:|:---:|:---:|
| **Nano Creator** | 5.000 – 20.000 follow | **300.000 – 800.000 đ** | 5.000 – 15.000 views |
| **Micro Creator** | 20.000 – 100.000 follow | **1.000.000 – 3.000.000 đ** | 20.000 – 50.000 views |
| **Mid-tier Creator** | 100.000 – 300.000 follow | **3.500.000 – 8.000.000 đ** | 60.000 – 120.000 views |

### B. Cơ chế thưởng thêm trích từ "Quỹ thưởng hiệu quả" (Bonus)
Sau 14 ngày đo lường, nếu video của Creator vượt các mốc lượt xem sau thì được nhận thưởng thêm:
* **Từ 30.000 – 50.000 views:** Thưởng thêm `+300.000 đ`
* **Từ 50.000 – 100.000 views:** Thưởng thêm `+600.000 đ`
* **Từ 100.000 – 300.000 views:** Thưởng thêm `+1.500.000 đ`
* **Trên 300.000 views:** Thưởng thêm `+3.000.000 đ`

---

## 7.4. Làm thế nào Onstage luôn có Lợi nhuận trong mọi kịch bản?

Cơ chế quản lý Quỹ dự phòng (10–12%) và Quỹ thưởng (8–10%) giúp Onstage luôn bảo toàn lợi nhuận:

```text
                                  KỊCH BẢN CHIẾN DỊCH
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
[KỊCH BẢN 1: VIRAL MẠNH]       [KỊCH BẢN 2: ĐẠT CHUẨN KPI]       [KỊCH BẢN 3: BỊ THIẾU VIEWS]
- Nhiều clip nổ xu hướng       - Views đạt đúng cam kết          - Một số clip bị bóp views
- Thừa views cam kết           - Dùng vừa đủ Quỹ thưởng          - Dùng Quỹ Dự Phòng (10-12%)
- Chi Quỹ thưởng cho Creator   - Quỹ Dự Phòng KHÔNG dùng đến       để book thêm 2-3 Creator bù
- Onstage giữ trọn:            - Quỹ Dự Phòng biến thành:        - Onstage vẫn giữ được:
  LỢI NHUẬN 30% – 35%            LỢI NHUẬN TĂNG LÊN 35% – 40%      LỢI NHUẬN AN TOÀN 22% – 25%
```

1. **Kịch bản 1 (Chiến dịch Viral mạnh):** Nhiều video đạt mốc thưởng lớn $\rightarrow$ Lượt xem của Nhãn hàng vượt cam kết $\rightarrow$ Tiền thưởng được trả từ Quỹ Thưởng có sẵn $\rightarrow$ **Onstage giữ trọn lợi nhuận gộp 30% – 35%**.
2. **Kịch bản 2 (Chiến dịch Đạt chuẩn KPI):** Tổng views đạt đủ 100% mục tiêu, không có clip nào bị xịt nặng $\rightarrow$ Onstage không cần đụng vào Quỹ Dự Phòng $\rightarrow$ **Khoản dự phòng này chuyển thẳng thành lợi nhuận ròng, giúp biên lợi nhuận tăng lên 35% – 40%**.
3. **Kịch bản 3 (Chiến dịch bị thiếu Views do có clip xịt):** Onstage trích ngay Quỹ Dự Phòng (10–12%) để mời thêm 2–3 Creator Nano quay bổ sung cho đủ views $\rightarrow$ Không phải lấy tiền túi bù $\rightarrow$ **Onstage vẫn giữ được biên lợi nhuận an toàn 22% – 25%**.

---

# 8. Các quy tắc nghiệp vụ cốt lõi

## 8.1. Nhãn hàng mua Gói Kết quả, không chọn mua lẻ từng Creator
* **Cơ chế:** Nhãn hàng chỉ cần chọn: Ngành hàng, phân loại sản phẩm, mức độ xuất hiện sản phẩm (Mức 1 đến Mức 4) và Tổng lượt xem cam kết.
* **Quyền điều phối:** Quản trị viên Onstage chịu trách nhiệm chọn và phân bổ danh sách Creator phù hợp để đạt mục tiêu.
* **Lý do:** Nếu để Nhãn hàng tự chọn từng Creator và mặc cả giá từng người thì hệ thống sẽ quay lại mô hình Booking truyền thống, vừa mất thời gian vừa không thể cam kết kết quả tổng thể.

---

## 8.2. Phân tách rõ Chi phí nội bộ và Giá bán cho Nhãn hàng
Khi Quản trị viên tạo hoặc duyệt báo giá, màn hình quản trị phải hiển thị rõ ràng 4 thông số tài chính:
```text
1. Giá bán cho Nhãn hàng
2. Chi phí thực tế trả Creator & Vận hành
3. Lợi nhuận gộp dự kiến (VND)
4. Biên lợi nhuận gộp dự kiến (Mục tiêu 25% – 35%)
```

---

## 8.3. Luôn có "Biên an toàn" trong kế hoạch phân bổ Lượt xem
* Khi Nhãn hàng mua gói **500.000 lượt xem cam kết**, kế hoạch phân bổ Creator nội bộ phải nhắm tới **600.000 – 650.000 lượt xem dự kiến** (dư 20% – 30%).
* *Mục đích:* Phòng ngừa trường hợp một số Creator có clip bị ít tương tác, đảm bảo tổng thể chiến dịch vẫn luôn đạt hoặc vượt KPI cam kết.

---

## 8.4. Phân biệt rõ "Cam kết với Nhãn hàng" và "Dự kiến với Creator"
* **Với Nhãn hàng:** Onstage cam kết **Tổng lượt xem toàn chiến dịch**.
* **Với Creator:** Onstage chỉ đưa ra **mức kỳ vọng dự kiến**; Creator nhận thù lao cố định làm video + thưởng thêm theo lượt xem thực tế đạt được, Onstage không cam kết lượt xem cố định cho từng cá nhân Creator.

---

## 8.5. Lưu trữ đầy đủ lịch sử các phiên bản video
Mọi video Creator nộp lên hệ thống đều phải được lưu theo phiên bản:
```text
Bản nháp 1 ──► Yêu cầu sửa (kèm ghi chú lý do) ──► Bản nháp 2 ──► Đạt chuẩn (Duyệt)
```
Không ghi đè hoặc xóa các file nháp cũ để làm bằng chứng đối soát khi phát sinh khiếu nại.

---

## 8.6. Số liệu Lượt xem phải có nguồn xác thực rõ ràng
Mỗi số liệu lượt xem ghi nhận trên hệ thống cần lưu lại:
* Đường link video gốc trên nền tảng (TikTok, Reels, Shorts).
* Thời gian cập nhật số liệu gần nhất.
* Ảnh chụp màn hình đối soát (nếu cập nhật thủ công) hoặc mã xác thực API (khi đồng bộ tự động).

---

# 9. Các chỉ số vận hành & Hiệu quả cần theo dõi

## 9.1. Nhóm chỉ số về Chiến dịch
* **Mục tiêu lượt xem cam kết:** Tổng số lượt xem đã hứa với Nhãn hàng (Ví dụ: 500.000 views).
* **Lượt xem thực tế đã đạt:** Tổng số lượt xem ghi nhận được từ tất cả các video đã đăng.
* **Tỷ lệ hoàn thành mục tiêu (%):** (Lượt xem thực tế / Mục tiêu cam kết) x 100%.
* **Số lượng Creator tham gia & Số video đã đăng:** Theo dõi tiến độ sản xuất nội dung.
* **Tỷ lệ video phải chỉnh sửa (%):** Số video bị yêu cầu làm lại / Tổng số video nộp.
* **Tỷ lệ giao hàng mẫu thành công (%):** Số kiện hàng mẫu Creator đã nhận thành công.

## 9.2. Nhóm chỉ số về Tài chính & Lợi nhuận
* **Doanh thu chiến dịch:** Tổng số tiền thu từ Nhãn hàng.
* **Chi phí trả Creator:** Tổng tiền thù lao cố định + tiền thưởng hiệu quả trả cho Creator.
* **Chi phí giao nhận hàng mẫu:** Tiền cước bưu điện, shipper giao sản phẩm cho Creator.
* **Chi phí bù lượt xem (nếu có):** Tiền book thêm Creator dự phòng hoặc hoàn tiền cho Nhãn hàng.
* **Lợi nhuận gộp:** `Doanh thu - Tổng chi phí nội bộ`.
* **Biên lợi nhuận gộp (%):** `(Lợi nhuận gộp / Doanh thu) x 100%`.
* **Đơn giá thực tế trên 1.000 lượt xem (CPM):** Đo lường hiệu quả chi phí thực tế của chiến dịch.

## 9.3. Nhóm chỉ số đánh giá chất lượng Creator
* **Tỷ lệ đồng ý nhận việc (%):** Số lần Creator bấm nhận job / Tổng số lần được gửi lời mời.
* **Tỷ lệ nộp bài đúng hạn (%):** Số lần nộp video đúng thời hạn quy định.
* **Lượt xem trung bình / video của Creator:** Đánh giá sức hút và độ viral của từng Creator.
* **Tỷ lệ đạt chuẩn ngay lần đầu (%):** Video được duyệt ngay từ Bản nháp 1 mà không cần sửa lại.
* **Hiệu suất chi phí của Creator:** Số lượt xem mang lại trên mỗi đồng chi phí đầu tư, giúp hệ thống tự động ưu tiên Creator tốt cho các chiến dịch sau.

---

# 10. Dữ liệu phục vụ Creator Phân tích dữ liệu sau này

Module này phải được thiết kế ngay từ đầu để tạo data moat.

Sau nhiều chiến dịch, hệ thống cần trả lời được:

### Creator Phân tích dữ liệu

- Creator nào mạnh ngành Beauty?
- Creator nào mạnh FMCG?
- Creator nào có Median Lượt xem tốt?
- Creator nào giá thấp nhưng chi phí/lượt xem tốt?
- Creator nào có completion rate cao?
- Creator nào thường xuyên underperform?

### Sản phẩm Phân tích dữ liệu

- Sản phẩm category nào có lượt xem tốt?
- Sản phẩm price range nào dễ bán?
- Duyệt trực tiếp hay Placement hiệu quả hơn?

### Nội dung Phân tích dữ liệu

- Format nào hiệu quả?
- Hook nào hiệu quả?
- Video length nào tốt?
- lời kêu gọi hành động nào tốt?
- Hashtag nào tốt?
- Creator style nào phù hợp ngành nào?

---

# 11. Lộ trình đề xuất

## Giai đoạn 1 – Điều phối bởi Onstage bản tối thiểu

- Nhãn hàng tạo chiến dịch
- Quản trị viên báo giá thủ công
- Quản trị viên chọn Creator
- Creator accept/reject
- Giao hàng manual
- Tải lên nội dung
- Approve/revision
- Creator paste published URL
- Lượt xem update manual hoặc semi-auto
- Trung tâm theo dõi lượt xem
- Thanh toán manual approval
- Cuối kỳ report

## Giai đoạn 2 – Tự động hóa

- Báo giá rule engine
- Creator recommendation
- Kết nối tài khoản mạng xã hội
- Tự động đồng bộ lượt xem
- Giao hàng integration
- Tự động tính tiền Creator
- Dự báo chiến dịch

## Giai đoạn 3 – Phân tích dữ liệu

- Điểm Creator
- Dự kiến Lượt xem Model
- Rủi ro Prediction
- chi phí/lượt xem Optimization
- Tự động phân bổ Creator
- Nội dung Phân tích dữ liệu
- Sản phẩm Phân tích dữ liệu
- Chiến dịch Recommendation

---

# 12. Kết luận

Module Creator Nội dung Chiến dịch không nên được xây như một biến thể nhỏ của Job Posting.

Đây nên là một sản phẩm riêng với logic:

```text
Nhãn hàng mua Outcome
        ↓
Onstage báo giá
        ↓
Onstage quản trị Creator Supply
        ↓
Creator tạo Nội dung
        ↓
Onstage kiểm soát Logistics
        ↓
Onstage đo Hiệu quả
        ↓
Onstage chịu Chiến dịch-mức Guarantee
        ↓
Onstage trả Thanh toán
        ↓
Nhãn hàng nhận Report
```

Lợi thế lớn nhất của module không chỉ nằm ở doanh thu chiến dịch.

Quan trọng hơn là mỗi chiến dịch tạo ra dữ liệu:

```text
Sản phẩm
  ×
Creator
  ×
Nội dung
  ×
Hiệu quả
  ×
Chi phí
```

Đây là nền tảng để Onstage.vn phát triển thành hệ thống Creator Phân tích dữ liệu trong giai đoạn sau.
