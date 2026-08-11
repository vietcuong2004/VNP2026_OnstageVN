# Thiết kế UI Admin – Xử lý đơn đặt Talent OnstageVN

## 1. Mục tiêu tài liệu

Tài liệu này thiết kế lại module **Admin xử lý đơn công việc/booking** theo đúng luồng người dùng hiện tại của OnstageVN.

Điểm quan trọng nhất: khách hàng **đã chọn một Talent cụ thể trước khi tạo yêu cầu**. Admin không nhận một brief chung rồi tìm nhiều ứng viên để gửi khách lựa chọn.

Luồng phía khách hiện tại:

```text
Tìm kiếm / xem Talent
        ↓
Chọn Talent cụ thể
        ↓
Bấm “Đặt ngay”
        ↓
Chọn loại công việc
        ↓
Điền yêu cầu công việc
        ↓
Xác nhận thông tin liên hệ
        ↓
Đặt cọc 200.000đ
        ↓
Thanh toán / xác nhận đã chuyển khoản
        ↓
Yêu cầu được gửi
        ↓
Chờ Onstage xác nhận
```

Vì vậy nhiệm vụ chính của Admin là:

> **Nhận đơn đã có Talent được chọn → kiểm tra tiền cọc và yêu cầu → xác minh Talent có nhận được job hay không → xác nhận hoặc xử lý trường hợp không thể nhận → theo dõi công việc.**

---

# 2. Luồng nghiệp vụ đúng của hệ thống

## 2.1. Phía khách hàng

Ví dụ khách đang xem hồ sơ **An An là Mặt trời nhỏ**:

```text
Talent: An An là Mặt trời nhỏ
        ↓
[ĐẶT NGAY]
        ↓
Chọn loại công việc: MC
        ↓
Nhập:
- Tiêu đề công việc
- Mô tả
- Ngày làm việc
- Giờ bắt đầu
- Giờ kết thúc
- Các yêu cầu tương ứng loại công việc
        ↓
Xác nhận yêu cầu
- Talent đã chọn
- Thời gian
- Yêu cầu
- Họ tên
- Số điện thoại
- Email
        ↓
[XÁC NHẬN & ĐẶT CỌC]
        ↓
Đặt cọc: 200.000 VND
        ↓
Chuyển khoản / ví điện tử
        ↓
[ĐÃ CHUYỂN KHOẢN]
        ↓
Gửi yêu cầu thành công
        ↓
Chờ Onstage xác nhận
```

### Kết luận nghiệp vụ

Một đơn khi xuất hiện trong Backoffice đã gắn với:

- 01 khách hàng;
- 01 Talent cụ thể;
- 01 loại công việc;
- 01 bộ yêu cầu công việc;
- 01 thời gian thực hiện;
- thông tin liên hệ khách hàng;
- khoản đặt cọc;
- mã yêu cầu.

Admin **không cần chọn ứng viên cho đơn này**.

---

# 3. Vai trò của Admin trong booking

Sau khi khách đặt cọc, Admin cần xử lý 4 việc:

1. **Kiểm tra đơn** – thông tin yêu cầu có đầy đủ và tiền cọc có hợp lệ không.
2. **Xác nhận với Talent** – Talent có nhận được công việc theo thời gian/yêu cầu này không.
3. **Phản hồi cho khách** – xác nhận booking nếu Talent nhận, hoặc xử lý nếu Talent từ chối/không thể nhận.
4. **Theo dõi booking** – từ lúc xác nhận đến khi công việc hoàn tất.

Do đó Admin UI nên được thiết kế như một **Booking Operations Dashboard**, không phải ATS tuyển ứng viên.

---

# 4. Trạng thái đơn đề xuất

Luồng trạng thái nên phản ánh đúng việc khách đã chọn Talent từ đầu.

```text
1. CHỜ KIỂM TRA
   Khách đã gửi yêu cầu / báo đã đặt cọc
            ↓
2. CHỜ TALENT XÁC NHẬN
   Admin đã kiểm tra đơn và gửi yêu cầu cho Talent
            ↓
3A. ĐÃ XÁC NHẬN
    Talent nhận công việc
            ↓
4. SẮP DIỄN RA
   Booking đã chốt và chờ đến lịch làm việc
            ↓
5. HOÀN TẤT

Nhánh ngoại lệ:

2. CHỜ TALENT XÁC NHẬN
            ↓
3B. TALENT TỪ CHỐI / KHÔNG KHẢ DỤNG
            ↓
Admin liên hệ khách để xử lý
```

> Không dùng trạng thái **“Đề xuất ứng viên”** hoặc **“Ứng viên được chọn”** cho luồng này, vì Talent đã được khách chọn trước khi đặt cọc.

---

# 5. Cấu trúc Backoffice

Sidebar đề xuất:

```text
OnstageVN

Tổng quan
Đơn công việc
Talent
Lịch làm việc
Thanh toán
Cấu hình
```

Tên **“Đơn công việc”** phù hợp hơn “Ứng viên” hoặc một ATS vì đây là module quản lý các booking trực tiếp.

---

# 6. Trang Tổng quan

## 6.1. Mục tiêu

Giúp Admin biết ngay hôm nay có việc gì cần xử lý.

Không nên biến dashboard thành trang analytics nặng. Ưu tiên **operational metrics**.

## 6.2. KPI đầu trang

```text
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Chờ kiểm tra    │ │ Chờ Talent      │ │ Đã xác nhận     │ │ Lịch hôm nay    │
│      12         │ │      08         │ │      24         │ │      06         │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

Có thể thêm **Tiền cọc hôm nay** nếu Admin tài chính cần theo dõi.

## 6.3. Khối “Đơn cần xử lý”

Đây là khối quan trọng nhất.

Mỗi dòng hiển thị:

- mã yêu cầu;
- khách hàng;
- Talent được đặt;
- loại công việc;
- ngày/giờ;
- trạng thái;
- CTA `Xử lý`.

Ví dụ:

```text
#MC110826-001
Nguyễn Văn A → An An là Mặt trời nhỏ
MC · 12/08/2026 · 18:00–20:00
[Chờ kiểm tra]                                      [Xử lý]
```

---

# 7. Trang “Đơn công việc”

Đây là màn hình trung tâm của module.

## 7.1. Header

```text
Đơn công việc
Theo dõi và xử lý các yêu cầu đặt Talent từ khách hàng.
```

Bên phải có thể có:

```text
[Tìm kiếm đơn...]
```

Không cần nút **Tạo yêu cầu** trong luồng chính. Chỉ bổ sung nếu Onstage thực sự có nghiệp vụ Admin nhập booking thủ công từ hotline/Zalo.

---

# 8. Tabs trạng thái

Không nên dùng MC / PG / Lookbook làm tab chính vì Admin xử lý theo **trạng thái**, không phải theo loại Talent.

Đề xuất:

```text
[Tất cả]
[Chờ kiểm tra 12]
[Chờ Talent 8]
[Đã xác nhận]
[Sắp diễn ra]
[Hoàn tất]
[Có vấn đề]
```

Loại công việc nên chuyển thành filter:

```text
Loại công việc: [Tất cả ▾]
Talent:         [Tất cả ▾]
Ngày làm việc:  [Khoảng ngày ▾]
Thanh toán:     [Tất cả ▾]
```

---

# 9. Bảng danh sách đơn

Các cột đề xuất:

| Cột | Nội dung |
|---|---|
| Mã đơn | `#MC110826-001` |
| Khách hàng | Họ tên + SĐT |
| Talent | Avatar + tên Talent |
| Công việc | MC / Lookbook / PG... |
| Lịch làm việc | Ngày + giờ |
| Đặt cọc | 200.000đ + trạng thái |
| Trạng thái đơn | Badge |
| Thao tác | `Xử lý` / `Xem chi tiết` |

Ví dụ:

```text
MÃ ĐƠN         KHÁCH HÀNG      TALENT                CÔNG VIỆC     LỊCH              ĐẶT CỌC       TRẠNG THÁI

#MC110826-001  Nguyễn Văn A    [Ảnh] An An           MC            12/08 18:00       200.000đ      Chờ kiểm tra   [Xử lý]
#LB110826-002  Trần Minh B     [Ảnh] Linh Chi        Lookbook      14/08 09:00       200.000đ      Chờ Talent     [Xem]
#PG110826-003  Lê Hoàng C      [Ảnh] Mai Phương      PG            15/08 08:00       200.000đ      Đã xác nhận    [Xem]
```

### Quy tắc quan trọng

**Talent phải là một cột nổi bật**, vì đây là booking trực tiếp một Talent cụ thể.

---

# 10. Màn hình chi tiết đơn – cấu trúc tổng thể

Đây là màn hình Admin dùng nhiều nhất.

Desktop nên chia **2 cột**:

```text
┌─────────────────────────────────────────────────────┬─────────────────────────────┐
│ NỘI DUNG ĐƠN                                        │ XỬ LÝ ĐƠN                   │
│                                                     │                             │
│ Talent được đặt                                     │ Trạng thái                  │
│ Thông tin công việc                                 │                             │
│ Thông tin khách hàng                                │ Hành động cần làm           │
│ Thanh toán                                          │                             │
│                                                     │ Lịch sử xử lý               │
└─────────────────────────────────────────────────────┴─────────────────────────────┘
```

Tỷ lệ gợi ý:

- trái: 65–70%;
- phải: 30–35%.

---

# 11. Header chi tiết đơn

```text
← Quay lại Đơn công việc

#MC110826-001                              [CHỜ KIỂM TRA]
Đặt ngày 11/08/2026 · 10:05
```

Có thể thêm menu `•••` cho các thao tác phụ như hủy đơn hoặc xem log, nhưng không đặt quá nhiều CTA trên header.

---

# 12. Card “Talent được đặt”

Card này phải xuất hiện đầu tiên vì khách đã chủ động chọn Talent.

```text
TALENT ĐƯỢC ĐẶT

[Avatar lớn]  An An là Mặt trời nhỏ   ✓
              MC · KOL · Người mẫu
              Hai Bà Trưng, Hà Nội
              ★ 4.8 · 1.390 đánh giá
              88 lượt booking

              [Xem hồ sơ Talent]
```

Không hiển thị nút **Chọn ứng viên**.

Có thể hiển thị trạng thái lịch:

```text
● Chưa kiểm tra lịch
```

hoặc:

```text
● Không có booking trùng lịch
```

nếu hệ thống đã có dữ liệu lịch đáng tin cậy.

---

# 13. Card “Thông tin công việc”

Admin cần nhìn thấy đúng dữ liệu khách vừa nhập ở luồng booking.

Ví dụ với MC:

```text
THÔNG TIN CÔNG VIỆC

Tiêu đề       MC dẫn chương trình khai trương
Loại          MC
Ngày          12/08/2026
Thời gian     18:00 – 20:00
Thời lượng    2 giờ

Mô tả
Cần MC dẫn chương trình khai trương...
```

Các yêu cầu bổ sung của từng loại công việc render phía dưới theo schema tương ứng.

### MC

Hiển thị đúng các trường form MC đang có.

### PG / Model

Có thể gồm chiều cao, cân nặng, ngoại hình, trang phục, kinh nghiệm và ghi chú nếu đây là các trường form phía khách.

### Lookbook

Có thể gồm concept, địa điểm, số lượng look, thời lượng và yêu cầu khác nếu form phía khách có các trường này.

> Nguyên tắc: Admin chỉ render dữ liệu khách đã nhập; không tự tạo thêm requirement mà phía khách không hề được hỏi.

---

# 14. Card “Thông tin khách hàng”

```text
THÔNG TIN LIÊN HỆ

Nguyễn Văn A
0123 456 789
email@example.com
```

CTA phụ có thể gồm:

```text
[Gọi điện]   [Sao chép SĐT]
```

Nếu hệ thống có tích hợp kênh liên lạc thì có thể bổ sung sau.

---

# 15. Card “Thanh toán”

Vì khách phải đặt cọc trước khi gửi yêu cầu, Admin cần nhìn thấy trạng thái tiền cọc ngay trong đơn.

```text
THANH TOÁN

Tiền đặt cọc             200.000đ
Phương thức              Chuyển khoản ngân hàng
Nội dung                 ONSTAGE_DEPOC ab_123
Thời gian báo CK         11/08/2026 · 10:04

Trạng thái               [CHỜ KIỂM TRA]
```

Nếu hệ thống đã tự đối soát được:

```text
Trạng thái               [ĐÃ NHẬN CỌC]
```

Nếu vẫn dùng nút **“Đã chuyển khoản”** từ phía khách mà chưa có bank webhook, phải phân biệt rõ:

- `Khách báo đã chuyển khoản`;
- `Hệ thống/Admin đã xác nhận nhận tiền`.

Hai trạng thái này **không được coi là một**.

---

# 16. Panel “Xử lý đơn”

Panel bên phải thay thế hoàn toàn phần **Ứng viên phù hợp** của thiết kế cũ.

Nó phải trả lời cho Admin 3 câu hỏi:

1. Đơn đang ở trạng thái nào?
2. Admin cần làm gì tiếp theo?
3. Trước đó đã có những thao tác gì?

---

# 17. Trạng thái 1 – Chờ kiểm tra

```text
CHỜ KIỂM TRA

Khách đã gửi yêu cầu và báo đã đặt cọc.
Hãy kiểm tra thông tin trước khi gửi booking cho Talent.

Checklist
✓ Có Talent được chọn
✓ Có ngày / giờ làm việc
✓ Có thông tin liên hệ
○ Xác nhận tiền cọc

[ XÁC NHẬN ĐƠN & GỬI TALENT ]
```

CTA chỉ được active khi các điều kiện bắt buộc hợp lệ.

Sau khi bấm:

```text
Chờ kiểm tra → Chờ Talent xác nhận
```

---

# 18. Trạng thái 2 – Chờ Talent xác nhận

Sau khi Admin gửi booking cho Talent:

```text
CHỜ TALENT XÁC NHẬN

Yêu cầu đã được gửi tới:
An An là Mặt trời nhỏ

Gửi lúc: 11/08/2026 · 10:12

Đang chờ Talent phản hồi.

[Nhắc Talent]       [Talent không phản hồi]
```

Nếu Talent có portal/app thì Talent nên có hai hành động:

```text
[Nhận công việc]
[Từ chối]
```

Admin không nên phải tự “chọn Talent” ở bước này.

---

# 19. Talent đồng ý

Khi Talent đồng ý:

```text
✓ TALENT ĐÃ XÁC NHẬN

An An là Mặt trời nhỏ đã nhận công việc.
Xác nhận lúc 11/08/2026 · 10:35
```

Đơn chuyển sang:

```text
ĐÃ XÁC NHẬN
```

Hệ thống cần thông báo cho khách rằng booking đã được Talent xác nhận.

---

# 20. Talent từ chối / không khả dụng

Đây là nhánh rất quan trọng vì khách đã đặt cọc trước.

Không được tự động quay lại luồng “Admin chọn ứng viên”.

Panel hiển thị:

```text
⚠ TALENT KHÔNG THỂ NHẬN JOB

Lý do:
Trùng lịch vào 12/08/2026 · 18:00–20:00

Khách đã đặt cọc: 200.000đ

Hãy liên hệ khách để lựa chọn phương án xử lý.
```

CTA:

```text
[Liên hệ khách]
[Chuyển sang Talent khác]
[Xử lý hoàn cọc]
```

### “Chuyển sang Talent khác”

Đây là **luồng xử lý ngoại lệ**, không phải luồng chính.

Khi khách đồng ý đổi Talent, Admin mới mở modal/drawer tìm Talent thay thế.

Cần lưu rõ:

```text
Talent ban đầu: An An là Mặt trời nhỏ
Talent thay thế: ...
Lý do thay đổi: Talent trùng lịch
Khách đồng ý lúc: ...
```

Admin không được âm thầm thay Talent mà khách không biết.

---

# 21. Trạng thái “Đã xác nhận”

Khi Talent đã nhận booking:

```text
ĐÃ XÁC NHẬN

✓ Đã nhận cọc
✓ Talent đã xác nhận
✓ Khách đã được thông báo

Talent
An An là Mặt trời nhỏ

Lịch
12/08/2026 · 18:00–20:00
```

CTA chính không cần nhiều. Có thể có:

```text
[Xem lịch làm việc]
```

Booking tự chuyển sang **Sắp diễn ra** theo thời gian hoặc chỉ hiển thị nhóm “Sắp diễn ra” dựa trên ngày làm việc, không nhất thiết cần Admin bấm chuyển trạng thái thủ công.

---

# 22. Trạng thái “Sắp diễn ra”

Admin cần tập trung vào thông tin vận hành:

```text
SẮP DIỄN RA

MC dẫn chương trình khai trương
12/08/2026 · 18:00–20:00

Talent
An An là Mặt trời nhỏ

Khách hàng
Nguyễn Văn A · 0123 456 789
```

Có thể bổ sung nhắc lịch ở phase sau.

---

# 23. Hoàn tất

Sau khi công việc đã diễn ra:

```text
CÔNG VIỆC ĐÃ HOÀN TẤT

Talent        An An là Mặt trời nhỏ
Thời gian     12/08/2026 · 18:00–20:00
```

Nếu hệ thống cần Admin xác nhận thủ công:

```text
[ĐÁNH DẤU HOÀN TẤT]
```

Nếu trạng thái có thể xác nhận từ Talent/khách thì Admin chỉ cần theo dõi.

Các nghiệp vụ thanh toán phần còn lại chỉ nên xuất hiện ở đây nếu sản phẩm thực tế đã có bước này. Các ảnh luồng hiện tại chỉ thể hiện **đặt cọc 200.000đ để gửi yêu cầu**, chưa đủ cơ sở để coi thanh toán phần còn lại là bước bắt buộc trong booking.

---

# 24. Timeline xử lý trong chi tiết đơn

Bên dưới panel trạng thái nên có timeline nhỏ để Admin hiểu lịch sử đơn:

```text
LỊCH SỬ XỬ LÝ

10:04  Khách báo đã chuyển khoản 200.000đ
10:05  Yêu cầu #MC110826-001 được tạo
10:08  Admin xác nhận tiền cọc
10:12  Yêu cầu được gửi cho Talent
10:35  Talent xác nhận nhận công việc
```

Timeline này hữu ích hơn một stepper 5 màu cố định vì nó cho biết **điều gì thực sự đã xảy ra**.

---

# 25. Wireframe – Danh sách đơn

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ OnstageVN                                                                                              │
├───────────────┬───────────────────────────────────────────────────────────────────────────────────────┤
│ Tổng quan     │ ĐƠN CÔNG VIỆC                                                    [Tìm kiếm đơn...]    │
│               │ Theo dõi và xử lý các yêu cầu đặt Talent.                                             │
│ ● Đơn công việc│                                                                                       │
│ Talent        │ [Tất cả] [Chờ kiểm tra 12] [Chờ Talent 8] [Đã xác nhận] [Sắp diễn ra] [Hoàn tất]     │
│ Lịch làm việc │                                                                                       │
│ Thanh toán    │ [Loại công việc ▾] [Ngày ▾] [Thanh toán ▾]                                           │
│ Cấu hình      │                                                                                       │
│               │ MÃ ĐƠN       KHÁCH        TALENT             CÔNG VIỆC    LỊCH       CỌC     TRẠNG THÁI│
│               │ ───────────────────────────────────────────────────────────────────────────────────── │
│               │ #MC...       Nguyễn A     [Ảnh] An An        MC           12/08      200K    Chờ kiểm │
│               │                                                                                 [Xử lý]│
│               │ #LB...       Trần B       [Ảnh] Linh Chi     Lookbook     14/08      200K    Chờ Talent│
│               │                                                                                   [Xem]│
└───────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 26. Wireframe – Chi tiết đơn đang chờ kiểm tra

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Đơn công việc                                                                                     │
│ #MC110826-001                                                    [CHỜ KIỂM TRA]                     │
├──────────────────────────────────────────────────────────────┬─────────────────────────────────────┤
│ TALENT ĐƯỢC ĐẶT                                             │ XỬ LÝ ĐƠN                           │
│ ┌──────────────────────────────────────────────────────────┐ │                                     │
│ │ [Avatar]  An An là Mặt trời nhỏ ✓                      │ │ CHỜ KIỂM TRA                        │
│ │           MC · KOL · Người mẫu                          │ │                                     │
│ │           ★4.8 · 88 booking                             │ │ Khách đã gửi yêu cầu và đặt cọc.   │
│ │                                      [Xem hồ sơ]        │ │                                     │
│ └──────────────────────────────────────────────────────────┘ │ ✓ Talent                             │
│                                                              │ ✓ Thời gian                           │
│ THÔNG TIN CÔNG VIỆC                                         │ ✓ Thông tin liên hệ                   │
│ ┌──────────────────────────────────────────────────────────┐ │ ○ Xác nhận tiền cọc                  │
│ │ Tiêu đề       MC dẫn chương trình khai trương          │ │                                     │
│ │ Loại          MC                                        │ │ [XÁC NHẬN ĐƠN & GỬI TALENT]         │
│ │ Ngày          12/08/2026                                │ │                                     │
│ │ Thời gian     18:00 – 20:00                            │ │ ──────────────────────────────────  │
│ │ Mô tả         ...                                       │ │ LỊCH SỬ XỬ LÝ                       │
│ └──────────────────────────────────────────────────────────┘ │ 10:04 Khách báo đã chuyển khoản      │
│                                                              │ 10:05 Yêu cầu được tạo                │
│ THÔNG TIN KHÁCH HÀNG                                        │                                     │
│ Nguyễn Văn A · 0123 456 789 · email@example.com             │                                     │
│                                                              │                                     │
│ THANH TOÁN                                                   │                                     │
│ Đặt cọc 200.000đ · Chuyển khoản · [CHỜ KIỂM TRA]            │                                     │
└──────────────────────────────────────────────────────────────┴─────────────────────────────────────┘
```

---

# 27. Wireframe – Chờ Talent xác nhận

```text
┌───────────────────────────────────────────────────────────────┬────────────────────────────────────┐
│ TALENT ĐƯỢC ĐẶT                                              │ CHỜ TALENT XÁC NHẬN                │
│ [Avatar] An An là Mặt trời nhỏ                               │                                    │
│                                                               │ Yêu cầu đã gửi lúc 10:12           │
│ THÔNG TIN CÔNG VIỆC                                          │                                    │
│ MC · 12/08/2026 · 18:00–20:00                               │ Đang chờ Talent phản hồi...        │
│                                                               │                                    │
│ THÔNG TIN KHÁCH HÀNG                                         │ [Nhắc Talent]                       │
│ Nguyễn Văn A · 0123 456 789                                  │                                    │
│                                                               │ LỊCH SỬ XỬ LÝ                      │
│ THANH TOÁN                                                    │ ✓ Đã xác nhận tiền cọc             │
│ Đặt cọc 200.000đ · Đã nhận                                   │ ✓ Đã gửi yêu cầu cho Talent        │
└───────────────────────────────────────────────────────────────┴────────────────────────────────────┘
```

---

# 28. Những phần cần bỏ khỏi thiết kế Admin cũ

Theo luồng mới được xác nhận, cần **bỏ khỏi luồng chính**:

- `Ứng viên phù hợp` trong mỗi booking;
- nút `Chọn ứng viên` của Admin;
- `Đã chọn 3 ứng viên`;
- CTA `Gửi danh sách ứng viên`;
- trạng thái `Đề xuất ứng viên`;
- trạng thái `Chờ khách chọn`;
- màn hình khách chọn lại một Talent sau khi đã đặt cọc;
- logic Admin tự shortlist nhiều Talent cho booking bình thường.

Các thành phần tìm Talent chỉ xuất hiện trong **nhánh ngoại lệ** khi Talent ban đầu không thể nhận và khách đồng ý đổi người.

---

# 29. Phạm vi MVP Admin nên triển khai

MVP nên có:

- Dashboard đơn cần xử lý.
- Danh sách đơn theo trạng thái.
- Search theo mã đơn, khách hàng hoặc Talent.
- Filter loại công việc/ngày/thanh toán.
- Xem Talent mà khách đã đặt.
- Xem toàn bộ yêu cầu công việc.
- Xem thông tin liên hệ khách.
- Xem và xác nhận trạng thái tiền cọc.
- Gửi yêu cầu cho Talent.
- Nhận trạng thái Talent đồng ý/từ chối.
- Theo dõi booking đã xác nhận và lịch làm việc.
- Hoàn tất booking.
- Timeline lịch sử xử lý cơ bản.
- Nhánh xử lý Talent từ chối.

Chưa cần cho MVP:

- ATS/Kanban ứng viên;
- AI matching cho luồng booking trực tiếp;
- shortlist nhiều ứng viên ở luồng chính;
- compare Talent;
- Admin tự chọn Talent thay khách;
- SLA dashboard phức tạp;
- commission/escrow nếu nghiệp vụ chưa triển khai;
- các bước thanh toán còn lại nếu product flow chưa định nghĩa.

---

# 30. Luồng Admin cuối cùng

```text
KHÁCH HÀNG
Tìm Talent
   ↓
Chọn Talent
   ↓
Đặt ngay
   ↓
Chọn loại công việc
   ↓
Điền yêu cầu
   ↓
Xác nhận thông tin
   ↓
Đặt cọc
   ↓
Gửi yêu cầu

══════════════════════════════════════

ADMIN
Nhận đơn
   ↓
Kiểm tra yêu cầu + tiền cọc
   ↓
Gửi yêu cầu tới Talent đã được khách chọn
   ↓
┌───────────────────┴───────────────────┐
↓                                       ↓
Talent đồng ý                       Talent từ chối
↓                                       ↓
Xác nhận booking                    Liên hệ khách
↓                                       ↓
Đưa vào lịch                        Đổi Talent / hoàn cọc / xử lý khác
↓
Theo dõi công việc
↓
Hoàn tất
```

## Nguyên tắc thiết kế cốt lõi

> **Booking được tạo từ một Talent cụ thể. Admin là người xác minh và điều phối booking đó, không phải người tuyển/chọn Talent thay cho khách.**

Đây nên là nguyên tắc dùng để quyết định toàn bộ UI, trạng thái và CTA của module Admin.
