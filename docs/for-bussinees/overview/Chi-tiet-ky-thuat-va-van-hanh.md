# TÀI LIỆU CHI TIẾT KỸ THUẬT VÀ VẬN HÀNH HỆ THỐNG
**Nền tảng Quản trị & Kết nối Tài năng Giải trí 4.0**

---

## PHẦN I: KIẾN TRÚC HỆ THỐNG TỔNG QUAN (SYSTEM ARCHITECTURE)

### 1. Kiến trúc Microservices phân tầng

Hệ thống được thiết kế theo mô hình **Microservices Architecture** với 7 service chính:

#### **Service 1: User Management Service (Quản lý Người dùng)**
- **Chức năng:**
  - Xác thực và phân quyền (Authentication & Authorization)
  - Quản lý 4 loại tài khoản: Talent (Người đẹp/Model), Brand (Doanh nghiệp), Agency (Công ty môi giới), Admin (Quản trị viên)
  - Hệ thống phân cấp quyền truy cập (Role-Based Access Control - RBAC)
  
- **Database Schema chính:**
  ```
  users: id, email, phone, password_hash, user_type, status, created_at
  user_profiles: user_id, full_name, dob, gender, province, verification_status
  user_roles: user_id, role_id, scope
  user_sessions: session_id, user_id, token, expires_at, device_info
  ```

- **API Endpoints quan trọng:**
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/verify-otp
  - GET /api/users/{id}/profile
  - PUT /api/users/{id}/profile


#### **Service 2: Talent Profile Service (Hồ sơ Tài năng)**
- **Chức năng:**
  - Lưu trữ và quản lý hồ sơ chi tiết của Talent
  - Tự động tính toán điểm số 10 tiêu chí (Scoring Engine)
  - Phân hạng tự động theo Tier S/A/B/C
  - Quản lý Portfolio (ảnh, video, chứng chỉ)
  
- **Database Schema chính:**
  ```
  talent_profiles: talent_id, height, weight, bust, waist, hips, skin_tone, hair_style
  talent_achievements: id, talent_id, title, level, year, certificate_url
  talent_scores: talent_id, criterion_1 to criterion_10, total_score, tier, updated_at
  talent_portfolios: id, talent_id, media_type, url, title, is_featured
  talent_availability: talent_id, date, status (available/booked/blocked)
  ```

- **Thuật toán Scoring Engine:**
  - Chạy tự động mỗi khi có cập nhật hồ sơ
  - Tích hợp API bên thứ 3 để lấy Social Metrics (TikTok, Instagram, Facebook)
  - Tính toán điểm uy tín dựa trên lịch sử giao dịch
  - Output: JSON object với 10 điểm + tổng điểm + tier


#### **Service 3: Campaign & Booking Service (Chiến dịch & Đặt lịch)**
- **Chức năng:**
  - Brand tạo chiến dịch với yêu cầu cụ thể
  - Hệ thống AI Match-making tự động gợi ý Talent phù hợp
  - Quản lý quy trình booking từ A-Z
  - Theo dõi trạng thái công việc (Job Status Tracking)
  
- **Database Schema chính:**
  ```
  campaigns: id, brand_id, title, description, budget, start_date, end_date, status
  campaign_requirements: campaign_id, tier, min_height, max_age, skills_required, location
  bookings: id, campaign_id, talent_id, job_type, rate, booking_date, status
  booking_timeline: booking_id, status, changed_at, changed_by, notes
  job_types: id, name, category (event/catwalk/photoshoot/livestream/ambassador)
  ```

- **AI Match-making Algorithm:**
  - Input: Campaign requirements (JSON)
  - Process: 
    1. Filter theo điều kiện cứng (chiều cao, tuổi, tier, location)
    2. Scoring theo độ phù hợp (skills match, availability, price range)
    3. Ranking theo điểm uy tín và social metrics
  - Output: Top 20 Talent phù hợp nhất với confidence score


#### **Service 4: Payment & Escrow Service (Thanh toán & Ký quỹ)**
- **Chức năng:**
  - Quản lý ví điện tử cho cả Brand và Talent
  - Hệ thống Escrow tự động khóa tiền khi booking thành công
  - Giải ngân tự động sau khi hoàn thành công việc
  - Xử lý tranh chấp và hoàn tiền
  
- **Database Schema chính:**
  ```
  wallets: user_id, balance, currency, status
  transactions: id, from_user, to_user, amount, type, status, created_at
  escrow_accounts: booking_id, amount, locked_at, release_condition, status
  payment_methods: user_id, type (bank/card/momo/zalopay), details, is_default
  invoices: id, booking_id, brand_id, total_amount, tax, invoice_number, issued_at
  ```

- **Luồng xử lý Escrow:**
  1. Brand booking → Tiền tự động chuyển từ wallet vào escrow_account
  2. Talent hoàn thành job → Upload bằng chứng (ảnh/video check-in)
  3. Brand xác nhận nghiệm thu (hoặc auto-approve sau 24h)
  4. Hệ thống tự động giải ngân: 
     - 85% cho Talent
     - 15% phí platform (có thể điều chỉnh theo tier)
  5. Cập nhật điểm uy tín cho cả hai bên


#### **Service 5: Social Media Integration Service (Tích hợp Mạng xã hội)**
- **Chức năng:**
  - Kết nối API TikTok, Instagram, Facebook, YouTube
  - Tự động cập nhật metrics (followers, engagement rate, reach)
  - Phân tích sentiment và brand safety
  - Lên lịch đăng bài tự động (Content Scheduler)
  
- **Database Schema chính:**
  ```
  social_accounts: talent_id, platform, username, account_id, access_token, status
  social_metrics: account_id, date, followers, posts, likes, comments, shares, engagement_rate
  social_posts: id, account_id, post_id, content, posted_at, likes, comments, reach
  content_calendar: talent_id, scheduled_date, platform, content_type, status
  brand_safety_scores: talent_id, score, last_scan_date, issues_found
  ```

- **API Integration Details:**
  - **TikTok API:** Sử dụng TikTok for Developers API v2
    - Endpoints: /user/info, /video/list, /user/stats
    - Rate limit: 100 requests/minute
    - Refresh metrics: Mỗi 6 giờ
  
  - **Instagram Graph API:** 
    - Endpoints: /me, /media, /insights
    - Yêu cầu: Business/Creator account
    - Refresh metrics: Mỗi 12 giờ
  
  - **Facebook Graph API:**
    - Endpoints: /me, /posts, /page_insights
    - Refresh metrics: Mỗi 24 giờ


#### **Service 6: Pageant Management Service (Quản lý Cuộc thi)**
- **Chức năng:**
  - CMS cho Ban tổ chức cuộc thi (BTC)
  - Quản lý hồ sơ thí sinh số hóa
  - Hệ thống bình chọn trực tuyến (Voting Engine)
  - Crown Funding (Gọi vốn cộng đồng cho dự án nhân ái)
  
- **Database Schema chính:**
  ```
  pageants: id, name, organizer_id, start_date, end_date, level, status
  pageant_contestants: pageant_id, talent_id, contestant_number, status
  pageant_rounds: pageant_id, round_name, round_date, criteria
  contestant_scores: contestant_id, round_id, judge_id, score, notes
  voting_campaigns: pageant_id, start_date, end_date, vote_price, status
  votes: campaign_id, contestant_id, voter_id, votes_count, amount_paid, voted_at
  crown_funding_projects: contestant_id, title, goal_amount, current_amount, description
  donations: project_id, donor_id, amount, message, donated_at
  ```

- **Voting Engine Logic:**
  - Mỗi vote = 10,000 VND (có thể cấu hình)
  - User có thể mua gói vote (10 votes, 50 votes, 100 votes) với giá ưu đãi
  - Real-time leaderboard cập nhật mỗi 30 giây
  - Chống gian lận: IP tracking, device fingerprint, rate limiting
  - Revenue sharing: 70% cho thí sinh, 20% cho BTC, 10% cho platform


#### **Service 7: B2B Marketplace Service (Chợ dịch vụ B2B)**
- **Chức năng:**
  - Kết nối Talent với các nhà cung cấp dịch vụ (Makeup, Stylist, Designer, Training Center)
  - Quản lý danh mục dịch vụ và nhà cung cấp
  - Hệ thống đánh giá và review
  - Booking và thanh toán dịch vụ
  
- **Database Schema chính:**
  ```
  service_providers: id, name, type, description, rating, verified_status
  services: id, provider_id, name, category, price_from, price_to, duration
  service_bookings: id, talent_id, service_id, booking_date, status, total_price
  service_reviews: booking_id, rating, comment, photos, created_at
  service_packages: id, provider_id, name, services_included, package_price, validity_days
  ```

- **Các loại dịch vụ chính:**
  1. **Makeup & Hair:** Makeup artist, Hair stylist cho sự kiện/cuộc thi
  2. **Fashion:** Nhà thiết kế áo dài, dạ hội, cho thuê trang phục
  3. **Training:** Catwalk, ứng xử, ngoại ngữ, fitness
  4. **Photography:** Chụp ảnh profile, portfolio, lookbook
  5. **Consulting:** Tư vấn hình ảnh, dinh dưỡng, skincare

---

## PHẦN II: LUỒNG VẬN HÀNH CHI TIẾT (DETAILED WORKFLOWS)

### 1. Luồng đăng ký và xây dựng hồ sơ Talent

**Bước 1: Đăng ký tài khoản**
- User truy cập app → Chọn "Đăng ký với vai trò Talent"
- Nhập thông tin cơ bản: Email/SĐT, Mật khẩu, Họ tên, Ngày sinh
- Xác thực OTP qua SMS/Email
- Hệ thống tạo tài khoản với status = "pending_profile"


**Bước 2: Hoàn thiện hồ sơ cơ bản (Onboarding)**
- Nhập thông tin nhân trắc học: Chiều cao, cân nặng, số đo 3 vòng
- Upload ảnh chân dung (Portrait) và ảnh toàn thân (Full body)
- Chọn tỉnh/thành phố, trình độ học vấn, ngoại ngữ
- Khai báo tình trạng hôn nhân, phẫu thuật thẩm mỹ
- Hệ thống tự động tính điểm sơ bộ và gán Tier tạm thời

**Bước 3: Khảo sát định hướng (30 câu hỏi)**
- Talent hoàn thành bảng khảo sát 30 câu hỏi
- Hệ thống AI phân tích và đưa ra gợi ý:
  - Loại cuộc thi phù hợp (Hoa hậu/Người mẫu/KOL)
  - Điểm mạnh và điểm cần cải thiện
  - Roadmap phát triển 6-12 tháng
- Kết quả hiển thị dạng Radar Chart với 3 nhóm xu hướng

**Bước 4: Xây dựng Portfolio**
- Upload ảnh/video chuyên nghiệp:
  - Polaroid (ảnh không makeup)
  - Ảnh thời trang/lookbook
  - Video catwalk (nếu có)
  - Video giới thiệu bản thân (30-60s)
- Thêm thành tích, chứng chỉ, kinh nghiệm
- Kết nối tài khoản mạng xã hội (TikTok, Instagram, Facebook)

**Bước 5: Xác minh danh tính (Verification)**
- Upload CCCD/CMND (2 mặt)
- Selfie với CCCD để xác thực khuôn mặt (Face matching)
- Hệ thống AI kiểm tra tính hợp lệ của giấy tờ
- Admin review và phê duyệt (trong vòng 24h)
- Sau khi verify → Hồ sơ được hiển thị công khai, status = "active"


### 2. Luồng Brand tạo chiến dịch và booking Talent

**Bước 1: Brand đăng ký và xác thực doanh nghiệp**
- Đăng ký tài khoản với vai trò "Brand"
- Upload giấy phép kinh doanh, mã số thuế
- Xác thực email doanh nghiệp và số điện thoại
- Admin xác minh thông tin doanh nghiệp (1-2 ngày làm việc)
- Nạp tiền vào ví để sẵn sàng booking

**Bước 2: Tạo chiến dịch (Campaign)**
- Brand đăng nhập → Vào "Tạo chiến dịch mới"
- Điền thông tin chiến dịch:
  - Tên chiến dịch, mô tả chi tiết
  - Loại công việc: Event, Catwalk, Photoshoot, Livestream, Ambassador
  - Ngân sách dự kiến
  - Thời gian: Ngày bắt đầu, ngày kết thúc
  - Địa điểm làm việc
  
**Bước 3: Thiết lập yêu cầu tuyển chọn (Requirements)**
- Chọn Tier mong muốn: S, A, B, C (có thể chọn nhiều)
- Thiết lập bộ lọc chi tiết:
  - Chiều cao: Từ X cm đến Y cm
  - Độ tuổi: Từ X đến Y tuổi
  - Giới tính: Nam/Nữ/Khác
  - Khu vực: Hà Nội, TP.HCM, Đà Nẵng, hoặc toàn quốc
  - Kỹ năng đặc biệt: Catwalk, Livestream, MC, Ngoại ngữ
  - Followers tối thiểu: Ví dụ ≥ 10K followers
  - Engagement rate tối thiểu: Ví dụ ≥ 3%

**Bước 4: AI Match-making tự động**
- Hệ thống quét database và trả về danh sách Talent phù hợp
- Hiển thị dạng card với thông tin:
  - Ảnh đại diện, tên, tuổi, chiều cao
  - Tier và tổng điểm
  - Radar chart 10 tiêu chí
  - Social metrics (followers, engagement)
  - Giá tham khảo (rate card)
  - Lịch trống (availability calendar)
- Brand có thể:
  - Xem chi tiết hồ sơ
  - Lưu vào danh sách yêu thích
  - Gửi lời mời booking


**Bước 5: Gửi lời mời và đàm phán**
- Brand chọn Talent → Bấm "Gửi lời mời booking"
- Điền thông tin cụ thể:
  - Ngày giờ làm việc chính xác
  - Địa điểm cụ thể (địa chỉ + Google Maps)
  - Yêu cầu trang phục, makeup
  - Mức cát-xê đề xuất
  - Điều khoản đặc biệt (nếu có)
- Talent nhận thông báo push notification
- Talent có 3 lựa chọn:
  - **Chấp nhận:** Booking thành công, chuyển sang bước 6
  - **Đàm phán:** Đề xuất Phí booking khác hoặc điều chỉnh điều khoản
  - **Từ chối:** Ghi rõ lý do (bận lịch, không phù hợp, giá thấp...)

**Bước 6: Ký hợp đồng điện tử và Escrow**
- Khi cả hai bên đồng ý → Hệ thống tự động tạo hợp đồng điện tử
- Nội dung hợp đồng bao gồm:
  - Thông tin hai bên
  - Mô tả công việc chi tiết
  - Thời gian, địa điểm
  - Mức cát-xê và phương thức thanh toán
  - Điều khoản hủy show và xử lý tranh chấp
  - Chữ ký điện tử của cả hai bên
- Brand xác nhận → Tiền tự động khóa vào Escrow Account
- Talent nhận thông báo "Booking đã được xác nhận và thanh toán"

**Bước 7: Thực hiện công việc và Check-in**
- Đến ngày làm việc, Talent đến địa điểm
- Check-in bằng một trong các cách:
  - Quét QR code do Brand cung cấp
  - GPS check-in (nếu Brand bật tính năng này)
  - Brand xác nhận thủ công trên app
- Hệ thống ghi nhận thời gian check-in
- Talent thực hiện công việc theo hợp đồng

**Bước 8: Nghiệm thu và giải ngân**
- Sau khi hoàn thành, Talent upload bằng chứng:
  - Ảnh/video tại sự kiện
  - Ảnh check-out (nếu cần)
- Brand có 24h để nghiệm thu:
  - **Chấp nhận:** Hệ thống tự động giải ngân cho Talent
  - **Khiếu nại:** Mở ticket tranh chấp, Admin can thiệp
- Nếu Brand không phản hồi sau 24h → Tự động nghiệm thu và giải ngân
- Sau khi giải ngân, cả hai bên đánh giá nhau (rating 1-5 sao + comment)


### 3. Luồng tham gia cuộc thi và Crown Funding

**Bước 1: BTC tạo cuộc thi trên hệ thống**
- Ban tổ chức đăng ký tài khoản "Organizer"
- Tạo cuộc thi mới với thông tin:
  - Tên cuộc thi, cấp độ (Quốc gia/Tỉnh/Ngành)
  - Thời gian đăng ký, các vòng thi
  - Điều kiện tham gia (tuổi, chiều cao, học vấn...)
  - Giải thưởng
  - Cơ cấu điểm số các vòng thi
- Thiết lập cổng bình chọn (nếu có)
- Công bố cuộc thi trên app

**Bước 2: Talent đăng ký tham gia**
- Talent xem danh sách cuộc thi đang mở
- Hệ thống gợi ý cuộc thi phù hợp dựa trên:
  - Kết quả khảo sát 30 câu hỏi
  - Điều kiện nhân trắc học
  - Tier hiện tại
- Talent chọn cuộc thi → Bấm "Đăng ký tham gia"
- Điền form đăng ký online (thay vì giấy tờ):
  - Thông tin cá nhân (tự động điền từ profile)
  - Upload ảnh theo yêu cầu BTC
  - Video giới thiệu
  - Dự án nhân ái (nếu có)
- Thanh toán lệ phí đăng ký (nếu có) qua ví điện tử
- BTC nhận hồ sơ và duyệt

**Bước 3: Quản lý hồ sơ và chấm điểm số hóa**
- BTC truy cập dashboard quản lý cuộc thi
- Xem danh sách thí sinh đã đăng ký dạng bảng:
  - Ảnh, tên, số báo danh, chiều cao, số đo
  - Trạng thái hồ sơ: Chờ duyệt/Đã duyệt/Từ chối
- Duyệt hồ sơ hàng loạt hoặc từng cá nhân
- Trong các vòng thi:
  - Ban giám khảo đăng nhập app với tài khoản Judge
  - Chấm điểm trực tiếp trên tablet/điện thoại
  - Điểm tự động tổng hợp và hiển thị real-time
  - Xuất bảng điểm tổng kết tự động


**Bước 4: Bình chọn trực tuyến (Voting)**
- BTC mở cổng bình chọn với cấu hình:
  - Thời gian bắt đầu/kết thúc
  - Giá mỗi vote (ví dụ: 10,000 VND/vote)
  - Gói vote ưu đãi (10 votes = 90K, 50 votes = 400K...)
  - Tỷ lệ chia revenue (70% thí sinh, 20% BTC, 10% platform)
- Người hâm mộ:
  - Xem danh sách thí sinh với ảnh và video giới thiệu
  - Chọn thí sinh yêu thích → Mua vote
  - Thanh toán qua ví điện tử/thẻ/banking
  - Vote được cộng ngay vào bảng xếp hạng
- Leaderboard cập nhật real-time mỗi 30 giây
- Chống gian lận:
  - Giới hạn số vote tối đa từ 1 IP/device trong 1 giờ
  - Phát hiện bot bằng CAPTCHA
  - Xác thực số điện thoại cho giao dịch lớn

**Bước 5: Crown Funding cho dự án nhân ái**
- Thí sinh tạo dự án Crown Funding:
  - Tiêu đề dự án (ví dụ: "Xây thư viện cho trẻ em vùng cao")
  - Mô tả chi tiết, hình ảnh, video
  - Mục tiêu gọi vốn (ví dụ: 100 triệu VND)
  - Kế hoạch thực hiện
  - Timeline
- Dự án được hiển thị trên app
- Người dùng và doanh nghiệp có thể:
  - Quyên góp bất kỳ số tiền nào
  - Để lại lời nhắn động viên
  - Nhận certificate điện tử (nếu góp trên 1 triệu)
- Tiến độ gọi vốn hiển thị dạng progress bar
- Khi đạt mục tiêu:
  - Tiền được giải ngân cho thí sinh
  - Thí sinh phải báo cáo minh bạch việc sử dụng tiền
  - Upload ảnh/video thực hiện dự án
  - Sao kê chi tiết công khai

**Bước 6: Sau cuộc thi - Cập nhật thành tích**
- Khi có kết quả cuộc thi, BTC công bố trên app
- Hệ thống tự động:
  - Cập nhật danh hiệu vào hồ sơ Talent (Hoa hậu, Á hậu, Top X...)
  - Tính lại điểm tiêu chí M1.1 (Danh hiệu & Thành tích)
  - Cập nhật Tier nếu tổng điểm thay đổi
  - Gửi thông báo chúc mừng
- Talent có badge đặc biệt trên profile (ví dụ: 👑 Hoa hậu XYZ 2026)


---

## PHẦN III: TÍNH NĂNG ĐẶC BIỆT VÀ CÔNG NGHỆ ÁP DỤNG

### 1. Hệ thống AI và Machine Learning

#### **1.1. AI Scoring Engine (Chấm điểm tự động)**
- **Công nghệ:** Python + TensorFlow/PyTorch
- **Input:** 
  - Dữ liệu nhân trắc học (chiều cao, cân nặng, số đo)
  - Ảnh chân dung và toàn thân
  - Social metrics từ API
  - Lịch sử giao dịch và đánh giá
- **Process:**
  - Computer Vision: Phân tích tỷ lệ khuôn mặt, cấu trúc xương
  - NLP: Phân tích nội dung bài đăng, sentiment analysis
  - Rule-based scoring: Tính điểm theo 10 tiêu chí
  - Weighted average: Tổng hợp điểm với trọng số khác nhau
- **Output:** JSON với 10 điểm + tier + confidence score

#### **1.2. Face Matching & Verification**
- **Công nghệ:** Face Recognition API (AWS Rekognition hoặc Azure Face API)
- **Chức năng:**
  - So khớp ảnh selfie với ảnh CCCD
  - Phát hiện ảnh giả, deepfake
  - Xác thực danh tính khi check-in sự kiện
- **Độ chính xác:** ≥ 98%

#### **1.3. Content Recommendation Engine**
- **Công nghệ:** Collaborative Filtering + Content-based Filtering
- **Chức năng:**
  - Gợi ý cuộc thi phù hợp cho Talent
  - Gợi ý Talent phù hợp cho Brand
  - Gợi ý dịch vụ B2B phù hợp
  - Gợi ý nội dung đăng bài cho Talent
- **Cập nhật:** Model được retrain mỗi tuần dựa trên dữ liệu mới


### 2. Hệ thống Bảo mật và Chống gian lận

#### **2.1. Bảo mật dữ liệu người dùng**
- **Mã hóa:** 
  - Dữ liệu nhạy cảm (CCCD, số tài khoản) mã hóa AES-256
  - Mật khẩu hash bằng bcrypt với salt
  - HTTPS/TLS 1.3 cho mọi kết nối
- **Phân quyền:**
  - Role-Based Access Control (RBAC)
  - Principle of Least Privilege
  - Audit log cho mọi thao tác nhạy cảm
- **Tuân thủ:** GDPR, PDPA (Personal Data Protection Act)

#### **2.2. Chống gian lận thanh toán**
- **3D Secure:** Xác thực 2 lớp cho thanh toán thẻ
- **Risk Scoring:** 
  - Phân tích hành vi giao dịch bất thường
  - Phát hiện tài khoản giả, tài khoản rác
  - Cảnh báo giao dịch nghi ngờ
- **Escrow System:** Bảo vệ cả Brand và Talent
- **Dispute Resolution:** Quy trình xử lý tranh chấp minh bạch

#### **2.3. Chống spam và bot**
- **Rate Limiting:** Giới hạn số request/IP/phút
- **CAPTCHA:** Google reCAPTCHA v3 cho các thao tác nhạy cảm
- **Device Fingerprinting:** Nhận diện thiết bị duy nhất
- **Behavior Analysis:** Phát hiện hành vi bot (click pattern, timing)

### 3. Hệ thống Thông báo đa kênh

#### **3.1. Push Notification**
- **Công nghệ:** Firebase Cloud Messaging (FCM)
- **Các loại thông báo:**
  - Booking mới từ Brand
  - Thay đổi trạng thái booking
  - Nhắc nhở sự kiện sắp diễn ra (1 ngày trước, 2 giờ trước)
  - Cập nhật điểm số, tier
  - Cuộc thi mới phù hợp
  - Tin nhắn từ Brand/Talent
- **Cá nhân hóa:** User có thể tùy chỉnh loại thông báo nhận

#### **3.2. Email Notification**
- **Công nghệ:** SendGrid hoặc AWS SES
- **Template:** HTML responsive, branded
- **Các loại email:**
  - Welcome email sau đăng ký
  - Xác thực email/OTP
  - Hợp đồng điện tử
  - Hóa đơn thanh toán
  - Báo cáo tháng (monthly report)
  - Newsletter về xu hướng ngành

#### **3.3. SMS Notification**
- **Công nghệ:** Twilio hoặc nhà cung cấp SMS Việt Nam
- **Các trường hợp gửi SMS:**
  - OTP xác thực
  - Booking được xác nhận
  - Nhắc nhở sự kiện quan trọng
  - Cảnh báo bảo mật (đăng nhập từ thiết bị lạ)


### 4. Analytics và Business Intelligence

#### **4.1. Dashboard cho Admin**
- **Metrics theo dõi:**
  - Tổng số user (Talent/Brand/Agency) và tăng trưởng
  - Số booking thành công/thất bại/đang xử lý
  - Doanh thu theo ngày/tuần/tháng
  - GMV (Gross Merchandise Value)
  - Take rate (% phí platform)
  - Conversion rate (từ view profile → booking)
  - Churn rate
- **Visualization:** Charts, graphs, heatmaps
- **Export:** PDF, Excel, CSV

#### **4.2. Dashboard cho Brand**
- **Campaign Performance:**
  - Số lượt xem campaign
  - Số Talent apply/được mời
  - Booking success rate
  - ROI của chiến dịch
- **Talent Analytics:**
  - So sánh performance của các Talent đã book
  - Engagement rate trước và sau campaign
  - Brand lift measurement
- **Budget Tracking:** Theo dõi chi tiêu theo thời gian

#### **4.3. Dashboard cho Talent**
- **Career Analytics:**
  - Tổng số booking và doanh thu
  - Xu hướng tăng trưởng followers
  - Engagement rate theo thời gian
  - Top performing posts
  - Tier progression (lịch sử thay đổi tier)
- **Competitive Insights:**
  - So sánh với Talent cùng tier (anonymous)
  - Average rate trong ngành
  - Trending skills cần học
- **Financial Dashboard:**
  - Thu nhập theo tháng
  - Pending payments
  - Transaction history

---

## PHẦN IV: CÔNG NGHỆ VÀ STACK KỸ THUẬT

### 1. Technology Stack

#### **Frontend:**
- **Mobile App:** 
  - React Native (iOS + Android)
  - Redux Toolkit cho state management
  - React Navigation cho routing
  - Axios cho API calls
- **Web App (Admin/Brand Portal):**
  - React.js + TypeScript
  - Next.js cho SSR
  - Material-UI hoặc Ant Design
  - Chart.js/Recharts cho visualization

#### **Backend:**
- **API Server:**
  - Node.js + Express.js hoặc NestJS
  - TypeScript
  - RESTful API + GraphQL (cho complex queries)
- **Microservices:**
  - Docker containers
  - Kubernetes cho orchestration
  - Service mesh (Istio) cho communication
- **Message Queue:**
  - RabbitMQ hoặc Apache Kafka
  - Cho async processing (email, notifications, scoring)

#### **Database:**
- **Primary Database:** PostgreSQL
  - Relational data (users, bookings, transactions)
  - JSONB cho flexible schema
- **Cache:** Redis
  - Session storage
  - API response caching
  - Real-time leaderboard
- **Search Engine:** Elasticsearch
  - Full-text search cho Talent profiles
  - Faceted search với filters
- **File Storage:** AWS S3 hoặc Google Cloud Storage
  - Images, videos, documents
  - CDN (CloudFront/CloudFlare) cho delivery

#### **AI/ML:**
- **Framework:** Python + TensorFlow/PyTorch
- **Deployment:** TensorFlow Serving hoặc TorchServe
- **Training:** Google Colab/AWS SageMaker

#### **DevOps:**
- **CI/CD:** GitHub Actions hoặc GitLab CI
- **Monitoring:** 
  - Prometheus + Grafana
  - Sentry cho error tracking
  - New Relic/DataDog cho APM
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)


### 2. Kiến trúc hệ thống chi tiết

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Mobile App   │  │  Web Portal  │  │  Admin Panel │      │
│  │ (React Native)│  │  (Next.js)   │  │  (React)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                              │
│  - Authentication/Authorization                              │
│  - Rate Limiting                                             │
│  - Load Balancing (Nginx/HAProxy)                           │
│  - API Versioning                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  MICROSERVICES LAYER                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  User    │ │  Talent  │ │ Campaign │ │ Payment  │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  Social  │ │ Pageant  │ │   B2B    │                   │
│  │ Service  │ │ Service  │ │ Service  │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │PostgreSQL│ │  Redis   │ │Elasticsearch│ │   S3    │      │
│  │(Primary) │ │ (Cache)  │ │ (Search)  │ │ (Files) │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  - TikTok/Instagram/Facebook APIs                           │
│  - Payment Gateways (VNPay, Momo, ZaloPay)                 │
│  - SMS/Email Services (Twilio, SendGrid)                    │
│  - AI/ML Services (AWS Rekognition, Azure Face API)        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Database Schema quan trọng

#### **Users & Authentication**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('talent', 'brand', 'agency', 'organizer', 'admin'),
    status ENUM('pending', 'active', 'suspended', 'deleted'),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type_status ON users(user_type, status);
```

#### **Talent Profiles**
```sql
CREATE TABLE talent_profiles (
    talent_id UUID PRIMARY KEY REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    stage_name VARCHAR(255),
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other'),
    province VARCHAR(100),
    height DECIMAL(5,2), -- cm
    weight DECIMAL(5,2), -- kg
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    skin_tone VARCHAR(50),
    hair_style VARCHAR(100),
    education_level VARCHAR(100),
    languages JSONB, -- ["Vietnamese", "English:IELTS 7.0"]
    marital_status ENUM('single', 'married', 'divorced'),
    has_children BOOLEAN DEFAULT FALSE,
    surgery_history JSONB, -- ["nose", "breast"]
    bio TEXT,
    verification_status ENUM('pending', 'verified', 'rejected'),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```


#### **Talent Scoring & Tiering**
```sql
CREATE TABLE talent_scores (
    talent_id UUID PRIMARY KEY REFERENCES talent_profiles(talent_id),
    criterion_1_achievement DECIMAL(4,2), -- Danh hiệu & Thành tích
    criterion_2_physique DECIMAL(4,2),    -- Nhân trắc học & Hình thể
    criterion_3_social DECIMAL(4,2),      -- Social Metrics
    criterion_4_education DECIMAL(4,2),   -- Học vấn & Ngoại ngữ
    criterion_5_portfolio DECIMAL(4,2),   -- Portfolio & Kinh nghiệm
    criterion_6_reliability DECIMAL(4,2), -- Uy tín & Thái độ
    criterion_7_skills DECIMAL(4,2),      -- Kỹ năng Chuyên môn
    criterion_8_roi DECIMAL(4,2),         -- Giá trị Thương mại
    criterion_9_tech DECIMAL(4,2),        -- Thích ứng Công nghệ
    criterion_10_safety DECIMAL(4,2),     -- An toàn Hình ảnh
    total_score DECIMAL(5,2),
    tier ENUM('S', 'A', 'B', 'C', 'POTENTIAL'),
    confidence_score DECIMAL(3,2), -- 0.00 - 1.00
    last_calculated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_talent_scores_tier ON talent_scores(tier);
CREATE INDEX idx_talent_scores_total ON talent_scores(total_score DESC);
```

#### **Campaigns & Bookings**
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type ENUM('event', 'catwalk', 'photoshoot', 'livestream', 'ambassador', 'other'),
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    status ENUM('draft', 'published', 'in_progress', 'completed', 'cancelled'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaign_requirements (
    campaign_id UUID REFERENCES campaigns(id),
    tier_required VARCHAR(10)[], -- ['S', 'A']
    min_height DECIMAL(5,2),
    max_height DECIMAL(5,2),
    min_age INTEGER,
    max_age INTEGER,
    gender ENUM('male', 'female', 'any'),
    location VARCHAR(100),
    skills_required JSONB, -- ["catwalk", "livestream"]
    min_followers INTEGER,
    min_engagement_rate DECIMAL(5,2),
    other_requirements TEXT,
    PRIMARY KEY (campaign_id)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    talent_id UUID REFERENCES talent_profiles(talent_id),
    brand_id UUID REFERENCES users(id),
    job_type VARCHAR(50),
    job_description TEXT,
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    rate DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'),
    contract_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_talent ON bookings(talent_id, status);
CREATE INDEX idx_bookings_brand ON bookings(brand_id, status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
```


#### **Payment & Escrow**
```sql
CREATE TABLE wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'VND',
    status ENUM('active', 'frozen', 'closed'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'booking_payment', 'escrow_lock', 'escrow_release', 'refund', 'fee'),
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    reference_id UUID, -- booking_id hoặc campaign_id
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE escrow_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2),
    talent_amount DECIMAL(15,2),
    status ENUM('locked', 'released', 'refunded', 'disputed'),
    locked_at TIMESTAMP DEFAULT NOW(),
    release_condition VARCHAR(255),
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(from_user_id, to_user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type, status);
CREATE INDEX idx_escrow_booking ON escrow_accounts(booking_id);
```

#### **Social Media Integration**
```sql
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_id UUID REFERENCES talent_profiles(talent_id),
    platform ENUM('tiktok', 'instagram', 'facebook', 'youtube'),
    username VARCHAR(255),
    account_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    status ENUM('connected', 'disconnected', 'expired', 'error'),
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(talent_id, platform)
);

CREATE TABLE social_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id),
    metric_date DATE NOT NULL,
    followers INTEGER,
    following INTEGER,
    posts_count INTEGER,
    likes_total BIGINT,
    comments_total BIGINT,
    shares_total BIGINT,
    views_total BIGINT,
    engagement_rate DECIMAL(5,2),
    reach INTEGER,
    impressions INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, metric_date)
);

CREATE INDEX idx_social_metrics_account_date ON social_metrics(account_id, metric_date DESC);
```

---

## PHẦN V: QUY TRÌNH VẬN HÀNH VÀ QUẢN TRỊ

### 1. Quy trình Onboarding User

#### **1.1. Onboarding Talent**
**Mục tiêu:** Giúp Talent hoàn thiện hồ sơ trong vòng 15-20 phút

**Các bước:**
1. **Welcome Screen:** Giới thiệu ngắn gọn về platform (30s video)
2. **Chọn mục tiêu:** "Bạn muốn tham gia cuộc thi hay tìm công việc?"
3. **Nhập thông tin cơ bản:** Form 1 trang với auto-save
4. **Upload ảnh:** Hướng dẫn chụp ảnh chuẩn (có template overlay)
5. **Khảo sát 30 câu hỏi:** Chia làm 3 phần, mỗi phần 10 câu
6. **Kết nối mạng xã hội:** OAuth flow đơn giản
7. **Xác minh danh tính:** Upload CCCD + Selfie
8. **Hoàn thành:** Hiển thị kết quả tier và gợi ý bước tiếp theo

**Gamification:**
- Progress bar hiển thị % hoàn thành
- Badge "Profile Complete" khi hoàn thành 100%
- Unlock tính năng khi đạt milestone (50%, 75%, 100%)


#### **1.2. Onboarding Brand**
**Mục tiêu:** Giúp Brand tạo campaign đầu tiên trong 10 phút

**Các bước:**
1. **Đăng ký doanh nghiệp:** Nhập thông tin công ty, mã số thuế
2. **Upload giấy tờ:** Giấy phép kinh doanh, giấy ủy quyền
3. **Chờ xác minh:** Admin review trong 1-2 ngày (có thể dùng tài khoản trial)
4. **Nạp tiền:** Hướng dẫn nạp tiền vào ví (tối thiểu 5 triệu)
5. **Tour hướng dẫn:** Interactive tutorial tạo campaign mẫu
6. **Tạo campaign thật:** Với support từ chatbot/live chat

**Incentive:**
- Miễn phí platform fee cho 3 booking đầu tiên
- Credit 500K cho campaign đầu tiên
- Dedicated account manager cho 30 ngày đầu

### 2. Quy trình Quản lý Chất lượng (Quality Control)

#### **2.1. Kiểm duyệt hồ sơ Talent**
**Tiêu chí kiểm duyệt:**
- ✅ Ảnh rõ nét, không filter quá đà
- ✅ Thông tin nhân trắc học hợp lý (chiều cao/cân nặng/số đo)
- ✅ CCCD hợp lệ, không bị che mờ
- ✅ Face matching ≥ 95%
- ✅ Không có nội dung nhạy cảm, vi phạm pháp luật
- ❌ Ảnh mờ, ảnh photoshop quá nhiều
- ❌ Thông tin giả mạo
- ❌ Tài khoản trùng lặp

**Quy trình:**
1. AI tự động kiểm tra (80% case pass/fail tự động)
2. Case không chắc chắn → Queue cho Admin review
3. Admin approve/reject với lý do cụ thể
4. Nếu reject → Gửi email hướng dẫn sửa
5. Talent có 3 lần submit lại

#### **2.2. Giám sát chất lượng dịch vụ**
**Metrics theo dõi:**
- **Booking Success Rate:** % booking được hoàn thành thành công
- **On-time Rate:** % Talent đến đúng giờ
- **Cancellation Rate:** % booking bị hủy (phân tích nguyên nhân)
- **Average Rating:** Điểm đánh giá trung bình từ Brand
- **Response Time:** Thời gian Talent phản hồi lời mời booking

**Hành động:**
- Talent có rating < 3.5 sao → Cảnh báo
- Talent hủy show > 2 lần/tháng → Tạm khóa tài khoản 7 ngày
- Talent có complaint nghiêm trọng → Điều tra và xử lý

#### **2.3. Brand Safety Monitoring**
**Tự động quét:**
- Lịch sử bài đăng trên mạng xã hội (6 tháng gần nhất)
- Phát hiện nội dung nhạy cảm: Chính trị, tôn giáo, bạo lực, 18+
- Sentiment analysis: Phát hiện scandal, drama
- Fake followers detection

**Cảnh báo:**
- 🟢 Green: An toàn 100%
- 🟡 Yellow: Có một số vấn đề nhỏ (cần review)
- 🔴 Red: Có vấn đề nghiêm trọng (không nên hợp tác)

### 3. Quy trình Xử lý Tranh chấp

#### **3.1. Các loại tranh chấp phổ biến**
1. **Talent hủy show phút chót**
2. **Brand không thanh toán hoặc thanh toán chậm**
3. **Chất lượng công việc không đạt yêu cầu**
4. **Thay đổi điều khoản đột ngột**
5. **Hành vi không chuyên nghiệp**


#### **3.2. Quy trình xử lý**
**Bước 1: Mở ticket tranh chấp**
- Bên bị thiệt hại bấm "Báo cáo vấn đề" trên booking
- Chọn loại vấn đề và mô tả chi tiết
- Upload bằng chứng (ảnh, video, tin nhắn)
- Hệ thống tự động freeze escrow account

**Bước 2: Thông báo bên kia**
- Bên bị khiếu nại nhận thông báo
- Có 24h để phản hồi và cung cấp bằng chứng
- Nếu không phản hồi → Tự động chấp nhận khiếu nại

**Bước 3: Admin điều tra**
- Review toàn bộ bằng chứng từ cả hai bên
- Kiểm tra lịch sử giao dịch, đánh giá trước đó
- Liên hệ trực tiếp nếu cần làm rõ
- Thời gian xử lý: 2-5 ngày làm việc

**Bước 4: Ra quyết định**
- **Talent đúng:** Giải ngân 100% + bồi thường 20% từ Brand
- **Brand đúng:** Hoàn tiền 100% + trừ điểm uy tín Talent
- **Cả hai có lỗi:** Chia theo tỷ lệ (ví dụ: 60-40)
- **Không đủ bằng chứng:** Chia đôi 50-50

**Bước 5: Thực thi và ghi nhận**
- Thực hiện giao dịch theo quyết định
- Cập nhật điểm uy tín (criterion 6)
- Ghi nhận vào lịch sử (ảnh hưởng đến matching sau này)
- Nếu vi phạm nghiêm trọng → Khóa tài khoản

---

## PHẦN VI: CHIẾN LƯỢC PHÁT TRIỂN VÀ MỞ RỘNG

### 1. Roadmap phát triển sản phẩm

#### **Phase 1: MVP (Tháng 1-3)**
**Mục tiêu:** Launch phiên bản cơ bản với tính năng core

**Tính năng:**
- ✅ Đăng ký và quản lý hồ sơ Talent/Brand
- ✅ Hệ thống scoring và tiering cơ bản
- ✅ Tạo campaign và booking đơn giản
- ✅ Escrow payment cơ bản
- ✅ Rating và review
- ✅ Admin panel cơ bản

**KPI:**
- 100 Talent đăng ký
- 10 Brand đăng ký
- 50 booking thành công
- GMV: 500 triệu VND

#### **Phase 2: Growth (Tháng 4-6)**
**Mục tiêu:** Mở rộng tính năng và tăng trưởng user base

**Tính năng mới:**
- ✅ Tích hợp API mạng xã hội (TikTok, Instagram)
- ✅ AI Match-making nâng cao
- ✅ B2B Marketplace (Makeup, Stylist, Designer)
- ✅ Mobile app (iOS + Android)
- ✅ Content calendar và scheduler
- ✅ Advanced analytics dashboard

**KPI:**
- 500 Talent
- 50 Brand
- 300 booking/tháng
- GMV: 3 tỷ VND/tháng

#### **Phase 3: Scale (Tháng 7-12)**
**Mục tiêu:** Trở thành platform #1 trong ngành

**Tính năng mới:**
- ✅ Pageant Management System
- ✅ Crown Funding
- ✅ Voting Engine
- ✅ Live streaming integration
- ✅ AI content generation
- ✅ International expansion (English version)

**KPI:**
- 2,000 Talent
- 200 Brand
- 1,000 booking/tháng
- GMV: 10 tỷ VND/tháng
- 5 cuộc thi lớn sử dụng platform


### 2. Chiến lược Go-to-Market

#### **2.1. Chiến lược thu hút Talent (Supply Side)**

**Kênh marketing:**
1. **Social Media Marketing:**
   - TikTok: Video hướng dẫn, success stories, tips & tricks
   - Instagram: Showcase portfolio của Talent thành công
   - Facebook Groups: Tham gia các group về người mẫu, hoa hậu
   
2. **Partnership với Training Centers:**
   - Hợp tác với các trung tâm đào tạo người mẫu
   - Offer: Miễn phí 6 tháng đầu cho học viên
   - Co-branding events
   
3. **Influencer Marketing:**
   - Mời các Hoa hậu, Á hậu nổi tiếng làm ambassador
   - Testimonial videos
   - Referral program: Giới thiệu bạn nhận 500K
   
4. **Offline Events:**
   - Tổ chức workshop "Làm thế nào để trở thành người mẫu chuyên nghiệp"
   - Booth tại các cuộc thi sắc đẹp
   - Campus tour tại các trường đại học

**Incentive Program:**
- Miễn phí 100% platform fee trong 3 tháng đầu
- Bonus 1 triệu cho booking đầu tiên
- Free professional photoshoot cho top 100 Talent đầu tiên
- Premium features miễn phí 6 tháng

#### **2.2. Chiến lược thu hút Brand (Demand Side)**

**Target Segments:**
1. **Local Fashion Brands (30 brands):**
   - Thời trang nữ, mỹ phẩm, phụ kiện
   - Pain point: Khó tìm model phù hợp, quy trình booking rườm rà
   - Solution: AI matching, booking nhanh trong 24h
   
2. **Event Agencies (20 agencies):**
   - Tổ chức sự kiện, triển lãm, khai trương
   - Pain point: Cần nhiều PG/Model cùng lúc, quản lý chấm công phức tạp
   - Solution: Bulk booking, QR check-in, một hóa đơn tổng
   
3. **Luxury Brands (10 brands):**
   - Xe hơi, đồng hồ, bất động sản cao cấp
   - Pain point: Cần Talent tier S/A, brand safety quan trọng
   - Solution: Verified profiles, brand safety score, premium support

**Sales Strategy:**
- **Direct Sales:** Account Executive gọi điện, gặp mặt trực tiếp
- **Demo & Trial:** Miễn phí 3 booking đầu tiên
- **Case Studies:** Showcase success stories với metrics cụ thể
- **Webinar:** "Cách tối ưu chi phí marketing với Talent phù hợp"

**Pricing Strategy:**
- Platform fee: 15% trên mỗi booking (có thể negotiate cho volume lớn)
- Subscription model cho Agency: 5 triệu/tháng (unlimited booking, giảm fee xuống 10%)
- Premium features: Analytics dashboard, priority support, dedicated account manager

### 3. Mô hình kinh doanh và Revenue Streams

#### **3.1. Revenue Streams chính**

**1. Commission từ Booking (70% revenue)**
- 15% platform fee trên mỗi giao dịch
- Ví dụ: Booking 10 triệu → Platform nhận 1.5 triệu
- Projected: 1,000 bookings/tháng × 10 triệu × 15% = 1.5 tỷ/tháng

**2. Subscription từ Brand/Agency (15% revenue)**
- Basic: Free (15% fee)
- Pro: 5 triệu/tháng (10% fee, analytics, priority support)
- Enterprise: 15 triệu/tháng (8% fee, dedicated AM, custom features)
- Projected: 50 Pro + 10 Enterprise = 400 triệu/tháng

**3. Premium Features cho Talent (5% revenue)**
- Featured Profile: 500K/tháng (hiển thị ưu tiên)
- Portfolio Boost: 300K/tháng (AI optimize portfolio)
- Analytics Pro: 200K/tháng (advanced insights)
- Projected: 200 Talent × 500K = 100 triệu/tháng

**4. B2B Marketplace Commission (5% revenue)**
- 10% commission từ dịch vụ makeup, stylist, designer
- Projected: 500 bookings/tháng × 2 triệu × 10% = 100 triệu/tháng

**5. Voting & Crown Funding (5% revenue)**
- 10% platform fee từ voting
- 5% platform fee từ crown funding
- Projected: 5 cuộc thi/năm × 500 triệu votes = 250 triệu/năm

**Tổng Revenue dự kiến (Phase 3):**
- Monthly: ~2.1 tỷ VND
- Yearly: ~25 tỷ VND

#### **3.2. Cost Structure**

**Fixed Costs (Monthly):**
- Team: 500 triệu (20 người × 25 triệu)
- Office & Infrastructure: 100 triệu
- Cloud Hosting (AWS/GCP): 50 triệu
- Software Licenses: 20 triệu
- Marketing: 200 triệu
- **Total Fixed:** ~870 triệu/tháng

**Variable Costs:**
- Payment Gateway Fee: 2% của GMV
- SMS/Email: 10 triệu/tháng
- Customer Support: 50 triệu/tháng
- **Total Variable:** ~100-150 triệu/tháng

**Break-even:** ~1 tỷ revenue/tháng (đạt được ở Phase 2)

---

## PHẦN VII: RỦI RO VÀ GIẢI PHÁP

### 1. Rủi ro kỹ thuật

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| System downtime | Cao | Load balancer, auto-scaling, 99.9% SLA |
| Data breach | Cao | Encryption, regular security audit, penetration testing |
| API rate limit (TikTok/IG) | Trung bình | Caching, batch processing, multiple API keys |
| Payment gateway failure | Cao | Multiple payment providers, retry mechanism |
| AI model bias | Trung bình | Regular model audit, diverse training data |

### 2. Rủi ro vận hành

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Talent hủy show hàng loạt | Cao | Penalty system, deposit requirement, insurance |
| Brand không thanh toán | Cao | Escrow system, verified business only |
| Fake profiles | Trung bình | KYC verification, AI detection, manual review |
| Low booking rate | Cao | AI matching optimization, marketing campaigns |
| Customer support overload | Trung bình | Chatbot, self-service portal, hire more CS |

### 3. Rủi ro pháp lý

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Vi phạm GDPR/PDPA | Cao | Legal consultation, privacy policy, user consent |
| Tranh chấp hợp đồng | Trung bình | Clear T&C, dispute resolution process, legal team |
| Thuế và hóa đơn | Cao | Accounting system, tax consultant, auto invoice |
| Bản quyền hình ảnh | Trung bình | Clear IP ownership in contract, watermark |

---

## KẾT LUẬN

Tài liệu này cung cấp cái nhìn chi tiết về kiến trúc kỹ thuật, luồng vận hành, và chiến lược phát triển của nền tảng. Các điểm chính:

1. **Kiến trúc Microservices** đảm bảo khả năng mở rộng và bảo trì
2. **AI/ML** tự động hóa scoring, matching, và content moderation
3. **Escrow System** bảo vệ quyền lợi cả hai bên
4. **Multi-channel Integration** kết nối với TikTok, Instagram, Facebook
5. **Scalable Infrastructure** sẵn sàng cho tăng trưởng nhanh

**Next Steps:**
1. Finalize technical specifications với Tech Lead
2. Setup development environment và CI/CD pipeline
3. Start Sprint 1: User Management + Authentication
4. Parallel: UI/UX design cho Mobile App
5. Weekly sync với stakeholders

---

**Phiên bản:** 1.0  
**Ngày cập nhật:** 2026-05-26  
**Người soạn:** Product Team  
**Liên hệ:** product@platform.vn

