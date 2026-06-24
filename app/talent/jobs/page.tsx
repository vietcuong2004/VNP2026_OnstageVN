"use client";

import React, { useState, useEffect } from "react";
import {
  Search, MapPin, DollarSign, Sparkles, Filter, ShieldCheck, CheckCircle,
  Eye, X, Info, Clock, Phone, Mail, Globe, MapPinned, AlertCircle,
  ArrowUpRight, Copy, Users, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPONSORSHIP_CATEGORIES } from "@/lib/brand-mvp-data";
import { applyTalentCampaign, loadTalentCampaigns, mapCampaignToTalentJob, resolveCampaignReferralLink, getCampaignReferralLink } from "@/lib/talent-api";
import { getStoredAuthUser } from "@/lib/api-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCodeContainer from "@/components/QR_Code";

type StageFilter = "executing" | "recruiting" | "completed" | "all";

const stageFilterLabels: Record<StageFilter, string> = {
  executing: "Đang tham gia",
  recruiting: "Đang tuyển dụng",
  completed: "Đã hoàn thành",
  all: "Tất cả",
};

function sentenceCaseText(value: string) {
  const text = String(value || "").trim();
  if (!text) return "";

  const firstLetterIndex = text.search(/\p{L}/u);
  if (firstLetterIndex < 0) return text;

  return `${text.slice(0, firstLetterIndex)}${text.charAt(firstLetterIndex).toLocaleUpperCase("vi-VN")}${text.slice(firstLetterIndex + 1)}`;
}

function displayCampaignDate(value?: string | null) {
  if (!value) return "-";

  const raw = String(value);
  const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function readCurrentTalentIdentity() {
  if (typeof window === "undefined") {
    return { userId: "", profileId: "", fallbackId: "tal-1" };
  }

  const user = getStoredAuthUser<{ id?: number | string }>();
  let profileId = "";

  try {
    const storedProfile = window.localStorage.getItem("vnp_talent_profile");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile) as { backendProfileId?: number | string };
      profileId = String(parsed.backendProfileId || "");
    }
  } catch {
    profileId = "";
  }

  return {
    userId: String(user?.id || ""),
    profileId,
    fallbackId: profileId || String(user?.id || "") || "tal-1",
  };
}

export default function JobsPage() {
  const currentTalent = readCurrentTalentIdentity();
  const searchParams = useSearchParams();
  const campaignIdParam = searchParams.get("campaignId");
  const [selectedSponsorshipFilter, setSelectedSponsorshipFilter] = useState("all");
  const [selectedStageFilter, setSelectedStageFilter] = useState<StageFilter>("all");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" }[]>([]);
  const [displayJobs, setDisplayJobs] = useState<any[]>([]);
  const [pastedUrl, setPastedUrl] = useState("");
  const [activeReferralLink, setActiveReferralLink] = useState<{ [campId: string]: any }>({});
  const [loadingReferral, setLoadingReferral] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<any>(null);

  const handleInviteClick = async (camp: any) => {
    setLoadingReferral(camp.id);
    try {
      const res = await getCampaignReferralLink(camp.id);
      setActiveReferralLink(prev => ({ ...prev, [camp.id]: res }));
      setShowInviteModal(camp);
    } catch (err) {
      console.warn("Error getting referral link:", err);
      setActiveReferralLink(prev => ({ ...prev, [camp.id]: null }));
      setShowInviteModal(camp);
      addToast("Chưa tạo được link giới thiệu campaign. Vui lòng thử lại sau.", "info");
    } finally {
      setLoadingReferral(null);
    }
  };

  const handleCopyLink = (url: string) => {
    if (!url) {
      addToast("Link giới thiệu chưa sẵn sàng. Vui lòng thử lại sau.", "info");
      return;
    }
    navigator.clipboard.writeText(url);
    addToast("Đã sao chép link giới thiệu vào bộ nhớ tạm!", "success");
  };

  const getSplitBudgetLabel = (budgetStr: string) => {
    const matchNums = budgetStr.match(/\d+([\.\,]\d+)*/g);
    if (matchNums && matchNums.length > 0) {
      const minVal = parseInt(matchNums[0].replace(/[\.\,]/g, ""));
      const splitVal = minVal / 2;
      return `${splitVal.toLocaleString("vi-VN")}đ`;
    }
    return "10.000.000đ";
  };

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const normalizeJobStage = (status?: string | null) => {
    if (!status) return "";
    if (status === "pending") return "new";
    if (status === "approved") return "accepted";
    return status;
  };

  const getTalentJobStage = (job: any) => {
    const backendStage = normalizeJobStage(job.application?.status);
    if (backendStage) return backendStage;

    const appItem = job.applicants?.find((a: any) => {
      const talentId = String(a.talentId || a.profileId || a.userId || "");
      return talentId === currentTalent.profileId || talentId === currentTalent.userId || talentId === currentTalent.fallbackId;
    });
    return normalizeJobStage(appItem?.stage) || "";
  };

  const hasTalentApplication = (job: any) => {
    return Boolean(
      job.hasApplied
      || job.application
      || job.applicants?.some((a: any) => {
        const talentId = String(a.talentId || a.profileId || a.userId || "");
        return talentId === currentTalent.profileId || talentId === currentTalent.userId || talentId === currentTalent.fallbackId;
      })
    );
  };

  useEffect(() => {
    setShowAllBenefits(false);
  }, [selectedJob?.id]);

  useEffect(() => {
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
        sponsorships: [
          { category: "Tài trợ Trang điểm (Makeup)", details: "Cung cấp trọn gói dịch vụ trang điểm chuyên nghiệp tại studio." },
          { category: "Tài trợ Mỹ phẩm dưỡng da", details: "Tặng bộ kit mỹ phẩm dưỡng da Glow Beauty trị giá 5.000.000đ." }
        ],
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
                "Thử thách kỹ năng xử lý tình huống trực tiếp trên sóng livestream giải lập."
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
        sponsorships: [
          { category: "Tài trợ Trang phục dạ hội", details: "Cung cấp đầm dạ hội may đo thiết kế Haute Couture." },
          { category: "Tài trợ Khách sạn/Lưu trú VIP", details: "Đài thọ phòng nghỉ Deluxe tại khách sạn 5 sao." }
        ],
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
        sponsorships: [
          { category: "Tài trợ Trang sức cao cấp", details: "Bảo đảm đeo bộ trang sức kim cương trị giá 5 tỷ đồng." },
          { category: "Tài trợ Làm tóc (Hair Styling)", details: "Hỗ trợ làm tóc từ chuyên gia làm tóc riêng." }
        ],
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
                "Check-in thảm đỏ, chụp ảnh PR with trang sức kim cương của thương hiệu.",
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
        sponsorships: [
          { category: "Tài trợ Trang phục thường ngày", details: "Tặng 2 bộ streetwear thời trang dạo phố mùa thu." },
          { category: "Tài trợ Chụp ảnh & Studio", details: "Hỗ trợ chụp hình miễn phí từ nhiếp ảnh gia nổi tiếng." }
        ],
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

    loadTalentCampaigns().then((items) => {
      if (!items?.length) {
        setDisplayJobs(mockCampaigns);
        return;
      }

      const backendJobs = items.map(mapCampaignToTalentJob);
      setDisplayJobs(backendJobs);
      const backendAppliedIds = backendJobs.filter((job) => job.hasApplied).map((job) => String(job.id));
      setAppliedJobs((prev) => {
        const next = Array.from(new Set([...prev, ...backendAppliedIds]));
        return next.length === prev.length ? prev : next;
      });
    }).catch((error) => {
      console.warn("Cannot load talent campaigns from backend", error);
      setDisplayJobs(mockCampaigns);
    });
  }, []);

  useEffect(() => {
    if (!campaignIdParam || !displayJobs.length) return;

    const invitedJob = displayJobs.find((job) => String(job.id) === String(campaignIdParam));
    if (invitedJob) {
      setSelectedJob((current: any) => (
        String(current?.id) === String(invitedJob.id) ? current : invitedJob
      ));
    }
  }, [campaignIdParam, displayJobs]);

  const handleApply = async (id: string, title: string) => {
    if (appliedJobs.includes(id)) return;

    if (/^\d+$/.test(String(id))) {
      try {
        await applyTalentCampaign(id, "Tôi rất quan tâm và mong muốn ứng tuyển thực hiện chiến dịch này.");
        setDisplayJobs((prev) => prev.map((job) => (
          String(job.id) === String(id)
            ? { ...job, hasApplied: true, application: { ...(job.application || {}), status: "new" } }
            : job
        )));
      } catch (error) {
        console.warn("Cannot apply campaign from backend", error);
        addToast("Chưa gửi được ứng tuyển lên backend. Vui lòng thử lại.", "info");
        return;
      }
    }

    setAppliedJobs((prev) => [...prev, id]);
    addToast(`Ứng tuyển thành công công việc "${title}"!`);
  };

  const handleUpdateStage = (jobId: string, nextStage: string) => {
    setDisplayJobs(prevJobs => prevJobs.map(job => {
      if (String(job.id) !== String(jobId)) return job;

      return {
        ...job,
        application: job.application ? { ...job.application, status: nextStage } : job.application,
        applicants: (job.applicants || []).map((a: any) =>
          String(a.talentId || a.profileId || a.userId || "") === currentTalent.fallbackId ? { ...a, stage: nextStage } : a
        )
      };
    }));

    if (selectedJob && String(selectedJob.id) === String(jobId)) {
      setSelectedJob((prev: any) => ({
        ...prev,
        application: prev.application ? { ...prev.application, status: nextStage } : prev.application,
        applicants: (prev.applicants || []).map((a: any) =>
          String(a.talentId || a.profileId || a.userId || "") === currentTalent.fallbackId ? { ...a, stage: nextStage } : a
        )
      }));
    }

    if (nextStage === "executing") {
      addToast("Bắt đầu thực hiện job (Check-in thành công)!", "success");
    } else if (nextStage === "completed") {
      addToast("Đã báo cáo hoàn thành job (Chờ nghiệm thu)!", "success");
    }
  };

  const handleJoinCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl) return;

    try {
      let urlStr = pastedUrl.trim();
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }

      const urlObj = new URL(urlStr);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      const refId = searchParams.get("ref") || "";

      if (!pathname.includes("/campaign/")) {
        addToast("Đường dẫn không chứa '/campaign/'. Vui lòng dán đúng link Affiliate.", "info");
        return;
      }

      const pathParts = pathname.split("/campaign/");
      const campaignPart = pathParts[pathParts.length - 1];

      let campaignId = campaignPart.split("-").slice(-2).join("-") === "camp-1" ||
        campaignPart.split("-").slice(-2).join("-") === "camp-2" ||
        campaignPart.split("-").slice(-2).join("-") === "camp-3" ||
        campaignPart.split("-").slice(-2).join("-") === "camp-4"
        ? campaignPart.split("-").slice(-2).join("-")
        : campaignPart.split("-").pop() || "";

      if (campaignId === "c1") campaignId = "camp-1";
      if (campaignId === "c2") campaignId = "camp-2";
      if (campaignId === "c3") campaignId = "camp-3";
      if (campaignId === "c4") campaignId = "camp-4";

      if (refId) {
        try {
          const resolved = await resolveCampaignReferralLink(refId);
          const resolvedCampaignId = resolved?.campaign?.id || resolved?.campaign_id || campaignId;

          if (resolvedCampaignId) {
            await applyTalentCampaign(resolvedCampaignId, "Đăng ký tham gia qua link giới thiệu Affiliate.", refId);

            const refreshed = await loadTalentCampaigns();
            if (refreshed?.length) {
              const backendJobs = refreshed.map(mapCampaignToTalentJob);
              setDisplayJobs(backendJobs);
              const backendAppliedIds = backendJobs.filter((job) => job.hasApplied).map((job) => String(job.id));
              setAppliedJobs((prev) => Array.from(new Set([...prev, ...backendAppliedIds])));
            }

            setPastedUrl("");
            const referrerName = resolved?.referrer?.name || resolved?.owner?.name || "KOL đối tác";
            addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
            return;
          }
        } catch (error) {
          console.warn("Cannot apply campaign referral via backend", error);
          if (/^\d+$/.test(String(campaignId))) {
            addToast(error instanceof Error ? error.message : "Không thể đăng ký campaign qua link backend.", "info");
            return;
          }
        }
      }

      const allCampaigns = displayJobs;
      const targetCamp = allCampaigns.find(c => c.id === campaignId);
      if (!targetCamp) {
        addToast("Không tìm thấy chiến dịch trong dữ liệu hệ thống.", "info");
        return;
      }

      if (hasTalentApplication(targetCamp)) {
        addToast("Bạn đã ứng tuyển hoặc đang tham gia chiến dịch này rồi.", "info");
        return;
      }

      const updatedCampaigns = allCampaigns.map(c => {
        const matchesCurrentId = c.id === campaignId;
        const matchesMockId1 = (campaignId === "camp-1" && c.id === "c1") || (campaignId === "c1" && c.id === "camp-1");
        const matchesMockId2 = (campaignId === "camp-2" && c.id === "c2") || (campaignId === "c2" && c.id === "camp-2");
        const matchesMockId3 = (campaignId === "camp-3" && c.id === "c3") || (campaignId === "c3" && c.id === "camp-3");
        const matchesMockId4 = (campaignId === "camp-4" && c.id === "c4") || (campaignId === "c4" && c.id === "camp-4");

        if (matchesCurrentId || matchesMockId1 || matchesMockId2 || matchesMockId3 || matchesMockId4) {
          const apps = c.applicants || [];
          return {
            ...c,
            hasApplied: true,
            application: { ...(c.application || {}), status: "approved" },
            applicants: [
              ...apps,
              {
                talentId: "tal-1",
                stage: "approved" as const,
                note: "Đăng ký tham gia qua link giới thiệu Affiliate của đối tác.",
                referredByTalentId: refId || undefined
              }
            ]
          };
        }
        return c;
      });
      setDisplayJobs(updatedCampaigns);
      setAppliedJobs((prev) => [...prev, campaignId]);
      setPastedUrl("");

      const referrerName = "KOL đối tác";
      addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
    } catch (err) {
      try {
        let urlStr = pastedUrl.trim();
        if (urlStr.includes("campaign/")) {
          const parts = urlStr.split("campaign/");
          const rightPart = parts[parts.length - 1];
          const cleanPart = rightPart.split("?")[0];
          const queryPart = rightPart.includes("?") ? rightPart.split("?")[1] : "";

          let campaignId = cleanPart.split("-").slice(-2).join("-") === "camp-1" ||
            cleanPart.split("-").slice(-2).join("-") === "camp-2" ||
            cleanPart.split("-").slice(-2).join("-") === "camp-3" ||
            cleanPart.split("-").slice(-2).join("-") === "camp-4"
            ? cleanPart.split("-").slice(-2).join("-")
            : cleanPart.split("-").pop() || "";

          if (campaignId === "c1") campaignId = "camp-1";
          if (campaignId === "c2") campaignId = "camp-2";
          if (campaignId === "c3") campaignId = "camp-3";
          if (campaignId === "c4") campaignId = "camp-4";

          const queryParams = new URLSearchParams(queryPart);
          const refId = queryParams.get("ref") || "";

          const allCampaigns = displayJobs;
          const targetCamp = allCampaigns.find(c => c.id === campaignId);
          if (!targetCamp) {
            addToast("Không tìm thấy chiến dịch trong dữ liệu hệ thống.", "info");
            return;
          }

          if (hasTalentApplication(targetCamp)) {
            addToast("Bạn đã ứng tuyển hoặc đang tham gia chiến dịch này rồi.", "info");
            return;
          }

          const updatedCampaigns = allCampaigns.map(c => {
            const matchesCurrentId = c.id === campaignId;
            const matchesMockId1 = (campaignId === "camp-1" && c.id === "c1") || (campaignId === "c1" && c.id === "camp-1");
            const matchesMockId2 = (campaignId === "camp-2" && c.id === "c2") || (campaignId === "c2" && c.id === "camp-2");
            const matchesMockId3 = (campaignId === "camp-3" && c.id === "c3") || (campaignId === "c3" && c.id === "camp-3");
            const matchesMockId4 = (campaignId === "camp-4" && c.id === "c4") || (campaignId === "c4" && c.id === "camp-4");

            if (matchesCurrentId || matchesMockId1 || matchesMockId2 || matchesMockId3 || matchesMockId4) {
              const apps = c.applicants || [];
              return {
                ...c,
                hasApplied: true,
                application: { ...(c.application || {}), status: "approved" },
                applicants: [
                  ...apps,
                  {
                    talentId: "tal-1",
                    stage: "approved" as const,
                    note: "Đăng ký tham gia qua link giới thiệu Affiliate của đối tác.",
                    referredByTalentId: refId || undefined
                  }
                ]
              };
            }
            return c;
          });
          setDisplayJobs(updatedCampaigns);
          setAppliedJobs((prev) => [...prev, campaignId]);
          setPastedUrl("");

          const referrerName = "KOL đối tác";
          addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
          return;
        }
      } catch (e) { }

      addToast("Đường dẫn không hợp lệ. Vui lòng kiểm tra lại.", "info");
    }
  };

  const filteredCampaigns = displayJobs.filter((camp) => {
    // 1. Sponsorship filter
    let matchesSponsorship = true;
    if (selectedSponsorshipFilter === "any") {
      matchesSponsorship = camp.sponsorships && camp.sponsorships.length > 0;
    } else if (selectedSponsorshipFilter !== "all") {
      const selectedCat = SPONSORSHIP_CATEGORIES.find((c: { id: string, label: string }) => c.id === selectedSponsorshipFilter);
      matchesSponsorship = camp.sponsorships && camp.sponsorships.some((s: { category: string }) =>
        s.category.toLowerCase().includes(selectedCat?.label.toLowerCase() || "") ||
        s.category.toLowerCase().includes(selectedSponsorshipFilter.toLowerCase())
      );
    }

    // 2. Stage filter — based on tal-1’s applicant stage in this campaign
    let matchesStage = true;
    if (selectedStageFilter !== "all") {
      const stage = getTalentJobStage(camp);
      const applied = hasTalentApplication(camp);
      if (selectedStageFilter === "executing") {
        matchesStage = (stage === "executing" || stage === "accepted");
      } else if (selectedStageFilter === "recruiting") {
        matchesStage = (!applied || stage === "new");
      } else if (selectedStageFilter === "completed") {
        matchesStage = (stage === "completed" || stage === "confirmed");
      }
    }

    return matchesSponsorship && matchesStage;
  });

  const stageFilterOptions: StageFilter[] = ["all", "executing", "recruiting", "completed"];

  // Count jobs per stage for displaying badge counts
  const stageCounts = stageFilterOptions.reduce((acc, sf) => {
    acc[sf] = displayJobs.filter((camp) => {
      if (sf === "all") return true;
      const stage = getTalentJobStage(camp);
      const applied = hasTalentApplication(camp);
      if (sf === "executing") {
        return stage === "executing" || stage === "accepted";
      }
      if (sf === "recruiting") {
        return !applied || stage === "new";
      }
      if (sf === "completed") {
        return stage === "completed" || stage === "confirmed";
      }
      return false;
    }).length;
    return acc;
  }, {} as Record<StageFilter, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Title block */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Chợ việc làm</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium">Khám phá và ứng tuyển các job sắc đẹp phù hợp nhất với bản thân.</p>
      </div>

      {/* Tham gia qua link giới thiệu */}
      <div className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-[#0c0f1d] to-[#07080e] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col gap-4 relative z-10 w-full text-left">
          <div className="space-y-1">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              Tham gia qua link giới thiệu
            </h2>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl">
              Dán đường dẫn Affiliate nhận từ đối tác (F1) để tham gia trực tiếp chiến dịch với vai trò F2 và nhận 70% cát-xê.
            </p>
          </div>

          <form onSubmit={handleJoinCampaign} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="Dán link chiến dịch tại đây..."
                className="w-full bg-slate-950/80 border border-amber-500/35 hover:border-amber-500/60 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none pr-10 min-w-0 transition-all"
              />
              {pastedUrl && (
                <button
                  type="button"
                  onClick={() => setPastedUrl("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] uppercase font-bold"
                >
                  Xóa
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!pastedUrl.trim()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 px-6 text-xs font-black uppercase tracking-wider transition-all hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Tham gia ngay <ArrowUpRight className="h-4 w-4 text-slate-950" />
            </button>
          </form>
        </div>
      </div>

      {/* Filter Tabs - same amber style as brand campaigns page */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {stageFilterOptions.map((sf) => {
          const count = stageCounts[sf];
          return (
            <button
              key={sf}
              onClick={() => setSelectedStageFilter(sf)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border flex items-center gap-1.5",
                selectedStageFilter === sf
                  ? "bg-[#f4c430] border-amber-400/30 text-slate-950 shadow-[0_4px_12px_rgba(244,196,48,0.2)]"
                  : "bg-[#08090f] border-[#151b2d] text-slate-400 hover:text-white hover:bg-white/2"
              )}
            >
              {stageFilterLabels[sf]}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-black min-w-[18px] text-center",
                  selectedStageFilter === sf ? "bg-black/20" : "bg-white/5 text-slate-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sponsorship Filter
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[#08090f] border border-[#151b2d] rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Lọc theo Hạng mục tài trợ:</span>
        </div>
        <select
          value={selectedSponsorshipFilter}
          onChange={(e) => setSelectedSponsorshipFilter(e.target.value)}
          className="w-full sm:w-64 bg-[#050711] border border-[#151b2d] rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
        >
          <option value="all">Tất cả hạng mục</option>
          <option value="any">🎁 Có bất kỳ tài trợ nào</option>
          {SPONSORSHIP_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              🎁 {cat.label}
            </option>
          ))}
        </select>
      </div> */}

      {/* Campaigns Listing - Premium grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCampaigns.map((camp) => {
          const isApplied = appliedJobs.includes(camp.id) || hasTalentApplication(camp);

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
                    {(() => {
                      const stage = getTalentJobStage(camp);
                      const applied = hasTalentApplication(camp);

                      let label = "Đang tuyển dụng";
                      let colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";

                      if (stage === "completed" || stage === "confirmed") {
                        label = "Đã hoàn thành";
                        colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                      } else if (stage === "executing" || stage === "accepted") {
                        label = "Đang tham gia";
                        colorClass = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                      } else if (stage === "new" || (applied && !stage)) {
                        label = "Chờ duyệt hồ sơ";
                        colorClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
                      }

                      return (
                        <span className={cn("rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider", colorClass)}>
                          {label}
                        </span>
                      );
                    })()}
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

              {/* Sponsorship Badges */}
              {camp.sponsorships && camp.sponsorships.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
                  {camp.sponsorships.map((spons: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-400/5 border border-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-400"
                    >
                      🎁 {spons.category}
                    </span>
                  ))}
                </div>
              )}

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

                {(() => {
                  if (!isApplied) {
                    return (
                      <button
                        onClick={() => handleApply(camp.id, camp.title)}
                        className="flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer"
                      >
                        Ứng tuyển ngay
                      </button>
                    );
                  }

                  const stage = getTalentJobStage(camp) || "new";

                  if (stage === "new") {
                    return (
                      <button
                        disabled
                        className="flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-not-allowed"
                      >
                        Chờ duyệt hồ sơ
                      </button>
                    );
                  }
                  if (stage === "accepted") {
                    return (
                      <button
                        onClick={() => handleUpdateStage(camp.id, "executing")}
                        className="flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer"
                      >
                        Bắt đầu tham gia
                      </button>
                    );
                  }
                  if (stage === "executing") {
                    return (
                      <button
                        onClick={() => handleUpdateStage(camp.id, "completed")}
                        className="flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer"
                      >
                        Báo cáo hoàn thành
                      </button>
                    );
                  }
                  if (stage === "completed") {
                    return (
                      <button
                        disabled
                        className="flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 cursor-not-allowed"
                      >
                        Đang chờ nghiệm thu
                      </button>
                    );
                  }
                  return (
                    <button
                      disabled
                      className="flex h-11 items-center justify-center rounded-xl font-display text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                    >
                      Thành công (Đã rút ví)
                    </button>
                  );
                })()}
              </div>

              <button
                onClick={() => {
                  if (isApplied) {
                    handleInviteClick(camp);
                  } else {
                    addToast("Vui lòng ứng tuyển chiến dịch trước khi mời thành viên khác.", "info");
                  }
                }}
                disabled={loadingReferral === camp.id}
                className={cn(
                  "mt-3 flex w-full h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer relative z-10",
                  isApplied
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                    : "border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <UserPlus className="h-4 w-4 text-amber-400" />
                {loadingReferral === camp.id ? "Đang lấy link..." : "Mời tham gia (Affiliate)"}
              </button>
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
                  {(() => {
                    const stage = getTalentJobStage(selectedJob);
                    const applied = hasTalentApplication(selectedJob);

                    let label = "Đang tuyển dụng";
                    let colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";

                    if (stage === "completed" || stage === "confirmed") {
                      label = "Đã hoàn thành";
                      colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                    } else if (stage === "executing" || stage === "accepted") {
                      label = "Đang tham gia";
                      colorClass = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                    } else if (stage === "new" || (applied && !stage)) {
                      label = "Chờ duyệt hồ sơ";
                      colorClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
                    }

                    return (
                      <span className={cn("rounded border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider", colorClass)}>
                        {label}
                      </span>
                    );
                  })()}
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
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><b>Độ tương thích AI:</b> <span className="text-amber-400 font-bold">{selectedJob.matchScore}%</span></span>
                  </div>
                </div>
              </div>

              {(selectedJob.type || selectedJob.eventName || selectedJob.eventDate || selectedJob.startDate || selectedJob.endDate || selectedJob.applicationDeadline || selectedJob.deadline || selectedJob.venueName || selectedJob.venueAddress || selectedJob.roles?.length > 0 || selectedJob.targetProfiles?.length > 0 || selectedJob.industries?.length > 0 || selectedJob.responsibilities?.length > 0 || selectedJob.contactNote) && (
                <div className="space-y-3 rounded-2xl border border-[#151b2d] bg-[#050711]/50 p-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thông tin tuyển chọn</h4>
                  <div className="grid grid-cols-1 gap-3 text-[10px] text-slate-400 sm:grid-cols-2">
                    {selectedJob.type && <span><b>Loại chiến dịch:</b> <span className="text-slate-200">{selectedJob.type}</span></span>}
                    {selectedJob.eventName && <span><b>Sự kiện:</b> <span className="text-slate-200">{selectedJob.eventName}</span></span>}
                    <span><b>Bắt đầu campaign:</b> <span className="text-slate-200">{displayCampaignDate(selectedJob.startDate)}</span></span>
                    <span><b>Kết thúc campaign:</b> <span className="text-slate-200">{displayCampaignDate(selectedJob.endDate)}</span></span>
                    {(selectedJob.eventDate || selectedJob.startDate) && <span><b>Sự kiện chính:</b> <span className="text-slate-200">{displayCampaignDate(selectedJob.eventDate || selectedJob.startDate)}</span></span>}
                    {(selectedJob.applicationDeadline || selectedJob.deadline) && <span><b>Hạn ứng tuyển:</b> <span className="text-slate-200">{displayCampaignDate(selectedJob.applicationDeadline || selectedJob.deadline)}</span></span>}
                    {selectedJob.venueName && <span><b>Địa điểm:</b> <span className="text-slate-200">{selectedJob.venueName}</span></span>}
                    {selectedJob.venueAddress && <span><b>Địa chỉ:</b> <span className="text-slate-200">{selectedJob.venueAddress}</span></span>}
                  </div>
                  {selectedJob.roles?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Vị trí tuyển</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.roles.map((role: string, idx: number) => (
                          <span key={`${role}-${idx}`} className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedJob.targetProfiles?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Nhóm phù hợp</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.targetProfiles.map((profile: string, idx: number) => (
                          <span key={`${profile}-${idx}`} className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                            {profile}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedJob.industries?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Lĩnh vực</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.industries.map((industry: string, idx: number) => (
                          <span key={`${industry}-${idx}`} className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedJob.responsibilities?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Đầu việc chính</p>
                      <ul className="list-disc space-y-1 pl-4 text-[10px] leading-relaxed text-slate-400">
                        {selectedJob.responsibilities.slice(0, 5).map((item: string, idx: number) => (
                          <li key={`${item}-${idx}`}>{sentenceCaseText(item)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedJob.contactNote && (
                    <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-[10px] leading-relaxed text-slate-300">
                      <b className="text-amber-300">Ghi chú ứng tuyển:</b> {selectedJob.contactNote}
                    </div>
                  )}
                </div>
              )}

              {(selectedJob.coverUrl || selectedJob.media?.length > 0) && (
                <div className="space-y-3 rounded-2xl border border-[#151b2d] bg-[#050711]/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Hình ảnh chiến dịch
                    </h4>
                    {selectedJob.coverUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(selectedJob.coverUrl)}
                        className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[9px] font-black uppercase text-amber-300 hover:bg-amber-400/20"
                      >
                        Xem ảnh lớn
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {selectedJob.coverUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(selectedJob.coverUrl)}
                        className="h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-amber-400/30 bg-black hover:border-amber-300 sm:h-36 sm:w-28"
                      >
                        <img src={selectedJob.coverUrl} alt={selectedJob.title} className="h-full w-full object-cover" />
                      </button>
                    )}
                    {(selectedJob.media || [])
                      .filter((media: any) => media.url && media.url !== selectedJob.coverUrl)
                      .map((media: any, idx: number) => (
                        <button
                          type="button"
                          key={`${media.id || media.url || idx}`}
                          onClick={() => setPreviewImageUrl(media.url)}
                          className="h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-[#151b2d] bg-black hover:border-amber-400/60 sm:h-36 sm:w-28"
                        >
                          <img src={media.url} alt={media.caption || selectedJob.title} className="h-full w-full object-cover" />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Sponsorships Section */}
              {selectedJob.sponsorships && selectedJob.sponsorships.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-amber-400" /> Cam kết tài trợ từ Brand
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    {selectedJob.sponsorships.map((spons: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#050711] border border-amber-400/20 rounded-xl p-3.5 space-y-1.5 shadow-[0_0_15px_rgba(244,196,48,0.01)] hover:border-amber-400/40 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <span>🎁</span>
                          <span>{spons.category}</span>
                        </div>
                        {spons.details && (
                          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            {sentenceCaseText(spons.details)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2">
                    Yêu cầu tuyển dụng
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-xs font-medium leading-relaxed">
                    {selectedJob.detail.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{sentenceCaseText(req)}</li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2">
                    Quyền lợi & Đãi ngộ
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-xs font-medium leading-relaxed">
                    {(showAllBenefits ? selectedJob.detail.benefits : selectedJob.detail.benefits.slice(0, 5)).map((benefit: string, idx: number) => (
                      <li key={idx}>{sentenceCaseText(benefit)}</li>
                    ))}
                  </ul>
                  {selectedJob.detail.benefits.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllBenefits((current) => !current)}
                      className="text-[10px] font-black uppercase tracking-wider text-amber-300 transition-colors hover:text-amber-200"
                    >
                      {showAllBenefits ? "Thu gọn" : `Xem thêm ${selectedJob.detail.benefits.length - 5} phúc lợi`}
                    </button>
                  )}
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

              {(() => {
                const isApplied = appliedJobs.includes(selectedJob.id) || hasTalentApplication(selectedJob);
                if (!isApplied) {
                  return (
                    <button
                      onClick={() => handleApply(selectedJob.id, selectedJob.title)}
                      className="px-6 py-2.5 rounded-xl font-display text-xs font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer"
                    >
                      Ứng tuyển ngay
                    </button>
                  );
                }

                const stage = getTalentJobStage(selectedJob) || "new";

                if (stage === "new") {
                  return (
                    <button
                      disabled
                      className="px-6 py-2.5 rounded-xl font-display text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-not-allowed"
                    >
                      Chờ duyệt hồ sơ
                    </button>
                  );
                }
                if (stage === "accepted") {
                  return (
                    <button
                      onClick={() => handleUpdateStage(selectedJob.id, "executing")}
                      className="px-6 py-2.5 rounded-xl font-display text-xs font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer"
                    >
                      Bắt đầu tham gia
                    </button>
                  );
                }
                if (stage === "executing") {
                  return (
                    <button
                      onClick={() => handleUpdateStage(selectedJob.id, "completed")}
                      className="px-6 py-2.5 rounded-xl font-display text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer"
                    >
                      Báo cáo hoàn thành
                    </button>
                  );
                }
                if (stage === "completed") {
                  return (
                    <button
                      disabled
                      className="px-6 py-2.5 rounded-xl font-display text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 cursor-not-allowed"
                    >
                      Đang chờ nghiệm thu
                    </button>
                  );
                }
                return (
                  <button
                    disabled
                    className="px-6 py-2.5 rounded-xl font-display text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                  >
                    Thành công (Đã rút ví)
                  </button>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* INVITATION AFFILIATE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-[#08090f] border border-[#D4A64A]/30 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-5 sm:p-6 space-y-6 animate-in zoom-in-95 duration-300 scrollbar-thin">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowInviteModal(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Grid for two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Affiliate Link & referred users */}
              <div className="space-y-6 text-left">
                {/* Modal Header */}
                <div className="relative pr-8 space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-base sm:text-lg text-white uppercase leading-tight tracking-tight">
                      {showInviteModal.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                      THƯƠNG HIỆU: <span className="text-slate-300">{showInviteModal.brand}</span>
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 text-[9px] font-black uppercase text-amber-300 tracking-wider">
                      Cát-xê chia đều: {getSplitBudgetLabel(showInviteModal.budget)}
                    </span>
                  </div>
                </div>

                {/* Link & referrals generator */}
                {(() => {
                  const url = activeReferralLink[showInviteModal.id]?.url || "";
                  const referrals = showInviteModal.referrals || [];
                  const commission = 500000;

                  return (
                    <>
                      {/* Affiliate Link Container */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          LINK AFFILIATE GIỚI THIỆU (CAMPAIGN)
                        </p>
                        <div className="flex items-center gap-3 bg-[#03050c] border border-[#151b2d] rounded-xl p-2.5 min-w-0">
                          <span className="text-xs text-[#F0C56B] font-mono select-all truncate flex-1 pl-1 min-w-0">
                            {url || "Chưa tạo liên kết giới thiệu"}
                          </span>
                          <button
                            onClick={() => handleCopyLink(url)}
                            disabled={!url}
                            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-gold text-slate-950 px-3 sm:px-4 text-xs font-black uppercase tracking-widest transition hover:brightness-110 active:scale-[0.98] cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          * Mẹo: Chia sẻ link này cho các KOL/KOC trong network của bạn. Khi họ đăng ký & được duyệt, bạn nhận ngay 5% hoa hồng từ việc làm của họ.
                        </p>
                      </div>

                      {/* List of referred users */}
                      <div className="space-y-3.5 border-t border-[#151b2d] pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Users className="h-4.5 w-4.5 text-amber-400 shrink-0" /> KOL F2 được bạn mời ({referrals.length})
                          </h4>
                          {referrals.length > 0 && (
                            <span className="self-start sm:self-auto rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[9px] font-black uppercase text-amber-300">
                              Hoa hồng từ campaign: +{(referrals.length * commission).toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>

                        {referrals.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 text-xs font-medium">
                            Bạn chưa mời ai tham gia chiến dịch này. Hãy chia sẻ link trên để nhận 5% hoa hồng!
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                            {referrals.map((item: any, idx: number) => {
                              const name = item.profile?.display_name || item.profile?.user?.name || "KOL F2";
                              const avatar = item.profile?.user?.external_avatar_url || item.profile?.logo_url || "";
                              const status = item.status || "new";

                              let statusText = "CHỜ DUYỆT (F2)";
                              let statusColor = "text-amber-400 bg-amber-400/10 border-amber-400/20";
                              if (status === "accepted" || status === "executing") {
                                statusText = "ĐANG THAM GIA (F2)";
                                statusColor = "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
                              } else if (status === "completed" || status === "confirmed") {
                                statusText = "HOÀN THÀNH (F2)";
                                statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                              }

                              return (
                                <div
                                  key={item.id || idx}
                                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 animate-in fade-in duration-200"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-900 border border-[#D4A64A]/30 shrink-0">
                                      {avatar ? (
                                        <img src={avatar} alt={name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-black uppercase text-amber-300">
                                          {name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-xs font-black text-white truncate max-w-[120px] sm:max-w-none">{name}</span>
                                        <span className="rounded bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 text-[8px] font-black uppercase text-cyan-300 whitespace-nowrap">
                                          KOL F2
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-[#F0C56B] font-bold mt-1 whitespace-nowrap">
                                        Hoa hồng giới thiệu: +{commission.toLocaleString("vi-VN")}đ
                                      </p>
                                    </div>
                                  </div>

                                  <span className={cn("rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider self-start sm:self-auto shrink-0", statusColor)}>
                                    {statusText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Right Column: QR Code Container */}
              <div className="flex flex-col justify-center">
                {(() => {
                  const url = activeReferralLink[showInviteModal.id]?.url || "";
                  return (
                    <QRCodeContainer
                      campaignLink={url}
                      title="Mã QR Tuyển Dụng"
                      subtitle="Quét mã để tham gia ngay"
                      badgeText="Affiliate QR Code"
                      shareButtonLabel="Chia sẻ"
                      onCopyLink={() => handleCopyLink(url)}
                      className="border-[#D4A64A]/20 bg-gradient-to-br from-[#1a1305]/40 via-[#070913]/80 to-[#070913]/90 shadow-[0_8px_30px_rgba(212,166,74,0.05)]"
                    />
                  );
                })()}
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="flex justify-end pt-4 border-t border-[#151b2d]">
              <button
                onClick={() => setShowInviteModal(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#151b2d] bg-[#050711] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/2 cursor-pointer transition-colors"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

      {previewImageUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-3">
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={previewImageUrl} alt="Campaign preview" className="max-h-full max-w-full object-contain" />
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
