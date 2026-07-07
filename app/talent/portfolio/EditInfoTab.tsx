"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3, ShieldCheck, CheckCircle, Upload, Video, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { persistTalentProfile, ensureTalentProfile, saveTalentProfile, uploadTalentPhoto } from "@/lib/talent-api";
import { normalizeBackendAssetUrl } from "@/lib/avatar";
import ProgressBar from "@/components/ui/ProgressBar";

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

  // Identity card (CCCD) upload states
  const [cccdFront, setCccdFront] = useState<string | null>(null);
  const [cccdBack, setCccdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [lifestyleServices, setLifestyleServices] = useState<any[]>([]);
  const [isLifestyleExpanded, setIsLifestyleExpanded] = useState(false);

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
  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

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

      const front = profile.cccdFront || null;
      const back = profile.cccdBack || null;
      const self = profile.cccdSelfie || null;
      setCccdFront(front);
      setCccdBack(back);
      setSelfie(self);

      if (front && back && self) {
        setVerificationStatus(profile.verificationStatus || "pending");
      } else {
        setVerificationStatus(profile.verificationStatus || "unverified");
      }

      if (onboarded && (profile.verifiedLevel === "Elite" || profile.verifiedLevel === "Pro" || profile.verifiedLevel === "Basic")) {
        setVerificationStatus("verified");
      }
    }
  }, [profile]);

  // Real identity card (CCCD) uploader
  const handleCccdUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cccd_front" | "cccd_back" | "cccd_selfie") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fieldMap = {
      cccd_front: "cccdFront",
      cccd_back: "cccdBack",
      cccd_selfie: "cccdSelfie"
    };
    const field = fieldMap[type];
    const previewUrl = URL.createObjectURL(file);
    setProfile((current: any) => ({ ...current, [field]: previewUrl }));
    if (type === "cccd_front") setCccdFront(previewUrl);
    if (type === "cccd_back") setCccdBack(previewUrl);
    if (type === "cccd_selfie") setSelfie(previewUrl);

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

      let photoUrl = "";
      if (syncedProfile.backendProfileId) {
        const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, type);
        photoUrl = photo.url || photo.path || "";
      }

      if (!photoUrl) {
        // Fallback for unauthenticated or local usage: read as Base64 data URL
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

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

      const updatedProfile = {
        ...syncedProfile,
        ...profile,
        [field]: photoUrl
      };

      setProfile(persistTalentProfile(updatedProfile));
      URL.revokeObjectURL(previewUrl);

      if (type === "cccd_front") setCccdFront(photoUrl);
      if (type === "cccd_back") setCccdBack(photoUrl);
      if (type === "cccd_selfie") setSelfie(photoUrl);

      let typeName = "";
      if (type === "cccd_front") typeName = "Mặt trước CCCD";
      else if (type === "cccd_back") typeName = "Mặt sau CCCD";
      else if (type === "cccd_selfie") typeName = "Ảnh Selfie xác thực";

      addToast(`Tải lên tài liệu ${typeName} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Submit Identity Verification Request
  const handleIdentitySubmit = () => {
    if (!cccdFront || !cccdBack || !selfie) {
      addToast("Vui lòng tải lên đầy đủ 3 tài liệu xác thực trước!", "info");
      return;
    }
    setVerificationStatus("pending");
    const updated = {
      ...profile,
      verificationStatus: "pending"
    };
    setProfile(persistTalentProfile(updated));
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

        <form onSubmit={async (e) => {
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
          const syncedProfile = await saveTalentProfile(updated);
          setProfile(syncedProfile);
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
            <div className="border-t border-[#151b2d] pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[8px] text-left">
                  Dịch Vụ Đồng Hành VIP
                </span>
                <button
                  type="button"
                  onClick={() => setIsLifestyleExpanded(!isLifestyleExpanded)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 hover:border-amber-400/40 text-[9px] font-black uppercase transition-all duration-300 focus:outline-none hover:shadow-[0_0_10px_rgba(244,196,48,0.15)]"
                >
                  <span>{isLifestyleExpanded ? "Thu gọn" : "Cấu hình"}</span>
                  {isLifestyleExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {isLifestyleExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Select All Toggle - shown only when expanded */}
                  <div className="flex justify-end">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-950/60 border border-white/5 px-2.5 py-1.5 rounded-lg hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={lifestyleServices.length > 0 && lifestyleServices.every(s => s.enabled)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updated = lifestyleServices.map(s => ({ ...s, enabled: checked }));
                          setLifestyleServices(updated);
                        }}
                        className="rounded accent-[#f4c430] h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-[8px] font-black text-slate-400 uppercase">Chọn tất cả</span>
                    </label>
                  </div>

                  {/* Grid of items */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">

          {/* Front CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt trước</span>
            <div className="h-24 w-full rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group">
              {cccdFront ? (
                <>
                  <img src={normalizeBackendAssetUrl(cccdFront)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="CCCD Mặt trước" />
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_front"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_front")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[8px] text-slate-500 mb-2">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-white" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_front"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_front")}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar overlay */}
              {uploadingState["cccd_front"] && (
                <ProgressBar
                  progress={uploadingState["cccd_front"].progress}
                  message="Đang tải ảnh mặt trước CCCD lên..."
                />
              )}
            </div>
          </div>

          {/* Back CCCD */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">CCCD Mặt sau</span>
            <div className="h-24 w-full rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group">
              {cccdBack ? (
                <>
                  <img src={normalizeBackendAssetUrl(cccdBack)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="CCCD Mặt sau" />
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_back"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_back")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[8px] text-slate-500 mb-2">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-white" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_back"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_back")}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar overlay */}
              {uploadingState["cccd_back"] && (
                <ProgressBar
                  progress={uploadingState["cccd_back"].progress}
                  message="Đang tải ảnh mặt sau CCCD lên..."
                />
              )}
            </div>
          </div>

          {/* Selfie Verified */}
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
            <span className="font-bold block uppercase text-[8px] text-slate-400">Ảnh chân dung Selfie</span>
            <div className="h-24 w-full rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group">
              {selfie ? (
                <>
                  <img src={normalizeBackendAssetUrl(selfie)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Ảnh chân dung Selfie" />
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/75 hover:bg-black/90 border border-white/15 hover:border-amber-400/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_selfie"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_selfie")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[8px] text-slate-500 mb-2">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-white" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_selfie"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_selfie")}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar overlay */}
              {uploadingState["cccd_selfie"] && (
                <ProgressBar
                  progress={uploadingState["cccd_selfie"].progress}
                  message="Đang tải ảnh chân dung selfie lên..."
                />
              )}
            </div>
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

      {/* SUB-SECTION 4: VIDEO UPLOAD MANAGER (Commented out) */}

    </div>
  );
}
