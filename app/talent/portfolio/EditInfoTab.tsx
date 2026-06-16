"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3, ShieldCheck, CheckCircle, Camera, X, Plus, Info, Upload, Video, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { persistTalentProfile } from "@/lib/talent-api";

const convertToInputDate = (dateStr: string) => {
  if (!dateStr) return "2002-05-15";
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return dateStr;
};

const convertToDisplayDate = (dateStr: string) => {
  if (!dateStr) return "15/05/2002";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
  }
  return dateStr;
};

interface EditInfoTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
}

export default function EditInfoTab({
  profile,
  setProfile,
  addToast
}: EditInfoTabProps) {

  const displayedPhotos = (profile?.photos || []).filter(
    (p: string) => profile?.isOnboarded || (!p.includes("fullbody_model.png") && !p.includes("cover_image.png"))
  );

  // Identity card (CCCD) upload state simulators
  const [cccdFrontUploaded, setCccdFrontUploaded] = useState(false);
  const [cccdBackUploaded, setCccdBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [lifestyleServices, setLifestyleServices] = useState<any[]>([]);

  // Form states for profile editing
  const [editForm, setEditForm] = useState<any>({
    name: "",
    height: 172,
    weight: 51,
    bust: 85,
    waist: 60,
    hips: 90,
    location: "",
    hometown: "",
    education: "",
    languages: "",
    rateCard: {},
    plasticSurgery: "false",
    maritalStatus: "Độc thân",
    gender: "Nữ",
    dob: "2002-05-15",
    skinColor: "Sáng",
    hairColor: "Nâu",
    tattoo: "Không",
    tattooDesc: "",
    experience: 3,
    specialSkills: ""
  });

  // Video upload state simulator
  const [videoForm, setVideoForm] = useState({
    hasUploadedIntro: false,
    hasUploadedCatwalk: false,
    hasUploadedMC: false
  });

  // Upload simulation states
  const [uploadingType, setUploadingType] = useState<"photos" | "catwalk" | "intro" | "mc" | "cccd_front" | "cccd_back" | "cccd_selfie" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync edit form fields once profile loads
  useEffect(() => {
    if (profile) {
      const onboarded = !!profile.isOnboarded;
      setEditForm({
        name: profile.name || "",
        height: onboarded ? (profile.height || 172) : "",
        weight: onboarded ? (profile.weight || 51) : "",
        bust: onboarded ? (profile.bust || 85) : "",
        waist: onboarded ? (profile.waist || 60) : "",
        hips: onboarded ? (profile.hips || 90) : "",
        location: onboarded ? (profile.location || "") : "",
        hometown: onboarded ? (profile.hometown || "") : "",
        education: onboarded ? (profile.education || "") : "",
        languages: onboarded ? (Array.isArray(profile.languages) ? profile.languages.join(", ") : (profile.languages || "")) : "",
        rateCard: onboarded ? { ...(profile.rateCard || {}) } : {
          "Instagram Post": "",
          "TikTok Video": "",
          "Livestream 2h": "",
          "Event Appearance": "",
          "Catwalk Show": "",
        },
        plasticSurgery: onboarded ? (profile.plasticSurgery || "false") : "false",
        maritalStatus: onboarded ? (profile.maritalStatus || "Độc thân") : "",
        gender: onboarded ? (profile.gender || "Nữ") : "Nữ",
        dob: onboarded ? convertToInputDate(profile.dob) : "",
        skinColor: onboarded ? (profile.skinColor || "Sáng") : "Sáng",
        hairColor: onboarded ? (profile.hairColor || "Nâu") : "Nâu",
        tattoo: onboarded ? (profile.tattoo || "Không") : "Không",
        tattooDesc: onboarded ? (profile.tattooDesc || "") : "",
        experience: onboarded ? (profile.experience !== undefined ? profile.experience : 3) : "",
        specialSkills: onboarded ? (Array.isArray(profile.specialSkills) ? profile.specialSkills.join(", ") : (Array.isArray(profile.skills) ? profile.skills.join(", ") : "")) : ""
      });
      setVideoForm({
        hasUploadedIntro: onboarded ? (profile.hasUploadedIntro || false) : false,
        hasUploadedCatwalk: onboarded ? (profile.hasUploadedCatwalk || false) : false,
        hasUploadedMC: onboarded ? (profile.hasUploadedMC || false) : false
      });
      setLifestyleServices(onboarded ? (profile.lifestyleServices || []) : []);
      if (onboarded && (profile.verifiedLevel === "Elite" || profile.verifiedLevel === "Pro" || profile.verifiedLevel === "Basic")) {
        setVerificationStatus("verified");
        setCccdFrontUploaded(true);
        setCccdBackUploaded(true);
        setSelfieUploaded(true);
      } else {
        setVerificationStatus("unverified");
        setCccdFrontUploaded(false);
        setCccdBackUploaded(false);
        setSelfieUploaded(false);
      }
    }
  }, [profile]);

  // Simulated identity uploaders
  const startCccdUpload = (type: "cccd_front" | "cccd_back" | "cccd_selfie") => {
    if (uploadingType) return;
    setUploadingType(type);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (type === "cccd_front") setCccdFrontUploaded(true);
          if (type === "cccd_back") setCccdBackUploaded(true);
          if (type === "cccd_selfie") setSelfieUploaded(true);
          setUploadingType(null);
          addToast(`Tải lên tài liệu ${type === "cccd_front" ? "Mặt trước CCCD" : type === "cccd_back" ? "Mặt sau CCCD" : "Ảnh Selfie xác thực"} thành công!`, "success");
        }, 100);
      }
    }, 100);
  };

  // Simulated video uploaders
  const startVideoUpload = (type: "intro" | "catwalk" | "mc") => {
    if (uploadingType) return;
    setUploadingType(type);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setVideoForm(prev => ({
            ...prev,
            [type === "intro" ? "hasUploadedIntro" : type === "catwalk" ? "hasUploadedCatwalk" : "hasUploadedMC"]: true
          }));
          setUploadingType(null);
          addToast(`Tải lên video thành công! Vui lòng nhấn "Lưu thay đổi" ở góc dưới để áp dụng.`, "success");
        }, 100);
      }
    }, 100);
  };

  // Submit Video changes
  const handleSaveVideos = () => {
    const updated = {
      ...profile,
      hasUploadedIntro: videoForm.hasUploadedIntro,
      hasUploadedCatwalk: videoForm.hasUploadedCatwalk,
      hasUploadedMC: videoForm.hasUploadedMC
    };
    setProfile(persistTalentProfile(updated));
    addToast("Đã lưu các thay đổi video thành công!", "success");
  };

  // Submit Identity Verification Request
  const handleIdentitySubmit = () => {
    if (!cccdFrontUploaded || !cccdBackUploaded || !selfieUploaded) {
      addToast("Vui lòng tải lên đầy đủ 3 tài liệu xác thực trước!", "info");
      return;
    }
    setVerificationStatus("pending");
    addToast("Đã gửi hồ sơ xác minh CCCD lên hệ thống! Tiến trình xét duyệt từ 1-2 tiếng.", "success");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* SUB-SECTION 1: PERSONAL INFORMATION & METRICS FORM */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="h-4.5 w-4.5 text-[#f4c430]" /> Cập Nhật Thông Tin Cá Nhân
          </h3>
          <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            Đồng bộ trực tiếp lên hệ thống và hiển thị chỉ số ngoại hình của bạn
          </span>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const updated = {
            ...profile,
            name: editForm.name,
            height: Number(editForm.height),
            weight: Number(editForm.weight),
            bust: Number(editForm.bust),
            waist: Number(editForm.waist),
            hips: Number(editForm.hips),
            location: editForm.location,
            hometown: editForm.hometown,
            education: editForm.education,
            languages: editForm.languages.split(",").map((s: string) => s.trim()),
            rateCard: { ...editForm.rateCard },
            plasticSurgery: editForm.plasticSurgery,
            maritalStatus: editForm.maritalStatus,
            gender: editForm.gender,
            dob: convertToDisplayDate(editForm.dob),
            skinColor: editForm.skinColor,
            hairColor: editForm.hairColor,
            tattoo: editForm.tattoo,
            tattooDesc: editForm.tattoo === "Có" ? editForm.tattooDesc : "",
            experience: Number(editForm.experience),
            specialSkills: editForm.specialSkills.split(",").map((s: string) => s.trim()),
            skills: editForm.specialSkills.split(",").map((s: string) => s.trim()),
            lifestyleServices: lifestyleServices
          };
          setProfile(persistTalentProfile(updated));
          addToast("Cập nhật thông tin cá nhân và ngoại hình thành công!", "success");
        }} className="space-y-4 text-xs">

          {/* Row 1: Name & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Họ tên nghệ danh</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Khu vực hoạt động</label>
              <input
                type="text"
                required
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Hometown & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Quê quán</label>
              <input
                type="text"
                required
                value={editForm.hometown}
                onChange={(e) => setEditForm({ ...editForm, hometown: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Học vấn</label>
              <input
                type="text"
                required
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Height, Weight & Surgery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Chiều cao (cm)</label>
              <input
                type="number"
                required
                value={editForm.height}
                onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Cân nặng (kg)</label>
              <input
                type="number"
                required
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Phẫu thuật thẩm mỹ</label>
              <select
                value={editForm.plasticSurgery}
                onChange={(e) => setEditForm({ ...editForm, plasticSurgery: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="false">Tự nhiên 100%</option>
                <option value="true">Đã can thiệp thẩm mỹ</option>
              </select>
            </div>
          </div>

          {/* Row 4: 3-vong */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 1 (cm)</label>
              <input
                type="number"
                required
                value={editForm.bust}
                onChange={(e) => setEditForm({ ...editForm, bust: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 2 (cm)</label>
              <input
                type="number"
                required
                value={editForm.waist}
                onChange={(e) => setEditForm({ ...editForm, waist: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Vòng 3 (cm)</label>
              <input
                type="number"
                required
                value={editForm.hips}
                onChange={(e) => setEditForm({ ...editForm, hips: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* New Row: Giới tính, Ngày sinh, Kinh nghiệm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Giới tính</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Ngày sinh</label>
              <input
                type="date"
                required
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Kinh nghiệm (năm)</label>
              <input
                type="number"
                required
                min={0}
                max={20}
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* New Row: Màu da, Màu tóc, Hình xăm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Màu da</label>
              <select
                value={editForm.skinColor}
                onChange={(e) => setEditForm({ ...editForm, skinColor: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Sáng">Sáng</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Ngăm">Ngăm</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Màu tóc</label>
              <select
                value={editForm.hairColor}
                onChange={(e) => setEditForm({ ...editForm, hairColor: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Đen">Đen</option>
                <option value="Nâu">Nâu</option>
                <option value="Vàng">Vàng</option>
                <option value="Đỏ">Đỏ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Hình xăm</label>
              <select
                value={editForm.tattoo}
                onChange={(e) => setEditForm({ ...editForm, tattoo: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Không">Không</option>
                <option value="Có">Có</option>
              </select>
            </div>
          </div>

          {/* New Row: Mô tả hình xăm (chỉ hiện khi có hình xăm) */}
          {editForm.tattoo === "Có" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Mô tả hình xăm (vị trí, kích thước, hình dạng)</label>
              <input
                type="text"
                required
                value={editForm.tattooDesc}
                onChange={(e) => setEditForm({ ...editForm, tattooDesc: e.target.value })}
                placeholder="Ví dụ: Hình xăm hoa hồng nhỏ ở cổ tay phải"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          )}

          {/* Row 5: Languages, Marriage & Special Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Ngôn ngữ (ngăn cách bằng dấu phẩy)</label>
              <input
                type="text"
                required
                value={editForm.languages}
                onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Tình trạng hôn nhân</label>
              <input
                type="text"
                required
                value={editForm.maritalStatus}
                onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Kỹ năng đặc biệt (phân tách dấu phẩy)</label>
              <input
                type="text"
                required
                value={editForm.specialSkills}
                onChange={(e) => setEditForm({ ...editForm, specialSkills: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Rate card config editing */}
          <div className="border-t border-[#151b2d] pt-4 space-y-3">
            <span className="block font-bold text-slate-300 uppercase tracking-wider text-[8px]">Cấu hình bảng giá dịch vụ (VND)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(editForm.rateCard).map((key) => (
                <div key={key} className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">{key}</label>
                  <input
                    type="number"
                    required
                    value={editForm.rateCard[key]}
                    onChange={(e) => {
                      const updatedRates = { ...editForm.rateCard, [key]: Number(e.target.value) };
                      setEditForm({ ...editForm, rateCard: updatedRates });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle Companion services config editing */}
          {lifestyleServices && lifestyleServices.length > 0 && (
            <div className="border-t border-[#151b2d] pt-4 space-y-3">
              <span className="block font-bold text-slate-300 uppercase tracking-wider text-[8px] text-left">Dịch Vụ Đồng Hành VIP & Phong Cách Sống (Lifestyle Co-Space)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lifestyleServices.map((service, index) => {
                  return (
                    <div key={service.id} className="rounded-xl border border-white/5 bg-slate-950 p-4 space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">{service.title}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={service.enabled}
                            onChange={(e) => {
                              const updated = [...lifestyleServices];
                              updated[index] = { ...service, enabled: e.target.checked };
                              setLifestyleServices(updated);
                            }}
                            className="rounded accent-[#f4c430] h-3.5 w-3.5 cursor-pointer"
                          />
                          <span className="text-[8px] font-black text-slate-400 uppercase">Kích hoạt</span>
                        </label>
                      </div>

                      <p className="text-xs text-slate-500 leading-normal">{service.description}</p>

                      {service.enabled && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                          <label className="block font-bold text-slate-400 uppercase tracking-wider text-[8px]">Giá dịch vụ đề xuất (VND / {service.unit})</label>
                          <input
                            type="number"
                            required
                            value={service.rate}
                            onChange={(e) => {
                              const updated = [...lifestyleServices];
                              updated[index] = { ...service, rate: Number(e.target.value) };
                              setLifestyleServices(updated);
                            }}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#f4c430] text-slate-950 font-black uppercase tracking-wider hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* SUB-SECTION 2: CCCD IDENTITY DOCUMENT VERIFICATION */}
      <div className="rounded-2xl border border-cyan-500/20 bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> Xác Minh Căn Cước Công Dân (CCCD)
          </h3>
          <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            Tải lên thông tin bắt buộc để nhận Tích xanh/Tích vàng Elite xác thực tài khoản
          </span>
        </div>

        {uploadingType && (uploadingType.includes("cccd")) && (
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white uppercase">Đang mã hóa tệp tin CCCD bảo mật...</span>
              <span className="font-mono text-cyan-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">

          {/* Front CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt trước</span>
            <div className="h-24 w-full rounded bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden">
              {cccdFrontUploaded ? (
                <div className="absolute inset-0 bg-emerald-500/5 text-emerald-400 flex flex-col items-center justify-center p-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-[7.5px] font-black uppercase">Đã Tải Lên</span>
                </div>
              ) : (
                <span className="text-[8px] text-slate-500 px-4">Độ phân giải rõ nét, không bị lóa</span>
              )}
            </div>
            <button
              type="button"
              disabled={!!uploadingType || verificationStatus === "verified"}
              onClick={() => startCccdUpload("cccd_front")}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {cccdFrontUploaded ? "Tải lại" : "Tải ảnh lên"}
            </button>
          </div>

          {/* Back CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt sau</span>
            <div className="h-24 w-full rounded bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden">
              {cccdBackUploaded ? (
                <div className="absolute inset-0 bg-emerald-500/5 text-emerald-400 flex flex-col items-center justify-center p-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-[7.5px] font-black uppercase">Đã Tải Lên</span>
                </div>
              ) : (
                <span className="text-[8px] text-slate-500 px-4">Hiển thị rõ mã vạch và quốc huy</span>
              )}
            </div>
            <button
              type="button"
              disabled={!!uploadingType || verificationStatus === "verified"}
              onClick={() => startCccdUpload("cccd_back")}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {cccdBackUploaded ? "Tải lại" : "Tải ảnh lên"}
            </button>
          </div>

          {/* Selfie Verified */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">Ảnh chân dung Selfie</span>
            <div className="h-24 w-full rounded bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden">
              {selfieUploaded ? (
                <div className="absolute inset-0 bg-emerald-500/5 text-emerald-400 flex flex-col items-center justify-center p-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-1" />
                  <span className="text-[7.5px] font-black uppercase">Đã Tải Lên</span>
                </div>
              ) : (
                <span className="text-[8px] text-slate-500 px-4">Ảnh selfie cầm CCCD trên tay</span>
              )}
            </div>
            <button
              type="button"
              disabled={!!uploadingType || verificationStatus === "verified"}
              onClick={() => startCccdUpload("cccd_selfie")}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all disabled:opacity-50"
            >
              {selfieUploaded ? "Tải lại" : "Tải ảnh lên"}
            </button>
          </div>

        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-dashed border-[#151b2d] flex justify-between items-center gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-white block">Trạng thái phê duyệt CCCD</span>
            <span className="text-[9.5px] text-slate-400 block">
              {verificationStatus === "unverified" && "Chưa gửi yêu cầu. Vui lòng tải đủ 3 ảnh trên."}
              {verificationStatus === "pending" && "⏳ Hồ sơ đang chờ quản trị viên phê duyệt trong vòng 120 phút."}
              {verificationStatus === "verified" && "🎉 Tài khoản đã được định danh thật thành công trên hệ thống!"}
            </span>
          </div>
          {verificationStatus !== "verified" && (
            <button
              type="button"
              onClick={handleIdentitySubmit}
              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
            >
              {verificationStatus === "pending" ? "Đang xử lý..." : "Gửi yêu cầu xác thực"}
            </button>
          )}
        </div>
      </div>

      {/* SUB-SECTION 3: PORTFOLIO GALLERY (MAX 10 PHOTO STRICT LIMIT CONSTRAINT) */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-4 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-purple-400" /> Bộ Sưu Tập Ảnh Nghệ Thuật (Art Portfolio)
            </h3>
            <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
              Lưu trữ tối đa 10 bức ảnh. Tải ảnh mới hoặc xóa ảnh cũ sẽ cập nhật trực tiếp vào Hồ Sơ cá nhân.
            </span>
          </div>
          <span className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded border font-mono",
            displayedPhotos.length >= 10
              ? "border-red-500/30 text-red-400 bg-red-500/10 animate-pulse"
              : "border-purple-500/30 text-purple-400 bg-purple-500/10"
          )}>
            {displayedPhotos.length} / 10 Ảnh
          </span>
        </div>

        {uploadingType === "photos" && (
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white uppercase">Đang đăng ảnh nghệ thuật lên máy chủ...</span>
              <span className="font-mono text-purple-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {displayedPhotos.map((imgUrl: string, idx: number) => (
            <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5 bg-slate-900 group shadow-md">
              <img src={imgUrl} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  const updatedPhotos = (profile.photos || []).filter((url: string) => url !== imgUrl);
                  const updatedProfile = { ...profile, photos: updatedPhotos };
                  setProfile(persistTalentProfile(updatedProfile));
                  addToast("Đã xóa ảnh khỏi bộ ảnh nghệ thuật", "info");
                }}
                className="absolute top-1.5 right-1.5 h-6 w-6 sm:h-5 sm:w-5 bg-red-600/90 text-white rounded-full flex items-center justify-center text-[8px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add photos trigger block (strictly limit <= 10) */}
          <button
            disabled={!!uploadingType || displayedPhotos.length >= 10}
            onClick={() => {
              if (uploadingType || displayedPhotos.length >= 10) return;
              setUploadingType("photos");
              setUploadProgress(0);
              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) {
                  clearInterval(interval);
                  setTimeout(() => {
                    const unsplashPhotos = [
                      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600"
                    ];
                    const randomPhoto = unsplashPhotos[Math.floor(Math.random() * unsplashPhotos.length)];
                    const currentPhotos = (profile.photos || []).filter(
                      (url: string) => profile.isOnboarded || (!url.includes("fullbody_model.png") && !url.includes("cover_image.png"))
                    );
                    currentPhotos.push(randomPhoto);
                    const updatedProfile = { ...profile, photos: currentPhotos };
                    setProfile(persistTalentProfile(updatedProfile));
                    setUploadingType(null);
                    addToast("Đã tải ảnh mới lên Art Portfolio!", "success");
                  }, 100);
                }
              }, 100);
            }}
            className={cn(
              "aspect-[3/4] rounded-lg border border-dashed flex flex-col items-center justify-center gap-1.5 transition-all text-xs",
              displayedPhotos.length >= 10
                ? "border-red-500/25 bg-red-500/5 text-red-500/60 cursor-not-allowed"
                : "border-white/10 hover:border-amber-400 bg-slate-900 text-slate-500 hover:text-amber-400 cursor-pointer disabled:opacity-50"
            )}
          >
            <Plus className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase text-center">
              {displayedPhotos.length >= 10 ? "Đầy 10 ảnh" : "Tải thêm ảnh"}
            </span>
          </button>
        </div>

        {displayedPhotos.length >= 10 && (
          <p className="text-[9px] text-red-400/80 font-bold bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            Đã đạt giới hạn tối đa 10 ảnh nghệ thuật. Vui lòng xóa ảnh cũ để giải phóng dung lượng trước khi tải ảnh mới.
          </p>
        )}
      </div>

      {/* SUB-SECTION 4: VIDEO UPLOAD MANAGER (Commented out) */}

    </div>
  );
}
