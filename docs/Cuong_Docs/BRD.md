
TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BRD)
Dự án: Nền tảng Booking KOLs/Models & Multi-level Affiliate
Phiên bản tài liệu: 1.0
1. Mục tiêu Dự án (Project Objectives)
Xây dựng một nền tảng kết nối trực tiếp Khách hàng (Brands/Cá nhân) với lực lượng KOLs/Models để thực hiện các chiến dịch sự kiện (Khai trương, dự tiệc, review).
Hệ thống tích hợp lõi Affiliate Đa cấp (Multi-level Marketing - MLM cấu trúc minh bạch) nhằm kích thích KOLs tự giới thiệu và xây dựng mạng lưới tuyến dưới, tự động hóa việc tính toán hoa hồng thông qua Ví điện tử nội bộ.
2. Phân quyền Người dùng (User Roles)
Role (Vai trò)
Mô tả
Môi trường truy cập
Admin
Quản trị viên hệ thống. Quản lý user, cấu hình tỷ lệ hoa hồng động, duyệt lệnh rút tiền, kiểm soát tranh chấp.
Filament Admin Panel
Client (Hiện tại đang là “Brand” https://onstage.vn/brand)
Khách hàng/Nhãn hàng. Người tạo Job (Booking), nạp tiền vào nền tảng để thanh toán cho các chiến dịch.
Next.js Frontend
KOL / Model (Hiện tại đang là “Talent” https://onstage.vn/talent)
Người nhận Job. Có mã giới thiệu (Referral Code) để mời KOL khác. Nhận hoa hồng từ Job tự làm (F0) và hoa hồng thụ động từ tuyến dưới (F1, F2...).
Next.js Frontend

3. Luồng Nghiệp vụ Cốt lõi (Core Business Flows)
3.1. Luồng Booking Job (End-to-End)
Tạo Job: Client tạo yêu cầu (VD: Khai trương nhà hàng A, cần 2 Models, ngân sách 5.000.000 VNĐ/người, thời gian X).
Ký quỹ (Escrow): Tùy chọn - Client phải thanh toán trước/tạm giữ tiền (qua Cổng thanh toán hoặc nạp vào Ví Client) để Job được hiển thị.
Apply & Approve: Các KOL nhìn thấy Job trên Frontend -> Nhấn "Apply". Client xem profile KOLs và nhấn "Duyệt" người phù hợp.
Thực hiện Job: KOL đến sự kiện. Sau khi xong, KOL nhấn "Hoàn thành" kèm hình ảnh check-in.
Nghiệm thu: Client xác nhận "Nghiệm thu thành công". Chuyển sang luồng thanh toán và chia hoa hồng.
3.2. Luồng Chia Hoa hồng Đa cấp (Cascade Commission Flow)
Thuật toán này chạy ngầm (Queue Job) ngay khi Client "Nghiệm thu thành công".
Trả thù lao F0: Hệ thống tự động chuyển 5.000.000 VNĐ (trừ đi % phí nền tảng nếu có) vào Ví của KOL thực hiện Job.
Quét Upline (Tuyến trên): Hệ thống dùng Adjacency List để tìm người đã giới thiệu F0 (gọi là F1), người giới thiệu F1 (gọi là F2)...
Đối chiếu Cấu hình động: Hệ thống kiểm tra Setting hiện tại trên Filament (VD: F1 = 10%, F2 = 5%, F3 = 2%).
Phân bổ tiền: * Trích tiền từ ngân sách chiến dịch hoặc quỹ hệ thống cộng vào Ví của Upline tương ứng.
Ghi log giao dịch (Transactions): Rõ ràng lý do "Hoa hồng từ user [Tên F0] làm job [Tên Job]".
3.3. Luồng Rút tiền (Payout Request)
KOL kiểm tra số dư "Khả dụng" (Available Balance) trên Next.js Dashboard.
KOL tạo "Lệnh rút tiền" (Nhập số tiền + Chọn ngân hàng đã lưu). Trạng thái lệnh: Pending. Tiền trong ví tạm thời bị khóa (Locked).
Admin nhận thông báo Real-time (qua WebSockets/Reverb) trên Filament.
Admin thực hiện chuyển khoản ngoài đời thực (hoặc tích hợp API ngân hàng tự động).
Admin nhấn "Đã chuyển khoản" (Approved) -> Hệ thống trừ hẳn tiền khỏi ví KOL và cập nhật trạng thái Success.
4. Yêu cầu Chức năng (Functional Requirements)
4.1. Hệ thống Frontend (Next.js - Client & KOL)
Xác thực & Cá nhân hóa: Đăng nhập/Đăng ký qua SĐT (OTP) hoặc Google. Luồng KYC (Up Căn cước công dân/Hình ảnh thật) đối với KOL để được duyệt rút tiền.
Job Board: Giao diện lưới hiện thị các Job đang mở. Tích hợp bộ lọc (Filter) theo giá, địa điểm, thể loại sự kiện.
My Network (Affiliate Tree): Giao diện đồ họa (Tree view) cho KOL thấy mạng lưới tuyến dưới của mình và thống kê "Tổng hoa hồng đã mang lại từ từng nhánh".
Wallet & Billing: Quản lý số dư khả dụng, số dư đang chờ duyệt. Lịch sử biến động số dư chi tiết.
4.2. Hệ thống Quản trị (Filament Backend)
Module Cấu hình Affiliate (Settings): Cung cấp giao diện Repeater cho phép Admin linh hoạt thêm/bớt số tầng hoa hồng và % tương ứng mà không cần deploy lại code.
Module User & Network Manager: Hiển thị danh sách KOL. Có nút bấm để xem sơ đồ tuyến dưới của một KOL cụ thể (Tích hợp D3.js hoặc OrgChart widget).
Module Quản lý Job: Theo dõi tiến độ các sự kiện (Draft -> Published -> In Progress -> Completed -> Cancelled). Tích hợp State Machine.
Module Payout (Kế toán): Màn hình hiển thị danh sách yêu cầu rút tiền cần xử lý. Hiển thị cảnh báo rủi ro (VD: Nhắc nhở nếu ví có dấu hiệu nạp/rút bất thường).
Audit & Logs: Theo dõi toàn bộ lịch sử chỉnh sửa cấu hình hệ thống hoặc lịch sử chia tiền để phục vụ đối soát.
5. Quy tắc Kinh doanh & Ràng buộc (Business Rules)
Rule Cắt ngọn (Capping): Nếu sơ đồ tuyến trên của KOL thực hiện Job kéo dài đến 10 người, nhưng cấu hình hệ thống chỉ set thưởng cho 3 tầng (F1, F2, F3), thì những người từ F4 trở đi sẽ không nhận được hoa hồng từ giao dịch này.
Rule Vòng đời Giao dịch (Transaction Lifecycle): Tiền hoa hồng chuyển vào ví sẽ có trạng thái "Holding" (Tạm giữ) trong vòng X ngày (VD: 3 ngày) để đề phòng trường hợp Client khiếu nại (Dispute). Sau X ngày mới chuyển thành "Available" (Khả dụng để rút).
Rule Vòng lặp Vô tận (Anti-Loop): Một KOL không thể nhập mã giới thiệu của một người đang là tuyến dưới của chính mình (Ngăn chặn bằng vòng lặp kiểm tra trước khi insert parent_id trong Adjacency List).
Hạn mức Rút tiền: Tối thiểu 500.000 VNĐ / lần và tối đa 50.000.000 VNĐ / ngày để đảm bảo dòng tiền hệ thống. (Admin có thể thay đổi trên Filament Setting).
