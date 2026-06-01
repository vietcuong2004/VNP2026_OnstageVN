"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, Calendar, Award, CheckCircle, Clock, X,
  Sparkles, Search, ArrowLeft, MapPin, AlertCircle, PlayCircle,
  Phone, Mail, Globe, MapPinned, Info, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContestDetail {
  organizerName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  phases: {
    title: string;
    timeline: string;
    location: string;
    items: string[];
  }[];
  notes: string[];
}

interface Contest {
  id: string;
  name: string;
  organizer: string;
  duration: string;
  suitability: number;
  status: "Chưa tham gia" | "Đang tham gia" | "Đang chờ duyệt";
  scale: string;
  description: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  glowColor: string;
  detail: ContestDetail;
  funding?: {
    projectName: string;
    projectImage: string;
    raised: number;
    goal: number;
    supportersCount: number;
    sponsors: {
      name: string;
      tier: string;
    }[];
  };
}

const FUNDING_DATA: Record<string, NonNullable<Contest["funding"]>> = {
  ct1: {
    projectName: "Tủ sách cho trẻ em vùng cao (Nguyễn Mai Anh)",
    projectImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 62500000,
    goal: 100000000,
    supportersCount: 1248,
    sponsors: [
      { name: "Glow Beauty Cosmetics", tier: "Kim Cương" },
      { name: "VNDress Fashion Group", tier: "Vàng" },
      { name: "Sheraton Hanoi Hotel", tier: "Bạc" }
    ]
  },
  ct2: {
    projectName: "Nước sạch cho trường em bản cao (Trần Thu Thảo)",
    projectImage: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 88000000,
    goal: 150000000,
    supportersCount: 920,
    sponsors: [
      { name: "Sen Vàng Agency", tier: "Kim Cương" },
      { name: "Lotus Airlines", tier: "Vàng" },
      { name: "AquaPure VN", tier: "Bạc" }
    ]
  },
  ct3: {
    projectName: "Lớp học công nghệ cho trẻ em khuyết tật (Lê Mỹ Linh)",
    projectImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 45000000,
    goal: 80000000,
    supportersCount: 512,
    sponsors: [
      { name: "VNP Group", tier: "Kim Cương" },
      { name: "EduTech Việt Nam", tier: "Vàng" }
    ]
  },
  ct4: {
    projectName: "Bữa ăn đầy nhân ái cho bệnh nhi nghèo (Phạm Thanh Hằng)",
    projectImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 30000000,
    goal: 60000000,
    supportersCount: 340,
    sponsors: [
      { name: "VNP Media Corp", tier: "Vàng" },
      { name: "FreshFood VN", tier: "Bạc" }
    ]
  },
  ct5: {
    projectName: "Bảo tồn làng nghề lụa truyền thống (Hoàng Lệ Quyên)",
    projectImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 120000000,
    goal: 200000000,
    supportersCount: 1450,
    sponsors: [
      { name: "Thái Tuấn Silk", tier: "Kim Cương" },
      { name: "Heritage Hotel", tier: "Vàng" }
    ]
  },
  ct6: {
    projectName: "Quỹ học bổng kiều bào trẻ hiếu học (Vũ Thị Tuyết)",
    projectImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 155000000,
    goal: 250000000,
    supportersCount: 860,
    sponsors: [
      { name: "FLC Group", tier: "Kim Cương" },
      { name: "VietGlobal Bank", tier: "Vàng" }
    ]
  },
  ct7: {
    projectName: "Ngôi nhà ước mơ cho người già neo đơn (Đặng Hồng Ngọc)",
    projectImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 72000000,
    goal: 120000000,
    supportersCount: 640,
    sponsors: [
      { name: "Thanh Nien Publishing", tier: "Kim Cương" },
      { name: "Dalitex Group", tier: "Bạc" }
    ]
  },
  ct8: {
    projectName: "Bảo vệ rạn san hô Nam Trung Bộ (Bùi Phương Nga)",
    projectImage: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 38000000,
    goal: 70000000,
    supportersCount: 410,
    sponsors: [
      { name: "Vinpearl Resort & Spa", tier: "Kim Cương" },
      { name: "SeaSafe Organization", tier: "Vàng" }
    ]
  },
  ct9: {
    projectName: "Trạm y tế lưu động cho đồng bào thiểu số (Nguyễn Cao Kỳ Duyên)",
    projectImage: "https://images.unsplash.com/photo-1584515901407-d7ff536c047e?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 340000000,
    goal: 500000000,
    supportersCount: 2950,
    sponsors: [
      { name: "UniMedia Corporation", tier: "Kim Cương" },
      { name: "Cosmo Hospital", tier: "Vàng" },
      { name: "Vietcombank", tier: "Vàng" }
    ]
  },
  ct10: {
    projectName: "Trường học hữu nghị biên giới Việt - Lào (Linh Souphanouvong)",
    projectImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&h=300&q=80",
    raised: 95000000,
    goal: 150000000,
    supportersCount: 750,
    sponsors: [
      { name: "Bộ Văn hóa, Thể thao và Du lịch", tier: "Kim Cương" },
      { name: "Vietlao Express", tier: "Vàng" }
    ]
  }
};

export default function ContestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const [contests, setContests] = useState<Contest[]>(() => {
    const rawContests: Contest[] = [
      {
        id: "ct1",
        name: "Hoa hậu Việt Nam",
        organizer: "Báo Tiền Phong & Sen Vàng",
        duration: "30/08/2026 - 25/12/2026",
        suitability: 96,
        status: "Chưa tham gia",
        scale: "Toàn quốc",
        description: "Cuộc thi sắc đẹp cấp quốc gia lâu đời và uy tín nhất Việt Nam, tôn vinh vẻ đẹp trí tuệ, tâm hồn và tấm lòng nhân ái của người phụ nữ Việt.",
        color: "gold",
        borderColor: "border-[#3e3415] hover:border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.02)]",
        badgeColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        glowColor: "from-amber-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC HOA HẬU VIỆT NAM 2026",
          address: "Tòa nhà Báo Tiền Phong, 15 Hồ Xuân Hương, Hai Bà Trưng, Hà Nội",
          phone: "0243 943 4016",
          email: "info@hoahauvietnam.vn",
          website: "hoahauvietnam.vn",
          phases: [
            {
              title: "I. Họp báo công bố khởi động cuộc thi",
              timeline: "Tháng 05/2026",
              location: "Tp. Hà Nội",
              items: [
                "Thông cáo báo chí tới các cơ quan thông tấn trên toàn quốc",
                "Họp báo chính thức ra mắt và công bố các nhà tài trợ lớn",
                "Công bố quy chế thi và thời gian tiếp nhận hồ sơ đăng ký"
              ]
            },
            {
              title: "II. Vòng thi sơ khảo 2 miền",
              timeline: "Tháng 09/2026",
              location: "Hà Nội & TP. Hồ Chí Minh",
              items: [
                "Nhận hồ sơ online qua cổng portal và xét tuyển điều kiện nhân trắc học",
                "Tổ chức vòng sơ khảo thí sinh miền Bắc tại Khách sạn Sheraton Hanoi West",
                "Tổ chức sơ khảo thí sinh miền Nam tại Caravelle Hotel TP.HCM",
                "Đo nhân trắc học nhân thể và phỏng vấn trực tiếp trước BGK"
              ]
            },
            {
              title: "III. Vòng Bán kết",
              timeline: "Tháng 11/2026",
              location: "Khu du lịch Tuần Châu, Quảng Ninh",
              items: [
                "Chụp ảnh profile ngoài trời với trang phục áo dài và dạ hội",
                "Thiết lập các lớp tập huấn kỹ năng trình diễn (Catwalk masterclass)",
                "Đêm thi bán kết truyền hình trực tiếp lựa chọn TOP 40 vào chung kết"
              ]
            },
            {
              title: "IV. Vòng Chung kết & Hoạt động đồng hành",
              timeline: "Tháng 12/2026",
              location: "TP. Hồ Chí Minh",
              items: [
                "Triển khai chuỗi dự án nhân ái hỗ trợ cộng đồng tại các khu vực khó khăn",
                "Đêm diễn phụ: Người đẹp biển, Người đẹp thời trang, Người đẹp tài năng",
                "Tổng duyệt sân khấu đêm chung kết với sự tham gia của các ngôi sao hạng A",
                "Truyền hình trực tiếp đêm Chung kết tại Nhà thi đấu Phú Thọ ngày 25/12/2026"
              ]
            }
          ],
          notes: [
            "Thí sinh vào vòng chung kết được hỗ trợ toàn bộ chi phí lưu trú, ăn uống, trang phục dạ hội và trang điểm chuyên nghiệp.",
            "Cuộc thi yêu cầu thí sinh chưa qua đại phẫu thẩm mỹ và chưa kết hôn/sinh con."
          ]
        }
      },
      {
        id: "ct2",
        name: "Hoa hậu Quốc gia Việt Nam",
        organizer: "Công ty Sen Vàng",
        duration: "15/09/2026 - 18/12/2026",
        suitability: 92,
        status: "Đang chờ duyệt",
        scale: "Toàn quốc (63 tỉnh thành)",
        description: "Cuộc thi tôn vinh vẻ đẹp truyền thống gắn liền với nét đẹp văn hóa đặc trưng của các vùng miền và quảng bá du lịch Việt Nam.",
        color: "cyan",
        borderColor: "border-[#143d4d] hover:border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.02)]",
        badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        glowColor: "from-cyan-500/5 to-transparent",
        detail: {
          organizerName: "CÔNG TY CỔ PHẦN QUẢN CÁO THƯƠNG MẠI SEN VÀNG",
          address: "6D Trường Sa, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh",
          phone: "0283 899 2233",
          email: "info@senvangvn.com",
          website: "hoahauquocgia.senvang.com",
          phases: [
            {
              title: "I. Tuyển sinh & Gặp gỡ báo chí",
              timeline: "Tháng 07/2026",
              location: "TP. Hồ Chí Minh",
              items: [
                "Nhận đăng ký ứng viên đại diện cho 63 tỉnh thành",
                "Họp báo ra mắt ban giám khảo và các chuyên gia văn hóa lịch sử",
                "Sơ loại hồ sơ học vấn và năng khiếu vùng miền của thí sinh"
              ]
            },
            {
              title: "II. Vòng Sơ khảo vùng miền",
              timeline: "Tháng 09/2026",
              location: "Miền Bắc, Miền Trung, Miền Nam",
              items: [
                "Tổ chức thi tuyển trực tiếp tại 3 cụm khu vực trọng điểm",
                "Thi tài năng thuyết trình văn hóa du lịch địa phương của thí sinh",
                "Chọn ra 63 gương mặt xuất sắc nhất đại diện cho 63 tỉnh thành"
              ]
            },
            {
              title: "III. Vòng Chung khảo & Hoạt động thực tế",
              timeline: "Tháng 11/2026",
              location: "Khu di tích lịch sử đền Hùng, Phú Thọ",
              items: [
                "Thực hiện bộ ảnh cổ phục dân tộc tại các địa danh văn hóa lớn",
                "Tham gia chuỗi tọa đàm giới thiệu ẩm thực và làng nghề truyền thống",
                "Đêm chung khảo xếp hạng các phần thi phụ"
              ]
            },
            {
              title: "IV. Vòng Chung kết toàn quốc",
              timeline: "Tháng 12/2026",
              location: "Tp. Hà Nội",
              items: [
                "Tổng duyệt catwalk đồng diễn trang phục các dân tộc Việt Nam",
                "Đêm chung kết toàn quốc diễn ra ngày 18/12/2026 tại Trung tâm Hội nghị Quốc gia",
                "Truyền hình trực tiếp trên các kênh VTV và FPT Play"
              ]
            }
          ],
          notes: [
            "Mỗi thí sinh đại diện cho một tỉnh thành sẽ được ban tổ chức tài trợ gói thiết kế trang phục dân tộc riêng (trị giá lên tới 50M).",
            "Chấp nhận thí sinh có can thiệp thẩm mỹ nhẹ nhưng chưa thay đổi cấu trúc khung xương mặt."
          ]
        }
      },
      {
        id: "ct3",
        name: "Hoa khôi Việt Nam",
        organizer: "Trung ương Hội Liên hiệp Thanh niên Việt Nam",
        duration: "10/10/2026 - 05/01/2027",
        suitability: 85,
        status: "Chưa tham gia",
        scale: "Sinh viên toàn quốc",
        description: "Sân chơi sắc đẹp, trí tuệ và tài năng dành riêng cho nữ sinh viên các trường Đại học, Cao đẳng trên toàn lãnh thổ Việt Nam.",
        color: "purple",
        borderColor: "border-[#2f1c4f] hover:border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.02)]",
        badgeColor: "bg-[#a855f7]/10 border-[#a855f7]/20 text-[#a855f7]",
        glowColor: "from-purple-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC HOA KHÔI SINH VIÊN VIỆT NAM",
          address: "64 Bà Triệu, Hoàn Kiếm, Hà Nội",
          phone: "0246 263 1946",
          email: "contact@hoakhoisinhvien.vn",
          website: "hoakhoisinhvien.vn",
          phases: [
            {
              title: "I. Khởi động & Phát động tuyển sinh",
              timeline: "Tháng 09/2026",
              location: "Các trường Đại học toàn quốc",
              items: [
                "Gửi thông báo tuyển sinh tới hơn 400 trường ĐH, CĐ trên cả nước",
                "Giao lưu quảng bá trực tiếp tại các trường ĐH trọng điểm tại HN, ĐN, Cần Thơ, TP.HCM",
                "Thời gian nhận hồ sơ trực tiếp tại văn phòng Đoàn trường hoặc online"
              ]
            },
            {
              title: "II. Vòng Sơ khảo cấp trường & Cấp tỉnh",
              timeline: "Tháng 10 - 11/2026",
              location: "Các cụm khu vực thi",
              items: [
                "Tổ chức chấm thi sơ tuyển trực tiếp tại các giảng đường lớn",
                "Kiểm tra học lực (điểm số GPA tối thiểu 2.5/4.0 hoặc tương đương)",
                "Thi trắc nghiệm kiến thức xã hội và trả lời ứng xử nhanh"
              ]
            },
            {
              title: "III. Vòng Bán kết khu vực",
              timeline: "Tháng 12/2026",
              location: "Hà Nội, Đà Nẵng, TP. Hồ Chí Minh",
              items: [
                "Đồng diễn flashmob năng động và chụp hình đồng phục sinh viên",
                "Thi tài năng chuyên môn (múa, hát, hùng biện tiếng Anh, nhạc cụ)",
                "Lựa chọn TOP 45 thí sinh xuất sắc nhất bước vào Chung kết"
              ]
            },
            {
              title: "IV. Vòng Chung kết toàn quốc",
              timeline: "Tháng 01/2027",
              location: "Nhà hát Bến Thành, TP. Hồ Chí Minh",
              items: [
                "Tham gia trại huấn luyện kỹ năng mềm và giao tiếp ngoại giao",
                "Đêm chung kết vinh danh diễn ra ngày 05/01/2027 với các giải thưởng học bổng lớn",
                "Đồng hành truyền thông trên VTV6 và các kênh số của Hội sinh viên"
              ]
            }
          ],
          notes: [
            "Yêu cầu bắt buộc: Thí sinh phải là nữ sinh viên đang theo học hệ chính quy tại các ĐH, CĐ, học viện.",
            "Học bổng đặc biệt cho Top 3 trị giá từ 50M - 200M và cơ hội tham gia các chuyến giao lưu quốc tế."
          ]
        }
      },
      {
        id: "ct4",
        name: "Người đẹp Việt Nam",
        organizer: "Công ty Cổ phần Truyền thông Việt Nam",
        duration: "05/08/2026 - 15/11/2026",
        suitability: 78,
        status: "Chưa tham gia",
        scale: "Miền Bắc & Miền Nam",
        description: "Sự kiện văn hóa tôn vinh vẻ đẹp đằm thắm truyền thống kết hợp tài năng nghệ thuật và kỹ năng giao tiếp xuất sắc của thiếu nữ Việt.",
        color: "slate",
        borderColor: "border-[#1e293b] hover:border-slate-400/40 shadow-[0_0_15px_rgba(148,163,184,0.02)]",
        badgeColor: "bg-slate-500/10 border-slate-500/20 text-slate-400",
        glowColor: "from-slate-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC NGƯỜI ĐẸP VIỆT NAM 2026",
          address: "Tòa nhà VNP, 102 Ngụy Như Kon Tum, Thanh Xuân, Hà Nội",
          phone: "0243 556 7890",
          email: "nguoidepvietnam@vnp.vn",
          website: "nguoidepvietnam.vn",
          phases: [
            {
              title: "I. Nhận hồ sơ và Tuyển chọn sơ bộ",
              timeline: "Tháng 08/2026",
              location: "Online / Trực tiếp",
              items: [
                "Hồ sơ gửi kèm tối thiểu 3 ảnh chân dung và toàn thân không chỉnh sửa quá đà",
                "Sơ loại thông tin lý lịch cá nhân và trình độ văn hóa",
                "Thông báo danh sách thí sinh lọt vào sơ khảo"
              ]
            },
            {
              title: "II. Vòng Sơ khảo hai miền",
              timeline: "Tháng 09/2026",
              location: "Hà Nội & TP. Hồ Chí Minh",
              items: [
                "Kiểm tra nhân trắc học cơ bản (chiều cao tối thiểu 163cm)",
                "Phần thi trình diễn áo bà ba / áo dài truyền thống tự chọn",
                "Phỏng vấn trực tiếp trước hội đồng giám khảo về kiến thức văn hóa"
              ]
            },
            {
              title: "III. Vòng Chung khảo",
              timeline: "Tháng 10/2026",
              location: "Thành phố Đà Nẵng",
              items: [
                "Tổ chức chuỗi hoạt động chụp ảnh lookbook thời trang cho nhà tài trợ",
                "Thi tài năng nữ công gia chánh (cắm hoa, nấu ăn) và ứng xử nhanh",
                "Chọn TOP 30 thí sinh đi tiếp vào đêm Chung kết"
              ]
            },
            {
              title: "IV. Đêm Chung kết",
              timeline: "Tháng 11/2026",
              location: "Nhà hát Lớn Hà Nội",
              items: [
                "Luyện tập tổng duyệt chương trình cùng biên đạo múa chuyên nghiệp",
                "Đêm chung kết trang trọng diễn ra ngày 15/11/2026 tại Nhà hát Lớn Hà Nội",
                "Phát sóng trực tiếp trên đài phát thanh và truyền hình Hà Nội"
              ]
            }
          ],
          notes: [
            "Cuộc thi mở rộng cho tất cả nữ công dân Việt Nam từ 18 đến 27 tuổi, chiều cao từ 163cm trở lên.",
            "Cho phép thí sinh đã can thiệp thẩm mỹ nhẹ nhưng chưa thay đổi hình thái nhân trắc học tự nhiên."
          ]
        }
      },
      {
        id: "ct5",
        name: "Hoa hậu Áo Dài Việt Nam",
        organizer: "Hiệp hội Thiết kế Thời trang & Sở Văn hóa",
        duration: "20/08/2026 - 20/10/2026",
        suitability: 90,
        status: "Đang tham gia",
        scale: "Toàn quốc",
        description: "Cuộc thi tôn vinh quốc phục Áo Dài truyền thống Việt Nam, tìm kiếm gương mặt đại diện quảng bá hình ảnh di sản quốc gia ra thế giới.",
        color: "rose",
        borderColor: "border-[#4f1a2d] hover:border-rose-400/40 shadow-[0_0_15px_rgba(236,72,153,0.02)]",
        badgeColor: "bg-rose-500/10 border-rose-500/20 text-rose-400",
        glowColor: "from-rose-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC HOA HẬU ÁO DÀI VIỆT NAM 2026",
          address: "Tòa nhà Sở Văn Hóa Thể Thao, 164 Đồng Khởi, Quận 1, TP. Hồ Chí Minh",
          phone: "0283 822 4153",
          email: "ao daivietnam@hcm.gov.vn",
          website: "hoahauaodaivietnam.vn",
          phases: [
            {
              title: "I. Khởi động và Phát động thiết kế Áo dài",
              timeline: "Tháng 07/2026",
              location: "TP. Hồ Chí Minh",
              items: [
                "Họp báo phát động cuộc thi thiết kế Áo dài đồng hành cùng chương trình",
                "Mở cổng đăng ký trực tuyến cho các nhà thiết kế và thí sinh",
                "Công bố dàn giám khảo gồm các NTK áo dài danh tiếng toàn quốc"
              ]
            },
            {
              title: "II. Vòng Sơ khảo trực tiếp",
              timeline: "Tháng 08/2026",
              location: "Hà Nội, Huế, TP. Hồ Chí Minh",
              items: [
                "Tổ chức sơ tuyển trực tiếp tại 3 miền Bắc - Trung - Nam",
                "Đo chỉ số nhân trắc và phỏng vấn kiến thức lịch sử tà áo dài Việt Nam",
                "Thí sinh trình diễn áo dài tự chọn trước hội đồng BGK"
              ]
            },
            {
              title: "III. Vòng Bán kết & Hoạt động di sản",
              timeline: "Tháng 09/2026",
              location: "Cố đô Huế, Thừa Thiên Huế",
              items: [
                "Thực hiện bộ ảnh áo dài tại Đại Nội Huế và cầu Tràng Tiền",
                "Đêm trình diễn áo dài di sản (Áo dài Show) phát sóng trên truyền hình",
                "Lựa chọn TOP 35 thí sinh đi tiếp vào đêm chung kết xếp hạng"
              ]
            },
            {
              title: "IV. Đêm Chung kết",
              timeline: "Tháng 10/2026",
              location: "Nhà hát Thành phố, TP. Hồ Chí Minh",
              items: [
                "Tập luyện kỹ năng catwalk uyển chuyển với tà áo dài cùng HLV chuyên nghiệp",
                "Đêm chung kết trao vương miện diễn ra ngày 20/10/2026 (Ngày Phụ nữ Việt Nam)",
                "Truyền hình trực tiếp trên sóng HTV và phát sóng đa nền tảng số"
              ]
            }
          ],
          notes: [
            "Thí sinh tham gia sẽ được các NTK nổi tiếng hỗ trợ may đo áo dài độc quyền suốt hành trình cuộc thi.",
            "Yêu cầu vẻ đẹp tự nhiên hài hòa, nụ cười rạng rỡ và mái tóc dài đen mượt truyền thống."
          ]
        }
      },
      {
        id: "ct6",
        name: "Hoa hậu Bản sắc Việt",
        organizer: "Tập đoàn FLC & VTV",
        duration: "01/10/2026 - 15/01/2027",
        suitability: 82,
        status: "Chưa tham gia",
        scale: "Toàn cầu",
        description: "Tìm kiếm vẻ đẹp trí tuệ, duyên dáng và bản sắc đặc trưng của người con gái Việt Nam đang sinh sống trong nước và ở nước ngoài.",
        color: "blue",
        borderColor: "border-[#1e3a8a]/40 hover:border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.02)]",
        badgeColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        glowColor: "from-blue-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC HOA HẬU BẢN SẮC VIỆT TOÀN CẦU 2026",
          address: "Tòa nhà FLC Landmark, Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
          phone: "0243 771 1111",
          email: "bansacviet@flc.vn",
          website: "hoahaubansacviet.vn",
          phases: [
            {
              title: "I. Tuyển sinh toàn cầu & Vòng loại hồ sơ",
              timeline: "Tháng 09 - 10/2026",
              location: "Trong nước & Nước ngoài (Mỹ, Úc, Đức, Nhật...)",
              items: [
                "Tiếp nhận hồ sơ đăng ký của kiều bào và du học sinh Việt Nam tại nước ngoài",
                "Phối hợp với các hội nhóm cộng đồng người Việt toàn cầu để casting online",
                "Sơ tuyển hồ sơ học vấn và trắc nghiệm kiến thức lịch sử văn hóa Việt"
              ]
            },
            {
              title: "II. Vòng Sơ khảo bán tập trung",
              timeline: "Tháng 11/2026",
              location: "Hà Nội, TP.HCM & Điểm casting quốc tế",
              items: [
                "Đo đạc chỉ số hình thể chính xác và phỏng vấn ứng xử song ngữ",
                "Lựa chọn đại diện trong nước và các kiều bào xuất sắc từ hải ngoại quay về hội quân"
              ]
            },
            {
              title: "III. Vòng Bán kết toàn cầu",
              timeline: "Tháng 12/2026",
              location: "FLC Samson Beach & Golf Resort, Thanh Hóa",
              items: [
                "Chụp hình bikini và trang phục thể thao bên bờ biển Sầm Sơn",
                "Tham gia thi đấu các môn thể thao bãi biển và kiểm tra sức bền",
                "Đêm diễn bán kết hoành tráng chọn ra TOP 40 thí sinh xuất sắc nhất"
              ]
            },
            {
              title: "IV. Vòng Chung kết toàn cầu",
              timeline: "Tháng 01/2027",
              location: "FLC Quy Nhon Beach & Golf Resort, Bình Định",
              items: [
                "Chuỗi hoạt động khám phá bản sắc văn hóa các dân tộc địa phương miền Trung",
                "Đêm chung kết toàn cầu truyền hình trực tiếp trên sóng VTV1 ngày 15/01/2027",
                "Gala tiệc vinh danh và chào mừng tân Hoa hậu đăng quang"
              ]
            }
          ],
          notes: [
            "Hỗ trợ vé máy bay khứ hồi và toàn bộ chi phí ăn ở, đi lại tại Việt Nam cho các thí sinh kiều bào lọt vào bán kết.",
            "Yêu cầu thí sinh có quốc tịch Việt Nam hoặc có gốc Việt Nam (bố hoặc mẹ là người Việt)."
          ]
        }
      },
      {
        id: "ct7",
        name: "Hoa hậu Duyên Dáng Việt Nam",
        organizer: "Tạp chí Thanh Niên",
        duration: "12/07/2026 - 30/09/2026",
        suitability: 89,
        status: "Chưa tham gia",
        scale: "Toàn quốc",
        description: "Tôn vinh vẻ đẹp thanh lịch và duyên dáng của phụ nữ trẻ Việt Nam gắn liền với các hoạt động thiện nguyện xã hội.",
        color: "indigo",
        borderColor: "border-[#312e81]/40 hover:border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.02)]",
        badgeColor: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        glowColor: "from-indigo-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC HOA HẬU DUYÊN DÁNG VIỆT NAM",
          address: "Tòa nhà Báo Thanh Niên, 348 Yersin, Quận 1, TP. Hồ Chí Minh",
          phone: "0283 930 2302",
          email: "duyendang@thanhnien.vn",
          website: "duyendangvietnam.vn",
          phases: [
            {
              title: "I. Khởi động và Nhận hồ sơ",
              timeline: "Tháng 06/2026",
              location: "Trực tuyến",
              items: [
                "Họp báo giới thiệu thông điệp cuộc thi 'Vẻ đẹp tỏa sáng từ tâm'",
                "Mở cổng nộp hồ sơ, yêu cầu clip giới thiệu bản thân tối đa 1 phút",
                "Lọc và lựa chọn 150 ứng viên bước vào vòng sơ khảo"
              ]
            },
            {
              title: "II. Vòng Sơ khảo trực tiếp",
              timeline: "Tháng 07/2026",
              location: "Hà Nội & TP. Hồ Chí Minh",
              items: [
                "Gặp gỡ trực tiếp BGK, đo nhân trắc học và kiểm tra biểu cảm gương mặt",
                "Thi catwalk tự chọn với giày cao gót tối thiểu 10cm",
                "Tuyển lựa TOP 45 thí sinh xuất sắc nhất vào bán kết"
              ]
            },
            {
              title: "III. Vòng Bán kết toàn quốc",
              timeline: "Tháng 08/2026",
              location: "Thành phố Đà Lạt, Lâm Đồng",
              items: [
                "Chụp hình profile dạ hội giữa đồi thông thơ mộng",
                "Đồng hành cùng hoạt động từ thiện xây nhà tình thương và phát quà cho trẻ em nghèo",
                "Đêm thi bán kết lựa chọn TOP 30 gương mặt vào chung kết"
              ]
            },
            {
              title: "IV. Vòng Chung kết & Đăng quang",
              timeline: "Tháng 09/2026",
              location: "Nhà hát Hòa Bình, TP. Hồ Chí Minh",
              items: [
                "Luyện tập vũ đạo đồng diễn và kỹ năng ứng xử thông minh trước máy quay",
                "Đêm chung kết vinh danh diễn ra ngày 30/09/2026 tại Nhà hát Hòa Bình",
                "Truyền hình trực tiếp trên các kênh truyền hình lớn toàn quốc"
              ]
            }
          ],
          notes: [
            "Cuộc thi đề cao các hoạt động dự án xã hội thực tế do chính thí sinh lên ý tưởng và thực hiện.",
            "Chấp nhận thí sinh đã qua phẫu thuật thẩm mỹ răng và sửa mũi nhẹ."
          ]
        }
      },
      {
        id: "ct8",
        name: "Hoa hậu Đất Việt",
        organizer: "Sở VH-TT-DL các tỉnh Nam Trung Bộ",
        duration: "05/09/2026 - 30/11/2026",
        suitability: 74,
        status: "Chưa tham gia",
        scale: "Miền Trung - Tây Nguyên",
        description: "Quảng bá thế mạnh du lịch biển đảo và văn hóa ẩm thực đặc sắc của dải đất miền Trung qua vẻ đẹp của thí sinh đại diện.",
        color: "emerald",
        borderColor: "border-[#064e3b]/40 hover:border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.02)]",
        badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        glowColor: "from-emerald-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC HOA HẬU ĐẤT VIỆT 2026",
          address: "Trung tâm Hội nghị Tỉnh, Trần Phú, Nha Trang, Khánh Hòa",
          phone: "0258 382 2253",
          email: "datvietbeauty@khanhhoa.gov.vn",
          website: "hoahaudatviet.vn",
          phases: [
            {
              title: "I. Họp báo ra mắt & Đăng ký",
              timeline: "Tháng 08/2026",
              location: "Nha Trang, Khánh Hòa",
              items: [
                "Công bố mục tiêu quảng bá du lịch và văn hóa di sản Đất Việt",
                "Mở cổng đăng ký dành riêng cho thí sinh hộ khẩu Miền Trung - Tây Nguyên",
                "Xét tuyển sơ loại thông tin học vấn và chiều cao"
              ]
            },
            {
              title: "II. Vòng Sơ khảo khu vực",
              timeline: "Tháng 09/2026",
              location: "Đà Nẵng & Buôn Ma Thuột",
              items: [
                "Tổ chức sơ tuyển trực tiếp đo nhân trắc học và kiểm tra năng khiếu",
                "Phần thi ứng xử hiểu biết văn hóa, lịch sử và ẩm thực địa phương",
                "Chọn lọc TOP 40 thí sinh đi tiếp vào bán kết"
              ]
            },
            {
              title: "III. Vòng Bán kết",
              timeline: "Tháng 10/2026",
              location: "Quy Nhơn, Bình Định",
              items: [
                "Chuỗi hoạt động quảng bá du lịch biển đảo, nhặt rác bảo vệ môi trường",
                "Đêm trình diễn trang phục áo dài thổ cẩm và trang phục đi biển tự chọn",
                "Lựa chọn TOP 25 thí sinh xuất sắc đi tiếp vào Chung kết"
              ]
            },
            {
              title: "IV. Đêm Chung kết",
              timeline: "Tháng 11/2026",
              location: "Vinpearl Land Nha Trang, Khánh Hòa",
              items: [
                "Tập luyện kỹ năng biểu diễn trước sân khấu ngoài trời quy mô lớn",
                "Đêm chung kết xếp hạng ngày 30/11/2026 tại Nha Trang",
                "Truyền hình trực tiếp trên các kênh VTV8 và sở đài truyền hình địa phương"
              ]
            }
          ],
          notes: [
            "Ưu tiên đặc cách cho các thí sinh đã đoạt giải Hoa khôi cấp tỉnh, cấp trường khu vực Miền Trung - Tây Nguyên.",
            "Thí sinh đoạt giải sẽ đại diện quảng bá cho du lịch miền Trung trong vòng 2 năm nhiệm kỳ."
          ]
        }
      },
      {
        id: "ct9",
        name: "Hoa hậu Hoàn Vũ Việt Nam",
        organizer: "Công ty Cổ phần Hoàn Vũ Sài Gòn (UniMedia)",
        duration: "01/08/2026 - 31/12/2026",
        suitability: 95,
        status: "Chưa tham gia",
        scale: "Toàn quốc",
        description: "Sân chơi nhan sắc đẳng cấp và khốc liệt nhất nhằm tìm kiếm đại diện sắc sảo, tự tin và có kỹ năng trình diễn vượt trội.",
        color: "gold",
        borderColor: "border-[#3e3415] hover:border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.02)]",
        badgeColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        glowColor: "from-amber-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC MISS COSMO VIETNAM 2026",
          address: "Tòa nhà UniMedia, 187 Hoàng Văn Thụ, Quận Phú Nhuận, TP. Hồ Chí Minh",
          phone: "0283 842 2842",
          email: "contact@unimedia.vn",
          website: "misscosmovietnam.vn",
          phases: [
            {
              title: "I. Tuyển sinh toàn quốc & Sơ loại hồ sơ",
              timeline: "Tháng 07 - 08/2026",
              location: "Cổng portal trực tuyến",
              items: [
                "Công bố chủ đề cuộc thi 'Made, Not Born' (Tôi tự luyện, Tôi tỏa sáng)",
                "Xét duyệt hồ sơ học vấn, ngoại ngữ và hình thể ban đầu",
                "Tổ chức vòng sơ tuyển hồ sơ đặc biệt chọn thẳng vào TOP 60"
              ]
            },
            {
              title: "II. Sơ khảo trực tiếp & Ghi hình Truyền hình thực tế",
              timeline: "Tháng 09 - 10/2026",
              location: "TP. Hồ Chí Minh",
              items: [
                "Tổ chức sơ tuyển đo nhân trắc học khắt khe và phỏng vấn kín với BGK",
                "Ghi hình 8 tập Truyền hình thực tế 'Tôi là Hoa hậu Hoàn vũ Việt Nam'",
                "Thi đấu các thử thách loại trừ trực tiếp: Catwalk đối đầu, Hùng biện tiếng Anh, Pose ảnh high-fashion"
              ]
            },
            {
              title: "III. Đêm Bán kết",
              timeline: "Tháng 12/2026",
              location: "Đà Lạt, Lâm Đồng",
              items: [
                "Tổ chức show trình diễn thời trang ngoài trời 'Fashion Show Cosmo'",
                "Đêm thi bán kết quốc gia truyền hình trực tiếp với hai phần thi chính: Bikini và Dạ hội"
              ]
            },
            {
              title: "IV. Đêm Chung kết & Đăng quang",
              timeline: "31 Tháng 12, 2026",
              location: "TP. Hồ Chí Minh (Sân khấu trung tâm)",
              items: [
                "Luyện tập tổng duyệt khớp đội hình sân khấu 3D hiện đại",
                "Đêm chung kết diễn ra vào đêm giao thừa 31/12/2026 đón năm mới",
                "Cơ chế ứng xử loại trừ trực tiếp TOP 5 -> TOP 2 đối thoại trực tiếp",
                "Truyền hình trực tiếp trên sóng VTV9 và tiếp sóng quốc tế"
              ]
            }
          ],
          notes: [
            "Yêu cầu khắt khe: Chiều cao tối thiểu 167cm, tư duy biện luận tốt, khả năng ngoại ngữ lưu loát (Tiếng Anh song ngữ).",
            "Chấp nhận thí sinh đã phẫu thuật thẩm mỹ toàn diện, đề cao sự tự tin và cá tính độc lập."
          ]
        }
      },
      {
        id: "ct10",
        name: "Hoa hậu Hữu Nghị Việt - Lào",
        organizer: "Bộ Văn hóa, Thể thao và Du lịch hai nước",
        duration: "15/10/2026 - 10/12/2026",
        suitability: 88,
        status: "Chưa tham gia",
        scale: "Quốc tế (Việt Nam & Lào)",
        description: "Sự kiện văn hóa ngoại giao tôn vinh tình đoàn kết hữu nghị Việt - Lào và nét duyên dáng chung của phụ nữ hai đất nước.",
        color: "cyan",
        borderColor: "border-[#143d4d] hover:border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.02)]",
        badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        glowColor: "from-cyan-500/5 to-transparent",
        detail: {
          organizerName: "BAN TỔ CHỨC LIÊN HOAN HOA HẬU HỮU NGHỊ VIỆT - LÀO 2026",
          address: "Tòa nhà Bộ Văn hóa, Thể thao và Du lịch, 51 Ngô Quyền, Hoàn Kiếm, Hà Nội",
          phone: "0243 943 8231",
          email: "vietlao.friendship@chinhphu.vn",
          website: "vietlao-friendship.gov.vn",
          phases: [
            {
              title: "I. Khởi động và Nhận đăng ký",
              timeline: "Tháng 09/2026",
              location: "Hà Nội & Viêng Chăn",
              items: [
                "Họp báo quốc tế công bố chương trình hợp tác văn hóa giữa hai bộ VH-TT-DL",
                "Phát động đăng ký dành cho nữ công dân hai nước (tuổi từ 18-28)",
                "Sơ loại hồ sơ lý lịch văn hóa và trình độ học vấn"
              ]
            },
            {
              title: "II. Vòng Sơ tuyển quốc gia",
              timeline: "Tháng 10/2026",
              location: "Hà Nội (Việt Nam) & Viêng Chăn (Lào)",
              items: [
                "Mỗi nước tổ chức chấm thi sơ khảo riêng để chọn ra 20 đại diện xuất sắc nhất",
                "Đo chỉ số nhân trắc học, kiểm tra khả năng giao tiếp ngoại giao",
                "Thí sinh thi tài năng kết hợp văn hóa hai nước (múa lăm vông, múa dân gian Việt...)"
              ]
            },
            {
              title: "III. Trại giao lưu văn hóa hữu nghị",
              timeline: "Tháng 11/2026",
              location: "Tỉnh Nghệ An & Tỉnh Luông Pha Băng",
              items: [
                "40 thí sinh hai nước tập trung tham gia các dự án trồng rừng hữu nghị và thiện nguyện",
                "Chụp hình profile chung trang phục truyền thống (Sinh lào & Áo dài Việt)",
                "Đêm diễn giao lưu hữu nghị nghệ thuật thắt chặt tình cảm"
              ]
            },
            {
              title: "IV. Đêm Chung kết liên bang",
              timeline: "Tháng 12/2026",
              location: "Cung Văn hóa Hữu nghị Việt - Xô, Hà Nội",
              items: [
                "Tập luyện catwalk đồng diễn phối hợp song ngữ Việt - Lào",
                "Đêm chung kết trao vương miện hữu nghị diễn ra ngày 10/12/2026",
                "Truyền hình trực tiếp trên các đài truyền hình quốc gia VTV (Việt Nam) và LNTV (Lào)"
              ]
            }
          ],
          notes: [
            "Thí sinh phải có khả năng giao tiếp cơ bản bằng tiếng Anh hoặc tiếng của nước bạn (thí sinh Việt biết tiếng Lào và ngược lại là lợi thế).",
            "Tất cả chi phí huấn luyện, trang phục quốc phục hai nước đều do ban tổ chức tài trợ 100%."
          ]
        }
      }
    ];
    return rawContests.map(c => ({
      ...c,
      funding: FUNDING_DATA[c.id]
    }));
  });

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleApply = (id: string, name: string) => {
    setContests(prev =>
      prev.map(c => (c.id === id ? { ...c, status: "Đang chờ duyệt" } : c))
    );
    // If selected contest modal is open, update its status in modal too
    if (selectedContest && selectedContest.id === id) {
      setSelectedContest(prev => prev ? { ...prev, status: "Đang chờ duyệt" } : null);
    }
    addToast(`Đã gửi hồ sơ ứng tuyển tham gia cuộc thi "${name}" thành công!`, "success");
  };

  // Filter logic
  const filteredContests = contests.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filterTabs = [
    { label: "Tất cả", value: "All" },
    { label: "Chưa tham gia", value: "Chưa tham gia" },
    { label: "Đang chờ duyệt", value: "Đang chờ duyệt" },
    { label: "Đang tham gia", value: "Đang tham gia" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">

      {/* Title Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/talent/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Danh Sách Cuộc Thi</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">Theo dõi các cuộc thi sắc đẹp đang diễn ra, xem độ phù hợp của bản thân và ứng tuyển trực tuyến.</p>
        </div>
      </div>

      {/* Control Panel: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm cuộc thi, ban tổ chức..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#151b2d] bg-[#08090f] text-xs font-semibold text-slate-200 placeholder-slate-500 focus:border-amber-400/40 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none w-full md:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border",
                selectedStatus === tab.value
                  ? "bg-[#f4c430] border-amber-400/30 text-slate-950 shadow-[0_4px_12px_rgba(244,196,48,0.15)]"
                  : "bg-[#08090f] border-[#151b2d] text-slate-400 hover:text-white hover:bg-white/2"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid listing pageants */}
      {filteredContests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredContests.map((contest) => {
            return (
              <div
                key={contest.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-[#08090f] border p-6 shadow-xl luxury-card-hover transition-all duration-300",
                  contest.borderColor
                )}
              >
                {/* Glow Background effect */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", contest.glowColor)} />

                {/* Header: Title and Match Score */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider", contest.badgeColor)}>
                        {contest.scale}
                      </span>

                      {/* Status Badges */}
                      {contest.status === "Đang tham gia" && (
                        <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" /> Đang tham gia
                        </span>
                      )}
                      {contest.status === "Đang chờ duyệt" && (
                        <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-0.5 text-[8px] text-amber-400 font-extrabold border border-amber-500/20 uppercase tracking-wider animate-pulse">
                          <Clock className="h-3 w-3" /> Đang chờ duyệt
                        </span>
                      )}
                      {contest.status === "Chưa tham gia" && (
                        <span className="flex items-center gap-1 rounded bg-slate-500/10 px-2.5 py-0.5 text-[8px] text-slate-400 font-extrabold border border-slate-500/20 uppercase tracking-wider">
                          <PlayCircle className="h-3 w-3" /> Chưa tham gia
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-extrabold text-sm text-white mt-2 group-hover:text-amber-400 transition-colors duration-300 leading-snug">
                      {contest.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">{contest.organizer}</p>
                  </div>

                  {/* AI Suitability Score */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                      <span className="font-display font-extrabold text-sm text-amber-400">{contest.suitability}%</span>
                    </div>
                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Phù hợp</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mt-4 font-medium relative z-10 line-clamp-3">
                  {contest.description}
                </p>

                {/* Details Footer */}
                <div className="mt-5 border-t border-[#151b2d] pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Thời gian: <b className="text-white font-mono font-extrabold">{contest.duration}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="truncate font-semibold">{contest.scale}</span>
                  </div>
                </div>

                {/* Action buttons (Xem chi tiết + Ứng tuyển) */}
                <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                  <button
                    onClick={() => setSelectedContest(contest)}
                    className="flex h-11 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f]/80 text-slate-300 hover:text-white hover:bg-slate-900/40 hover:border-slate-700/40 text-xs font-bold transition-all duration-300 cursor-pointer"
                  >
                    Xem chi tiết
                  </button>

                  <button
                    onClick={() => handleApply(contest.id, contest.name)}
                    disabled={contest.status !== "Chưa tham gia"}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold transition-all duration-300 cursor-pointer",
                      contest.status === "Đang tham gia"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                        : contest.status === "Đang chờ duyệt"
                          ? "bg-amber-500/5 border border-amber-500/20 text-amber-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
                    )}
                  >
                    {contest.status === "Đang tham gia" ? (
                      "Đã tham gia"
                    ) : contest.status === "Đang chờ duyệt" ? (
                      "Chờ duyệt"
                    ) : (
                      "Ứng tuyển"
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#151b2d] bg-[#08090f]/50 p-12 text-center">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white uppercase">Không tìm thấy cuộc thi nào</h3>
          <p className="text-xs text-slate-500 mt-2">Vui lòng điều chỉnh từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.</p>
        </div>
      )}

      {/* DETAILED CONTEST DIALOG (MODAL) */}
      {selectedContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider", selectedContest.badgeColor)}>
                    {selectedContest.scale}
                  </span>
                  {selectedContest.status === "Đang tham gia" && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                      <CheckCircle className="h-3 w-3" /> Đang tham gia
                    </span>
                  )}
                  {selectedContest.status === "Đang chờ duyệt" && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[8px] text-amber-400 font-extrabold border border-amber-500/20 uppercase tracking-wider">
                      <Clock className="h-3 w-3 animate-spin-slow" /> Đang chờ duyệt
                    </span>
                  )}
                </div>
                <h2 className="font-display font-black text-lg text-white mt-1.5 uppercase leading-tight tracking-tight">
                  {selectedContest.name}
                </h2>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                  Tổ chức bởi: <span className="text-slate-300">{selectedContest.organizer}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedContest(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body - Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">

              {/* Description */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Info className="h-4 w-4 text-amber-400" /> Mô tả cuộc thi
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-6 font-medium">
                  {selectedContest.description}
                </p>
              </div>

              {/* Organization contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#050711]/50 border border-[#151b2d] rounded-2xl p-4 text-[10px] text-slate-400">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><b>Trụ sở BTC:</b> <span className="text-slate-300">{selectedContest.detail.address}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Hotline:</b> <span className="text-slate-300 font-mono">{selectedContest.detail.phone}</span></span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Email:</b> <span className="text-slate-300 font-mono">{selectedContest.detail.email}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Website:</b> <a href={`https://${selectedContest.detail.website}`} target="_blank" rel="noreferrer" className="text-amber-300 hover:underline font-mono">{selectedContest.detail.website}</a></span>
                  </div>
                </div>
              </div>

              {/* Dự án Gọi vốn & Nhà tài trợ */}
              {selectedContest.funding && (
                <div className="space-y-4 border-t border-[#151b2d] pt-6">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Crown className="h-4 w-4 text-amber-400 animate-pulse" /> Gọi vốn dự án & Nhà Tài trợ
                  </h4>

                  <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#111421] to-[#08090f] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                    <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-3xl bg-amber-400 pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Image cover */}
                      <div className="h-32 md:h-24 md:w-36 w-full rounded-xl bg-slate-900 border border-white/5 relative overflow-hidden shrink-0">
                        <img
                          src={selectedContest.funding.projectImage}
                          alt={selectedContest.funding.projectName}
                          className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className="inline-flex items-center rounded bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[8px] font-bold text-amber-300 uppercase">
                            CROWN FUNDING
                          </span>
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h5 className="font-display font-black text-xs text-white uppercase tracking-wider leading-snug">
                            {selectedContest.funding.projectName}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            Chiến dịch gây quỹ ủng hộ dự án cộng đồng/nhân ái của thí sinh trong khuôn khổ cuộc thi.
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-end text-[9px] font-bold uppercase tracking-wider">
                            <span className="text-amber-400">Tiến độ: {Math.round((selectedContest.funding.raised / selectedContest.funding.goal) * 100)}%</span>
                            <span className="text-slate-400">
                              <span className="text-white font-mono">{selectedContest.funding.raised.toLocaleString()}đ</span> / {selectedContest.funding.goal.toLocaleString()}đ
                            </span>
                          </div>

                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((selectedContest.funding.raised / selectedContest.funding.goal) * 100))}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[8px] text-slate-500 font-semibold uppercase tracking-wider">
                            <span>{selectedContest.funding.supportersCount} Nhà hảo tâm ủng hộ</span>
                            <button
                              onClick={() => {
                                setSelectedContest(null);
                                router.push("/talent/crown");
                              }}
                              className="text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                            >
                              Ủng hộ dự án &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Sponsors list */}
                    <div className="mt-4 pt-4 border-t border-[#151b2d]">
                      <span className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">Nhà tài trợ đồng hành</span>
                      <div className="flex flex-wrap gap-2 items-center">
                        {selectedContest.funding.sponsors.map((sponsor, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-1.5 rounded-lg border border-[#151b2d] bg-[#050711]/60 px-2.5 py-1 text-[9px] hover:border-amber-500/20 transition-all duration-300"
                          >
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              sponsor.tier === "Kim Cương" ? "bg-cyan-400" :
                                sponsor.tier === "Vàng" ? "bg-amber-400" : "bg-slate-400"
                            )} />
                            <span>
                              <strong className="text-slate-200">{sponsor.name}</strong>
                              <span className="text-slate-500 ml-1">({sponsor.tier})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Lịch trình */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Trophy className="h-4 w-4 text-amber-400" /> Lịch trình & Vòng thi chi tiết
                </h4>

                {/* Timeline vertical flow */}
                <div className="relative border-l border-[#151b2d] ml-3 pl-6 space-y-8">
                  {selectedContest.detail.phases.map((phase, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#08090f] border-2 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </span>

                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-xs font-bold text-white">{phase.title}</span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded bg-[#0f172a] border border-[#1e293b] px-2 py-0.5 text-[8px] font-bold text-amber-400 uppercase font-mono">
                              <Clock className="h-2.5 w-2.5" /> {phase.timeline}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded bg-[#0f172a] border border-[#1e293b] px-2 py-0.5 text-[8px] font-bold text-slate-400 uppercase">
                              <MapPin className="h-2.5 w-2.5" /> {phase.location}
                            </span>
                          </div>
                        </div>

                        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs font-medium">
                          {phase.items.map((item, i) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2.5 border-t border-[#151b2d] pt-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Lưu ý từ ban tổ chức</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-500 text-[10px] font-medium leading-relaxed">
                  {selectedContest.detail.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button
                onClick={() => setSelectedContest(null)}
                className="px-5 py-2.5 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/2 cursor-pointer transition-colors"
              >
                Đóng lại
              </button>

              <button
                onClick={() => handleApply(selectedContest.id, selectedContest.name)}
                disabled={selectedContest.status !== "Chưa tham gia"}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-display text-xs font-bold transition-all duration-300 cursor-pointer",
                  selectedContest.status === "Đang tham gia"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                    : selectedContest.status === "Đang chờ duyệt"
                      ? "bg-amber-500/5 border border-amber-500/20 text-amber-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
                )}
              >
                {selectedContest.status === "Đang tham gia" ? (
                  "Đã tham gia"
                ) : selectedContest.status === "Đang chờ duyệt" ? (
                  "Đang chờ duyệt..."
                ) : (
                  "Ứng tuyển cuộc thi"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toast Notification System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "glass-panel border-l-4 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 min-w-[280px] max-w-[400px]",
              toast.type === "success" ? "border-l-emerald-500" : "border-l-amber-500"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            )}
            <p className="text-xs font-semibold text-white leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
