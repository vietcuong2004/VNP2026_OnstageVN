"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, MapPin, DollarSign, Sparkles, Filter, ShieldCheck, CheckCircle,
  Eye, X, Info, Clock, Phone, Mail, Globe, MapPinned, Trophy, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applyTalentCampaign, loadTalentCampaigns, mapCampaignToTalentJob } from "@/lib/talent-api";

export default function JobsPage() {
  const [selectedTag, setSelectedTag] = useState("Tất cả");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" }[]>([]);

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const mockCampaigns = [
    {
      id: "c1",
      title: "Beauty Mega Live 06/2026",
      brand: "Glow Beauty Cosmetics",
      type: "Livestream",
      budget: "12.000.000đ",
      location: "Studio Cầu Giấy, Hà Nội",
      brief: "Livestream giới thiệu dòng son dưỡng mới và phấn phủ glowy skin. Cần Talent có khả năng tương tác tốt, am hiểu mỹ phẩm và năng động.",
      minHeight: 165,
      matchScore: 94,
      escrowed: true,
      color: "cyan",
      borderColor: "border-[#143d4d] hover:border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.02)]",
      badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      glowColor: "from-cyan-500/5 to-transparent",
      detail: {
        requirements: [
          "Chiều cao tối thiểu từ 1m65 trở lên, ngoại hình sáng, da đẹp ít khuyết điểm.",
          "Khả năng tương tác trực tiếp tốt, tự tin trước ống kính và giọng nói truyền cảm, rõ ràng.",
          "Ưu tiên ứng viên có kinh nghiệm làm livestream bán hàng ngành mỹ phẩm hoặc có lượng follower ổn định trên các nền tảng mạng xã hội."
        ],
        benefits: [
          "Mức cát-xê đề xuất hấp dẫn: 12.000.000đ cho mỗi buổi live 2 tiếng.",
          "Được thương hiệu cung cấp toàn bộ trang phục, mỹ phẩm và các sản phẩm skincare hỗ trợ chuẩn bị.",
          "Hợp tác lâu dài với nhãn hàng Glow Beauty Cosmetics trong các chiến dịch tiếp theo."
        ],
        phases: [
          {
            title: "Vòng Tuyển Chọn (Casting Online)",
            timeline: "29/05/2026 - 05/06/2026",
            location: "Gửi clip test giới thiệu sản phẩm online",
            items: [
              "Nộp hồ sơ trực tuyến đính kèm clip 1 phút tự giới thiệu và test giọng đọc giới thiệu dòng son dưỡng mới.",
              "Ban tuyển chọn sẽ đánh giá giọng nói, thần thái và kỹ năng tương tác trước máy quay."
            ]
          },
          {
            title: "Vòng Phỏng Vấn Trực Tiếp (Interview)",
            timeline: "08/06/2026",
            location: "Văn phòng Glow Beauty, Cầu Giấy, Hà Nội",
            items: [
              "Phỏng vấn trực tiếp với Giám đốc Sáng tạo và Đại diện Thương hiệu.",
              "Thử thách kỹ năng xử lý tình huống trực tiếp trên sóng livestream giả lập."
            ]
          },
          {
            title: "Vòng Live Thực Tế (Execution)",
            timeline: "15/06/2026 - 20/06/2026",
            location: "Studio Cầu Giấy, Hà Nội",
            items: [
              "Tiến hành các buổi livestream chính thức giới thiệu dòng son dưỡng mới và phấn phủ glowy skin.",
              "Lịch live chia làm 3 buổi, mỗi buổi kéo dài 2 tiếng theo khung giờ vàng."
            ]
          }
        ],
        address: "Tòa nhà Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội",
        phone: "024.7300.7979",
        email: "contact@glowbeauty.vn",
        website: "glowbeauty.com.vn"
      }
    },
    {
      id: "c2",
      title: "Summer Runway Collection 2026",
      brand: "Diamond Luxury Fashion",
      type: "Runway",
      budget: "20.000.000đ",
      location: "Gem Center, TP. Hồ Chí Minh",
      brief: "Trình diễn bộ sưu tập đầm dạ hội Haute Couture mùa hè. Yêu cầu catwalk phong thái sang trọng, uyển chuyển và đúng nhịp nhạc.",
      minHeight: 172,
      matchScore: 89,
      escrowed: true,
      color: "purple",
      borderColor: "border-[#2f1c4f] hover:border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.02)]",
      badgeColor: "bg-[#a855f7]/10 border-[#a855f7]/20 text-[#a855f7]",
      glowColor: "from-purple-500/5 to-transparent",
      detail: {
        requirements: [
          "Chiều cao tối thiểu từ 1m72 trở lên, số đo hình thể chuẩn mẫu thời trang dạ hội.",
          "Kỹ năng catwalk tốt, biểu cảm khuôn mặt lạnh lùng sang trọng, thần thái chuẩn Haute Couture.",
          "Ưu tiên ứng viên đã từng trình diễn tại các tuần lễ thời trang uy tín."
        ],
        benefits: [
          "Cát-xê đề xuất: 20.000.000đ cho buổi diễn chính thức.",
          "Được tài trợ trang phục biểu diễn Haute Couture may đo riêng theo số đo cơ thể.",
          "Cơ hội xuất hiện trên các trang tạp chí thời trang nổi tiếng đưa tin về sự kiện."
        ],
        phases: [
          {
            title: "Vòng Casting Trực Tiếp",
            timeline: "05/06/2026",
            location: "Gem Center, Quận 1, TP. HCM",
            items: [
              "Kiểm tra chỉ số hình thể (chiều cao, cân nặng, ba vòng).",
              "Catwalk thử với giày cao gót theo nhạc yêu cầu của đạo diễn catwalk."
            ]
          },
          {
            title: "Vòng Fitting (Thử Đồ)",
            timeline: "12/06/2026",
            location: "Atelier Diamond Luxury, Quận 3, TP. HCM",
            items: [
              "Thử trang phục chính thức và chỉnh sửa may đo để vừa vặn hoàn hảo.",
              "Tập dượt tuyến đi sân khấu (blocking) sơ bộ với trang phục."
            ]
          },
          {
            title: "Đêm Diễn Chính Thức (Show Day)",
            timeline: "20/06/2026",
            location: "Grand Ballroom, Gem Center, TP. HCM",
            items: [
              "Rehearsal tổng duyệt sân khấu với ánh sáng và âm nhạc từ chiều.",
              "Trình diễn chính thức bộ sưu tập đầm dạ hội trước 500 khách mời VIP."
            ]
          }
        ],
        address: "172 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP. HCM",
        phone: "028.3824.6868",
        email: "show@diamondluxury.vn",
        website: "diamondluxury.vn"
      }
    },
    {
      id: "c3",
      title: "Luxury Jewelry Launch Event",
      brand: "Luxury Diamonds Co.",
      type: "Event MC",
      budget: "45.000.000đ",
      location: "Metropole Hotel, Hà Nội",
      brief: "Tham gia với tư cách MC song ngữ và khách mời danh dự (Celeb). Chụp ảnh check-in thảm đỏ, mang trang sức kim cương của thương hiệu.",
      minHeight: 170,
      matchScore: 78,
      escrowed: false,
      color: "rose",
      borderColor: "border-[#4f1a2d] hover:border-rose-400/40 shadow-[0_0_15px_rgba(236,72,153,0.02)]",
      badgeColor: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      glowColor: "from-rose-500/5 to-transparent",
      detail: {
        requirements: [
          "Khả năng dẫn chương trình song ngữ Anh - Việt trôi chảy, phát âm chuẩn phát thanh.",
          "Ngoại hình sang trọng, quý phái phù hợp với tính chất sự kiện trang sức kim cương cao cấp.",
          "Kinh nghiệm làm MC các sự kiện cao cấp tối thiểu 3 năm."
        ],
        benefits: [
          "Cát-xê đề xuất: 45.000.000đ trọn gói cho đêm sự kiện.",
          "Được bảo hiểm và hỗ trợ an ninh khi đeo bộ trang sức kim cương trị giá 5 tỷ đồng trong suốt sự kiện.",
          "Cung cấp chuyên gia trang điểm và làm tóc riêng chuẩn sao hạng A."
        ],
        phases: [
          {
            title: "Duyệt Kịch Bản & Khớp Chương Trình",
            timeline: "14/06/2026",
            location: "Metropole Hotel, Hoàn Kiếm, Hà Nội",
            items: [
              "Họp thống nhất kịch bản chi tiết MC tiếng Anh và tiếng Việt với đạo diễn sự kiện.",
              "Khớp giọng đọc với hệ thống âm thanh chính và chỉnh sửa văn phong kịch bản."
            ]
          },
          {
            title: "Đêm Sự Kiện Chính Thức",
            timeline: "15/06/2026",
            location: "Metropole Hotel, Hoàn Kiếm, Hà Nội",
            items: [
              "Check-in thảm đỏ, chụp ảnh PR với trang sức kim cương của thương hiệu.",
              "Dẫn chương trình chính thức ra mắt bộ sưu tập trang sức mới kéo dài 3 tiếng."
            ]
          }
        ],
        address: "15 Ngô Quyền, Hoàn Kiếm, Hà Nội",
        phone: "024.3826.6919",
        email: "event@luxurydiamonds.com",
        website: "luxurydiamonds.com"
      }
    },
    {
      id: "c4",
      title: "BST Lookbook Mùa Thu Streetwear",
      brand: "Maison Design Studio",
      type: "Lookbook",
      budget: "8.000.000đ",
      location: "Hồ Tây, Hà Nội",
      brief: "Chụp bộ ảnh thời trang dạo phố mùa thu. Phong cách nhẹ nhàng, thơ mộng. Cần biểu cảm tốt trước máy ảnh cơ.",
      minHeight: 165,
      matchScore: 82,
      escrowed: true,
      color: "gold",
      borderColor: "border-[#3e3415] hover:border-amber-400/40 shadow-[0_0_15px_rgba(244,196,48,0.02)]",
      badgeColor: "bg-amber-400/10 border-amber-400/20 text-amber-400",
      glowColor: "from-amber-400/5 to-transparent",
      detail: {
        requirements: [
          "Chiều cao tối thiểu từ 1m65 trở lên, phong cách trẻ trung năng động phù hợp thời trang streetwear dạo phố.",
          "Khả năng biểu cảm đa dạng trước ống kính máy ảnh, tạo dáng tự nhiên, phóng khoáng.",
          "Không kén góc chụp, có khả năng tự phối phụ kiện cơ bản nếu cần."
        ],
        benefits: [
          "Cát-xê đề xuất: 8.000.000đ cho buổi chụp hình 1 ngày.",
          "Được tặng 2 bộ trang phục từ BST Lookbook Mùa Thu sau khi hoàn thành buổi chụp.",
          "Nhận file ảnh gốc chất lượng cao và toàn quyền sử dụng hình ảnh cho portfolio cá nhân."
        ],
        phases: [
          {
            title: "Duyệt Concept & Fitting",
            timeline: "24/09/2026",
            location: "Studio Maison, Tây Hồ, Hà Nội",
            items: [
              "Thử các set đồ thuộc bộ sưu tập streetwear mùa thu.",
              "Thống nhất danh sách phụ kiện đi kèm cho từng layout chụp."
            ]
          },
          {
            title: "Buổi Chụp Lookbook Ngoại Cảnh",
            timeline: "26/09/2026",
            location: "Hồ Tây & Phố cổ Hà Nội",
            items: [
              "Chụp ảnh ngoại cảnh tại các địa điểm thơ mộng quanh Hồ Tây từ sáng sớm.",
              "Hoàn thành chụp tối thiểu 8 set đồ thời trang dạo phố."
            ]
          }
        ],
        address: "Trích Sài, Tây Hồ, Hà Nội",
        phone: "0987.654.321",
        email: "hello@maisonstudio.vn",
        website: "maisonstudio.vn"
      }
    }
  ];

  const [campaigns, setCampaigns] = useState<any[]>(mockCampaigns);

  useEffect(() => {
    let active = true;

    loadTalentCampaigns().then((items) => {
      if (!active || !items?.length) return;
      const mapped = items.map(mapCampaignToTalentJob);
      setCampaigns(mapped);
      setAppliedJobs(mapped.filter((item) => item.hasApplied).map((item) => String(item.id)));
    });

    return () => {
      active = false;
    };
  }, []);

  const handleApply = async (id: string, title: string) => {
    if (appliedJobs.includes(String(id))) return;

    try {
      await applyTalentCampaign(id);
      setCampaigns((prev) => prev.map((campaign) => String(campaign.id) === String(id) ? { ...campaign, hasApplied: true, application: { status: "new" } } : campaign));
      setAppliedJobs((prev) => [...prev, String(id)]);
      addToast(`\u1ee8ng tuy\u1ec3n th\u00e0nh c\u00f4ng c\u00f4ng vi\u1ec7c "${title}"!`);
    } catch (error) {
      console.error(error);
      addToast("Kh\u00f4ng g\u1eedi \u0111\u01b0\u1ee3c \u1ee9ng tuy\u1ec3n l\u00ean backend. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp Talent v\u00e0 th\u1eed l\u1ea1i.", "info");
    }
  };

  const tags = ["T\u1ea5t c\u1ea3", "\u0110\u00e3 \u1ee9ng tuy\u1ec3n", "\u0110ang tuy\u1ec3n"];

  const filteredCampaigns = selectedTag === tags[0]
    ? campaigns
    : selectedTag === tags[1]
    ? campaigns.filter(c => appliedJobs.includes(String(c.id)))
    : campaigns.filter(c => !appliedJobs.includes(String(c.id)));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title block */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Chợ việc làm</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium">Khám phá và ứng tuyển các job sắc đẹp phù hợp nhất với bản thân.</p>
      </div>

      {/* Filter Tabs - Styled to match Admin button filters */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={cn(
              "rounded-xl px-4.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border",
              selectedTag === tag
                ? "bg-[#f4c430] border-amber-400/30 text-slate-950 shadow-[0_4px_12px_rgba(244,196,48,0.2)]"
                : "bg-[#08090f] border-[#151b2d] text-slate-400 hover:text-white hover:bg-white/2"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Campaigns Listing - Premium grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCampaigns.map((camp) => {
          const isApplied = appliedJobs.includes(String(camp.id));
          
          return (
            <div
              key={camp.id}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-[#08090f] border p-6 shadow-xl luxury-card-hover transition-all duration-300",
                camp.borderColor
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", camp.glowColor)} />

              {/* Card Header */}
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider", camp.badgeColor)}>
                      {camp.type === "Runway" ? "Người mẫu sàn diễn" : camp.type}
                    </span>
                    {camp.escrowed && (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                        <ShieldCheck className="h-3 w-3" /> Đã đặt cọc
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-extrabold text-sm text-white mt-2 group-hover:text-amber-400 transition-colors duration-300 leading-snug">{camp.title}</h3>
                  <p className="text-[10px] text-slate-500 font-bold">{camp.brand}</p>
                </div>

                <div className="text-right">
                  <span className="font-display font-extrabold text-sm text-amber-400">{camp.matchScore}%</span>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">AI Match</span>
                </div>
              </div>

              {/* Brief */}
              <p className="text-xs text-slate-400 leading-relaxed mt-4 font-medium relative z-10">{camp.brief}</p>

              {/* Specifications row */}
              <div className="mt-5 border-t border-[#151b2d] pt-3.5 grid grid-cols-2 gap-3 text-[10px] text-slate-400 relative z-10">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Cát-xê đề xuất: <b className="text-white font-mono font-extrabold">{camp.budget}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="truncate font-semibold">{camp.location}</span>
                </div>
              </div>

              {/* Action buttons (Xem chi tiết + Ứng tuyển) */}
              <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                <button
                  onClick={() => setSelectedJob(camp)}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#151b2d] bg-[#08090f]/80 text-slate-300 hover:text-white hover:bg-slate-900/40 hover:border-slate-700/40 text-xs font-bold transition-all duration-300 cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-amber-400" />
                  Xem chi tiết
                </button>
                
                <button
                  onClick={() => handleApply(camp.id, camp.title)}
                  disabled={isApplied}
                  className={cn(
                    "flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold transition-all duration-300 cursor-pointer",
                    isApplied
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
                  )}
                >
                  {isApplied ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Đã ứng tuyển
                    </span>
                  ) : (
                    "Ứng tuyển ngay"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED JOB DIALOG (MODAL) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider", selectedJob.badgeColor)}>
                    {selectedJob.type === "Runway" ? "Người mẫu sàn diễn" : selectedJob.type}
                  </span>
                  {selectedJob.escrowed && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                      <ShieldCheck className="h-3 w-3" /> Đã ký quỹ Escrow
                    </span>
                  )}
                  {appliedJobs.includes(String(selectedJob.id)) && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                      <CheckCircle className="h-3 w-3" /> Đã ứng tuyển
                    </span>
                  )}
                </div>
                <h2 className="font-display font-black text-lg text-white mt-1.5 uppercase leading-tight tracking-tight">
                  {selectedJob.title}
                </h2>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                  Thương hiệu: <span className="text-slate-300">{selectedJob.brand}</span>
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedJob(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body - Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">
              
              {/* Description / Brief */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Info className="h-4 w-4 text-amber-400" /> Mô tả công việc
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-6 font-medium">
                  {selectedJob.brief}
                </p>
              </div>

              {/* Key info columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#050711]/50 border border-[#151b2d] rounded-2xl p-4 text-[10px] text-slate-400">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Cát-xê đề xuất:</b> <span className="text-white font-mono font-bold text-xs">{selectedJob.budget}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Địa điểm làm việc:</b> <span className="text-slate-300">{selectedJob.location}</span></span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Chiều cao tối thiểu:</b> <span className="text-slate-300">{selectedJob.minHeight} cm</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Độ tương thích AI:</b> <span className="text-amber-400 font-bold">{selectedJob.matchScore}%</span></span>
                  </div>
                </div>
              </div>

              {/* Requirements & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2">
                    Yêu cầu tuyển dụng
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-xs font-medium leading-relaxed">
                    {selectedJob.detail.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2">
                    Quyền lợi & Đãi ngộ
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-xs font-medium leading-relaxed">
                    {selectedJob.detail.benefits.map((benefit: string, idx: number) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Brand Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#050711]/50 border border-[#151b2d] rounded-2xl p-4 text-[10px] text-slate-400">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><b>Trụ sở:</b> <span className="text-slate-300">{selectedJob.detail.address}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Hotline Brand:</b> <span className="text-slate-300 font-mono">{selectedJob.detail.phone}</span></span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <span><b>Email liên hệ:</b> <span className="text-slate-300 font-mono">{selectedJob.detail.email}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Website:</b> <a href={`https://${selectedJob.detail.website}`} target="_blank" rel="noreferrer" className="text-amber-300 hover:underline font-mono">{selectedJob.detail.website}</a></span>
                  </div>
                </div>
              </div>

              {/* Timeline Lịch trình tuyển dụng */}
              <div className="space-y-4 pt-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Clock className="h-4 w-4 text-amber-400" /> Quy trình tuyển chọn & Triển khai
                </h4>
                
                {/* Timeline vertical flow */}
                <div className="relative border-l border-[#151b2d] ml-3 pl-6 space-y-6">
                  {selectedJob.detail.phases.map((phase: any, idx: number) => (
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
                          {phase.items.map((item: string, i: number) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2.5 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/2 cursor-pointer transition-colors"
              >
                Đóng lại
              </button>
              
              <button
                onClick={() => {
                  handleApply(selectedJob.id, selectedJob.title);
                }}
                disabled={appliedJobs.includes(String(selectedJob.id))}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-display text-xs font-bold transition-all duration-300 cursor-pointer",
                  appliedJobs.includes(String(selectedJob.id))
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
                )}
              >
                {appliedJobs.includes(String(selectedJob.id)) ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
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
