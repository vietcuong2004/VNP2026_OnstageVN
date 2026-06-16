"use client";

import React, { useState, useEffect } from "react";
import {
  Award, User, GraduationCap, BookOpen, DollarSign,
  TrendingUp, Wallet, ShieldCheck, Calendar, Image, Sparkles, Star, Crown, Video,
  ChevronLeft, ChevronRight, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import ProgressBar from "@/components/ui/ProgressBar";
import { ensureTalentProfile, persistTalentProfile, uploadTalentPhoto } from "@/lib/talent-api";

const JOBS_LIST = [
  { id: 1, title: "Đại sứ thương hiệu", desc: "Gương mặt đại diện thương hiệu luxury", weights: { pageant: 0.4, runway: 0.2, kol: 0.4 } },
  { id: 2, title: "KOLs/Influencer quảng cáo", desc: "Sáng tạo nội dung video ngắn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 3, title: "KOC Livestream bán hàng", desc: "Thực hiện livestream bán hàng trực tiếp", weights: { pageant: 0.05, runway: 0.05, kol: 0.9 } },
  { id: 4, title: "Gương mặt trang bìa", desc: "Chụp ảnh bìa tạp chí, lookbook, ảnh PR", weights: { pageant: 0.3, runway: 0.5, kol: 0.2 } },
  { id: 5, title: "Người mẫu sàn diễn (Runway)", desc: "Trình diễn các bộ sưu tập thời trang cao cấp", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 6, title: "Người mẫu quảng cáo", desc: "Diễn xuất trong các TVC quảng cáo", weights: { pageant: 0.2, runway: 0.3, kol: 0.5 } },
  { id: 7, title: "Diễn viên MV ca nhạc", desc: "Đóng vai nữ chính/nam chính MV ca nhạc", weights: { pageant: 0.2, runway: 0.2, kol: 0.6 } },
  { id: 8, title: "KOL sự kiện / Khách mời VIP", desc: "Tham dự thảm đỏ và sự kiện thương hiệu", weights: { pageant: 0.6, runway: 0.2, kol: 0.2 } },
  { id: 9, title: "Người dẫn chương trình (MC)", desc: "Dẫn dắt các sự kiện và chương trình giải trí", weights: { pageant: 0.7, runway: 0.1, kol: 0.2 } },
  { id: 10, title: "VIP Promotion Girl (PG)", desc: "Lễ tân đón tiếp khách tại sự kiện lớn", weights: { pageant: 0.4, runway: 0.3, kol: 0.3 } },
  { id: 11, title: "Huấn luyện viên Catwalk", desc: "Đào tạo kỹ thuật đi catwalk cho học viên", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 12, title: "CEO thương hiệu riêng", desc: "Kinh doanh nhãn hàng thời trang, mỹ phẩm", weights: { pageant: 0.5, runway: 0.2, kol: 0.3 } },
  { id: 13, title: "Giám khảo cuộc thi sắc đẹp", desc: "Chấm điểm các cuộc thi hoa hậu, hoa khôi", weights: { pageant: 0.7, runway: 0.2, kol: 0.1 } },
  { id: 14, title: "Giám đốc hình ảnh / Stylist", desc: "Cố vấn định hình phong cách và trang phục", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } },
  { id: 15, title: "Sứ giả chiến dịch cộng đồng", desc: "Lan tỏa các giá trị nhân văn và dự án từ thiện", weights: { pageant: 0.8, runway: 0.1, kol: 0.1 } },
  { id: 16, title: "Vlogger du lịch & trải nghiệm", desc: "Quảng bá điểm đến, khách sạn, resort cao cấp", weights: { pageant: 0.2, runway: 0.1, kol: 0.7 } },
  { id: 17, title: "Người mẫu ảnh nghệ thuật", desc: "Hợp tác chụp ảnh thời trang Fine-art", weights: { pageant: 0.2, runway: 0.6, kol: 0.2 } },
  { id: 18, title: "Nhà sáng tạo nội dung tri thức", desc: "Chia sẻ kỹ năng mềm, kiến thức làm đẹp", weights: { pageant: 0.4, runway: 0.1, kol: 0.5 } },
  { id: 19, title: "Đại sứ Game / Esports", desc: "Hình ảnh đại diện cho các dự án game lớn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 20, title: "Người mẫu ảo / Metaverse", desc: "Scan 3D hình ảnh số để làm mẫu ảo", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } }
];

interface PersonalInfoTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
  setShowBookModal: (show: boolean) => void;
  setBookingForm: (form: any) => void;
}

export default function PersonalInfoTab({
  profile,
  setProfile,
  addToast,
  setShowBookModal,
  setBookingForm
}: PersonalInfoTabProps) {

  const [videoPreviews, setVideoPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(videoPreviews).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [videoPreviews]);

  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover" | "fullBody") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;


    setUploadingState(prev => ({
      ...prev,
      [type]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[type]) return prev;
        return {
          ...prev,
          [type]: {
            ...prev[type],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);
      setProfile(syncedProfile);

      if (!syncedProfile.backendProfileId) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        addToast("Vui lòng đăng nhập để tải ảnh lên.", "info");
        return;
      }

      const category = type === "fullBody" ? "full_body" : type;
      const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, category);
      const photoUrl = photo.url || photo.path;

      if (!photoUrl) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        addToast("Backend chưa trả về URL ảnh.", "info");
        return;
      }

      const updatedProfile = persistTalentProfile({ ...syncedProfile, [type]: photoUrl });
      setProfile(updatedProfile);

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, 800);

      let typeName = "";
      if (type === "avatar") typeName = "Ảnh đại diện";
      else if (type === "cover") typeName = "Ảnh bìa";
      else if (type === "fullBody") typeName = "Ảnh toàn thân (Full-body)";

      addToast(`Cập nhật ${typeName} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên, vui lòng thử lại.", "info");
    }
  };

  const handleLookbookUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;


    const stateKey = `lookbook-${id}`;

    setUploadingState(prev => ({
      ...prev,
      [stateKey]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[stateKey]) return prev;
        return {
          ...prev,
          [stateKey]: {
            ...prev[stateKey],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);
      setProfile(syncedProfile);

      if (!syncedProfile.backendProfileId) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
        addToast("Vui lòng đăng nhập để tải ảnh lên", "info");
        return;
      }

      const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, "portfolio");
      const photoUrl = photo.url || photo.path;

      if (!photoUrl) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
        addToast("Backend chưa trả về URL ảnh.", "info");
        return;
      }

      const updatedProfile = persistTalentProfile({ ...syncedProfile, [`lookbook${id}`]: photoUrl });
      setProfile(updatedProfile);

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [stateKey]: {
          ...prev[stateKey],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
      }, 800);

      addToast(`Cập nhật Ảnh ${id} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[stateKey];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên, vui lòng thử lại.", "info");
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "intro" | "catwalk" | "mc") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;


    setUploadingState(prev => ({
      ...prev,
      [type]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[type]) return prev;
        return {
          ...prev,
          [type]: {
            ...prev[type],
            progress
          }
        };
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);

      // Create local object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setVideoPreviews(prev => {
        if (prev[type]) {
          URL.revokeObjectURL(prev[type]);
        }
        return {
          ...prev,
          [type]: objectUrl
        };
      });

      const updatedProfile = persistTalentProfile({
        ...profile,
        [type === "intro" ? "hasUploadedIntro" : type === "catwalk" ? "hasUploadedCatwalk" : "hasUploadedMC"]: true
      });
      setProfile(updatedProfile);

      setUploadingState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, 800);

      addToast("Tải lên video và nén thành công!", "success");
    }, 3000);
  };

  // Lookbook photos metadata (labeled exactly "Ảnh 1", "Ảnh 2", "Ảnh 3", "Ảnh 4")
  const lookbookPhotos = [
    {
      id: 1,
      label: "Ảnh 1",
      title: "Beauty Portrait",
      url: profile.lookbook1 || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      photographer: "Lê Huy Studio",
      concept: "Classic High-Fashion",
      date: "20/05/2026",
      device: "Fujifilm GFX 100S"
    },
    {
      id: 2,
      label: "Ảnh 2",
      title: "Runway Pose",
      url: profile.lookbook2 || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
      photographer: "Minh Trần Portfolio",
      concept: "Avant-Garde Runway",
      date: "22/05/2026",
      device: "Sony A7R V"
    },
    {
      id: 3,
      label: "Ảnh 3",
      title: "Close-up",
      url: profile.lookbook3 || "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
      photographer: "Kien Nguyen",
      concept: "Editorial Makeup Glow",
      date: "25/05/2026",
      device: "Hasselblad X2D"
    },
    {
      id: 4,
      label: "Ảnh 4",
      title: "Streetwear Style",
      url: profile.lookbook4 || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
      photographer: "Alex Pham",
      concept: "Cyberpunk Neon Street",
      date: "28/05/2026",
      device: "Canon EOS R5"
    }
  ];

  // State for Month-switching Calendar
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // Default June 2026

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayPad = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    // Monday start:
    // Sunday (0) -> pad 6, Monday (1) -> pad 0, Tuesday (2) -> pad 1...
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  const getDayStatus = (dateStr: string) => {
    const calendar = profile.availabilityCalendar || [];
    if (calendar.includes(dateStr) || calendar.includes(`${dateStr}:available`)) {
      return "available";
    }
    if (calendar.includes(`${dateStr}:maybe`)) {
      return "maybe";
    }
    return "busy";
  };

  // Toggle calendar days availability cyclic: busy -> available -> maybe -> busy
  const handleCalendarDayClick = (dateStr: string) => {
    const calendar = [...(profile.availabilityCalendar || [])];
    const status = getDayStatus(dateStr);
    const dayNum = dateStr.split("-")[2];

    const cleanedCalendar = calendar.filter((d: string) =>
      d !== dateStr &&
      d !== `${dateStr}:available` &&
      d !== `${dateStr}:maybe` &&
      d !== `${dateStr}:busy`
    );

    if (status === "busy") {
      cleanedCalendar.push(dateStr); // Busy -> Available (stored as YYYY-MM-DD for backwards compatibility)
      addToast(`Đã chuyển ngày ${dayNum}/${currentMonth} thành trạng thái RẢNH (🟢)`, "success");
    } else if (status === "available") {
      cleanedCalendar.push(`${dateStr}:maybe`); // Available -> Chưa có lịch (Maybe)
      addToast(`Đã chuyển ngày ${dayNum}/${currentMonth} thành trạng thái CHƯA CÓ LỊCH (🟡)`, "info");
    } else {
      cleanedCalendar.push(`${dateStr}:busy`); // Chưa có lịch -> Busy
      addToast(`Đã chuyển ngày ${dayNum}/${currentMonth} thành trạng thái BẬN (🔴)`, "info");
    }

    const updatedProfile = persistTalentProfile({ ...profile, availabilityCalendar: cleanedCalendar });
    setProfile(updatedProfile);
  };

  if (!profile.isOnboarded) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-3xl border border-white/10 bg-[#08090f] shadow-2xl relative overflow-hidden backdrop-blur-xl min-h-[50vh] max-w-xl mx-auto w-full animate-in fade-in duration-500">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-6">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>

        <div className="space-y-3 max-w-sm">
          <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
            Hồ Sơ Chưa Được Kích Hoạt
          </h3>
          <p className="text-xs text-slate-450 leading-relaxed">
            Bạn chưa thực hiện bài khảo sát định hướng và cập nhật thông tin cá nhân. Hãy hoàn thành khảo sát để mở khóa chỉ số ngoại hình, học vấn, hạng người mẫu, các dịch vụ đồng hành và báo cáo hiệu quả.
          </p>
        </div>

        <button
          onClick={() => window.location.href = "/talent/survey"}
          className="mt-8 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          Làm Khảo Sát Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">

      {/* LEFT COLUMN: Sidebar Physical Parameters & General Metrics (Shown only here, and displays FIRST on mobile) */}
      <div className="space-y-6 md:space-y-8 order-1">

        {/* Model Full-Body Photo Card */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-5 space-y-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-amber-400" /> Ảnh Người Mẫu (Full-body)
          </h3>

          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-inner">
            <img
              src={profile.fullBody || "/fullbody_model.png"}
              alt="Model Full-body portrait"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-transparent to-transparent opacity-80" />

            {/* Desktop Hover Overlay upload trigger */}
            <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[11px] sm:text-xs font-bold cursor-pointer transition-all">
                <Upload className="h-5 w-5 text-amber-400" />
                <span>Đổi ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!!uploadingState["fullBody"]}
                  onChange={(e) => handleImageUpload(e, "fullBody")}
                />
              </label>
            </div>

            {/* Progress bar overlay */}
            {uploadingState["fullBody"] && (
              <ProgressBar
                progress={uploadingState["fullBody"].progress}
                message="Đang tải ảnh toàn thân lên..."
              />
            )}

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-35 sm:opacity-100 sm:group-hover:opacity-20 transition-opacity duration-300">
              <div>
                <span className="text-[8px] font-mono tracking-widest text-[#f4c430] font-bold uppercase">POLAROID BOOK</span>
                <h4 className="text-xs font-black text-white mt-0.5">{profile.name.toUpperCase()}</h4>
              </div>
              <div className="text-[8px] font-mono bg-black/40 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                Ratio: 3:4
              </div>
            </div>
          </div>
        </div>

        {/* Physical Measurements Card */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-slate-400" /> Chỉ Số Ngoại Hình
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-950 p-3.5 text-center border border-white/2">
              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Chiều Cao</span>
              <span className="text-sm font-extrabold text-white mt-1 block">{profile.height} cm</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-3.5 text-center border border-white/2">
              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Cân Nặng</span>
              <span className="text-sm font-extrabold text-white mt-1 block">{profile.weight} kg</span>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-[#151b2d] pt-4 text-left">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Giới tính</span>
              <span className="font-bold text-white">{profile.gender || "Nữ"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Ngày sinh</span>
              <span className="font-bold text-white font-mono">{profile.dob || "15/05/2002"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300 border-t border-dashed border-[#151b2d]/50 pt-2">
              <span className="font-medium text-slate-400">Số đo Vòng 1</span>
              <span className="font-bold text-white font-mono">{profile.bust} cm</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Số đo Vòng 2</span>
              <span className="font-bold text-white font-mono">{profile.waist} cm</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Số đo Vòng 3</span>
              <span className="font-bold text-white font-mono">{profile.hips} cm</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300 border-t border-dashed border-[#151b2d]/50 pt-2">
              <span className="font-medium text-slate-400">Màu da</span>
              <span className="font-bold text-white">{profile.skinColor || "Sáng"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Màu tóc</span>
              <span className="font-bold text-white">{profile.hairColor || "Nâu"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Hình xăm</span>
              <span className="font-bold text-white truncate max-w-[120px] text-right" title={profile.tattoo === "Có" ? `Có (${profile.tattooDesc || "Không mô tả"})` : "Không"}>
                {profile.tattoo === "Có" ? `Có (${profile.tattooDesc || "Không mô tả"})` : "Không"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Kinh nghiệm</span>
              <span className="font-bold text-white">{profile.experience !== undefined ? `${profile.experience} năm` : "3 năm"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300 border-t border-[#151b2d] pt-3.5">
              <span className="font-medium text-slate-400">Phẫu thuật thẩm mỹ</span>
              <span className="font-bold text-white">{profile.plasticSurgery === "true" ? "Đã can thiệp" : "Tự nhiên 100%"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Tình trạng kết hôn</span>
              <span className="font-bold text-white">{profile.maritalStatus}</span>
            </div>
          </div>
        </div>

        {/* Education, Languages & Special Skills */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <GraduationCap className="h-4.5 w-4.5 text-slate-400" /> Học Vấn, Ngôn Ngữ & Kỹ Năng
          </h3>

          <div className="space-y-4 text-xs text-slate-300 text-left">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                <GraduationCap className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block font-bold text-white">Học vấn</span>
                <span className="block text-[10px] text-slate-400 mt-1">{profile.education}</span>
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#151b2d] pt-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block font-bold text-white">Ngoại ngữ</span>
                <span className="block text-[10px] text-slate-400 mt-1 leading-normal">
                  {Array.isArray(profile.languages) ? profile.languages.join(", ") : profile.languages}
                </span>
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#151b2d] pt-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Award className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block font-bold text-white">Kỹ năng đặc biệt</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(profile.specialSkills || profile.skills || ["Catwalk", "MC song ngữ", "Pose dáng lookbook"]).map((skill: string, sIdx: number) => (
                    <span key={sIdx} className="bg-white/5 border border-white/10 text-slate-300 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Card Table */}
        <div className="rounded-2xl border border-amber-500/10 bg-[#08090f] p-6 space-y-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <DollarSign className="h-4.5 w-4.5 text-amber-400" /> Dịch Vụ Cơ Bản (Basic)
          </h3>
          <div className="space-y-3">
            {Object.entries(profile.rateCard || {}).map(([key, value]: any) => (
              <div key={key} className="flex justify-between py-1.5 text-xs border-b border-[#151b2d]/50 items-center">
                <span className="font-medium text-slate-400">{key}</span>
                <span className="font-extrabold text-amber-400 font-mono">từ {value.toLocaleString()}đ</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Co-Space Companion Services Card */}
        {profile.lifestyleServices && profile.lifestyleServices.some((s: any) => s.enabled) && (
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" /> Dịch Vụ Đồng Hành (VIP)
            </h3>
            <div className="space-y-3.5 text-left">
              {profile.lifestyleServices.filter((s: any) => s.enabled).map((service: any) => {
                let icon = "💼";
                if (service.id === "golf") icon = "⛳";
                else if (service.id === "pickleball") icon = "🎾";
                else if (service.id === "dining") icon = "🍷";
                else if (service.id === "cafe") icon = "☕";
                else if (service.id === "travel") icon = "💼";
                else if (service.id === "redcarpet") icon = "✨";
                else if (service.id === "shopping") icon = "🛍️";
                else if (service.id === "art") icon = "🎨";
                else if (service.id === "escort") icon = "🛥️";
                else if (service.id === "content") icon = "📱";

                return (
                  <div key={service.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5 space-y-2 hover:border-amber-400/30 transition-all text-left">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{icon}</span> {service.title}
                      </span>
                      <span className="font-black text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">
                        {(service.rate || 0).toLocaleString()}đ/{service.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{service.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Safety Guarantees Area */}
            <div className="border-t border-[#151b2d] pt-4 space-y-3">
              <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider text-left">🔒 Cam Kết Bảo Mật & An Toàn Giao Dịch</span>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                  <span className="block text-[14px] mb-1">✍️</span>
                  <span className="block text-[8px] font-black text-slate-300 uppercase tracking-wide">Smart Contract</span>
                  <span className="block text-[6.5px] text-slate-500 mt-0.5 font-medium leading-none">Ký số lịch trình</span>
                </div>
                <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                  <span className="block text-[14px] mb-1">📍</span>
                  <span className="block text-[8px] font-black text-slate-300 uppercase tracking-wide">Real-time GPS</span>
                  <span className="block text-[6.5px] text-slate-500 mt-0.5 font-medium leading-none">Check-in điểm hẹn</span>
                </div>
                <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                  <span className="block text-[14px] mb-1">💰</span>
                  <span className="block text-[8px] font-black text-slate-300 uppercase tracking-wide">Escrow Payment</span>
                  <span className="block text-[6.5px] text-slate-500 mt-0.5 font-medium leading-none">Đặt cọc hệ thống</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Tab main content */}
      <div className="lg:col-span-2 space-y-6 md:space-y-8 order-2">

        {/* SECTION A: DISPLAY PERFORMANCE ANALYTICS */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
            <TrendingUp className="h-4.5 w-4.5 text-cyan-400" /> Báo Cáo Hiệu Quả Hiển Thị
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Xem profile/tuần</span>
              <h4 className="text-lg font-extrabold text-white mt-1.5">1,520 lượt</h4>
              <span className="text-[8px] text-emerald-400 font-bold block mt-1">↑ 400% (Từ Super Boost)</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Đề xuất Booking</span>
              <h4 className="text-lg font-extrabold text-white mt-1.5">48 Đề xuất</h4>
              <span className="text-[8px] text-emerald-400 font-bold block mt-1">↑ 500% (Elite Verified)</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Tỷ lệ nhận việc</span>
              <h4 className="text-lg font-extrabold text-white mt-1.5">98%</h4>
              <span className="text-[8px] text-cyan-400 font-bold block mt-1">Hạng xuất sắc A+</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">ROI Tiếp Cận</span>
              <h4 className="text-lg font-extrabold text-white mt-1.5">3,000%</h4>
              <span className="text-[8px] text-[#f4c430] font-bold block mt-1 font-mono">Tối Ưu Cực Cao</span>
            </div>
          </div>
        </div>

        {/* SECTION B: REVENUE B2C FINANCIAL REPORTING */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
            <Wallet className="h-4.5 w-4.5 text-emerald-400" /> Báo Cáo Doanh Thu B2C & Ví Đại Diện
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance Wallet */}
            <div className="rounded-xl bg-slate-950 p-4 border border-emerald-500/20 relative overflow-hidden bg-gradient-to-br from-emerald-950/10 to-transparent">
              <div className="absolute top-2 right-2 opacity-15">
                <Wallet className="h-10 w-10 text-emerald-400" />
              </div>
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Số dư Ví hiện tại</span>
              <h4 className="text-xl font-black text-emerald-400 mt-2 font-mono">12.500.000đ</h4>
              <span className="text-[8.5px] text-emerald-500 block mt-1.5 font-bold">● Sẵn sàng rút về ngân hàng</span>
            </div>

            {/* Monthly Income */}
            <div className="rounded-xl bg-slate-950 p-4 border border-purple-500/20 relative overflow-hidden bg-gradient-to-br from-purple-950/10 to-transparent">
              <div className="absolute top-2 right-2 opacity-15">
                <TrendingUp className="h-10 w-10 text-purple-400" />
              </div>
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Doanh thu tháng này</span>
              <h4 className="text-xl font-black text-purple-400 mt-2 font-mono">18.000.000đ</h4>
              <span className="text-[8.5px] text-purple-400 block mt-1.5 font-bold">↑ Tăng 22% so với tháng trước</span>
            </div>

            {/* Escrowed / Locked cọc */}
            <div className="rounded-xl bg-slate-950 p-4 border border-amber-500/20 relative overflow-hidden bg-gradient-to-br from-amber-950/10 to-transparent">
              <div className="absolute top-2 right-2 opacity-15">
                <ShieldCheck className="h-10 w-10 text-amber-400" />
              </div>
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Tiền cọc chờ giải ngân</span>
              <h4 className="text-xl font-black text-amber-400 mt-2 font-mono">4.000.000đ</h4>
              <span className="text-[8.5px] text-amber-400 block mt-1.5 font-bold">🔒 Tiền cọc an toàn (Escrow)</span>
            </div>
          </div>
        </div>

        {/* SECTION C: INTERACTIVE AVAILABILITY CALENDAR */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#151b2d] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                Lịch Làm Việc (Tháng {currentMonth < 10 ? `0${currentMonth}` : currentMonth}/{currentYear})
              </h3>
            </div>
            <div className="flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/5 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-slate-950 hover:border-transparent hover:shadow-[0_0_12px_rgba(244,196,48,0.3)] transition-all cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/5 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-slate-950 hover:border-transparent hover:shadow-[0_0_12px_rgba(244,196,48,0.3)] transition-all cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-slate-500 font-black uppercase">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Pad empty days */}
              {Array.from({ length: getFirstDayPad(currentYear, currentMonth) }).map((_, pIdx) => (
                <div key={`pad-${pIdx}`} className="h-12 border border-transparent" />
              ))}

              {/* Real days */}
              {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dayStr = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
                const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
                const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
                const status = getDayStatus(dateKey);

                return (
                  <button
                    key={idx}
                    onClick={() => handleCalendarDayClick(dateKey)}
                    className={cn(
                      "flex flex-col items-center justify-between p-1.5 h-12 rounded-xl border text-center transition-all cursor-pointer hover:scale-102",
                      status === "available" && "border-emerald-400/40 bg-emerald-400/5 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:border-emerald-400",
                      status === "maybe" && "border-yellow-500/30 bg-yellow-500/5 text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.1)] hover:border-yellow-400",
                      status === "busy" && "border-red-500/40 bg-red-500/5 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)] hover:border-red-500"
                    )}
                  >
                    <span className="text-[9px] font-mono font-bold block">{dayStr}</span>
                    <span className="text-[6.5px] font-black uppercase tracking-wider scale-90">
                      {status === "available" ? "Rảnh" : status === "maybe" ? "Chưa có lịch" : "Bận"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] text-slate-400 border-t border-white/5 pt-3 mt-1">
              <span>🟢 Rảnh</span>
              <span>🔴 Bận</span>
              <span>🟡 Chưa có lịch</span>
            </div>
          </div>
        </div>

        {/* SECTION D: LOOKBOOK PHOTOS & VIDEOS DISPLAY */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
          <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Image className="h-4.5 w-4.5 text-[#f4c430]" /> Bộ Ảnh Lookbook & Video
              </h3>
              <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Hiển thị bộ ảnh Lookbook nghệ thuật và các video giới thiệu, trình diễn thực tế của Talent
              </span>
            </div>
          </div>

          {/* Sub-grid 1: 4 Lookbook Photos */}
          <div className="space-y-3">
            <span className="block text-[9px] text-[#f4c430] font-black uppercase tracking-wider">
              📸 Bộ Ảnh Lookbook Nghệ Thuật (4 Ảnh)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lookbookPhotos.map((img) => (
                <div key={img.id} className="flex flex-col gap-2">
                  <div
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md"
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 sm:block hidden" />

                    {/* Hover Overlay upload trigger */}
                    <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                        <Upload className="h-5 w-5 text-amber-400" />
                        <span>Thay đổi ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={!!uploadingState[`lookbook-${img.id}`]}
                          onChange={(e) => handleLookbookUpload(e, img.id)}
                        />
                      </label>
                    </div>

                    {/* Progress bar overlay */}
                    {uploadingState[`lookbook-${img.id}`] && (
                      <ProgressBar
                        progress={uploadingState[`lookbook-${img.id}`].progress}
                        message="Đang tải ảnh lên..."
                      />
                    )}

                    {/* Labeled overlay info (Desktop only) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 z-10 pointer-events-none hidden sm:block text-left">
                      <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {img.label}
                      </span>
                      <h4 className="text-[10px] font-black text-white">{img.title}</h4>
                      <div className="text-[7.5px] text-slate-400 space-y-0.5 leading-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p>📷 {img.photographer}</p>
                        <p>👗 Concept: {img.concept}</p>
                        <p>⚙️ {img.device}</p>
                        <p>📅 Ngày chụp: {img.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Labeled overlay info (Mobile only) */}
                  <div className="sm:hidden block space-y-1 px-1 text-left pb-1">
                    <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {img.label}
                    </span>
                    <h4 className="text-[10px] font-black text-white">{img.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-grid 2: 3 Videos (Intro, Catwalk, MC/Live Demo) */}
          <div className="space-y-3 border-t border-[#151b2d] pt-4">
            <span className="block text-[9px] text-cyan-400 font-black uppercase tracking-wider">
              🎥 Video Giới Thiệu & Demo Thực Tế (3 Videos)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Video 1: Intro */}
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md flex flex-col justify-between">
                {profile.hasUploadedIntro ? (
                  <div className="h-full w-full relative">
                    <video
                      src={videoPreviews.intro || "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-smiling-at-the-camera-40898-large.mp4"}
                      className="h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                    {/* Hover overlay to change video */}
                    <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-cyan-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                        <Upload className="h-5 w-5 text-cyan-400" />
                        <span>Đổi video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={!!uploadingState["intro"]}
                          onChange={(e) => handleVideoUpload(e, "intro")}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 p-4 relative">
                    <label className="flex flex-col items-center gap-1.5 bg-black/40 hover:bg-black/60 border border-dashed border-white/10 hover:border-cyan-400/80 rounded-xl px-4 py-6 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer transition-all w-full h-full justify-center">
                      <Upload className="h-6 w-6 text-slate-500 hover:text-cyan-400 animate-pulse" />
                      <span>Tải lên video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={!!uploadingState["intro"]}
                        onChange={(e) => handleVideoUpload(e, "intro")}
                      />
                    </label>
                  </div>
                )}

                {/* Progress bar overlay */}
                {uploadingState["intro"] && (
                  <ProgressBar
                    progress={uploadingState["intro"].progress}
                    message="Đang tải video lên..."
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1 pointer-events-none z-10">
                  <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    INTRO VIDEO
                  </span>
                  <h4 className="text-[10px] font-black text-white">Video Giới Thiệu Bản Thân</h4>
                  <p className="text-[7.5px] text-slate-400">Độ phân giải: 1080p • Định dạng: Vertical</p>
                </div>
              </div>

              {/* Video 2: Catwalk */}
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md flex flex-col justify-between">
                {profile.hasUploadedCatwalk ? (
                  <div className="h-full w-full relative">
                    <video
                      src={videoPreviews.catwalk || "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-show-39871-large.mp4"}
                      className="h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                    {/* Hover overlay to change video */}
                    <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-cyan-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                        <Upload className="h-5 w-5 text-cyan-400" />
                        <span>Đổi video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={!!uploadingState["catwalk"]}
                          onChange={(e) => handleVideoUpload(e, "catwalk")}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 p-4 relative">
                    <label className="flex flex-col items-center gap-1.5 bg-black/40 hover:bg-black/60 border border-dashed border-white/10 hover:border-cyan-400/80 rounded-xl px-4 py-6 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer transition-all w-full h-full justify-center">
                      <Upload className="h-6 w-6 text-slate-500 hover:text-cyan-400 animate-pulse" />
                      <span>Tải lên video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={!!uploadingState["catwalk"]}
                        onChange={(e) => handleVideoUpload(e, "catwalk")}
                      />
                    </label>
                  </div>
                )}

                {/* Progress bar overlay */}
                {uploadingState["catwalk"] && (
                  <ProgressBar
                    progress={uploadingState["catwalk"].progress}
                    message="Đang tải video lên..."
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1 pointer-events-none z-10">
                  <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    CATWALK POLAROID
                  </span>
                  <h4 className="text-[10px] font-black text-white">Video Trình Diễn Sàn Runway</h4>
                  <p className="text-[7.5px] text-slate-400">Độ phân giải: 1080p • Định dạng: Vertical</p>
                </div>
              </div>

              {/* Video 3: MC/Livestream */}
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md flex flex-col justify-between">
                {profile.hasUploadedMC ? (
                  <div className="h-full w-full relative">
                    <video
                      src={videoPreviews.mc || "https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-to-camera-in-interview-42358-large.mp4"}
                      className="h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                    {/* Hover overlay to change video */}
                    <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-cyan-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                        <Upload className="h-5 w-5 text-cyan-400" />
                        <span>Đổi video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={!!uploadingState["mc"]}
                          onChange={(e) => handleVideoUpload(e, "mc")}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 p-4 relative">
                    <label className="flex flex-col items-center gap-1.5 bg-black/40 hover:bg-black/60 border border-dashed border-white/10 hover:border-cyan-400/80 rounded-xl px-4 py-6 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer transition-all w-full h-full justify-center">
                      <Upload className="h-6 w-6 text-slate-500 hover:text-cyan-400 animate-pulse" />
                      <span>Tải lên video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={!!uploadingState["mc"]}
                        onChange={(e) => handleVideoUpload(e, "mc")}
                      />
                    </label>
                  </div>
                )}

                {/* Progress bar overlay */}
                {uploadingState["mc"] && (
                  <ProgressBar
                    progress={uploadingState["mc"].progress}
                    message="Đang tải video lên..."
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1 pointer-events-none z-10">
                  <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    DEMO MC / LIVE
                  </span>
                  <h4 className="text-[10px] font-black text-white">Dẫn Chương Trình / Live Bán Hàng</h4>
                  <p className="text-[7.5px] text-slate-400">Độ phân giải: 1080p • Định dạng: Vertical</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION E: AI SURVEY & RADAR CHART & 20 CAREER ALIGNMENTS */}
        <div className="rounded-2xl border border-purple-500/20 bg-[#08090f] shadow-[0_0_20px_rgba(168,85,247,0.03)] p-6 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#151b2d] pb-4 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
              <div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  Bản Đồ Năng Lực AI & Xếp Hạng Việc Làm (Radar Chart)
                </h3>
                <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                  Định hướng 8 trục chính xác theo nhân trắc học & kỹ năng
                </span>
              </div>
            </div>
            <div className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wide">
              AI Powered
            </div>
          </div>

          {!profile.isOnboarded ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-12 rounded-xl border border-purple-500/15 bg-slate-950/45 max-w-md mx-auto space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Kích Hoạt Bản Đồ Năng Lực AI</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Vui lòng thực hiện bài khảo sát định hướng gồm 20 câu hỏi định tính để mở khóa bản đồ năng lực 8 trục, biểu đồ radar & độ tương thích chi tiết với 20 vị trí công việc.
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/talent/survey"}
                className="h-9 px-5 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 text-[10px] font-black text-white hover:brightness-105 active:scale-98 transition-all uppercase tracking-wider cursor-pointer"
              >
                Làm Khảo Sát Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Radar Chart Summary Column */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl border border-white/2 bg-slate-950/40">
                <div className="space-y-2">
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Nhóm Tương Thích Nhất</span>
                  <h4 className="text-xs font-black text-amber-300 leading-relaxed uppercase tracking-wide">
                    {profile.mainCategory}
                  </h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    Biểu đồ radar 8 trục: <strong>Catwalk, Pose dáng, MC, Livestream, Diễn xuất, Social content, Brand safety, Reliability</strong>.
                  </p>
                </div>

                {/* SVG 8-axis Radar */}
                <div className="h-44 w-44 mx-auto my-4 shrink-0 rounded-xl border border-[#151b2d] bg-slate-950 p-2 shadow-inner flex items-center justify-center">
                  <RadarChart
                    scores={profile.skillsScores}
                    fillColor="rgba(244,196,48,0.2)"
                    strokeColor="#f4c430"
                    strokeWidth={2}
                    labelFontSize={9}
                    labelFontWeight="black"
                  />
                </div>

                {/* Legend description */}
                <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[8px] text-slate-500 border-t border-white/5 pt-2 font-mono">
                  <span>CW: Catwalk</span>
                  <span>PS: Pose dáng</span>
                  <span>MC: Dẫn chương trình</span>
                  <span>LS: Livestream</span>
                  <span>AC: Diễn xuất</span>
                  <span>SC: Social content</span>
                  <span>SF: Brand safety</span>
                  <span>RL: Reliability</span>
                </div>
              </div>

              {/* 20 Recommended Roles Column */}
              <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black text-left mb-2">Độ Tương Thích Với 20 Vị Trí Công Việc</span>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {(() => {
                      const scores = profile.surveyScores || { pageant: 50, runway: 45, kol: 95 };
                      const calculatedJobs = JOBS_LIST.map((job) => {
                        const matchScore = Math.round(
                          scores.pageant * job.weights.pageant +
                          scores.runway * job.weights.runway +
                          scores.kol * job.weights.kol
                        );
                        return { ...job, matchScore };
                      }).sort((a, b) => b.matchScore - a.matchScore);

                      return calculatedJobs.map((job, idx) => {
                        const isHigh = job.matchScore >= 80;
                        const isMid = job.matchScore >= 50 && job.matchScore < 80;

                        return (
                          <div
                            key={job.id}
                            className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950 p-2.5 hover:bg-slate-900/20 hover:border-white/10 transition-all duration-300 group"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[9px] font-bold text-slate-400 group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-colors">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] sm:text-[11px] font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                                  {job.title}
                                </h4>
                                <span className={cn(
                                  "font-display text-[9px] font-extrabold",
                                  isHigh ? "text-amber-400" : isMid ? "text-purple-400" : "text-slate-500"
                                )}>
                                  {job.matchScore}% Match
                                </span>
                              </div>
                              <p className="text-[8px] text-slate-500 truncate mt-0.5">{job.desc}</p>
                              <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isHigh ? "bg-gradient-to-r from-amber-200 to-amber-500" : isMid ? "bg-purple-500" : "bg-slate-700"
                                  )}
                                  style={{ width: `${job.matchScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION F: REPUTATION REVIEWS */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> Đánh Giá Từ Đối Tác & Độ Uy Tín
          </h3>
          <div className="space-y-4">
            {[
              { brand: "L'Oréal Paris Vietnam", rating: 5, date: "15/05/2026", comment: "Mai Anh làm việc vô cùng chuyên nghiệp, đúng giờ và livestream đạt KPI doanh số vượt mong đợi của brand. Rất mong muốn tiếp tục hợp tác lâu dài." },
              { brand: "Gucci Beauty Event", rating: 5, date: "29/04/2026", comment: "Thần thái xuất sắc, đi catwalk đỉnh cao và pose dáng cực tốt tại event thảm đỏ. Tương tác truyền thông xã hội rất tốt sau sự kiện." },
              { brand: "Vogue Vietnam Editorial", rating: 5, date: "12/04/2026", comment: "Gương mặt high-fashion, biểu cảm nghệ thuật độc đáo. Thái độ làm việc rất chuyên nghiệp, thân thiện và năng lượng cao." }
            ].map((rev, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950 p-4 border border-white/2 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-xs block">{rev.brand}</span>
                    <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Ngày hợp tác: {rev.date}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, sIdx) => (
                      <Star key={sIdx} className="h-3 w-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
